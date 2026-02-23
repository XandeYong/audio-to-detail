# Audio-to-Detail: Idea Capture App

## Overview
A cross-platform mobile app (Android-first, iOS-compatible) that records voice memos, transcribes them, and uses AI to generate structured idea summaries. Ideas are stored locally and synced to the cloud for backup and cross-device access.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native + Expo | SDK 54 |
| Language | TypeScript | 5.x |
| Navigation | Expo Router | file-based |
| Audio | expo-audio | latest (replaces deprecated expo-av) |
| Local DB | expo-sqlite | tagged template literals API |
| Styling | NativeWind | v4 (Tailwind for RN) |
| State | Zustand | 5.x |
| Cloud DB | Supabase | Postgres + Auth + Storage |
| API Proxy | Supabase Edge Functions | Deno runtime |
| Transcription | OpenAI Whisper API | gpt-4o-transcribe |
| Summarization | Anthropic Claude API | claude-sonnet-4-5 |

---

## Architecture

### Project Structure
```
audio-to-detail/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (providers, fonts)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab navigator layout
│   │   ├── index.tsx             # Home — big record button + recent ideas
│   │   ├── ideas.tsx             # Browse/search all ideas
│   │   └── settings.tsx          # Settings, account, API config
│   ├── idea/
│   │   └── [id].tsx              # Idea detail view
│   └── record.tsx                # Full-screen recording experience
├── src/
│   ├── components/
│   │   ├── RecordButton.tsx      # Animated record button
│   │   ├── IdeaCard.tsx          # Idea preview card for lists
│   │   ├── AudioPlayer.tsx       # Playback of recorded audio
│   │   ├── WaveformVisualizer.tsx # Live audio waveform
│   │   ├── ProcessingStatus.tsx  # Transcribing/summarizing status
│   │   ├── IdeaDetail.tsx        # Full idea display
│   │   └── SearchBar.tsx         # Search ideas
│   ├── services/
│   │   ├── audio.ts              # Audio recording (expo-audio)
│   │   ├── transcription.ts      # Calls Edge Function → Whisper API
│   │   ├── summarization.ts      # Calls Edge Function → Claude API
│   │   ├── supabase.ts           # Supabase client init
│   │   └── sync.ts               # Local ↔ cloud sync logic
│   ├── stores/
│   │   ├── useIdeasStore.ts      # Ideas CRUD + state
│   │   ├── useRecordingStore.ts  # Recording state
│   │   └── useAuthStore.ts       # Auth state
│   ├── db/
│   │   ├── schema.ts             # SQLite table definitions
│   │   ├── migrations.ts         # DB migration runner
│   │   └── queries.ts            # Typed query functions
│   ├── hooks/
│   │   ├── useRecording.ts       # Recording hook (start/stop/pause)
│   │   ├── useIdeas.ts           # Ideas list + search hook
│   │   └── useSync.ts            # Sync status hook
│   ├── types/
│   │   └── index.ts              # Shared TypeScript types
│   └── utils/
│       ├── formatters.ts         # Duration, date formatting
│       └── prompts.ts            # Claude prompt templates
├── supabase/
│   ├── migrations/
│   │   └── 001_initial.sql       # Supabase DB schema
│   └── functions/
│       ├── transcribe/
│       │   └── index.ts          # Edge Function: Whisper proxy
│       └── summarize/
│           └── index.ts          # Edge Function: Claude proxy
├── assets/
│   └── fonts/                    # Custom fonts if needed
├── tailwind.config.js
├── app.json                      # Expo config
├── tsconfig.json
└── package.json
```

---

## Data Model

