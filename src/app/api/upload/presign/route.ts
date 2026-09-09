import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();

  // Mode 1: Base64 upload (existing)
  if (body.base64Data) {
    const { filename, base64Data, contentType } = body;
    if (!filename || !base64Data) {
      return NextResponse.json({ error: 'filename and base64Data required' }, { status: 400 });
    }
    try {
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

  // Mode 2: URL-based upload (new — for imported listings)
  if (body.imageUrl) {
    const { imageUrl } = body;
    try {
      const imgRes = await fetch(imageUrl, {
        headers: { 'User-Agent': 'ShowHome-Import/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!imgRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = imageUrl.includes('.webp') ? 'webp' : imageUrl.includes('.png') ? 'png' : 'jpg';
      const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      const pathname = `showhome/uploads/${user.id}/${crypto.randomUUID()}.${ext}`;
      const blob = await put(pathname, buffer, {
        access: 'public',
        contentType,
      });
      return NextResponse.json({ publicUrl: blob.url });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'base64Data or imageUrl required' }, { status: 400 });
}
