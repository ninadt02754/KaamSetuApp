// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     FlatList,
//     Keyboard,
//     KeyboardAvoidingView,
//     Platform,
//     SafeAreaView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { API_BASE } from "../constants/Config";
// import {
//     KColors as Colors,
//     Radius,
//     Shadow,
//     Spacing,
// } from "../constants/kaamsetuTheme";

// const API_URL = "http://172.23.35.172:8030";

// type RawSender =
//   | string
//   | {
//       _id?: string;
//       id?: string;
//     }
//   | null
//   | undefined;

// type RawChatMessage = {
//   _id?: string;
//   id?: string;
//   senderId?: RawSender;
//   content?: string;
//   readStatus?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// };

// type ChatMessage = {
//   _id: string;
//   senderId: string;
//   content: string;
//   readStatus: boolean;
//   createdAt: string;
//   updatedAt?: string;
// };

// const getIdValue = (value: RawSender) => {
//   if (!value) return "";
//   if (typeof value === "string") return value;
//   if (typeof value === "object") return value._id || value.id || "";
//   return "";
// };

// const normalizeMessage = (msg: RawChatMessage, index: number): ChatMessage => {
//   return {
//     _id:
//       msg._id ||
//       msg.id ||
//       `${getIdValue(msg.senderId)}-${msg.createdAt || "no-date"}-${index}`,
//     senderId: getIdValue(msg.senderId),
//     content: msg.content || "",
//     readStatus: Boolean(msg.readStatus),
//     createdAt: msg.createdAt || new Date().toISOString(),
//     updatedAt: msg.updatedAt,
//   };
// };

// export default function JobChatScreen() {
//   const router = useRouter();
//   const { chatId } = useLocalSearchParams<{ chatId: string }>();

//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [myUserId, setMyUserId] = useState("");
//   const flatListRef = React.useRef<any>(null);

//   const loadMyUserId = async () => {
//     try {
//       const userString = await AsyncStorage.getItem("user");
//       if (!userString) return "";

//       const parsedUser = JSON.parse(userString);
//       const userId = parsedUser?._id || parsedUser?.id || "";
//       setMyUserId(userId);
//       return userId;
//     } catch (error) {
//       console.log("User parse error:", error);
//       return "";
//     }
//   };

//   const fetchMessages = async (showError = true) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!myUserId) {
//         await loadMyUserId();
//       }

//       if (!token || !chatId) {
//         setLoading(false);
//         return;
//       }

//       const res = await fetch(`${API_BASE}/chat/${chatId}/messages`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         if (showError) {
//           Alert.alert("Error", data.message || "Failed to fetch messages");
//         }
//         setLoading(false);
//         return;
//       }

//       const rawMessages = Array.isArray(data?.chat?.messages)
//         ? data.chat.messages
//         : [];

//       const normalizedMessages = rawMessages
//         .map((msg: RawChatMessage, index: number) =>
//           normalizeMessage(msg, index),
//         )
//         .sort(
//           (a: ChatMessage, b: ChatMessage) =>
//             new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
//         );

//       setMessages(normalizedMessages);
//       setTimeout(
//         () => flatListRef.current?.scrollToEnd({ animated: true }),
//         100,
//       );
//     } catch (error) {
//       console.log("Fetch messages error:", error);
//       if (showError) {
//         Alert.alert("Error", "Failed to load messages");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadMyUserId();
//   }, []);

//   useEffect(() => {
//     if (!chatId) {
//       setLoading(false);
//       return;
//     }

//     fetchMessages(false);

//     const interval = setInterval(() => {
//       fetchMessages(false);
//     }, 2500);

//     return () => clearInterval(interval);
//   }, [chatId, myUserId]);

//   const sendMessage = async () => {
//     const trimmed = input.trim();
//     if (!trimmed || sending) return;
//     Keyboard.dismiss();

//     try {
//       setSending(true);

//       const token = await AsyncStorage.getItem("token");