### Local SQLite Schema
```sql
CREATE TABLE ideas (
  id TEXT PRIMARY KEY,           -- UUID
  title TEXT NOT NULL,           -- AI-generated title
  raw_transcript TEXT,           -- Full transcription
  summary TEXT,                  -- AI-generated structured summary
  key_points TEXT,               -- JSON array of key points
  tags TEXT,                     -- JSON array of tags
  audio_uri TEXT,                -- Local file path
  audio_cloud_url TEXT,          -- Supabase storage URL
  duration INTEGER,              -- Recording duration (ms)
  status TEXT DEFAULT 'recording', -- recording|transcribing|summarizing|ready|error
  error_message TEXT,            -- Error details if status=error
  is_synced INTEGER DEFAULT 0,  -- 0=unsynced, 1=synced
  created_at TEXT NOT NULL,      -- ISO timestamp
  updated_at TEXT NOT NULL       -- ISO timestamp
);

CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX idx_ideas_status ON ideas(status);
```

### TypeScript Types
```typescript
interface Idea {
  id: string;
  title: string;
  rawTranscript: string | null;
  summary: string | null;
  keyPoints: string[];
  tags: string[];
  audioUri: string;
  audioCloudUrl: string | null;
  duration: number;
  status: 'recording' | 'transcribing' | 'summarizing' | 'ready' | 'error';
  errorMessage: string | null;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Supabase Cloud Schema (mirrors local)
```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  raw_transcript TEXT,
  summary TEXT,
  key_points JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  audio_cloud_url TEXT,
  duration INTEGER,
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: users can only access their own ideas
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their ideas" ON ideas
  FOR ALL USING (auth.uid() = user_id);
```

---

## Processing Pipeline

```
┌──────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Record   │───▶│  Save Audio  │───▶│  Transcribe │───▶│  Summarize   │
│  (expo-   │    │  locally     │    │  (Whisper)  │    │  (Claude)    │
│  audio)   │    │  (.m4a)      │    │             │    │              │
└──────────┘    └──────────────┘    └─────────────┘    └──────────────┘
                                                              │
                                    ┌─────────────┐           │
                                    │  Save to     │◀──────────┘
                                    │  SQLite      │
                                    │  (local)     │
                                    └──────┬──────┘
                                           │ (when online)
                                    ┌──────▼──────┐
                                    │  Sync to     │
                                    │  Supabase    │
                                    └─────────────┘
```

1. **Record**: User presses record → expo-audio captures audio as .m4a
2. **Save locally**: Audio file saved to app filesystem, idea row created in SQLite with status='recording'
3. **Transcribe**: Audio uploaded to Supabase Edge Function → proxied to Whisper API → transcript returned, status='transcribing'
4. **Summarize**: Transcript sent to Edge Function → proxied to Claude API → returns title, summary, key points, tags, status='summarizing'
5. **Store**: All data saved to SQLite, status='ready'
6. **Sync**: When online, unsynced ideas pushed to Supabase (audio to Storage, metadata to Postgres)

---

## Claude Prompt Strategy

```
You are an idea extraction assistant. Given a raw voice transcript,
extract and structure the following:

1. **Title**: A concise, descriptive title (max 10 words)
2. **Summary**: A clear, actionable summary (2-4 sentences)
3. **Key Points**: Bullet points of the core ideas (3-7 points)
4. **Tags**: Relevant category tags (2-5 tags)

The transcript may be informal, rambling, or contain filler words.
Focus on extracting the actual ideas and intentions.

