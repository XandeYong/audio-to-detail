import { File } from "expo-file-system";
import { supabase } from "./supabase";

export async function transcribeAudio(audioUri: string): Promise<string> {
  // Read the audio file as base64
  const file = new File(audioUri);
  const base64Audio = file.base64();

  // Call Supabase Edge Function which proxies to Whisper API
  const { data, error } = await supabase.functions.invoke("transcribe", {
    body: {
      audio: base64Audio,
      fileName: file.name,
    },
  });

  if (error) {
    throw new Error(`Transcription failed: ${error.message}`);
  }

  if (!data?.transcript) {
    throw new Error("No transcript returned");
  }

  return data.transcript;
}
