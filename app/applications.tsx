// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { useEffect, useMemo, useState } from "react";
// import {
//     ActivityIndicator,
//     Alert,
//     FlatList,
//     Modal,
//     SafeAreaView,
//     StatusBar,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import {
//     KColors as Colors,
//     Radius,
//     Shadow,
//     Spacing,
// } from "../constants/kaamsetuTheme";

// const API_URL = "http://10.211.100.130:8030";

// function StarRatingInput({
//   rating,
//   onRate,
// }: {
//   rating: number;
//   onRate: (r: number) => void;
// }) {
//   return (
//     <View style={{ flexDirection: "row", gap: 6 }}>
//       {[1, 2, 3, 4, 5].map((i) => (
//         <TouchableOpacity key={i} onPress={() => onRate(i)}>
//           <Text
//             style={{
//               fontSize: 28,
//               color: i <= rating ? Colors.starGold : "#DDD",
//             }}
//           >
//             ★
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// type WorkerRef =
//   | string
//   | {
//       _id: string;
//       name?: string;
//       phone?: string;
//       skills?: string[];
//     }
//   | null;

// type ApplicationItem = {
//   _id: string;
//   workerId?: WorkerRef;
//   workerName?: string;
//   workerPhone?: string;
//   skills?: string[];
//   status?: string;
//   source?: "direct" | "referral";
//   jobId?: string | { _id: string };
//   createdAt?: string; // Added for parsing referral dates
// };

// type ReferralItem = {
//   _id: string;
//   workerName: string;
//   workerPhone: string;
//   skills?: string[];
//   createdAt?: string;
//   jobId?: string | { _id: string; title?: string; company?: string };
// };

// type ListRow =
//   | { type: "section"; id: string; title: string }
//   | { type: "application"; id: string; data: ApplicationItem }
//   | { type: "referral"; id: string; data: ReferralItem };

// const safeJson = async (res: Response) => {
//   try {
//     const text = await res.text();
//     return JSON.parse(text);
//   } catch {
//     return null;
//   }
// };

// export default function ApplicationListScreen() {
//   const { jobId } = useLocalSearchParams<{ jobId: string }>();
//   const router = useRouter();
//   const [tab, setTab] = useState<"accepted" | "pending">("accepted");
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState("");
//   const [ratingModal, setRatingModal] = useState<{
//     visible: boolean;
//     appId: string;
//   }>({
//     visible: false,
//     appId: "",
//   });
//   const [applications, setApplications] = useState<ApplicationItem[]>([]);
//   const [referrals, setReferrals] = useState<ReferralItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   const getWorkerIdValue = (workerId?: WorkerRef) => {
//     if (!workerId) return null;
//     return typeof workerId === "string" ? workerId : workerId._id;
//   };

//   const getWorkerDisplayName = (app: ApplicationItem) => {
//     if (app.workerName) return app.workerName;
//     if (app.workerId && typeof app.workerId !== "string" && app.workerId.name) {
//       return app.workerId.name;
//     }
//     if (app.workerPhone) return `Worker (${app.workerPhone})`;
//     if (app.workerId && typeof app.workerId === "string") {
//       return `Worker ID: ${app.workerId}`;
//     }
//     return "Worker";
//   };

//   const getWorkerPhone = (app: ApplicationItem) => {
//     if (app.workerPhone) return app.workerPhone;
//     if (app.workerId && typeof app.workerId !== "string") {
//       return app.workerId.phone || null;
//     }
//     return null;
//   };

//   const getWorkerSkills = (app: ApplicationItem) => {
//     if (app.skills && app.skills.length > 0) return app.skills;
//     if (app.workerId && typeof app.workerId !== "string") {
//       return app.workerId.skills || [];
//     }
//     return [];
//   };

//   const getJobIdValue = (app: ApplicationItem) => {
//     if (app.jobId && typeof app.jobId !== "string") return app.jobId._id;
//     if (app.jobId && typeof app.jobId === "string") return app.jobId;
//     return jobId || null;
//   };

//   const fetchData = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token || !jobId) {
//         setLoading(false);
//         return;
//       }

//       const [applicationsRes, referralsRes] = await Promise.all([
//         fetch(`${API_URL}/api/applications/job/${jobId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }),
//         fetch(`${API_URL}/api/referrals`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }),
//       ]);

//       const applicationsData = await safeJson(applicationsRes);
//       const referralsData = await safeJson(referralsRes);

