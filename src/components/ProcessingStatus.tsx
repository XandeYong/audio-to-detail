import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { IdeaStatus } from "../types";

interface ProcessingStatusProps {
  status: IdeaStatus;
  errorMessage?: string | null;
}

export function ProcessingStatus({
  status,
  errorMessage,
}: ProcessingStatusProps) {
  if (status === "ready") return null;

  if (status === "error") {
    return (
      <View className="flex-row items-center gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <Text className="flex-1 text-sm text-red-600 dark:text-red-400">
          {errorMessage ?? "Something went wrong"}
        </Text>
      </View>
    );
  }

  if (status === "transcribed") {
    return (
      <View className="flex-row items-center gap-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
        <Ionicons name="clipboard-outline" size={20} color="#f59e0b" />
        <Text className="flex-1 text-sm text-amber-700 dark:text-amber-400">
          Transcript ready — copy to Claude to generate summary
        </Text>
      </View>
    );
  }

  if (status === "recording") {
    return (
      <View className="flex-row items-center gap-2 rounded-xl bg-primary-50 p-3 dark:bg-primary-900/20">
        <Ionicons name="mic" size={20} color="#3b82f6" />
        <Text className="flex-1 text-sm text-primary-700 dark:text-primary-400">
          Recording in progress...
        </Text>
      </View>
    );
  }

  return null;
}
