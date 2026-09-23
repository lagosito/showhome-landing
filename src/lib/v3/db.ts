// Homemotion v3 — jobs table access via service role (Supabase, project kiosk).
import { createClient as createSupabase, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    client = createSupabase(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export interface V3Job {
  id: string;
  created_at: string;
  params: any;
  photos: any[];
  shot_plan: any;
  prompt: string | null;
  fal_request_id: string | null;
  fal_status_url: string | null;
  fal_response_url: string | null;
  model: string | null;
  endpoint: string | null;
  status: 'planning' | 'rendering' | 'done' | 'error';
  error: string | null;
  video_url: string | null;
  cost_estimate_usd: number | null;
}

export async function insertJob(job: Partial<V3Job> & { id: string; params: any; photos: any }): Promise<void> {
  const { error } = await db().from('v3_jobs').insert(job);
  if (error) throw new Error(`insertJob: ${error.message}`);
}

export async function updateJob(id: string, patch: Partial<V3Job>): Promise<void> {
  const { error } = await db().from('v3_jobs').update(patch).eq('id', id);
  if (error) throw new Error(`updateJob: ${error.message}`);
}

export async function getJob(id: string): Promise<V3Job | null> {
  const { data, error } = await db().from('v3_jobs').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`getJob: ${error.message}`);
  return data as V3Job | null;
}
