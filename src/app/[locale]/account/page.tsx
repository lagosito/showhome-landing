import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AccountClient from './AccountClient';

export const dynamic = 'force-dynamic';

interface UserProfile {
  email: string;
  plan: string;
  credits_total: number;
  credits_used: number;
  trial_ends_at: string | null;
}

interface Job {
  id: string;
  status: string;
  created_at: string;
  video_url: string | null;
  error: string | null;
}

export default async function AccountPage() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/auth/signin');
  }

  // Fetch user profile from showhome_users
  const { data: profile } = await supabase
    .from('showhome_users')
    .select('email, plan, credits_total, credits_used, trial_ends_at')
    .eq('id', user.id)
    .single();

  // Fetch user's videos from showhome_jobs
  const { data: jobs } = await supabase
    .from('showhome_jobs')
    .select('id, status, created_at, video_url, error')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const userProfile: UserProfile = profile
    ? {
        email: profile.email,
        plan: profile.plan,
        credits_total: profile.credits_total,
        credits_used: profile.credits_used,
        trial_ends_at: profile.trial_ends_at,
      }
    : {
        email: user.email ?? '',
        plan: 'free',
        credits_total: 0,
        credits_used: 0,
        trial_ends_at: null,
      };

  return (
    <AccountClient
      userProfile={userProfile}
      jobs={(jobs ?? []) as Job[]}
    />
  );
}
