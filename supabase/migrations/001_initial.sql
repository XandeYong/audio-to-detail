-- Ideas table (cloud mirror of local SQLite)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Idea',
  raw_transcript TEXT,
  summary TEXT,
  key_points JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  audio_cloud_url TEXT,
  duration INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);

-- Row Level Security
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Users can only access their own ideas
CREATE POLICY "Users can view own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for audio recordings
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)
ON CONFLICT DO NOTHING;

-- Storage RLS: users can only access their own recordings
CREATE POLICY "Users can upload own recordings" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own recordings" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
