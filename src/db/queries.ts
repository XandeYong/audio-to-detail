import type { SQLiteDatabase } from "expo-sqlite";
import type { Idea, IdeaRow } from "../types";

function rowToIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    title: row.title,
    rawTranscript: row.raw_transcript,
    summary: row.summary,
    keyPoints: JSON.parse(row.key_points || "[]"),
    tags: JSON.parse(row.tags || "[]"),
    audioUri: row.audio_uri,
    audioCloudUrl: row.audio_cloud_url,
    duration: row.duration,
    status: row.status as Idea["status"],
    errorMessage: row.error_message,
    isSynced: row.is_synced === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllIdeas(db: SQLiteDatabase): Promise<Idea[]> {
  const rows = await db.getAllAsync<IdeaRow>(
    "SELECT * FROM ideas ORDER BY created_at DESC"
  );
  return rows.map(rowToIdea);
}

export async function getIdeaById(
  db: SQLiteDatabase,
  id: string
): Promise<Idea | null> {
  const row = await db.getFirstAsync<IdeaRow>(
    "SELECT * FROM ideas WHERE id = ?",
    [id]
  );
  return row ? rowToIdea(row) : null;
}

export async function searchIdeas(
  db: SQLiteDatabase,
  query: string
): Promise<Idea[]> {
  const pattern = `%${query}%`;
  const rows = await db.getAllAsync<IdeaRow>(
    `SELECT * FROM ideas
     WHERE title LIKE ? OR summary LIKE ? OR raw_transcript LIKE ? OR tags LIKE ?
     ORDER BY created_at DESC`,
    [pattern, pattern, pattern, pattern]
  );
  return rows.map(rowToIdea);
}

export async function createIdea(
  db: SQLiteDatabase,
  idea: Pick<Idea, "id" | "audioUri" | "duration">
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO ideas (id, title, audio_uri, duration, status, created_at, updated_at)
     VALUES (?, 'Untitled Idea', ?, ?, 'recording', ?, ?)`,
    [idea.id, idea.audioUri, idea.duration, now, now]
  );
}

export async function updateIdeaTranscript(
  db: SQLiteDatabase,
  id: string,
  transcript: string
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE ideas SET raw_transcript = ?, status = 'transcribed', updated_at = ? WHERE id = ?`,
    [transcript, now, id]
  );
}

export async function updateIdeaSummary(
  db: SQLiteDatabase,
  id: string,
  data: {
    title: string;
    summary: string;
    keyPoints: string[];
    tags: string[];
  }
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE ideas
     SET title = ?, summary = ?, key_points = ?, tags = ?, status = 'ready', updated_at = ?
     WHERE id = ?`,
    [
      data.title,
      data.summary,
      JSON.stringify(data.keyPoints),
      JSON.stringify(data.tags),
      now,
      id,
    ]
  );
}

export async function updateIdeaStatus(
  db: SQLiteDatabase,
  id: string,
  status: Idea["status"],
  errorMessage?: string
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE ideas SET status = ?, error_message = ?, updated_at = ? WHERE id = ?`,
    [status, errorMessage ?? null, now, id]
  );
}

export async function updateIdeaTitle(
  db: SQLiteDatabase,
  id: string,
  title: string
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE ideas SET title = ?, updated_at = ? WHERE id = ?`,
    [title, now, id]
  );
}

export async function deleteIdea(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync("DELETE FROM ideas WHERE id = ?", [id]);
}

export async function getUnsyncedIdeas(db: SQLiteDatabase): Promise<Idea[]> {
  const rows = await db.getAllAsync<IdeaRow>(
    "SELECT * FROM ideas WHERE is_synced = 0 AND status = 'ready' ORDER BY created_at ASC"
  );
  return rows.map(rowToIdea);
}

export async function markIdeaSynced(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE ideas SET is_synced = 1, updated_at = ? WHERE id = ?`,
    [now, id]
  );
}
