import { View, Text, Pressable } from "react-native";
import { Link, Stack } from "expo-router";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-white p-5 dark:bg-gray-900">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Pressable className="mt-4 rounded-lg bg-primary-500 px-4 py-2">
            <Text className="font-medium text-white">Go to home screen</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}
