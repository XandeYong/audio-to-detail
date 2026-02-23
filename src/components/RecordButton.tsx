import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  size?: "small" | "large";
}

export function RecordButton({
  isRecording,
  onPress,
  size = "large",
}: RecordButtonProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withTiming(1.3, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isRecording, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isRecording ? 0.3 : 0,
  }));

  const isLarge = size === "large";
  const buttonSize = isLarge ? 80 : 56;
  const iconSize = isLarge ? 36 : 24;

  return (
    <View className="items-center justify-center">
      <Animated.View
        style={[
          pulseStyle,
          {
            position: "absolute",
            width: buttonSize + 40,
            height: buttonSize + 40,
            borderRadius: (buttonSize + 40) / 2,
            backgroundColor: "#ef4444",
          },
        ]}
      />
      <Pressable
        onPress={onPress}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: isRecording ? "#ef4444" : "#3b82f6",
          alignItems: "center",
          justifyContent: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        }}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={iconSize}
          color="white"
        />
      </Pressable>
    </View>
  );
}
