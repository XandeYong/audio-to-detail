import { View, Text, Pressable, ScrollView } from "react-native";
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
  const { isRecording, transcript, durationMs, start, stop } = useRecording();

  const pulseScale = useSharedValue(1);
  const waveOpacity = useSharedValue(0.3);

  useEffect(() => {
    if (isRecording) {
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
  }, [isRecording, pulseScale, waveOpacity]);

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

  const handleCancel = () => {
    if (isRecording) {
      stop();
    }
    router.back();
  };

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
          <Text className="text-sm font-medium text-gray-400">RECORDING</Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Center: Waveform + transcript */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Pulse ring */}
        <Animated.View
          style={[
            pulseStyle,
            {
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: "#ef4444",
            },
          ]}
        />

        {/* Timer */}
        <Text className="mb-6 text-5xl font-light text-white">
          {formatDuration(durationMs)}
        </Text>

        {/* Live transcript */}
        <ScrollView
          className="max-h-48 w-full rounded-xl bg-gray-800/50 p-4"
          showsVerticalScrollIndicator={false}
        >
          {transcript ? (
            <Text className="text-center text-base leading-6 text-gray-300">
              {transcript}
            </Text>
          ) : (
            <Text className="text-center text-base italic text-gray-500">
              Start speaking... your words will appear here
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Controls */}
      <View className="items-center pb-12">
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
        <Text className="mt-3 text-sm text-gray-500">Tap to stop</Text>
      </View>
    </View>
  );
}
