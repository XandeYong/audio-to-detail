import { create } from "zustand";
import type { SQLiteDatabase } from "expo-sqlite";
import type { Idea } from "../types";
import * as queries from "../db/queries";

interface IdeasState {
  ideas: Idea[];
  isLoading: boolean;
  searchQuery: string;
  db: SQLiteDatabase | null;

  setDb: (db: SQLiteDatabase) => void;
  loadIdeas: () => Promise<void>;
  search: (query: string) => Promise<void>;
  addIdea: (idea: Pick<Idea, "id" | "audioUri" | "duration">) => Promise<void>;
  updateTranscript: (id: string, transcript: string) => Promise<void>;
  updateSummary: (
    id: string,
    data: {
      title: string;
      summary: string;
      keyPoints: string[];
      tags: string[];
    }
  ) => Promise<void>;
  updateStatus: (
    id: string,
    status: Idea["status"],
    errorMessage?: string
  ) => Promise<void>;
  updateTitle: (id: string, title: string) => Promise<void>;
  removeIdea: (id: string) => Promise<void>;
  getIdea: (id: string) => Idea | undefined;
}

export const useIdeasStore = create<IdeasState>((set, get) => ({
  ideas: [],
  isLoading: false,
  searchQuery: "",
  db: null,

  setDb: (db) => set({ db }),

  loadIdeas: async () => {
    const { db } = get();
    if (!db) return;
    set({ isLoading: true });
    const ideas = await queries.getAllIdeas(db);
    set({ ideas, isLoading: false });
  },

  search: async (query) => {
    const { db } = get();
    if (!db) return;
    set({ searchQuery: query, isLoading: true });
    const ideas = query
      ? await queries.searchIdeas(db, query)
      : await queries.getAllIdeas(db);
    set({ ideas, isLoading: false });
  },

  addIdea: async (idea) => {
    const { db } = get();
    if (!db) return;
    await queries.createIdea(db, idea);
    await get().loadIdeas();
  },

  updateTranscript: async (id, transcript) => {
    const { db } = get();
    if (!db) return;
    await queries.updateIdeaTranscript(db, id, transcript);
    await get().loadIdeas();
  },

  updateSummary: async (id, data) => {
    const { db } = get();
    if (!db) return;
    await queries.updateIdeaSummary(db, id, data);
    await get().loadIdeas();
  },

  updateStatus: async (id, status, errorMessage) => {
    const { db } = get();
    if (!db) return;
    await queries.updateIdeaStatus(db, id, status, errorMessage);
    await get().loadIdeas();
  },

  updateTitle: async (id, title) => {
    const { db } = get();
    if (!db) return;
    await queries.updateIdeaTitle(db, id, title);
    await get().loadIdeas();
  },

  removeIdea: async (id) => {
    const { db } = get();
    if (!db) return;
    await queries.deleteIdea(db, id);
    await get().loadIdeas();
  },

  getIdea: (id) => {
    return get().ideas.find((idea) => idea.id === id);
  },
}));
