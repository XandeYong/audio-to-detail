import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useRecording } from "@/src/hooks/useRecording";
import { formatDuration } from "@/src/utils/formatters";

export default function RecordScreen() {
  const insets = useSafeAreaInsets();
  const { isRecording, isPaused, durationMs, metering, start, stop, pause, resume } =
    useRecording();

  const pulseScale = useSharedValue(1);
  const waveOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isRecording && !isPaused) {
      pulseScale.value = withRepeat(
        withTiming(1.4, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      waveOpacity.value = withRepeat(
        withTiming(0.6, { duration: 800 }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1);
      waveOpacity.value = withTiming(0.1);
    }
  }, [isRecording, isPaused, pulseScale, waveOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: waveOpacity.value,
  }));

  // Auto-start recording when screen opens
  useEffect(() => {
    if (!isRecording) {
      start().catch(console.warn);
    }
  }, []);

  const handleStop = async () => {
    const id = await stop();
    if (id) {
      router.replace(`/idea/${id}`);
    } else {
      router.back();
    }
  };

  const handleCancel = async () => {
    if (isRecording) {
      await stop();
    }
    router.back();
  };

  // Visualize metering as bar heights
  const meterLevel = Math.max(0, Math.min(1, (metering + 60) / 60));

  return (
    <View
      className="flex-1 bg-gray-900"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={handleCancel} className="p-2">
          <Ionicons name="close" size={28} color="#9ca3af" />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-3 rounded-full bg-red-500" />
          <Text className="text-sm font-medium text-gray-400">
            {isPaused ? "PAUSED" : "RECORDING"}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Center: Waveform visualization */}
      <View className="flex-1 items-center justify-center">
        {/* Pulse ring */}
        <Animated.View
          style={[
            pulseStyle,
            {
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: "#ef4444",
            },
          ]}
        />

        {/* Meter level indicator */}
        <View className="mb-8 h-32 flex-row items-end gap-1">
          {Array.from({ length: 20 }).map((_, i) => {
            const barHeight = Math.max(
              4,
              meterLevel * 128 * (0.3 + 0.7 * Math.sin((i / 20) * Math.PI))
            );
            return (
              <View
                key={i}
                className="w-2 rounded-full bg-primary-400"
                style={{ height: barHeight, opacity: 0.5 + meterLevel * 0.5 }}
              />
            );
          })}
        </View>

        {/* Timer */}
        <Text className="text-5xl font-light text-white">
          {formatDuration(durationMs)}
        </Text>
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-12 pb-12">
        {/* Pause/Resume */}
        <Pressable
          onPress={isPaused ? resume : pause}
          className="h-14 w-14 items-center justify-center rounded-full bg-gray-800"
        >
          <Ionicons
            name={isPaused ? "play" : "pause"}
            size={24}
            color="white"
          />
        </Pressable>

        {/* Stop */}
        <Pressable
          onPress={handleStop}
          className="h-20 w-20 items-center justify-center rounded-full bg-red-500"
          style={{
            elevation: 8,
            shadowColor: "#ef4444",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
          }}
        >
          <Ionicons name="stop" size={32} color="white" />
        </Pressable>

        {/* Spacer for balance */}
        <View className="h-14 w-14" />
      </View>
    </View>
  );
}
