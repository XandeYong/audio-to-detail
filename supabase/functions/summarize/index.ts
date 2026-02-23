// Supabase Edge Function: Claude API proxy
// Keeps Anthropic API key server-side

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const SYSTEM_PROMPT = `You are an idea extraction assistant. Given a raw voice transcript, extract and structure the following:

1. **Title**: A concise, descriptive title (max 10 words)
2. **Summary**: A clear, actionable summary (2-4 sentences)
3. **Key Points**: Bullet points of the core ideas (3-7 points)
4. **Tags**: Relevant category tags (2-5 tags, lowercase)

The transcript may be informal, rambling, or contain filler words like "um", "uh", "like", "you know".
Focus on extracting the actual ideas and intentions. Ignore filler and repetition.

Respond ONLY with valid JSON in this exact format:
{
  "title": "...",
  "summary": "...",
  "keyPoints": ["...", "..."],
  "tags": ["...", "..."]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
      },
    });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const { transcript } = await req.json();

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: "No transcript provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Here is the voice transcript to analyze:\n\n${transcript}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const content = result.content?.[0]?.text;

    if (!content) {
      throw new Error("No content in Claude response");
    }

    // Parse JSON from Claude's response
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