//       if (!applicationsRes.ok) {
//         console.log("Applications fetch error:", applicationsData);
//         setApplications([]);
//       } else {
//         setApplications(
//           Array.isArray(applicationsData)
//             ? applicationsData
//             : applicationsData.applications || [],
//         );
//       }

//       if (!referralsRes.ok) {
//         console.log("Referrals fetch error:", referralsData);
//         setReferrals([]);
//       } else {
//         setReferrals(
//           Array.isArray(referralsData?.referrals)
//             ? referralsData.referrals
//             : [],
//         );
//       }
//     } catch (error) {
//       console.log("Applications/referrals fetch error:", error);
//       setApplications([]);
//       setReferrals([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [jobId]);

//   // Split standard applications (registered users) from referred applications
//   const filteredStandardApps = useMemo(() => {
//     return applications.filter(
//       (app) =>
//         app.source !== "referral" &&
//         (tab === "accepted"
//           ? app.status === "accepted"
//           : app.status === "pending" || !app.status),
//     );
//   }, [applications, tab]);

//   const filteredReferredAppsAsReferrals = useMemo(() => {
//     // Referrals usually fall under the pending logic until completed/accepted elsewhere
//     if (tab !== "pending") return [];
//     return applications.filter((app) => app.source === "referral");
//   }, [applications, tab]);

//   const filteredReferrals = useMemo(() => {
//     if (tab !== "pending") return [];
//     return referrals.filter((item) => {
//       if (!item.jobId || !jobId) return false;
//       if (typeof item.jobId === "string") {
//         return item.jobId === jobId;
//       }
//       return item.jobId._id === jobId;
//     });
//   }, [referrals, jobId, tab]);

//   const listData: ListRow[] = useMemo(() => {
//     const rows: ListRow[] = [];

//     // --- STANDARD APPLICANTS SECTION ---
//     rows.push({
//       type: "section",
//       id: "applicants-section",
//       title: "Applicants",
//     });

//     filteredStandardApps.forEach((item) => {
//       rows.push({
//         type: "application",
//         id: `application-${item._id}`,
//         data: item,
//       });
//     });

//     // --- REFERRED WORKERS SECTION ---
//     if (tab === "pending") {
//       rows.push({
//         type: "section",
//         id: "referrals-section",
//         title: "Referred Workers",
//       });

//       // 1. Add referrals strictly from the referrals endpoint
//       filteredReferrals.forEach((item) => {
//         rows.push({ type: "referral", id: `referral-${item._id}`, data: item });
//       });

//       // 2. Add applications that are actually referrals (like Harshit)
//       filteredReferredAppsAsReferrals.forEach((app) => {
//         rows.push({
//           type: "referral",
//           id: `app-referral-${app._id}`,
//           data: {
//             _id: app._id,
//             workerName: getWorkerDisplayName(app),
//             workerPhone: getWorkerPhone(app) || "No phone provided",
//             skills: getWorkerSkills(app),
//             createdAt: app.createdAt,
//             jobId: app.jobId,
//           } as ReferralItem,
//         });
//       });
//     }

//     return rows;
//   }, [
//     filteredStandardApps,
//     filteredReferrals,
//     filteredReferredAppsAsReferrals,
//     tab,
//   ]);

//   const handleAccept = async (applicationId: string) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(
//         `${API_URL}/api/applications/accept/${applicationId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       const data = await res.json();

//       if (res.ok) {
//         Alert.alert("Success", "Worker accepted!");
//         fetchData();
//       } else {
//         Alert.alert("Error", data.message || "Failed to accept");
//       }
//     } catch (error) {
//       console.log("Accept error:", error);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   const handleReject = async (applicationId: string) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(
//         `${API_URL}/api/applications/reject/${applicationId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       const data = await res.json();

//       if (res.ok) {
//         Alert.alert("Success", "Worker rejected!");
//         fetchData();
//       } else {
//         Alert.alert("Error", data.message || "Failed to reject");
//       }
//     } catch (error) {
//       console.log("Reject error:", error);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   const handleChat = async (app: ApplicationItem) => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const workerIdValue = getWorkerIdValue(app.workerId);
//       const jobIdValue = getJobIdValue(app);

//       if (!token || !jobIdValue || !workerIdValue || !app._id) {
//         Alert.alert("Error", "Missing chat details");
//         return;
//       }

