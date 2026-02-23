import { useCallback, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import * as Crypto from "expo-crypto";
import { useRecordingStore } from "../stores/useRecordingStore";
import { useIdeasStore } from "../stores/useIdeasStore";
import * as audioService from "../services/audio";
import { transcribeAudio } from "../services/transcription";
import { summarizeTranscript } from "../services/summarization";

export function useRecording() {
  const store = useRecordingStore();
  const {
    addIdea,
    updateTranscript,
    updateSummary,
    updateStatus,
  } = useIdeasStore();

  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = useCallback(async () => {
    const hasPermission = await audioService.requestPermissions();
    if (!hasPermission) {
      throw new Error("Microphone permission denied");
    }

    const recording = await audioService.startRecording();
    recordingRef.current = recording;
    store.setRecording(true);
    store.setPaused(false);
    store.setDuration(0);

    // Update duration every 100ms
    intervalRef.current = setInterval(async () => {
      if (recordingRef.current) {
        const status = await recordingRef.current.getStatusAsync();
        if (status.isRecording) {
          store.setDuration(status.durationMillis ?? 0);
          store.setMetering(status.metering ?? 0);
        }
      }
    }, 100);
  }, [store]);

  const stop = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const result = await audioService.stopRecording();
    recordingRef.current = null;
    store.reset();

    if (!result) return null;

    // Create idea in DB
    const id = Crypto.randomUUID();
    await addIdea({
      id,
      audioUri: result.uri,
      duration: result.duration,
    });

    // Start async processing pipeline
    processIdea(id, result.uri);

    return id;
  }, [store, addIdea]);

  const pause = useCallback(async () => {
    await audioService.pauseRecording();
    store.setPaused(true);
  }, [store]);

  const resume = useCallback(async () => {
    await audioService.resumeRecording();
    store.setPaused(false);
  }, [store]);

  // Background processing pipeline
  const processIdea = async (id: string, audioUri: string) => {
    try {
      // Step 1: Transcribe
      await updateStatus(id, "transcribing");
      const transcript = await transcribeAudio(audioUri);
      await updateTranscript(id, transcript);

      // Step 2: Summarize
      const result = await summarizeTranscript(transcript);
      await updateSummary(id, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Processing failed";
      await updateStatus(id, "error", message);
    }
  };

  return {
    isRecording: store.isRecording,
    isPaused: store.isPaused,
    durationMs: store.durationMs,
    metering: store.metering,
    start,
    stop,
    pause,
    resume,
  };
}
