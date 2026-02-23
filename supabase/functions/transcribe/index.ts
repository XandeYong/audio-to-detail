// Supabase Edge Function: Whisper API proxy
// Keeps OpenAI API key server-side

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

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
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const { audio, fileName } = await req.json();

    if (!audio) {
      return new Response(
        JSON.stringify({ error: "No audio data provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Decode base64 audio
    const binaryAudio = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));

    // Create form data for Whisper API
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([binaryAudio], { type: "audio/m4a" }),
      fileName || "recording.m4a"
    );
    formData.append("model", "gpt-4o-transcribe");
    formData.append("response_format", "text");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whisper API error: ${response.status} ${errorText}`);
    }

    const transcript = await response.text();

    return new Response(
      JSON.stringify({ transcript }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
