// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React from "react";
// import { Base_Url , API_BASE} from "../constants/Config";
// import {
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import {
//   KColors as Colors,
//   Radius,
//   Shadow,
//   Spacing,
// } from "../constants/kaamsetuTheme";

// function Avatar({ name, size = 80 }: { name: string; size?: number }) {
//   const initials = name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   return (
//     <View
//       style={[
//         styles.avatar,
//         { width: size, height: size, borderRadius: size / 2 },
//       ]}
//     >
//       <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.32 }}>
//         {initials}
//       </Text>
//     </View>
//   );
// }

// export default function WorkerProfileScreen() {
//   const { workerId, jobId, applicationId } = useLocalSearchParams<{
//     workerId: string;
//     jobId: string;
//     applicationId: string;
//   }>();

//   const router = useRouter();
//   const [worker, setWorker] = React.useState<any>(null);
//   const [loading, setLoading] = React.useState(true);

//   React.useEffect(() => {
//     const fetchWorker = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         const res = await fetch(`${Base_Url}/api/auth/user/${workerId}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         if (res.ok) {
//           setWorker(data.user || data);
//         }
//       } catch (e) {
//         console.log("Worker fetch error:", e);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (workerId) fetchWorker();
//   }, [workerId]);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.safe}>
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={Colors.primary} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!worker) {
//     return (
//       <SafeAreaView style={styles.safe}>
//         <View style={styles.centered}>
//           <Text style={{ color: Colors.textMuted }}>Worker not found.</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const handleAccept = () => {
//     Alert.alert(
//       "Confirm Selection",
//       `Accept ${worker.name} for this job? All other applicants will be notified.`,
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Accept",
//           onPress: () => {
//             Alert.alert(
//               "Success",
//               "Applicant accepted! The job is now in progress.",
//               [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
//             );
//           },
//         },
//       ],
//     );
//   };

//   const handleChat = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "Please login again.");
//         return;
//       }

//       if (!jobId || !workerId || !applicationId) {
//         Alert.alert("Error", "Missing jobId, workerId, or applicationId");
//         return;
//       }

//       const res = await fetch(`${API_BASE}/chat/create`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           jobId,
//           workerId,
//           applicationId,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         Alert.alert("Error", data.message || "Failed to create chat");
//         return;
//       }

//       const chatId = data.chat?._id;

//       if (!chatId) {
//         Alert.alert("Error", "Chat created but chatId missing");
//         return;
//       }

//       router.push(`/job-chat?chatId=${chatId}`);
//     } catch (error) {
//       console.log("Chat create error:", error);
//       Alert.alert("Error", "Failed to open chat");
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Text style={styles.backText}>‹</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Worker Profile</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.heroCard}>
//           <Avatar name={worker.name || "Worker"} size={90} />
// <Text style={styles.heroName}>{worker.name || "Worker"}</Text>
// <Text style={styles.heroTag}>{worker.skills?.join(", ") || "Worker"}</Text>

// <View style={styles.heroRatingRow}>
//   {[1, 2, 3, 4, 5].map((i) => (
//     <Text
//       key={i}
//       style={{
//         color:
//           i <= Math.round(worker.averageRating || 0) ? Colors.starGold : "#DDD",
//         fontSize: 18,
//       }}
//     >
//       ★
//     </Text>
//   ))}
//   <Text style={styles.heroRatingText}>
//     {" "}
//     {worker.averageRating?.toFixed(1) || "0"} ({worker.totalRatings || 0} Ratings)
//   </Text>
// </View>

// <View style={styles.heroPills}>
//   <View style={styles.heroPill}>
//     <Text style={styles.heroPillText}>📍 {worker.address || "N/A"}</Text>
//   </View>
//   <View style={styles.heroPill}>
//     <Text style={styles.heroPillText}>📞 {worker.phone || "N/A"}</Text>
//   </View>
// </View>

//           <View style={styles.actionRow}>
//             <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
//               <Text style={styles.chatBtnText}>💬 Chat</Text>
//             </TouchableOpacity>

