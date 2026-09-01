import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { submitJobToN8n } from '@/lib/n8n';
import { canCreateJob, consumeCredit } from '@/lib/credits';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Check credits
  const creditCheck = await canCreateJob(user.id);
  if (!creditCheck.allowed) {
    return NextResponse.json({ error: creditCheck.reason }, { status: 403 });
  }

  const body = await request.json();
  const { propertyType, style, aspectRatio, avatarId, avatarUrl, highlights, photos } = body;

  // Validate
  if (!propertyType || !style || !aspectRatio || !photos?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (photos.length < 3 || photos.length > 12) {
    return NextResponse.json({ error: 'Between 3 and 12 photos required' }, { status: 400 });
  }

  const jobId = randomUUID();

  // Create job row
  const { error: insertError } = await sb.from('showhome_jobs').insert({
    id: jobId,
    user_id: user.id,
    status: 'queued',
    property_type: propertyType,
    style,
    aspect_ratio: aspectRatio,
    avatar_id: avatarId || null,
    avatar_url: avatarUrl || null,
    highlights: highlights || '',
    photos,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  // Consume credit
  await consumeCredit(user.id);

  // Submit to n8n
  try {
    const result = await submitJobToN8n({
      jobId,
      userId: user.id,
      propertyType,
      style,
      aspectRatio,
      avatarId: avatarId || null,
      avatarUrl: avatarUrl || null,
      highlights: highlights || '',
      photos: photos.map((p: any, i: number) => ({
        url: p.url,
        room: p.room,
        order: i + 1,
      })),
    });

    return NextResponse.json({ jobId, accepted: result.accepted });
  } catch (err: any) {
    // n8n unreachable — mark job as failed
    await sb.from('showhome_jobs').update({
      status: 'failed',
      error: 'Video service temporarily unavailable. Please try again.',
    }).eq('id', jobId);

    return NextResponse.json({ error: 'Video service temporarily unavailable' }, { status: 502 });
  }
}
