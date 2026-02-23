import { useEffect } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { useIdeasStore } from "../stores/useIdeasStore";

export function useIdeas() {
  const db = useSQLiteContext();
  const store = useIdeasStore();

  useEffect(() => {
    store.setDb(db);
    store.loadIdeas();
  }, [db]);

  return {
    ideas: store.ideas,
    isLoading: store.isLoading,
    searchQuery: store.searchQuery,
    search: store.search,
    refresh: store.loadIdeas,
    removeIdea: store.removeIdea,
    updateTitle: store.updateTitle,
    getIdea: store.getIdea,
  };
}
