import type { SQLiteDatabase } from "expo-sqlite";

export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Untitled Idea',
      raw_transcript TEXT,
      summary TEXT,
      key_points TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      audio_uri TEXT NOT NULL,
      audio_cloud_url TEXT,
      duration INTEGER DEFAULT 0,
      status TEXT DEFAULT 'recording',
      error_message TEXT,
      is_synced INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
  `);
}