//       if (!token || !chatId) {
//         Alert.alert("Error", "Missing token or chatId");
//         return;
//       }

//       const res = await fetch(`${API_BASE}/chat/${chatId}/send`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },

//         body: JSON.stringify({
//           content: trimmed,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         Alert.alert("Error", data.message || "Failed to send message");
//         return;
//       }

//       setInput("");
//       await fetchMessages(false);
//     } catch (error) {
//       console.log("Send message error:", error);
//       Alert.alert("Error", "Failed to send message");
//     } finally {
//       setSending(false);
//     }
//   };

//   const renderItem = ({ item }: { item: ChatMessage }) => {
//     const isMine = item.senderId === myUserId;

//     return (
//       <View
//         style={[
//           styles.messageRow,
//           { justifyContent: isMine ? "flex-end" : "flex-start" },
//         ]}
//       >
//         <View
//           style={[
//             styles.messageBubble,
//             isMine ? styles.myMessage : styles.otherMessage,
//           ]}
//         >
//           <Text style={isMine ? styles.myMessageText : styles.otherMessageText}>
//             {item.content}
//           </Text>

//           <Text style={isMine ? styles.myTimeText : styles.otherTimeText}>
//             {new Date(item.createdAt).toLocaleTimeString("en-IN", {
//               hour: "numeric",
//               minute: "2-digit",
//             })}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   const emptyState = useMemo(() => {
//     if (loading) return null;
//     if (messages.length > 0) return null;
//     return (
//       <View style={styles.emptyWrap}>
//         <Text style={styles.emptyText}>No messages yet.</Text>
//       </View>
//     );
//   }, [loading, messages.length]);

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Text style={styles.backText}>‹</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Job Chat</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <KeyboardAvoidingView
//         style={styles.container}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
//       >
//         {loading ? (
//           <View style={styles.loaderWrap}>
//             <ActivityIndicator size="large" color={Colors.primary} />
//           </View>
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item) => item._id}
//             renderItem={renderItem}
//             contentContainerStyle={styles.listContent}
//             ListEmptyComponent={emptyState}
//             onContentSizeChange={() =>
//               flatListRef.current?.scrollToEnd({ animated: false })
//             }
//           />
//         )}

//         <View style={styles.inputBar}>
//           <TextInput
//             style={styles.input}
//             value={input}
//             onChangeText={setInput}
//             placeholder="Type a message..."
//             placeholderTextColor={Colors.textMuted}
//             multiline
//             blurOnSubmit={false}
//             onSubmitEditing={sendMessage}
//             returnKeyType="send"
//           />
//           <TouchableOpacity
//             style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
//             onPress={sendMessage}
//             disabled={sending}
//           >
//             <Text style={styles.sendBtnText}>
//               {sending ? "Sending..." : "Send"}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },

//   container: { flex: 1 },

//   header: {
//     backgroundColor: Colors.primary,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 14,
//   },

//   backBtn: {
//     width: 36,
//     justifyContent: "center",
//   },

//   backText: {
//     color: Colors.white,
//     fontSize: 28,
//     fontWeight: "300",
//     lineHeight: 32,
//   },

//   headerTitle: {
//     color: Colors.white,
//     fontSize: 18,
//     fontWeight: "700",
//   },

//   loaderWrap: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   listContent: {
//     padding: Spacing.md,
//     gap: 10,
//     flexGrow: 1,
//   },

//   emptyWrap: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 40,
//   },

//   emptyText: {
//     color: Colors.textMuted,
//     fontSize: 14,
//   },

//   messageRow: {
//     width: "100%",
//   },

//   messageBubble: {
//     maxWidth: "75%",
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     borderRadius: Radius.md,
//     ...Shadow.sm,
//   },

//   myMessage: {
//     backgroundColor: Colors.primary,
//     borderBottomRightRadius: 4,
//   },

//   otherMessage: {
//     backgroundColor: Colors.cardBg,
//     borderBottomLeftRadius: 4,
//     borderWidth: 1,
//     borderColor: Colors.cardBorder,
//   },

