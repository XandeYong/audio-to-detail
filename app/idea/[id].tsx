import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AudioPlayer } from "@/src/components/AudioPlayer";
import { ProcessingStatus } from "@/src/components/ProcessingStatus";
import { useIdeas } from "@/src/hooks/useIdeas";
import { formatDuration, formatRelativeTime } from "@/src/utils/formatters";
import { deleteAudioFile } from "@/src/services/audio";

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ideas, removeIdea, updateTitle } = useIdeas();
  const idea = ideas.find((i) => i.id === id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Idea", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (idea) {
            await deleteAudioFile(idea.audioUri);
            await removeIdea(idea.id);
          }
          router.back();
        },
      },
    ]);
  }, [idea, removeIdea]);

  const handleSaveTitle = useCallback(async () => {
    if (editedTitle.trim() && idea) {
      await updateTitle(idea.id, editedTitle.trim());
    }
    setIsEditingTitle(false);
  }, [editedTitle, idea, updateTitle]);

  if (!idea) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <Text className="text-gray-500">Idea not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        {/* Title */}
        {isEditingTitle ? (
          <View className="mb-4 flex-row items-center gap-2">
            <TextInput
              className="flex-1 rounded-lg border border-primary-300 px-3 py-2 text-xl font-bold text-gray-900 dark:border-primary-700 dark:text-white"
              value={editedTitle}
              onChangeText={setEditedTitle}
              autoFocus
              onSubmitEditing={handleSaveTitle}
            />
            <Pressable onPress={handleSaveTitle}>
              <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setEditedTitle(idea.title);
              setIsEditingTitle(true);
            }}
            className="mb-4"
          >
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              {idea.title}
            </Text>
          </Pressable>
        )}

        {/* Metadata */}
        <View className="mb-4 flex-row items-center gap-3">
          <Text className="text-xs text-gray-400">
            {formatRelativeTime(idea.createdAt)}
          </Text>
          <Text className="text-xs text-gray-400">
            {formatDuration(idea.duration)}
          </Text>
          {idea.isSynced && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="cloud-done" size={12} color="#22c55e" />
              <Text className="text-xs text-green-500">Synced</Text>
            </View>
          )}
        </View>

        {/* Processing status */}
        {idea.status !== "ready" && (
          <View className="mb-4">
            <ProcessingStatus
              status={idea.status}
              errorMessage={idea.errorMessage}
            />
          </View>
        )}

        {/* Audio player */}
        <View className="mb-6">
          <AudioPlayer uri={idea.audioUri} duration={idea.duration} />
        </View>

        {/* Summary */}
        {idea.summary && (
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Summary
            </Text>
            <Text className="text-base leading-6 text-gray-800 dark:text-gray-200">
              {idea.summary}
            </Text>
          </View>
        )}

        {/* Key points */}
        {idea.keyPoints.length > 0 && (
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Key Points
            </Text>
            {idea.keyPoints.map((point, index) => (
              <View key={index} className="mb-2 flex-row gap-2">
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#3b82f6"
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-base text-gray-700 dark:text-gray-300">
                  {point}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tags */}
        {idea.tags.length > 0 && (
          <View className="mb-6">
            <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Tags
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {idea.tags.map((tag) => (
                <View
                  key={tag}
                  className="rounded-full bg-primary-100 px-3 py-1 dark:bg-primary-900"
                >
                  <Text className="text-sm text-primary-700 dark:text-primary-300">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Raw transcript (collapsible) */}
        {idea.rawTranscript && (
          <View className="mb-6">
            <Pressable
              onPress={() => setShowTranscript(!showTranscript)}
              className="mb-2 flex-row items-center gap-1"
            >
              <Text className="text-sm font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Raw Transcript
              </Text>
              <Ionicons
                name={showTranscript ? "chevron-up" : "chevron-down"}
                size={14}
                color="#9ca3af"
              />
            </Pressable>
            {showTranscript && (
              <View className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <Text className="text-sm leading-5 text-gray-600 dark:text-gray-400">
                  {idea.rawTranscript}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View className="mb-8 flex-row gap-3">
          <Pressable
            onPress={handleDelete}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-red-200 py-3 dark:border-red-900"
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
            <Text className="text-sm font-medium text-red-500">Delete</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
