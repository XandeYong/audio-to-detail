import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { formatDuration } from "../utils/formatters";

interface AudioPlayerProps {
  uri: string;
  duration: number;
}

export function AudioPlayer({ uri, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await soundRef.current?.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
      return;
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        if (!status.isLoaded) return;
        setPosition(status.positionMillis);
        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          sound.setPositionAsync(0);
        }
      }
    );
    soundRef.current = sound;
    setIsPlaying(true);
  }, [isPlaying, uri]);

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-gray-100 p-3 dark:bg-gray-700">
      <Pressable onPress={togglePlayback}>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-500">
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color="white"
          />
        </View>
      </Pressable>

      {/* Progress bar */}
      <View className="flex-1">
        <View className="h-1.5 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
          <View
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>

      <Text className="text-xs text-gray-500 dark:text-gray-400">
        {formatDuration(position)} / {formatDuration(duration)}
      </Text>
    </View>
  );
}