//             {jobId ? (
//               <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
//                 <Text style={styles.acceptBtnText}>✓ Accept</Text>
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         </View>

//         <View style={styles.sectionHeader}>
//   <View style={styles.sectionAccent} />
//   <Text style={styles.sectionTitle}>Worker Info</Text>
// </View>

// <View style={styles.workCard}>
//   <Text style={styles.workTitle}>Email: {worker.email || "N/A"}</Text>
//   <Text style={styles.workTime}>Phone: {worker.phone || "N/A"}</Text>
//   <Text style={styles.workTime}>Address: {worker.address || "N/A"}</Text>
// </View>

//         <View style={{ height: 32 }} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     backgroundColor: Colors.primary,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: Spacing.md,
//     paddingVertical: 14,
//   },
//   backBtn: { width: 36, justifyContent: "center" },
//   backText: {
//     color: Colors.white,
//     fontSize: 28,
//     fontWeight: "300",
//     lineHeight: 32,
//   },
//   headerTitle: { color: Colors.white, fontSize: 18, fontWeight: "700" },
//   scrollContent: { padding: Spacing.md, gap: 12 },
//   heroCard: {
//     backgroundColor: Colors.cardBg,
//     borderRadius: Radius.lg,
//     padding: Spacing.lg,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: Colors.cardBorder,
//     ...Shadow.md,
//     gap: 10,
//   },
//   avatar: {
//     backgroundColor: Colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   heroName: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: Colors.textPrimary,
//     marginTop: 4,
//   },
//   heroTag: { fontSize: 14, color: Colors.primary, fontWeight: "600" },
//   heroRatingRow: { flexDirection: "row", alignItems: "center" },
//   heroRatingText: { fontSize: 13, color: Colors.textSecondary },
//   heroPills: { flexDirection: "row", gap: 12, marginTop: 4 },
//   heroPill: {
//     backgroundColor: Colors.primaryPale,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: Radius.full,
//   },
//   heroPillText: { fontSize: 12, fontWeight: "600", color: Colors.primary },
//   actionRow: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
//   chatBtn: {
//     flex: 1,
//     backgroundColor: Colors.primaryPale,
//     borderRadius: Radius.full,
//     paddingVertical: 12,
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: Colors.primary,
//   },
//   chatBtnText: { color: Colors.primary, fontWeight: "700", fontSize: 15 },
//   acceptBtn: {
//     flex: 1,
//     backgroundColor: Colors.primary,
//     borderRadius: Radius.full,
//     paddingVertical: 12,
//     alignItems: "center",
//   },
//   acceptBtnText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 8,
//   },
//   sectionAccent: {
//     width: 4,
//     height: 20,
//     backgroundColor: Colors.primary,
//     borderRadius: 2,
//   },
//   sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.textPrimary },
//   workCard: {
//     backgroundColor: Colors.primaryPale,
//     borderRadius: Radius.md,
//     padding: Spacing.md,
//     borderWidth: 1,
//     borderColor: Colors.cardBorder,
//     gap: 4,
//   },
//   workTopRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   workTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: Colors.textPrimary,
//     flex: 1,
//   },
//   workRatingText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: Colors.textPrimary,
//   },
//   workTime: { fontSize: 11, color: Colors.textMuted },
//   workReview: {
//     fontSize: 13,
//     color: Colors.textSecondary,
//     fontStyle: "italic",
//   },
// });
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { API_BASE, Base_Url } from "../constants/Config";
import { KColors as Colors } from "../constants/kaamsetuTheme";

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 84 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 4 },
      ]}
    >
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: size * 0.32 }}>
        {initials}
      </Text>
    </View>
  );
}