//       const res = await fetch(`${API_URL}/api/chat/create`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           jobId: jobIdValue,
//           workerId: workerIdValue,
//           applicationId: app._id,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok && data.chat?._id) {
//         router.push(`/job-chat?chatId=${data.chat._id}`);
//       } else {
//         Alert.alert("Error", data.message || "Could not open chat");
//       }
//     } catch (error) {
//       console.log("Chat error:", error);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   const handleRatingSubmit = async () => {
//     const appId = ratingModal.appId;
//     const token = await AsyncStorage.getItem("token");
//     const res = await fetch(`${API_URL}/api/applications/complete/${appId}`, {
//       method: "PUT",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ rating, review }),
//     });
//     const data = await res.json();
//     if (res.ok) {
//       setRatingModal({ visible: false, appId: "" });
//       setRating(0);
//       setReview("");
//       Alert.alert("Thank you!", "Your rating has been submitted.");
//       fetchData();
//     } else {
//       Alert.alert("Error", data.message || "Failed to submit rating");
//     }
//   };

//   const handleSkipRating = () => {
//     setRatingModal({ visible: false, appId: "" });
//     setRating(0);
//     setReview("");
//   };

//   const renderItem = ({ item }: { item: ListRow }) => {
//     if (item.type === "section") {
//       return (
//         <View style={styles.sectionHeader}>
//           <Text style={styles.sectionTitle}>{item.title}</Text>
//         </View>
//       );
//     }

//     if (item.type === "application") {
//       const app = item.data;
//       const workerIdValue = getWorkerIdValue(app.workerId);
//       const canOpenProfile = !!workerIdValue;
//       const status = app.status || "pending";
//       const workerDisplayName = getWorkerDisplayName(app);
//       const workerPhone = getWorkerPhone(app);

//       return (
//         <View style={styles.card}>
//           <TouchableOpacity
//             disabled={!canOpenProfile}
//             onPress={() => {
//               if (!workerIdValue) return;
//               router.push(
//                 `/worker-profile?workerId=${workerIdValue}&jobId=${jobId}&applicationId=${app._id}`,
//               );
//             }}
//           >
//             <Text style={styles.cardTitle}>{workerDisplayName}</Text>

//             {workerPhone ? (
//               <Text style={styles.cardSubtitle}>Phone: {workerPhone}</Text>
//             ) : null}

//             <Text style={styles.cardSubtitle}>Status: {status}</Text>

//             {canOpenProfile && (
//               <Text style={styles.openText}>View Profile →</Text>
//             )}
//           </TouchableOpacity>

//           <View style={styles.actionRow}>
//             {status === "pending" && (
//               <>
//                 <TouchableOpacity
//                   style={styles.acceptBtn}
//                   onPress={() => handleAccept(app._id)}
//                 >
//                   <Text style={styles.acceptBtnText}>Accept</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={styles.rejectBtn}
//                   onPress={() => handleReject(app._id)}
//                 >
//                   <Text style={styles.rejectBtnText}>Reject</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             <TouchableOpacity
//               style={styles.chatBtn}
//               onPress={() => handleChat(app)}
//             >
//               <Text style={styles.chatBtnText}>Chat</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     }

//     // Since we mapped source==="referral" applications to this type,
//     // it will now use this card, hiding the Accept/Reject/Chat buttons natively!
//     const referral = item.data;

//     return (
//       <View style={styles.referralCard}>
//         <Text style={styles.cardTitle}>{referral.workerName}</Text>
//         <Text style={styles.cardSubtitle}>Phone: {referral.workerPhone}</Text>

//         {referral.skills && referral.skills.length > 0 ? (
//           <Text style={styles.cardSubtitle}>
//             Skills: {referral.skills.join(", ")}
//           </Text>
//         ) : null}

//         {referral.createdAt ? (
//           <Text style={styles.metaText}>
//             Referred on:{" "}
//             {new Date(referral.createdAt).toLocaleDateString("en-IN")}
//           </Text>
//         ) : null}

//         <View style={styles.noChatBadge}>
//           <Text style={styles.noChatText}>No Chat Available</Text>
//         </View>
//       </View>
//     );
//   };

//   const keyExtractor = (item: ListRow) => item.id;

