export type IdeaStatus =
  | "recording"
  | "transcribing"
  | "summarizing"
  | "ready"
  | "error";

export interface Idea {
  id: string;
  title: string;
  rawTranscript: string | null;
  summary: string | null;
  keyPoints: string[];
  tags: string[];
  audioUri: string;
  audioCloudUrl: string | null;
  duration: number;
  status: IdeaStatus;
  errorMessage: string | null;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IdeaRow {
  id: string;
  title: string;
  raw_transcript: string | null;
  summary: string | null;
  key_points: string;
  tags: string;
  audio_uri: string;
  audio_cloud_url: string | null;
  duration: number;
  status: string;
  error_message: string | null;
  is_synced: number;
  created_at: string;
  updated_at: string;
}

export interface SummarizationResult {
  title: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
}

export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  metering: number;
}
