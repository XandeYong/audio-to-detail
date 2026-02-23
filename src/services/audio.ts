import { Audio } from "expo-av";
import { File } from "expo-file-system";

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
