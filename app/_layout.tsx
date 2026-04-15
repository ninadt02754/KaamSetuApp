import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import * as Notifications from "expo-notifications";  // ✅ ADDED
import { SafeAreaProvider } from "react-native-safe-area-context";

// ✅ ADDED
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AuthGuard() {
  const segments = useSegments();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsLoggedIn(Boolean(token));
    };
    checkLogin();
  }, [segments]);

  useEffect(() => {
    if (isLoggedIn === null) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isLoggedIn && !inAuthGroup) {
      router.replace("/(auth)/login");
    }

    if (isLoggedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, segments]);

  return null;
}

export default function RootLayout() {
  return (
    <>
      <SafeAreaProvider>
      <AuthGuard />

      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screens */}
        {/* <Stack.Screen name="(auth)" /> */}

        {/* Main app */}
        <Stack.Screen name="(tabs)" />

        {/* Other screens */}
        <Stack.Screen name="update-profile" />
        <Stack.Screen name="applicants/[jobId]" />
        <Stack.Screen name="worker-profile/[workerId]" />
        <Stack.Screen name="chat/[workerId]" />
        <Stack.Screen name="view-status/[jobId]" />
        <Stack.Screen name="referrals" />
        <Stack.Screen name="applications" />
        </Stack>
        </SafeAreaProvider>
    </>
  );
}