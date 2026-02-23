import { useCallback, useRef, useState } from "react";
import * as Crypto from "expo-crypto";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Paths } from "expo-file-system";
import { useIdeasStore } from "../stores/useIdeasStore";

export function useRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [durationMs, setDurationMs] = useState(0);

  const { addIdea, updateTranscript, updateStatus } = useIdeasStore();

  const ideaIdRef = useRef<string | null>(null);
  const audioUriRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Speech recognition events
  useSpeechRecognitionEvent("start", () => {
    setIsRecording(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  });

  useSpeechRecognitionEvent("result", (event) => {
    const text = event.results[0]?.transcript ?? "";
    setTranscript(text);
  });

  useSpeechRecognitionEvent("audioend", (event) => {
    // Audio file is ready
    if (event.uri) {
      audioUriRef.current = event.uri;
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.warn("Speech recognition error:", event.error, event.message);
    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  });

  const start = useCallback(async () => {
    const result =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      throw new Error("Microphone/speech recognition permission denied");
    }

    // Reset state
    setTranscript("");
    setDurationMs(0);
    audioUriRef.current = null;
    ideaIdRef.current = Crypto.randomUUID();
    startTimeRef.current = Date.now();

    // Start duration timer
    intervalRef.current = setInterval(() => {
      setDurationMs(Date.now() - startTimeRef.current);
    }, 100);

    // Start speech recognition with audio recording
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: true,
      addsPunctuation: true,
      recordingOptions: {
        persist: true,
        outputDirectory: Paths.document.uri,
        outputFileName: `idea_${ideaIdRef.current}.wav`,
      },
    });
  }, []);

  const stop = useCallback(async () => {
    ExpoSpeechRecognitionModule.stop();

    const id = ideaIdRef.current;
    const finalDuration = Date.now() - startTimeRef.current;

    if (!id) return null;

    // Wait a tick for the audioend event to fire
    await new Promise((resolve) => setTimeout(resolve, 300));

    const audioUri = audioUriRef.current ?? "";

    // Save idea to DB
    await addIdea({ id, audioUri, duration: finalDuration });

    // If we got a transcript, save it
    if (transcript.trim()) {
      await updateTranscript(id, transcript.trim());
    } else {
      await updateStatus(id, "transcribed");
    }

    return id;
  }, [transcript, addIdea, updateTranscript, updateStatus]);

  return {
    isRecording,
    transcript,
    durationMs,
    start,
    stop,
  };
}