// ── Stat box ──────────────────────────────────────────────────────────────────
function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Text style={styles.infoIcon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function WorkerProfileScreen() {
  const { workerId, jobId, applicationId } = useLocalSearchParams<{
    workerId: string;
    jobId: string;
    applicationId: string;
  }>();

  const router = useRouter();
  const [worker, setWorker] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [pastWorks, setPastWorks] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchWorker = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        // Fetch worker profile (includes ratings array)
        const res = await fetch(`${Base_Url}/api/auth/user/${workerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const workerData = data.user || data;
          setWorker(workerData);
        }
        // Fetch worker past completed applications for past works section
        const appsRes = await fetch(
          `${Base_Url}/api/applications/worker-history/${workerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setPastWorks(Array.isArray(appsData.applications) ? appsData.applications : []);
        }
      } catch (e) {
        console.log("Worker fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    if (workerId) fetchWorker();
  }, [workerId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!worker) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={{ color: Colors.textMuted }}>Worker not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleAccept = () => {
    Alert.alert(
      "Confirm Selection",
      `Accept ${worker.name} for this job? All other applicants will be notified.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            Alert.alert(
              "Success",
              "Applicant accepted! The job is now in progress.",
              [{ text: "OK", onPress: () => router.replace("/(tabs)") }],
            );
          },
        },
      ],
    );
  };

  const handleChat = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login again.");
        return;
      }
      if (!jobId || !workerId || !applicationId) {
        Alert.alert("Error", "Missing jobId, workerId, or applicationId");
        return;
      }
      const res = await fetch(`${API_BASE}/chat/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, workerId, applicationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message || "Failed to create chat");
        return;
      }
      const chatId = data.chat?._id;
      if (!chatId) {
        Alert.alert("Error", "Chat created but chatId missing");
        return;
      }
      router.push(`/job-chat?chatId=${chatId}`);
    } catch (error) {
      Alert.alert("Error", "Failed to open chat");
    }
  };

  const rating = worker.averageRating || 0;
  const skills: string[] = worker.skills || [];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* ── Blue gradient hero zone ── */}
      <LinearGradient
        colors={[Colors.primary, "#1A4880", "#1E5799"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <SafeAreaView>
          {/* Header row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Worker Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Avatar + name */}
          <View style={styles.heroContent}>
            <View style={styles.avatarWrap}>
              <Avatar name={worker.name || "Worker"} size={88} />
              {/* Online dot */}
              <View style={styles.onlineDot} />
            </View>

            <Text style={styles.heroName}>{worker.name || "Worker"}</Text>

            {/* Role badge */}
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>⚒ Worker</Text>
            </View>

            {/* Star rating */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Text
                  key={i}
                  style={{
                    color:
                      i <= Math.round(rating)
                        ? "#FBBF24"
                        : "rgba(255,255,255,0.25)",
                    fontSize: 18,
                  }}
                >
                  ★
                </Text>
              ))}
              <Text style={styles.ratingText}>
                {"  "}
                {rating.toFixed(1)} ({worker.totalRatings || 0} ratings)
              </Text>
            </View>

            {/* Stats strip */}
            <View style={styles.statsRow}>
              <StatBox value={worker.activeJobs ?? 0} label="Active Jobs" />
              <View style={styles.statDivider} />
              <StatBox value={worker.completedJobs ?? 0} label="Completed" />
              <View style={styles.statDivider} />
              <StatBox value={worker.totalRatings ?? 0} label="Reviews" />
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* ── Curved white sheet ── */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Action buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.chatBtn} onPress={handleChat}>
            <Text style={styles.chatBtnText}>💬 Chat</Text>
          </TouchableOpacity>
          {/* {jobId ? (
            <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
              <Text style={styles.acceptBtnText}>✓ Accept</Text>
            </TouchableOpacity>
          ) : null} */}
        </View>

        {/* ── Skills ── */}
        {skills.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Skills</Text>
            </View>
            <View style={styles.skillsWrap}>
              {skills.map((s) => (
                <View key={s} style={styles.skillPill}>
                  <Text style={styles.skillPillText}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Contact info card ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Contact & Info</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="✉️" label="Email" value={worker.email || "N/A"} />
          <View style={styles.infoDivider} />
          <InfoRow icon="📞" label="Phone" value={worker.phone || "N/A"} />
          <View style={styles.infoDivider} />
          <InfoRow icon="📍" label="Address" value={worker.address || "N/A"} />
        </View>

        {/* ── Past Works (Bug 3) ── */}
        {pastWorks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Past Works</Text>
            </View>
            {pastWorks.map((app: any, idx: number) => (
              <View key={app._id || idx} style={styles.infoCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1A3C5E", flex: 1 }}>
                    {app.jobId?.category || "Job"}
                  </Text>
                  <View style={{ backgroundColor: "#DBEAFE", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ fontSize: 11, color: "#1D4ED8", fontWeight: "600" }}>Completed</Text>
                  </View>
                </View>
                {app.jobId?.description ? (
                  <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }} numberOfLines={2}>
                    {app.jobId.description}
                  </Text>
                ) : null}
                {app.jobId?.address ? (
                  <Text style={{ fontSize: 12, color: "#94A3B8" }}>📍 {app.jobId.address}</Text>
                ) : null}
                {app.jobId?.completedAt ? (
                  <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                    🗓 {new Date(app.jobId.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        {/* ── Reviews & Ratings (Bug 3) ── */}
        {worker.ratings && worker.ratings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
            </View>
            {worker.ratings.slice(0, 10).map((r: any, idx: number) => (
              <View key={r._id || idx} style={[styles.infoCard, { marginBottom: 10 }]}>
                {/* Stars */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  {[1,2,3,4,5].map((star) => (
                    <Text key={star} style={{ color: star <= r.rating ? "#FBBF24" : "#E2E8F0", fontSize: 16 }}>★</Text>
                  ))}
                  <Text style={{ marginLeft: 6, fontSize: 13, fontWeight: "700", color: "#1A3C5E" }}>
                    {r.rating}/5
                  </Text>
                </View>
                {r.review ? (
                  <Text style={{ fontSize: 13, color: "#374151", fontStyle: "italic" }}>
                    "{r.review}"
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12, color: "#94A3B8" }}>No written review</Text>
                )}
                <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
                  🗓 {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                </Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f0f2f8" },

  safe: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ── Hero gradient ────────────────────────────────────────────────────────────
  heroGradient: {
    paddingBottom: 36, // extra bottom so curve overlaps nicely
    overflow: "hidden",
    position: "relative",
  },

  decorCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -60,
    right: -50,
  },
  decorCircle2: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 10,
    left: -30,
  },

  // ── Header row ───────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "300",
    lineHeight: 30,
    marginTop: -2,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  // ── Hero content ─────────────────────────────────────────────────────────────
  heroContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },

  avatarWrap: {
    position: "relative",
    marginBottom: 2,
  },

  avatar: {
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
  },

  onlineDot: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#34D399",
    borderWidth: 2,
    borderColor: "#1A4880",
  },

  heroName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.4,
  },

  roleBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  roleBadgeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12.5,
    fontWeight: "700",
  },

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  ratingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12.5,
    fontWeight: "500",
  },

  // ── Stats strip ──────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginTop: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },

  statValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },

  statLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10.5,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  // ── White curved sheet ────────────────────────────────────────────────────────
  sheet: {
    flex: 1,
    backgroundColor: "#f0f2f8",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -26,
  },

  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 0,
  },

  // ── Action buttons ───────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  chatBtn: {
    flex: 1,
    backgroundColor: "#e7edff",
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#4A7BF7",
  },

  chatBtnText: {
    color: "#1a3fbf",
    fontWeight: "700",
    fontSize: 15,
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
  },

  acceptBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  // ── Section headers ──────────────────────────────────────────────────────────
  sectionHeader: {
    marginBottom: 10,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#8891aa",
  },

  // ── Skills ───────────────────────────────────────────────────────────────────
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },

  skillPill: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#dde2f0",
    shadowColor: "#0D1B3E",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },

  skillPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3a56c4",
  },

  // ── Info card ─────────────────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#0D1B3E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
  },

  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f0f3ff",
    justifyContent: "center",
    alignItems: "center",
  },

  infoIcon: {
    fontSize: 18,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#aab0c6",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D1B3E",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#eef0f6",
    marginLeft: 54,
  },
});
