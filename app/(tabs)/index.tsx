import { View, Text, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RecordButton } from "@/src/components/RecordButton";
import { IdeaCard } from "@/src/components/IdeaCard";
import { EmptyState } from "@/src/components/EmptyState";
import { useIdeas } from "@/src/hooks/useIdeas";
import { useRecording } from "@/src/hooks/useRecording";
import { formatDuration } from "@/src/utils/formatters";

export default function HomeScreen() {
  const { ideas } = useIdeas();
  const { isRecording, transcript, durationMs, start, stop } = useRecording();

  const recentIdeas = ideas.slice(0, 5);

  const handleRecordPress = async () => {
    if (isRecording) {
      const id = await stop();
      if (id) {
        router.push(`/idea/${id}`);
      }
    } else {
      try {
        await start();
      } catch (error) {
        console.warn("Recording failed:", error);
      }
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Hero section */}
      <View className="items-center px-6 pb-6 pt-8">
        <Text className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Capture Your Idea
        </Text>
        <Text className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Tap to record your thought. We'll transcribe it live.
        </Text>

        <RecordButton
          isRecording={isRecording}
          onPress={handleRecordPress}
          size="large"
        />

        {isRecording && (
          <View className="mt-4 items-center gap-2">
            <View className="flex-row items-center gap-2">
              <View className="h-2 w-2 rounded-full bg-red-500" />
              <Text className="text-base font-medium text-red-500">
                {formatDuration(durationMs)}
              </Text>
            </View>
            {transcript ? (
              <Text
                className="mt-2 max-w-[280px] text-center text-sm text-gray-600 dark:text-gray-400"
                numberOfLines={3}
              >
                {transcript}
              </Text>
            ) : (
              <Text className="mt-2 text-sm italic text-gray-400">
                Listening...
              </Text>
            )}
          </View>
        )}

        {!isRecording && (
          <Pressable
            onPress={() => router.push("/record")}
            className="mt-4 flex-row items-center gap-1"
          >
            <Ionicons name="expand-outline" size={16} color="#3b82f6" />
            <Text className="text-sm text-primary-500">
              Full-screen recording
            </Text>
          </Pressable>
        )}
      </View>

      {/* Stats bar */}
      <View className="mx-4 mb-4 flex-row items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
        <View className="flex-row items-center gap-2">
          <Ionicons name="bulb" size={18} color="#3b82f6" />
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {ideas.length} {ideas.length === 1 ? "idea" : "ideas"} captured
          </Text>
        </View>
        {ideas.length > 0 && (
          <Pressable onPress={() => router.push("/(tabs)/ideas")}>
            <Text className="text-sm text-primary-500">View all</Text>
          </Pressable>
        )}
      </View>

      {/* Recent ideas */}
      {recentIdeas.length > 0 ? (
        <FlatList
          data={recentIdeas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IdeaCard idea={item} />}
          ListHeaderComponent={
            <Text className="mx-4 mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              Recent Ideas
            </Text>
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="mic-outline"
          title="No ideas yet"
          subtitle="Tap the microphone to record your first idea"
        />
      )}
    </View>
  );
}
