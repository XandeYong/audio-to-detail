import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Ionicons name={icon} size={64} color="#d1d5db" />
      <Text className="mt-4 text-center text-lg font-semibold text-gray-400 dark:text-gray-500">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-400 dark:text-gray-600">
        {subtitle}
      </Text>
    </View>
  );
}
