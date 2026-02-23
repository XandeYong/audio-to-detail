export function buildClaudePrompt(transcript: string): string {
  return `I recorded a voice memo with my idea. Please analyze the transcript below and respond ONLY with valid JSON in this exact format (no markdown, no code fences, just raw JSON):

{
  "title": "A concise title (max 10 words)",
  "summary": "A clear, actionable summary (2-4 sentences)",
  "keyPoints": ["key point 1", "key point 2", "..."],
  "tags": ["tag1", "tag2", "..."]
}

Rules:
- Title: max 10 words, descriptive
- Summary: 2-4 sentences, actionable
- Key Points: 3-7 bullet points of core ideas
- Tags: 2-5 lowercase category tags
- Ignore filler words (um, uh, like, you know)
- Focus on extracting the actual ideas and intentions

Here is my transcript:

${transcript}`;
}

export function parseClaudeResponse(text: string): {
  title: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
} | null {
  try {
    // Try to extract JSON from the response (handle if Claude wraps in code fences)
    let jsonStr = text.trim();

    // Remove markdown code fences if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    if (!parsed.title || !parsed.summary) {
      return null;
    }

    return {
      title: parsed.title,
      summary: parsed.summary,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    };
  } catch {
    return null;
  }
}
