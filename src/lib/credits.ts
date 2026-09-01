import { createClient } from '@/lib/supabase/server';

export interface UserCredits {
  plan: string;
  allowanceType: string;
  creditsTotal: number;
  creditsUsed: number;
  remaining: number | null; // null = unmetered
  trialEndsAt: string | null;
  isTrialActive: boolean;
}

export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  const sb = await createClient();
  const { data } = await sb
    .from('showhome_users')
    .select('plan, allowance_type, credits_total, credits_used, trial_ends_at')
    .eq('id', userId)
    .single();

  if (!data) return null;

  const now = new Date();
  const trialEnd = data.trial_ends_at ? new Date(data.trial_ends_at) : null;
  const isTrialActive = trialEnd ? trialEnd > now : false;

  return {
    plan: data.plan,
    allowanceType: data.allowance_type,
    creditsTotal: data.credits_total,
    creditsUsed: data.credits_used,
    remaining: data.allowance_type === 'metered' ? data.credits_total - data.credits_used : null,
    trialEndsAt: data.trial_ends_at,
    isTrialActive,
  };
}

export async function canCreateJob(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const credits = await getUserCredits(userId);
  if (!credits) return { allowed: false, reason: 'Account not found' };

  if (credits.plan === 'enterprise') return { allowed: true };

  if (credits.allowanceType === 'unmetered') return { allowed: true };

  // Metered: check credits
  if (credits.remaining !== null && credits.remaining <= 0) {
    if (credits.isTrialActive) {
      return { allowed: false, reason: 'Your trial has ended. Upgrade to continue creating videos.' };
    }
    return { allowed: false, reason: 'No credits remaining. Upgrade your plan to create more videos.' };
  }

  return { allowed: true };
}

export async function consumeCredit(userId: string): Promise<boolean> {
  const sb = await createClient();

  // Read current count then increment
  const { data: user } = await sb
    .from('showhome_users')
    .select('credits_used')
    .eq('id', userId)
    .single();

  if (!user) return false;

  const { error } = await sb
    .from('showhome_users')
    .update({ credits_used: user.credits_used + 1 })
    .eq('id', userId);

  return !error;
}
