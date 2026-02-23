import { supabase } from "./supabase";
import type { SummarizationResult } from "../types";

export async function summarizeTranscript(
  transcript: string
): Promise<SummarizationResult> {
  const { data, error } = await supabase.functions.invoke("summarize", {
    body: { transcript },
  });

  if (error) {
    throw new Error(`Summarization failed: ${error.message}`);
  }

  if (!data?.title || !data?.summary) {
    throw new Error("Invalid summarization response");
  }

  return {
    title: data.title,
    summary: data.summary,
    keyPoints: data.keyPoints ?? [],
    tags: data.tags ?? [],
  };
}
