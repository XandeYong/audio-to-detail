import "../global.css";
import { useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { SQLiteProvider } from "expo-sqlite";
import { migrateDb } from "@/src/db/schema";
import { useAuthStore } from "@/src/stores/useAuthStore";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const initialize = useAuthStore((s) => s.initialize);

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!loaded) return null;

  return (
    <SQLiteProvider databaseName="audiotodetail.db" onInit={migrateDb}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="record"
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="idea/[id]"
            options={{
              title: "Idea",
              headerBackTitle: "Back",
            }}
          />
        </Stack>
      </ThemeProvider>
    </SQLiteProvider>
  );
}
