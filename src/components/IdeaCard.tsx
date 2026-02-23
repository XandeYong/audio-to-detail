import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Idea } from "../types";
import { formatDuration, formatRelativeTime, truncate } from "../utils/formatters";

interface IdeaCardProps {
  idea: Idea;
}

const statusConfig: Record<
  Idea["status"],
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  recording: { icon: "mic", color: "#ef4444", label: "Recording" },
  transcribed: { icon: "clipboard-outline", color: "#f59e0b", label: "Needs Summary" },
  ready: { icon: "checkmark-circle", color: "#22c55e", label: "Ready" },
  error: { icon: "alert-circle", color: "#ef4444", label: "Error" },
};

export function IdeaCard({ idea }: IdeaCardProps) {
  const status = statusConfig[idea.status];

  return (
    <Pressable
      onPress={() => router.push(`/idea/${idea.id}`)}
      className="mx-4 mb-3 rounded-2xl bg-white p-4 dark:bg-gray-800"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      {/* Header */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text
          className="flex-1 text-base font-semibold text-gray-900 dark:text-white"
          numberOfLines={1}
        >
          {idea.title}
        </Text>
        <View className="ml-2 flex-row items-center">
          <Ionicons name={status.icon} size={14} color={status.color} />
          {idea.status !== "ready" && (
            <Text
              className="ml-1 text-xs"
              style={{ color: status.color }}
            >
              {status.label}
            </Text>
          )}
        </View>
      </View>

      {/* Summary preview */}
      {idea.summary && (
        <Text
          className="mb-2 text-sm text-gray-600 dark:text-gray-400"
          numberOfLines={2}
        >
          {truncate(idea.summary, 120)}
        </Text>
      )}

      {/* Footer: tags + metadata */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row flex-wrap gap-1">
          {idea.tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              className="rounded-full bg-primary-100 px-2 py-0.5 dark:bg-primary-900"
            >
              <Text className="text-xs text-primary-700 dark:text-primary-300">
                {tag}
              </Text>
            </View>
          ))}
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-xs text-gray-400">
            {formatDuration(idea.duration)}
          </Text>
          <Text className="text-xs text-gray-400">
            {formatRelativeTime(idea.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
