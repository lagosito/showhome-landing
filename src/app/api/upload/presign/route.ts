import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { filename, base64Data, contentType } = await request.json();
  if (!filename || !base64Data) {
    return NextResponse.json({ error: 'filename and base64Data required' }, { status: 400 });
  }

  try {
    // Decode base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    const pathname = `showhome/uploads/${user.id}/${crypto.randomUUID()}-${filename}`;

    const blob = await put(pathname, buffer, {
      access: 'public',
      contentType: contentType || 'image/jpeg',
    });

    return NextResponse.json({ publicUrl: blob.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
