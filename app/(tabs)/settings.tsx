import { View, Text, Pressable, Alert, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useAuthStore } from "@/src/stores/useAuthStore";

function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-3"
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name={icon} size={20} color="#6b7280" />
        <Text className="text-base text-gray-900 dark:text-white">{label}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        {value && (
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {value}
          </Text>
        )}
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
        )}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="mx-4 mb-1 mt-6 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
      {title}
    </Text>
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      {/* Account */}
      <SectionHeader title="Account" />
      <View className="mx-4 rounded-xl bg-gray-50 dark:bg-gray-800">
        {user ? (
          <>
            <SettingsRow
              icon="person"
              label="Email"
              value={user.email ?? "Unknown"}
            />
            <View className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />
            <SettingsRow
              icon="log-out-outline"
              label="Sign Out"
              onPress={handleSignOut}
            />
          </>
        ) : (
          <SettingsRow
            icon="log-in-outline"
            label="Sign In to enable cloud sync"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Authentication will be available in the next update."
              );
            }}
          />
        )}
      </View>

      {/* Sync */}
      <SectionHeader title="Sync" />
      <View className="mx-4 rounded-xl bg-gray-50 dark:bg-gray-800">
        <SettingsRow
          icon="cloud-outline"
          label="Cloud Sync"
          value={user ? "Enabled" : "Sign in required"}
        />
        <View className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />
        <SettingsRow icon="sync-outline" label="Sync Now" onPress={() => {}} />
      </View>

      {/* App */}
      <SectionHeader title="App" />
      <View className="mx-4 rounded-xl bg-gray-50 dark:bg-gray-800">
        <SettingsRow
          icon="color-palette-outline"
          label="Theme"
          value={colorScheme === "dark" ? "Dark" : "Light"}
        />
        <View className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />
        <SettingsRow icon="musical-notes-outline" label="Audio Quality" value="High" />
      </View>

      {/* About */}
      <SectionHeader title="About" />
      <View className="mx-4 mb-8 rounded-xl bg-gray-50 dark:bg-gray-800">
        <SettingsRow icon="information-circle-outline" label="Version" value="1.0.0" />
      </View>
    </ScrollView>
  );
}
