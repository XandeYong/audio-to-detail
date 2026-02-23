import { View, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { IdeaStatus } from "../types";

interface ProcessingStatusProps {
  status: IdeaStatus;
  errorMessage?: string | null;
}

const steps: { key: IdeaStatus; label: string }[] = [
  { key: "recording", label: "Recorded" },
  { key: "transcribing", label: "Transcribing" },
  { key: "summarizing", label: "Summarizing" },
  { key: "ready", label: "Complete" },
];

export function ProcessingStatus({
  status,
  errorMessage,
}: ProcessingStatusProps) {
  if (status === "ready") return null;

  if (status === "error") {
    return (
      <View className="mx-4 flex-row items-center gap-2 rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
        <Ionicons name="alert-circle" size={20} color="#ef4444" />
        <Text className="flex-1 text-sm text-red-600 dark:text-red-400">
          {errorMessage ?? "Something went wrong"}
        </Text>
      </View>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === status);

  return (
    <View className="mx-4 rounded-xl bg-primary-50 p-3 dark:bg-primary-900/20">
      <View className="flex-row items-center gap-3">
        {steps.map((step, index) => {
          const isDone = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <View key={step.key} className="flex-row items-center gap-1">
              {isDone ? (
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
              ) : isCurrent ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <View className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600" />
              )}
              <Text
                className={`text-xs ${
                  isCurrent
                    ? "font-medium text-primary-600 dark:text-primary-400"
                    : isDone
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </Text>
              {index < steps.length - 1 && (
                <View className="mx-1 h-px w-3 bg-gray-300 dark:bg-gray-600" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
