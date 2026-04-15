// import { Tabs } from "expo-router";
// import { StyleSheet, Text, View } from "react-native";

// function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
//   return (
//     <View style={[styles.emojiWrap, focused && styles.emojiWrapFocused]}>
//       <Text style={styles.tabEmoji}>{emoji}</Text>
//     </View>
//   );
// }

// export default function TabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: false,
//         tabBarStyle: styles.tabBar,
//         tabBarShowLabel: false,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           tabBarIcon: ({ focused }) => <TabIcon emoji="📡" focused={focused} />,
//         }}
//       />
//       <Tabs.Screen
//         name="post-job"
//         options={{
//           tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />,
//         }}
//       />
//       <Tabs.Screen
//         name="account"
//         options={{
//           tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
//         }}
//       />
//     </Tabs>
//   );
// }

// const styles = StyleSheet.create({
//   tabBar: {
//     backgroundColor: "#1A3C5E",
//     borderTopWidth: 0,
//     height: 65,
//     paddingBottom: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.18,
//     shadowRadius: 10,
//     elevation: 12,
//   },
//   emojiWrap: {
//     width: 48,
//     height: 40,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 2,
//     borderColor: "transparent",
//   },
//   emojiWrapFocused: {
//     backgroundColor: "#F59E0B",
//     borderColor: "#F59E0B",
//     shadowColor: "#F59E0B",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.4,
//     shadowRadius: 6,
//     elevation: 4,
//   },
//   tabEmoji: { fontSize: 22 },
// });
import { Ionicons } from "@expo/vector-icons";
import { Href, Tabs, useRouter, useSegments } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  gradMid: "#1A4880",
  gradTop: "#0F2D55",
  accentGold: "#F59E0B",
  white: "#FFFFFF",
};

// ─── Custom Tab Bar rendered as a single absolute View ────────────────────────
// This guarantees perfect alignment because icons live inside the pill itself.
function CustomTabBar() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();

  // Derive active tab from current route segments
  const current = segments[segments.length - 1] ?? "index";

  const tabs = [
    { name: "index", icon: "radio-outline" as const },
    { name: "post-job", icon: "add-outline" as const },
    { name: "account", icon: "person-outline" as const },
  ];

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 4 : 10;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: bottomOffset }]}
    >
      <View style={styles.pill}>
        {tabs.map((tab, i) => {
          const focused =
            current === tab.name ||
            (tab.name === "index" && current === "(tabs)");
          const isCenter = i === 1;

          return (
            <Pressable
              key={tab.name}
              onPress={() =>
                router.push(`/${tab.name === "index" ? "" : tab.name}` as Href)
              }
              style={styles.tabItem}
              hitSlop={8}
            >
              {isCenter ? (
                <View
                  style={[styles.centerBtn, focused && styles.centerBtnFocused]}
                >
                  <Ionicons
                    name={tab.icon}
                    size={19}
                    color={focused ? C.gradTop : C.white}
                  />
                </View>
              ) : (
                <View style={styles.sideIconWrap}>
                  <Ionicons
                    name={tab.icon}
                    size={20}
                    color={focused ? C.white : "rgba(255,255,255,0.35)"}
                  />
                  {focused && <View style={styles.dot} />}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // hide default bar entirely
      }}
      tabBar={() => <CustomTabBar />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="post-job" />
      <Tabs.Screen name="account" />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PILL_H = 48; // compact height
const SIDE_GAP = 62; // horizontal inset — keeps pill short

const styles = StyleSheet.create({
  // Absolute container spanning full width but only sitting at the bottom
  wrapper: {
    position: "absolute",
    left: SIDE_GAP,
    right: SIDE_GAP,
    alignItems: "center",
    // Forward pointer events through the transparent wrapper
    zIndex: 999,
  },

  // The pill itself — icons live inside this
  pill: {
    width: "100%",
    height: PILL_H,
    backgroundColor: C.gradMid,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    // Blue upward glow
    shadowColor: C.gradMid,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 14,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: PILL_H,
  },

  sideIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.white,
  },

  centerBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
  },
  centerBtnFocused: {
    backgroundColor: C.white,
    borderColor: C.white,
    shadowColor: C.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
