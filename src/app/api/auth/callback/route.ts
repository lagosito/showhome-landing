import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') || '/create/upload';

  if (code) {
    const sb = await createClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      // Ensure user row exists in showhome_users
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: existing } = await sb
          .from('showhome_users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existing) {
          await sb.from('showhome_users').insert({
            id: user.id,
            email: user.email,
            plan: 'starter',
            allowance_type: 'metered',
            credits_total: 3,
            credits_used: 0,
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