//   myMessageText: {
//     color: Colors.white,
//     fontSize: 15,
//   },

//   otherMessageText: {
//     color: Colors.textPrimary,
//     fontSize: 15,
//   },

//   myTimeText: {
//     color: "rgba(255,255,255,0.85)",
//     fontSize: 11,
//     marginTop: 6,
//     alignSelf: "flex-end",
//   },

//   otherTimeText: {
//     color: Colors.textMuted,
//     fontSize: 11,
//     marginTop: 6,
//     alignSelf: "flex-end",
//   },

//   inputBar: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     gap: 8,
//     padding: Spacing.md,
//     borderTopWidth: 1,
//     borderTopColor: Colors.cardBorder,
//     backgroundColor: Colors.white,
//   },

//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: Colors.cardBorder,
//     borderRadius: Radius.full,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     color: Colors.textPrimary,
//     backgroundColor: Colors.background,
//     maxHeight: 110,
//   },

//   sendBtn: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: Radius.full,
//   },

//   sendBtnDisabled: {
//     opacity: 0.7,
//   },

//   sendBtnText: {
//     color: Colors.white,
//     fontWeight: "700",
//   },
// });
// job-chat.tsx — Premium Redesign
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE } from "../constants/Config";

const { width } = Dimensions.get("window");

