import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  // Verify shared secret
  const secret = request.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { jobId, status, videoUrl, error: jobError, script } = body;

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }

  // Use service role for callback (no auth context)
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Idempotent: check if already terminal
  const { data: existing } = await sb
    .from('showhome_jobs')
    .select('status')
    .eq('id', jobId)
    .single();

  if (existing && (existing.status === 'ready' || existing.status === 'failed')) {
    return NextResponse.json({ ok: true, note: 'Already processed' });
  }

  const update: Record<string, any> = {
    status,
    completed_at: new Date().toISOString(),
  };

  if (videoUrl) update.video_url = videoUrl;
  if (script) update.script = script;
  if (jobError) update.error = jobError;

  const { error } = await sb
    .from('showhome_jobs')
    .update(update)
    .eq('id', jobId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO: send email notification if user opted in
  // Get user email from job -> user
  if (status === 'ready' || status === 'failed') {
    const { data: job } = await sb
      .from('showhome_jobs')
      .select('user_id, email_notification')
      .eq('id', jobId)
      .single();

    if (job?.email_notification) {
      const { data: userData } = await sb
        .from('showhome_users')
        .select('email')
        .eq('id', job.user_id)
        .single();

      if (userData?.email) {
        // TODO: integrate email sending (Resend, Brevo, etc.)
        console.log(`[ShowHome] Would send notification to ${userData.email} for job ${jobId} — status: ${status}`);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
