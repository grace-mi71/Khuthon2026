-- 딴길 Vercel Postgres 스키마

CREATE TABLE IF NOT EXISTS groups (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  centroid_embedding TEXT NOT NULL,   -- JSON 배열 (768차원)
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id  TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id   TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  group_id   TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id, created_at DESC);

CREATE TABLE IF NOT EXISTS reviews (
  id         TEXT PRIMARY KEY,
  perf_id    TEXT NOT NULL,
  user_id    TEXT NOT NULL,
  text       TEXT NOT NULL,
  tags_json  TEXT NOT NULL,           -- JSON: { positive, negative, mood }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_perf ON reviews(perf_id, created_at DESC);