//   const showApplicantsEmpty = filteredStandardApps.length === 0;
//   const showReferralsEmpty =
//     tab === "pending"
//       ? filteredReferrals.length === 0 &&
//         filteredReferredAppsAsReferrals.length === 0
//       : false;
//   const showCompletelyEmpty =
//     showApplicantsEmpty && (tab === "pending" ? showReferralsEmpty : true);

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Text style={styles.backText}>‹</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Applicants</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       {/* Tab switcher */}
//       <View style={{ flexDirection: "row", gap: 10, padding: 12 }}>
//         {(["accepted", "pending"] as const).map((t) => (
//           <TouchableOpacity
//             key={t}
//             onPress={() => setTab(t)}
//             style={{
//               flex: 1,
//               padding: 10,
//               borderRadius: 999,
//               backgroundColor: tab === t ? Colors.primary : "#F1F3F5",
//               alignItems: "center",
//             }}
//           >
//             <Text
//               style={{
//                 color: tab === t ? "#fff" : Colors.textSecondary,
//                 fontWeight: "700",
//               }}
//             >
//               {t.charAt(0).toUpperCase() + t.slice(1)}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color={Colors.primary} />
//         </View>
//       ) : showCompletelyEmpty ? (
//         <View style={styles.centered}>
//           <Text style={styles.emptyText}>
//             No applicants or referred workers found.
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={listData}
//           keyExtractor={keyExtractor}
//           renderItem={renderItem}
//           contentContainerStyle={styles.listContent}
//           ListFooterComponent={
//             <>
//               {showApplicantsEmpty && (
//                 <View style={styles.emptyBlock}>
//                   <Text style={styles.emptyMiniText}>No applicants found.</Text>
//                 </View>
//               )}
//               {showReferralsEmpty && (
//                 <View style={styles.emptyBlock}>
//                   <Text style={styles.emptyMiniText}>
//                     No referred workers found.
//                   </Text>
//                 </View>
//               )}
//             </>
//           }
//         />
//       )}

//       {/* Rating Modal */}
//       <Modal transparent animationType="fade" visible={ratingModal.visible}>
//         <View style={styles.overlay}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Rate the Worker</Text>
//             <Text style={styles.modalSubtitle}>How was your experience?</Text>
//             <StarRatingInput rating={rating} onRate={setRating} />
//             <TextInput
//               style={styles.reviewInput}
//               placeholder="Write a review (optional)..."
//               placeholderTextColor="#aaa"
//               value={review}
//               onChangeText={setReview}
//               multiline
//               numberOfLines={3}
//             />
//             <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
//               <TouchableOpacity
//                 style={styles.skipBtn}
//                 onPress={handleSkipRating}
//               >
//                 <Text style={styles.skipBtnText}>Skip</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.submitRatingBtn}
//                 onPress={handleRatingSubmit}
//               >
//                 <Text style={styles.submitRatingText}>Submit & End</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },

//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: Spacing.md,
//   },

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

//   listContent: {
//     padding: Spacing.md,
//     gap: 12,
//   },

//   sectionHeader: {
//     marginTop: 4,
//     marginBottom: 2,
//   },

//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: Colors.textPrimary,
//   },

//   card: {
//     backgroundColor: Colors.cardBg,
//     borderRadius: Radius.lg,
//     padding: Spacing.md,
//     borderWidth: 1,
//     borderColor: Colors.cardBorder,
//     ...Shadow.md,
//   },

//   referralCard: {
//     backgroundColor: Colors.cardBg,
//     borderRadius: Radius.lg,
//     padding: Spacing.md,
//     borderWidth: 1,
//     borderColor: Colors.cardBorder,
//     ...Shadow.md,
//   },

//   cardTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: Colors.textPrimary,
//   },

//   cardSubtitle: {
//     marginTop: 4,
//     fontSize: 13,
//     color: Colors.textSecondary,
//   },

//   openText: {
//     marginTop: 10,
//     fontSize: 14,
//     fontWeight: "700",
//     color: Colors.primary,
//   },
//   detailRow: { flexDirection: "row", gap: 8 },
//   detailKey: {
//     width: 80,
//     fontSize: 12,
//     fontWeight: "700",
//     color: Colors.textSecondary,
//   },
//   detailVal: { flex: 1, fontSize: 12, color: Colors.textPrimary },

//   metaText: {
//     marginTop: 8,
//     fontSize: 12,
//     color: Colors.textMuted,
//   },

//   noChatBadge: {
//     alignSelf: "flex-start",
//     marginTop: 10,
//     backgroundColor: "#F1F3F5",
//     borderRadius: 999,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },

//   noChatText: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: "#6B7280",
//   },

//   emptyText: {
//     fontSize: 15,
//     color: Colors.textMuted,
//     textAlign: "center",
//   },

//   emptyBlock: {
//     marginTop: 4,
//     marginBottom: 4,
//   },

//   emptyMiniText: {
//     fontSize: 14,
//     color: Colors.textMuted,
//   },

//   actionRow: {
//     flexDirection: "row",
//     gap: 10,
//     marginTop: 14,
//     flexWrap: "wrap",
//   },