// ── Design Tokens ─────────────────────────────────────────────────────────────
const P = {
  gradientTop: "#0F2D55",
  gradientMid: "#1A4880",
  gradientBottom: "#1E5799",
  accentBlue: "#4A90D9",
  accentGlow: "#5BA3E8",
  chatBgTop: "#EBF3FF",
  chatBgBottom: "#F4F7FC",
  cardBg: "#FFFFFF",
  inputBg: "#F0F5FF",
  inputBorder: "#D5E3F7",
  textDark: "#0F2040",
  textMuted: "#7A95B5",
  divider: "#E2ECF8",
  white: "#FFFFFF",
  myBubbleTop: "#1A4880",
  myBubbleBottom: "#0F2D55",
  otherBubbleBg: "#FFFFFF",
  otherBubbleBorder: "#D5E3F7",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type RawSender = string | { _id?: string; id?: string } | null | undefined;
type RawChatMessage = {
  _id?: string;
  id?: string;
  senderId?: RawSender;
  content?: string;
  readStatus?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
type ChatMessage = {
  _id: string;
  senderId: string;
  content: string;
  readStatus: boolean;
  createdAt: string;
  updatedAt?: string;
};

const getIdValue = (value: RawSender) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value._id || value.id || "";
  return "";
};

const normalizeMessage = (msg: RawChatMessage, index: number): ChatMessage => ({
  _id:
    msg._id ||
    msg.id ||
    `${getIdValue(msg.senderId)}-${msg.createdAt || "no-date"}-${index}`,
  senderId: getIdValue(msg.senderId),
  content: msg.content || "",
  readStatus: Boolean(msg.readStatus),
  createdAt: msg.createdAt || new Date().toISOString(),
  updatedAt: msg.updatedAt,
});

// ── Time grouping helper ──────────────────────────────────────────────────────
const formatDateLabel = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function JobChatScreen() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myUserId, setMyUserId] = useState("");
  const flatListRef = React.useRef<any>(null);

  const loadMyUserId = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) return "";
      const parsedUser = JSON.parse(userString);
      const userId = parsedUser?._id || parsedUser?.id || "";
      setMyUserId(userId);
      return userId;
    } catch {
      return "";
    }
  };

  const fetchMessages = async (showError = true) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!myUserId) await loadMyUserId();
      if (!token || !chatId) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        if (showError)
          Alert.alert("Error", data.message || "Failed to fetch messages");
        setLoading(false);
        return;
      }

      const rawMessages = Array.isArray(data?.chat?.messages)
        ? data.chat.messages
        : [];
      const normalized = rawMessages
        .map((msg: RawChatMessage, i: number) => normalizeMessage(msg, i))
        .sort(
          (a: ChatMessage, b: ChatMessage) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      setMessages(normalized);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    } catch (error) {
      if (showError) Alert.alert("Error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyUserId();
  }, []);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }
    fetchMessages(false);
    const interval = setInterval(() => fetchMessages(false), 2500);
    return () => clearInterval(interval);
  }, [chatId, myUserId]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    Keyboard.dismiss();
    try {
      setSending(true);
      const token = await AsyncStorage.getItem("token");
      if (!token || !chatId) {
        Alert.alert("Error", "Missing token or chatId");
        return;
      }
      const res = await fetch(`${API_BASE}/chat/${chatId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to send message");
        return;
      }
      setInput("");
      await fetchMessages(false);
    } catch {
      Alert.alert("Error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Build list with date separators
  type ListItem =
    | { type: "message"; data: ChatMessage }
    | { type: "date"; label: string; id: string };

  const listItems = useMemo((): ListItem[] => {
    const result: ListItem[] = [];
    let lastDate = "";
    messages.forEach((msg) => {
      const dateLabel = formatDateLabel(msg.createdAt);
      if (dateLabel !== lastDate) {
        result.push({ type: "date", label: dateLabel, id: `date-${msg._id}` });
        lastDate = dateLabel;
      }
      result.push({ type: "message", data: msg });
    });
    return result;
  }, [messages]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "date") {
      return (
        <View style={st.dateSeparator}>
          <View style={st.dateLine} />
          <Text style={st.dateLabel}>{item.label}</Text>
          <View style={st.dateLine} />
        </View>
      );
    }

    const msg = item.data;
    const isMine = msg.senderId === myUserId;
    const time = new Date(msg.createdAt).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

    return (
      <View
        style={[
          st.messageRow,
          { justifyContent: isMine ? "flex-end" : "flex-start" },
        ]}
      >
        {!isMine && (
          <View style={st.otherAvatar}>
            <Ionicons name="person" size={14} color={P.white} />
          </View>
        )}
        <View style={st.bubbleWrapper}>
          {isMine ? (
            <LinearGradient
              colors={[P.accentGlow, P.myBubbleTop, P.myBubbleBottom]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[st.bubble, st.myBubble]}
            >
              <Text style={st.myMsgText}>{msg.content}</Text>
              <View style={st.msgFooter}>
                <Text style={st.myTimeText}>{time}</Text>
                <Ionicons
                  name={msg.readStatus ? "checkmark-done" : "checkmark"}
                  size={13}
                  color={msg.readStatus ? "#93C5FD" : "rgba(255,255,255,0.6)"}
                />
              </View>
            </LinearGradient>
          ) : (
            <View style={[st.bubble, st.otherBubble]}>
              <Text style={st.otherMsgText}>{msg.content}</Text>
              <Text style={st.otherTimeText}>{time}</Text>
            </View>
          )}
        </View>
        {isMine && <View style={{ width: 8 }} />}
      </View>
    );
  };

  return (
    // FIX: Use SafeAreaView as root with edges={["top"]} so the header
    // sits flush against the status bar with no extra gap.
    <SafeAreaView style={st.root} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={P.gradientTop} />

      {/* Gradient header — no extra bottom padding/curve hack needed */}
      <LinearGradient
        colors={[P.gradientTop, P.gradientMid, P.gradientBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.headerGradient}
      >
        <View style={st.decorCircle1} />
        <View style={st.decorCircle2} />

        <View style={st.topBar}>
          <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={20} color={P.white} />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={st.headerTitle}>Job Chat</Text>
            <View style={st.onlineRow}>
              <View style={st.onlineDot} />
              <Text style={st.onlineText}>Active</Text>
            </View>
          </View>
          <TouchableOpacity
            style={st.refreshBtn}
            onPress={() => fetchMessages(false)}
          >
            <Ionicons name="refresh-outline" size={18} color={P.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Chat area — directly below header, no margin/curve overlap */}
      <KeyboardAvoidingView
        style={st.kvFlex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <LinearGradient
          colors={[P.chatBgTop, P.chatBgBottom]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={st.chatBg}
        >
          {loading ? (
            <View style={st.loaderWrap}>
              <ActivityIndicator size="large" color={P.accentBlue} />
              <Text style={{ color: P.textMuted, fontSize: 13, marginTop: 10 }}>
                Loading messages...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={listItems}
              keyExtractor={(item) =>
                item.type === "date" ? item.id : item.data._id
              }
              renderItem={renderItem}
              contentContainerStyle={st.listContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
              ListEmptyComponent={
                <View style={st.emptyWrap}>
                  <View style={st.emptyIcon}>
                    <Ionicons
                      name="chatbubbles-outline"
                      size={36}
                      color={P.accentBlue}
                    />
                  </View>
                  <Text style={st.emptyTitle}>No messages yet</Text>
                  <Text style={st.emptySubtitle}>
                    Start the conversation below
                  </Text>
                </View>
              }
            />
          )}
        </LinearGradient>

        {/* Input bar */}
        <View style={st.inputBar}>
          <View style={st.inputWrapper}>
            <TextInput
              style={st.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={P.textMuted}
              multiline
              blurOnSubmit={false}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            style={[
              st.sendBtn,
              (!input.trim() || sending) && st.sendBtnDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                sending ? ["#94A3B8", "#94A3B8"] : [P.accentGlow, P.gradientTop]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={st.sendBtnGrad}
            >
              <Ionicons
                name={sending ? "hourglass-outline" : "send"}
                size={18}
                color={P.white}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  // FIX: root background matches header so no flash of wrong color
  root: { flex: 1, backgroundColor: P.gradientTop },

  // Header — no extra height constant needed, content sizes it naturally
  headerGradient: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -40,
    right: -30,
  },
  decorCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 0,
    left: -20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    // FIX: reduced paddingBottom — was contributing to extra space
    paddingBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: P.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#34D399",
  },
  onlineText: { color: "rgba(255,255,255,0.7)", fontSize: 11 },

  // FIX: removed curveSheet entirely — it was the main culprit adding ~20-30px gap

  kvFlex: { flex: 1 },
  chatBg: { flex: 1 },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  // FIX: paddingTop reduced from 20 to 12 — messages start closer to header
  listContent: { padding: 16, paddingTop: 12, gap: 4, flexGrow: 1 },

  // Date separator
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 12,
  },
  dateLine: { flex: 1, height: 1, backgroundColor: P.divider },
  dateLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: P.textMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
  },

  // Messages
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginVertical: 3,
  },
  otherAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: P.gradientMid,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  bubbleWrapper: { maxWidth: "72%" },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  myBubble: { borderRadius: 18, borderBottomRightRadius: 4 },
  otherBubble: {
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    backgroundColor: P.otherBubbleBg,
    borderWidth: 1,
    borderColor: P.otherBubbleBorder,
    shadowColor: "#1A3C5E",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  myMsgText: { color: P.white, fontSize: 15, lineHeight: 21 },
  otherMsgText: { color: P.textDark, fontSize: 15, lineHeight: 21 },
  msgFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
  },
  myTimeText: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  otherTimeText: { color: P.textMuted, fontSize: 11, alignSelf: "flex-end" },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: P.inputBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: P.inputBorder,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: P.textDark },
  emptySubtitle: { fontSize: 13, color: P.textMuted },

  // Input
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: P.white,
    borderTopWidth: 1,
    borderTopColor: P.divider,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: P.inputBg,
    borderWidth: 1.5,
    borderColor: P.inputBorder,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 46,
    justifyContent: "center",
  },
  input: { fontSize: 15, color: P.textDark, maxHeight: 110 },
  sendBtn: { width: 46, height: 46, borderRadius: 23, overflow: "hidden" },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGrad: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
});
