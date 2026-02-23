import { Audio } from "expo-av";
import { File, Directory, Paths } from "expo-file-system";

let recording: Audio.Recording | null = null;

export async function requestPermissions(): Promise<boolean> {
  const { granted } = await Audio.requestPermissionsAsync();
  return granted;
}

export async function startRecording(): Promise<Audio.Recording> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording: newRecording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  recording = newRecording;
  return newRecording;
}

export async function stopRecording(): Promise<{
  uri: string;
  duration: number;
} | null> {
  if (!recording) return null;

  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  const uri = recording.getURI();
  const status = await recording.getStatusAsync();
  recording = null;

  if (!uri) return null;

  // Ensure recordings directory exists
  const recordingsDir = new Directory(Paths.document, "recordings");
  if (!recordingsDir.exists) {
    recordingsDir.create();
  }

  // Move to a persistent location
  const fileName = `idea_${Date.now()}.m4a`;
  const sourceFile = new File(uri);
  const destFile = new File(recordingsDir, fileName);
  sourceFile.move(destFile);

  return {
    uri: destFile.uri,
    duration: status.durationMillis ?? 0,
  };
}

export async function pauseRecording(): Promise<void> {
  if (!recording) return;
  await recording.pauseAsync();
}

export async function resumeRecording(): Promise<void> {
  if (!recording) return;
  await recording.startAsync();
}

export function getRecording(): Audio.Recording | null {
  return recording;
}

export async function playAudio(uri: string): Promise<Audio.Sound> {
  const { sound } = await Audio.Sound.createAsync({ uri });
  await sound.playAsync();
  return sound;
}

export async function deleteAudioFile(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // File may not exist
  }
}