//   acceptBtn: {
//     flex: 1,
//     backgroundColor: "#2E7D32",
//     borderRadius: Radius.full,
//     paddingVertical: 12,
//     alignItems: "center",
//     minWidth: 90,
//   },

//   acceptBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   rejectBtn: {
//     flex: 1,
//     backgroundColor: "#C62828",
//     borderRadius: Radius.full,
//     paddingVertical: 12,
//     alignItems: "center",
//     minWidth: 90,
//   },

//   rejectBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   chatBtn: {
//     flex: 1,
//     backgroundColor: Colors.primary,
//     borderRadius: Radius.full,
//     paddingVertical: 12,
//     alignItems: "center",
//     minWidth: 90,
//   },

//   chatBtnText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 15,
//   },
//   skipBtnText: { color: Colors.textSecondary, fontWeight: "600", fontSize: 14 },
//   overlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   modalCard: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 24,
//     width: "100%",
//     gap: 12,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: Colors.textPrimary,
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: Colors.textSecondary,
//   },
//   reviewInput: {
//     borderWidth: 1,
//     borderColor: "#DDD",
//     borderRadius: 10,
//     padding: 10,
//     fontSize: 14,
//     color: Colors.textPrimary,
//     minHeight: 80,
//     textAlignVertical: "top",
//   },
//   skipBtn: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 999,
//     backgroundColor: "#F1F3F5",
//     alignItems: "center",
//   },
//   submitRatingBtn: {
//     flex: 1,
//     padding: 12,
//     borderRadius: 999,
//     backgroundColor: Colors.primary,
//     alignItems: "center",
//   },
//   submitRatingText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 14,
//   },
// });
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KColors as Colors, Spacing } from "../constants/kaamsetuTheme";

const API_URL = "http://10.211.100.130:8030";

// ─── Avatar initials helper ───────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#1a3fbf", light: "#e7edff" },
  { bg: "#0f6e49", light: "#e6f9f0" },
  { bg: "#9a5f00", light: "#fff5e5" },
  { bg: "#a82424", light: "#fce9e9" },
  { bg: "#5b42d4", light: "#f2f0ff" },
];

