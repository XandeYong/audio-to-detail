import { File } from "expo-file-system";
import type { SQLiteDatabase } from "expo-sqlite";
import { supabase } from "./supabase";
import { getUnsyncedIdeas, markIdeaSynced } from "../db/queries";

export async function syncIdeas(db: SQLiteDatabase): Promise<number> {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) return 0;

  const unsyncedIdeas = await getUnsyncedIdeas(db);
  let syncedCount = 0;

  for (const idea of unsyncedIdeas) {
    try {
      // Upload audio to Supabase Storage
      let audioCloudUrl: string | null = null;
      if (idea.audioUri) {
        const audioFile = new File(idea.audioUri);
        const storagePath = `${session.user.id}/${idea.id}.m4a`;

        // Read file as array buffer for upload
        const arrayBuffer = await audioFile.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from("recordings")
          .upload(storagePath, arrayBuffer, {
            contentType: "audio/m4a",
            upsert: true,
          });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("recordings").getPublicUrl(storagePath);
          audioCloudUrl = publicUrl;
        }
      }

      // Upsert idea to Supabase
      const { error } = await supabase.from("ideas").upsert({
        id: idea.id,
        user_id: session.user.id,
        title: idea.title,
        raw_transcript: idea.rawTranscript,
        summary: idea.summary,
        key_points: idea.keyPoints,
        tags: idea.tags,
        audio_cloud_url: audioCloudUrl,
        duration: idea.duration,
        status: idea.status,
        created_at: idea.createdAt,
        updated_at: idea.updatedAt,
      });

      if (!error) {
        await markIdeaSynced(db, idea.id);
        syncedCount++;
      }
    } catch {
      // Skip this idea, try next
      continue;
    }
  }

  return syncedCount;
}
