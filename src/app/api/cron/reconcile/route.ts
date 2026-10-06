import { NextResponse } from 'next/server';
import { db } from '@/lib/v3/db';
import { GET as pollJobStatus } from '@/app/api/status/route';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Vercel cron: closes jobs that nobody is polling.
 *
 * /api/status only moves a job from "rendering" to "done" when something asks
 * for it — close the tab right after starting a render and the row stays
 * "rendering" forever, even though BytePlus finished minutes earlier. This
 * sweep polls the provider for those rows so the video page shows "fertig"
 * as soon as anyone opens it (and so billing/usage reporting isn't stuck).
 *
 * Auth: Vercel calls it with `Authorization: Bearer $CRON_SECRET`.
 */
async function reconcile(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // Anything rendering for more than 90 s deserves a provider check — the
  // browser poll handles everything fresher than that.
  const cutoff = new Date(Date.now() - 90_000).toISOString();
  const { data, error } = await db()
    .from('v3_jobs')
    .select('id, status')
    .eq('status', 'rendering')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const beat = async (jobs: number, note: string) => {
    try {
      await db().from('cron_heartbeats').insert({ jobs_checked: jobs, note });
    } catch { /* never fail the sweep over telemetry */ }
  };

  if (!data?.length) {
    await beat(0, 'nothing to reconcile');
    return NextResponse.json({ checked: 0, jobs: [] });
  }

  // Call the status handler directly instead of HTTP: Vercel invokes crons on
  // the deployment URL, whose origin sits behind deployment protection, so an
  // internal fetch silently came back non-JSON and the sweep never closed
  // anything (observed: heartbeats "rendering->rendering" for 40 min).
  const checked: { id: string; from: string; to: string | null; err?: string }[] = [];

  for (const row of data) {
    let to: string | null = row.status;
    let err: string | undefined;
    try {
      const res = await pollJobStatus(
        new Request(`http://internal/api/status?job_id=${encodeURIComponent(row.id)}`),
      );
      const body = (await res.json()) as { status?: string; error?: string };
      to = res.ok ? (body.status ?? row.status) : row.status;
      if (!res.ok) err = (body.error || `HTTP ${res.status}`).slice(0, 80);
    } catch (e) {
      err = String(e).slice(0, 80); // transient — the next sweep retries
    }
    checked.push(err ? { id: row.id, from: row.status, to, err } : { id: row.id, from: row.status, to });
  }

  await beat(
    checked.length,
    checked.map(c => `${c.from}->${c.to}${c.err ? ` (${c.err})` : ''}`).join(', ').slice(0, 200),
  );
  return NextResponse.json({ checked: checked.length, jobs: checked });
}

export async function GET(request: Request) {
  return reconcile(request);
}

export async function POST(request: Request) {
  return reconcile(request);
}