function getAvatarColor(name: string) {
  const idx =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function AvatarCircle({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const color = getAvatarColor(name);
  return (
    <View style={[styles.avatar, { backgroundColor: color.bg }]}>
      <Text style={styles.avatarText}>{initials || "W"}</Text>
    </View>
  );
}

// ─── Star rating input ────────────────────────────────────────────────────────
function StarRatingInput({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (r: number) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity key={i} onPress={() => onRate(i)}>
          <Text
            style={{
              fontSize: 28,
              color: i <= rating ? Colors.starGold : "#DDD",
            }}
          >
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type WorkerRef =
  | string
  | { _id: string; name?: string; phone?: string; skills?: string[] }
  | null;

type ApplicationItem = {
  _id: string;
  workerId?: WorkerRef;
  workerName?: string;
  workerPhone?: string;
  skills?: string[];
  status?: string;
  source?: "direct" | "referral";
  jobId?: string | { _id: string };
  createdAt?: string;
};

type ReferralItem = {
  _id: string;
  workerName: string;
  workerPhone: string;
  skills?: string[];
  createdAt?: string;
  jobId?: string | { _id: string; title?: string; company?: string };
};

type ListRow =
  | { type: "section"; id: string; title: string; count: number }
  | { type: "application"; id: string; data: ApplicationItem }
  | { type: "referral"; id: string; data: ReferralItem };

const safeJson = async (res: Response) => {
  try {
    const text = await res.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ApplicationListScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<"accepted" | "pending">("accepted");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [ratingModal, setRatingModal] = useState<{
    visible: boolean;
    appId: string;
  }>({ visible: false, appId: "" });
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getWorkerIdValue = (workerId?: WorkerRef) => {
    if (!workerId) return null;
    return typeof workerId === "string" ? workerId : workerId._id;
  };

  const getWorkerDisplayName = (app: ApplicationItem) => {
    if (app.workerName) return app.workerName;
    if (app.workerId && typeof app.workerId !== "string" && app.workerId.name)
      return app.workerId.name;
    if (app.workerPhone) return `Worker (${app.workerPhone})`;
    if (app.workerId && typeof app.workerId === "string")
      return `Worker ID: ${app.workerId}`;
    return "Worker";
  };

  const getWorkerPhone = (app: ApplicationItem) => {
    if (app.workerPhone) return app.workerPhone;
    if (app.workerId && typeof app.workerId !== "string")
      return app.workerId.phone || null;
    return null;
  };

  const getWorkerSkills = (app: ApplicationItem) => {
    if (app.skills && app.skills.length > 0) return app.skills;
    if (app.workerId && typeof app.workerId !== "string")
      return app.workerId.skills || [];
    return [];
  };

  const getJobIdValue = (app: ApplicationItem) => {
    if (app.jobId && typeof app.jobId !== "string") return app.jobId._id;
    if (app.jobId && typeof app.jobId === "string") return app.jobId;
    return jobId || null;
  };

  // ─── Data fetching ────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token || !jobId) {
        setLoading(false);
        return;
      }

      const [applicationsRes, referralsRes] = await Promise.all([
        fetch(`${API_URL}/api/applications/job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/referrals`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const applicationsData = await safeJson(applicationsRes);
      const referralsData = await safeJson(referralsRes);

      setApplications(
        applicationsRes.ok
          ? Array.isArray(applicationsData)
            ? applicationsData
            : applicationsData.applications || []
          : [],
      );
      setReferrals(
        referralsRes.ok && Array.isArray(referralsData?.referrals)
          ? referralsData.referrals
          : [],
      );
    } catch {
      setApplications([]);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  // ─── Filtered lists ───────────────────────────────────────────────────────
  const filteredStandardApps = useMemo(
    () =>
      applications.filter(
        (app) =>
          app.source !== "referral" &&
          (tab === "accepted"
            ? app.status === "accepted"
            : app.status === "pending" || !app.status),
      ),
    [applications, tab],
  );

  const filteredReferredAppsAsReferrals = useMemo(() => {
    if (tab !== "pending") return [];
    return applications.filter((app) => app.source === "referral");
  }, [applications, tab]);

  const filteredReferrals = useMemo(() => {
    if (tab !== "pending") return [];
    return referrals.filter((item) => {
      if (!item.jobId || !jobId) return false;
      return typeof item.jobId === "string"
        ? item.jobId === jobId
        : item.jobId._id === jobId;
    });
  }, [referrals, jobId, tab]);

  const listData: ListRow[] = useMemo(() => {
    const rows: ListRow[] = [];

    rows.push({
      type: "section",
      id: "applicants-section",
      title: "Applicants",
      count: filteredStandardApps.length,
    });

    filteredStandardApps.forEach((item) =>
      rows.push({
        type: "application",
        id: `application-${item._id}`,
        data: item,
      }),
    );

    if (tab === "pending") {
      const refCount =
        filteredReferrals.length + filteredReferredAppsAsReferrals.length;
      rows.push({
        type: "section",
        id: "referrals-section",
        title: "Referred Workers",
        count: refCount,
      });

      filteredReferrals.forEach((item) =>
        rows.push({ type: "referral", id: `referral-${item._id}`, data: item }),
      );

      filteredReferredAppsAsReferrals.forEach((app) =>
        rows.push({
          type: "referral",
          id: `app-referral-${app._id}`,
          data: {
            _id: app._id,
            workerName: getWorkerDisplayName(app),
            workerPhone: getWorkerPhone(app) || "No phone provided",
            skills: getWorkerSkills(app),
            createdAt: app.createdAt,
            jobId: app.jobId,
          } as ReferralItem,
        }),
      );
    }

    return rows;
  }, [
    filteredStandardApps,
    filteredReferrals,
    filteredReferredAppsAsReferrals,
    tab,
  ]);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleAccept = async (applicationId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/applications/accept/${applicationId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Worker accepted!");
        fetchData();
      } else Alert.alert("Error", data.message || "Failed to accept");
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/applications/reject/${applicationId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Worker rejected!");
        fetchData();
      } else Alert.alert("Error", data.message || "Failed to reject");
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleChat = async (app: ApplicationItem) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const workerIdValue = getWorkerIdValue(app.workerId);
      const jobIdValue = getJobIdValue(app);
      if (!token || !jobIdValue || !workerIdValue || !app._id) {
        Alert.alert("Error", "Missing chat details");
        return;
      }
      const res = await fetch(`${API_URL}/api/chat/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobIdValue,
          workerId: workerIdValue,
          applicationId: app._id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.chat?._id)
        router.push(`/job-chat?chatId=${data.chat._id}`);
      else Alert.alert("Error", data.message || "Could not open chat");
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleRatingSubmit = async () => {
    const appId = ratingModal.appId;
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/applications/complete/${appId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating, review }),
    });
    const data = await res.json();
    if (res.ok) {
      setRatingModal({ visible: false, appId: "" });
      setRating(0);
      setReview("");
      Alert.alert("Thank you!", "Your rating has been submitted.");
      fetchData();
    } else Alert.alert("Error", data.message || "Failed to submit rating");
  };

  const handleSkipRating = () => {
    setRatingModal({ visible: false, appId: "" });
    setRating(0);
    setReview("");
  };

  // ─── Render item ──────────────────────────────────────────────────────────
  const renderItem = ({ item }: { item: ListRow }) => {
    // Section header
    if (item.type === "section") {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          {item.count > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{item.count}</Text>
            </View>
          )}
        </View>
      );
    }

    // Standard application card
    if (item.type === "application") {
      const app = item.data;
      const workerIdValue = getWorkerIdValue(app.workerId);
      const canOpenProfile = !!workerIdValue;
      const status = app.status || "pending";
      const workerDisplayName = getWorkerDisplayName(app);
      const workerPhone = getWorkerPhone(app);
      const skills = getWorkerSkills(app);
      const isPending = status === "pending";

      return (
        <View style={styles.card}>
          {/* Top row: avatar + name + status pill */}
          <View style={styles.cardTop}>
            <AvatarCircle name={workerDisplayName} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{workerDisplayName}</Text>
              {workerPhone ? (
                <Text style={styles.cardPhone}>{workerPhone}</Text>
              ) : null}
            </View>
            <View
              style={[
                styles.statusPill,
                isPending ? styles.statusPending : styles.statusAccepted,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  isPending
                    ? styles.statusPendingText
                    : styles.statusAcceptedText,
                ]}
              >
                {isPending ? "Pending" : "Accepted"}
              </Text>
            </View>
          </View>

          {/* Skills row */}
          {skills.length > 0 && (
            <View style={styles.skillsRow}>
              {skills.map((s) => (
                <View key={s} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* View profile link */}
          {canOpenProfile && (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/worker-profile?workerId=${workerIdValue}&jobId=${jobId}&applicationId=${app._id}`,
                )
              }
            >
              <Text style={styles.profileLink}>View Profile →</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* Action buttons */}
          <View style={styles.actionRow}>
            {isPending && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnAccept]}
                  onPress={() => handleAccept(app._id)}
                >
                  <Text style={[styles.actionBtnText, styles.btnAcceptText]}>
                    ✓ Accept
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.btnReject]}
                  onPress={() => handleReject(app._id)}
                >
                  <Text style={[styles.actionBtnText, styles.btnRejectText]}>
                    ✕ Reject
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, styles.btnChat]}
              onPress={() => handleChat(app)}
            >
              <Text style={[styles.actionBtnText, styles.btnChatText]}>
                💬 Chat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Referral card
    const referral = item.data;
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <AvatarCircle name={referral.workerName} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{referral.workerName}</Text>
            <Text style={styles.cardPhone}>{referral.workerPhone}</Text>
          </View>
          <View style={[styles.statusPill, styles.statusReferral]}>
            <Text style={[styles.statusPillText, styles.statusReferralText]}>
              Referred
            </Text>
          </View>
        </View>

        {referral.skills && referral.skills.length > 0 && (
          <View style={styles.skillsRow}>
            {referral.skills.map((s) => (
              <View key={s} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {referral.createdAt && (
          <Text style={styles.metaText}>
            Referred on{" "}
            {new Date(referral.createdAt).toLocaleDateString("en-IN")}
          </Text>
        )}

        <View style={styles.referralNoChatBox}>
          <Text style={styles.referralNoChatText}>
            🔗 No direct chat available
          </Text>
        </View>
      </View>
    );
  };

  const keyExtractor = (item: ListRow) => item.id;

  const showApplicantsEmpty = filteredStandardApps.length === 0;
  const showReferralsEmpty =
    tab === "pending"
      ? filteredReferrals.length === 0 &&
        filteredReferredAppsAsReferrals.length === 0
      : false;
  const showCompletelyEmpty =
    showApplicantsEmpty && (tab === "pending" ? showReferralsEmpty : true);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Applicants</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab switcher */}
      <View style={styles.tabContainer}>
        {(["accepted", "pending"] as const).map((t) => {
          const isActive = tab === t;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.tabBtn,
                isActive ? styles.tabActive : styles.tabInactive,
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  isActive ? styles.tabActiveText : styles.tabInactiveText,
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : showCompletelyEmpty ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            No applicants or referred workers found.
          </Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {showApplicantsEmpty && (
                <View style={styles.emptyBlock}>
                  <Text style={styles.emptyMiniText}>No applicants found.</Text>
                </View>
              )}
              {showReferralsEmpty && (
                <View style={styles.emptyBlock}>
                  <Text style={styles.emptyMiniText}>
                    No referred workers found.
                  </Text>
                </View>
              )}
            </>
          }
        />
      )}

      {/* Rating Modal */}
      <Modal transparent animationType="fade" visible={ratingModal.visible}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate the Worker</Text>
            <Text style={styles.modalSubtitle}>How was your experience?</Text>
            <StarRatingInput rating={rating} onRate={setRating} />
            <TextInput
              style={styles.reviewInput}
              placeholder="Write a review (optional)..."
              placeholderTextColor="#aaa"
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={3}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={handleSkipRating}
              >
                <Text style={styles.skipBtnText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitRatingBtn}
                onPress={handleRatingSubmit}
              >
                <Text style={styles.submitRatingText}>Submit & End</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f0f2f8",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  // ── Tabs ────────────────────────────────────────────────────────────────────
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
    backgroundColor: Colors.primary,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },

  tabActive: {
    backgroundColor: "#4A7BF7",
  },

  tabInactive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  tabBtnText: {
    fontSize: 13.5,
    fontWeight: "700",
  },

  tabActiveText: {
    color: "#fff",
  },

  tabInactiveText: {
    color: "rgba(255,255,255,0.55)",
  },

  // ── List ────────────────────────────────────────────────────────────────────
  listContent: {
    padding: 14,
    paddingTop: 18,
    gap: 10,
  },

  // ── Section header ───────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 4,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: "#8891aa",
  },

  countBadge: {
    backgroundColor: "rgba(74,123,247,0.15)",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },

  countBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4A7BF7",
  },

  // ── Card ────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#0D1B3E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },

  // ── Avatar ──────────────────────────────────────────────────────────────────
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },

  // ── Card text ────────────────────────────────────────────────────────────────
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B3E",
    marginBottom: 2,
  },

  cardPhone: {
    fontSize: 12.5,
    color: "#7a8299",
    fontWeight: "500",
  },

  profileLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4A7BF7",
    marginTop: 4,
    marginBottom: 2,
  },

  // ── Status pills ─────────────────────────────────────────────────────────────
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: "auto",
  },

  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
  },

  statusAccepted: { backgroundColor: "#e6f9f1" },
  statusAcceptedText: { color: "#0f6e4a" },

  statusPending: { backgroundColor: "#fff5e5" },
  statusPendingText: { color: "#9a5f00" },

  statusReferral: { backgroundColor: "#f2f0ff" },
  statusReferralText: { color: "#5b42d4" },

  // ── Skills ───────────────────────────────────────────────────────────────────
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },

  skillTag: {
    backgroundColor: "#f0f3ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  skillTagText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#3a56c4",
  },

  // ── Divider ──────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: "#eef0f6",
    marginVertical: 12,
  },

  // ── Action buttons ───────────────────────────────────────────────────────────
  actionRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    minWidth: 80,
  },

  actionBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },

  btnAccept: { backgroundColor: "#e6f9f0" },
  btnAcceptText: { color: "#0d6e49" },

  btnReject: { backgroundColor: "#fce9e9" },
  btnRejectText: { color: "#a82424" },

  btnChat: { backgroundColor: "#e7edff" },
  btnChatText: { color: "#1a3fbf" },

  // ── Referral no-chat box ──────────────────────────────────────────────────────
  referralNoChatBox: {
    backgroundColor: "#f2f0ff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  referralNoChatText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#5b42d4",
  },

  metaText: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 11.5,
    color: "#aab0c6",
    fontWeight: "500",
  },

  // ── Empty states ─────────────────────────────────────────────────────────────
  emptyText: {
    fontSize: 15,
    color: "#aab0c6",
    textAlign: "center",
  },

  emptyBlock: {
    marginTop: 4,
    marginBottom: 4,
  },

  emptyMiniText: {
    fontSize: 14,
    color: "#aab0c6",
  },

  // ── Rating modal ──────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    gap: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D1B3E",
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#7a8299",
  },

  reviewInput: {
    borderWidth: 1,
    borderColor: "#eef0f6",
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: "#0D1B3E",
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#f8f9fb",
  },

  skipBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 999,
    backgroundColor: "#f0f2f8",
    alignItems: "center",
  },

  skipBtnText: {
    color: "#7a8299",
    fontWeight: "600",
    fontSize: 14,
  },

  submitRatingBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },

  submitRatingText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
