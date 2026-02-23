import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search ideas...",
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 dark:bg-gray-800">
      <Ionicons
        name="search"
        size={18}
        color={isDark ? "#9ca3af" : "#6b7280"}
      />
      <TextInput
        className="flex-1 text-sm text-gray-900 dark:text-white"
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")}>
          <Ionicons
            name="close-circle"
            size={18}
            color={isDark ? "#6b7280" : "#9ca3af"}
          />
        </Pressable>
      )}
    </View>
  );
}
