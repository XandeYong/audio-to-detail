import { create } from "zustand";

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  durationMs: number;
  metering: number;

  setRecording: (isRecording: boolean) => void;
  setPaused: (isPaused: boolean) => void;
  setDuration: (durationMs: number) => void;
  setMetering: (metering: number) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingState>((set) => ({
  isRecording: false,
  isPaused: false,
  durationMs: 0,
  metering: 0,

  setRecording: (isRecording) => set({ isRecording }),
  setPaused: (isPaused) => set({ isPaused }),
  setDuration: (durationMs) => set({ durationMs }),
  setMetering: (metering) => set({ metering }),
  reset: () =>
    set({ isRecording: false, isPaused: false, durationMs: 0, metering: 0 }),
}));