Respond in JSON format:
{
  "title": "...",
  "summary": "...",
  "keyPoints": ["...", "..."],
  "tags": ["...", "..."]
}
```

---

## Supabase Edge Functions

### `transcribe/index.ts`
- Receives audio file upload
- Forwards to OpenAI Whisper API (gpt-4o-transcribe)
- Returns transcript text
- API key stored as Supabase secret (never on device)

### `summarize/index.ts`
- Receives transcript text
- Sends to Claude API with extraction prompt
- Returns structured JSON (title, summary, keyPoints, tags)
- API key stored as Supabase secret (never on device)

---

## Screen Designs

### Home Tab (index.tsx)
- Large centered record button with pulse animation
- "Tap to capture your idea" text
- Recent ideas list below (last 5)
- Quick stats: total ideas count

### Ideas Tab (ideas.tsx)
- Search bar at top
- Filter chips: All / Today / This Week / Tags
- Scrollable list of IdeaCards
- Each card shows: title, summary preview, tags, timestamp, duration

### Idea Detail (idea/[id].tsx)
- Title (editable)
- Audio player with waveform
- Summary section
- Key points list
- Tags (editable)
- Raw transcript (expandable)
- Delete / Re-process actions

### Record Screen (record.tsx)
- Full-screen dark overlay
- Large waveform visualizer
- Timer display
- Pause / Stop buttons
- Cancel button

### Settings Tab (settings.tsx)
- Account (Supabase auth — email/Google)
- Sync status & manual sync button
- Audio quality settings
- Theme (light/dark/system)
- About & version

---

## Implementation Steps

### Phase 1: Project Scaffolding
1. Initialize Expo project with TypeScript template
2. Install and configure dependencies (expo-router, NativeWind, Zustand, expo-sqlite, expo-audio)
3. Set up Tailwind config + NativeWind
4. Set up Expo Router with tab navigation
5. Create basic screen shells for all routes

### Phase 2: Audio Recording
6. Implement audio recording service using expo-audio
7. Build RecordButton component with animation
8. Build full-screen recording UI with waveform + timer
9. Save audio files to local filesystem
10. Build AudioPlayer component for playback

### Phase 3: Local Database
11. Define SQLite schema and migrations
12. Implement DB query functions (CRUD for ideas)
13. Create Zustand ideas store connected to SQLite
14. Build IdeaCard and ideas list UI

### Phase 4: AI Processing Pipeline
15. Set up Supabase project (remote)
16. Create `transcribe` Edge Function (Whisper proxy)
17. Create `summarize` Edge Function (Claude proxy)
18. Implement transcription service (call Edge Function)
19. Implement summarization service (call Edge Function)
20. Wire up the full pipeline: record → transcribe → summarize → save

### Phase 5: UI Polish
21. Build Idea detail screen with all sections
22. Implement search and filtering on Ideas tab
23. Add ProcessingStatus component (real-time status updates)
24. Add pull-to-refresh on ideas list
25. Add empty states and loading skeletons

### Phase 6: Cloud Sync & Auth
26. Set up Supabase Auth (email + Google OAuth)
27. Create Supabase cloud schema with RLS
28. Implement sync service (local → cloud)
29. Upload audio files to Supabase Storage
30. Add sync status indicators in UI

### Phase 7: Polish & Production
31. Add dark mode support via NativeWind
32. Error handling and retry logic for API calls
33. Haptic feedback on record actions
34. App icon and splash screen
35. Test on Android and iOS

---

## Key Design Decisions

1. **Edge Functions as API proxy**: API keys (OpenAI, Anthropic) never touch the device. All AI calls go through Supabase Edge Functions.
2. **Offline-first**: Recording and local storage work without internet. Transcription/summarization queued until online.
3. **expo-audio over expo-av**: expo-av is deprecated; expo-audio is the recommended replacement.
4. **SQLite tagged templates**: Using the new Bun-inspired API for type-safe, injection-proof queries.
5. **Zustand over Redux**: Minimal boilerplate, excellent RN performance, perfect for this app's complexity level.
6. **NativeWind v4**: Tailwind utility classes in RN for rapid, consistent styling.

---

## Dependencies (package.json)

### Core
- `expo` ~54.0.0
- `expo-router` ~4.x
- `react-native` 0.81.x
- `typescript` ~5.x

### Audio & Media
- `expo-audio` latest
- `expo-file-system` latest

### Database & Storage
- `expo-sqlite` latest
- `@supabase/supabase-js` ~2.97.0

### State & UI
- `zustand` ~5.x
- `nativewind` ~4.x
- `tailwindcss` ~3.4.x
- `react-native-reanimated` latest
- `expo-haptics` latest

### Utilities
- `uuid` (for idea IDs)
- `date-fns` (date formatting)
