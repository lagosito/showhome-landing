-- ShowHome tables (shared Supabase project, prefixed with showhome_)

CREATE TABLE IF NOT EXISTS showhome_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  allowance_type TEXT NOT NULL DEFAULT 'metered' CHECK (allowance_type IN ('metered', 'unmetered')),
  credits_total INT NOT NULL DEFAULT 3,
  credits_used INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS showhome_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES showhome_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'writing_script', 'rendering', 'ready', 'failed')),
  property_type TEXT NOT NULL CHECK (property_type IN ('rent', 'sale')),
  style TEXT NOT NULL CHECK (style IN ('voiceover', 'presenter')),
  aspect_ratio TEXT NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16', '16:9')),
  avatar_id TEXT,
  avatar_url TEXT,
  highlights TEXT DEFAULT '',
  photos JSONB NOT NULL DEFAULT '[]',
  video_url TEXT,
  script TEXT,
  error TEXT,
  email_notification BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_showhome_jobs_user_id ON showhome_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_showhome_jobs_status ON showhome_jobs(status);
CREATE INDEX IF NOT EXISTS idx_showhome_jobs_created_at ON showhome_jobs(created_at DESC);

-- RLS policies (service role bypasses these, but good practice)
ALTER TABLE showhome_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE showhome_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON showhome_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON showhome_jobs FOR ALL USING (true) WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users read own" ON showhome_users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users read own jobs" ON showhome_jobs FOR SELECT USING (auth.uid() = user_id);
