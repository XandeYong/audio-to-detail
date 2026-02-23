import { useCallback, useState } from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { SearchBar } from "@/src/components/SearchBar";
import { IdeaCard } from "@/src/components/IdeaCard";
import { EmptyState } from "@/src/components/EmptyState";
import { useIdeas } from "@/src/hooks/useIdeas";

export default function IdeasScreen() {
  const { ideas, isLoading, search, refresh } = useIdeas();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      search(text);
    },
    [search]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IdeaCard idea={item} />}
        ListHeaderComponent={
          <View className="pt-2">
            <SearchBar value={searchQuery} onChangeText={handleSearch} />
          </View>
        }
        ListEmptyComponent={
          searchQuery ? (
            <EmptyState
              icon="search-outline"
              title="No results"
              subtitle={`No ideas matching "${searchQuery}"`}
            />
          ) : (
            <EmptyState
              icon="bulb-outline"
              title="No ideas yet"
              subtitle="Record your first idea from the Capture tab"
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}
