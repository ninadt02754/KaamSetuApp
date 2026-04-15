// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import { Base_Url , API_BASE } from "../constants/Config";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   SafeAreaView,
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

// const API_URL = Base_Url;

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

// export default function ApplicationListScreen() {
//   const { jobId } = useLocalSearchParams<{ jobId: string }>();
//   const router = useRouter();

//   const [applications, setApplications] = useState<ApplicationItem[]>([]);
//   const [referrals, setReferrals] = useState<ReferralItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   const getWorkerIdValue = (workerId?: WorkerRef) => {
//     if (!workerId) return null;
//     return typeof workerId === "string" ? workerId : workerId._id;
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

//       const applicationsData = await applicationsRes.json();
//       const referralsData = await referralsRes.json();

//       if (!applicationsRes.ok) {
//         console.log("Applications fetch error:", applicationsData);
//         setApplications([]);
//       } else {
//         const apps = Array.isArray(applicationsData)
//   ? applicationsData
//   : applicationsData.applications || [];
// console.log("Applications for job:", jobId, JSON.stringify(apps.map((a: ApplicationItem) => ({ id: a._id, status: a.status, name: a.workerName }))));
// setApplications(apps);
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

//   const filteredReferrals = useMemo(() => {
//     return referrals.filter((item) => {
//       if (!item.jobId || !jobId) return false;

//       if (typeof item.jobId === "string") {
//         return item.jobId === jobId;
//       }

//       return item.jobId._id === jobId;
//     });
//   }, [referrals, jobId]);

//   const listData: ListRow[] = useMemo(() => {
//     const rows: ListRow[] = [];

//     rows.push({
//       type: "section",
//       id: "applicants-section",
//       title: "Applicants",
//     });

//     if (applications.length > 0) {
//       applications.forEach((item) => {
//         rows.push({
//           type: "application",
//           id: `application-${item._id}`,
//           data: item,
//         });
//       });
//     }

//     rows.push({
//       type: "section",
//       id: "referrals-section",
//       title: "Referred Workers",
//     });

//     if (filteredReferrals.length > 0) {
//       filteredReferrals.forEach((item) => {
//         rows.push({
//           type: "referral",
//           id: `referral-${item._id}`,
//           data: item,
//         });
//       });
//     }

//     return rows;
//   }, [applications, filteredReferrals]);

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

//       return (
//         <View style={styles.card}>
//           <TouchableOpacity
//             disabled={!canOpenProfile}
//             onPress={() => {
//               if (!workerIdValue) return;
//               console.log("Opening profile with workerId:", workerIdValue, "type:", typeof workerIdValue);
// router.push(
//   `/worker-profile?workerId=${workerIdValue}&jobId=${jobId}&applicationId=${app._id}`,
// );
//             }}
//           >
//             <Text style={styles.cardTitle}>
//               {app.workerName ||
//                 (typeof app.workerId === "object" && app.workerId?.name) ||
//                 "Worker"}
//             </Text>

//             {app.workerPhone ? (
//               <Text style={styles.cardSubtitle}>Phone: {app.workerPhone}</Text>
//             ) : null}

//             {app.skills && app.skills.length > 0 ? (
//               <Text style={styles.cardSubtitle}>
//                 Skills: {app.skills.join(", ")}
//               </Text>
//             ) : null}

//             <Text style={styles.cardSubtitle}>Status: {status}</Text>

//             <Text style={styles.cardSubtitle}>
//               Type: {app.source === "referral" ? "Referred" : "Applied"}
//             </Text>

//             {canOpenProfile ? (
//               <Text style={styles.openText}>View Profile →</Text>
//             ) : (
//               <Text style={styles.metaText}>Profile not available</Text>
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

//   const showApplicantsEmpty = applications.length === 0;
//   const showReferralsEmpty = filteredReferrals.length === 0;
//   const showCompletelyEmpty = showApplicantsEmpty && showReferralsEmpty;

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
// });
// applications.tsx — Premium Redesign
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
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Base_Url } from "../constants/Config";

const API_URL = Base_Url;
const { width } = Dimensions.get("window");

// ── Design Tokens ─────────────────────────────────────────────────────────────
const P = {
  gradientTop: "#0F2D55",
  gradientMid: "#1A4880",
  gradientBottom: "#1E5799",
  accentBlue: "#4A90D9",
  accentGlow: "#5BA3E8",
  sheetBg: "#F4F7FC",
  cardBg: "#FFFFFF",
  inputBg: "#F0F5FF",
  inputBorder: "#D5E3F7",
  labelColor: "#3A5A82",
  textDark: "#0F2040",
  textMid: "#2A4A6E",
  textMuted: "#7A95B5",
  divider: "#E2ECF8",
  white: "#FFFFFF",
  successGreen: "#059669",
  errorRed: "#DC2626",
  tagBg: "#EAF3FF",
  tagBorder: "#C5DCFA",
};

// ── Types ─────────────────────────────────────────────────────────────────────
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
  expectedPay?: number;
  createdAt?: string;
};
type ReferralItem = {
  _id: string;
  workerName: string;
  workerPhone: string;
  skills?: string[];
  createdAt?: string;
  jobId?: string | { _id: string; title?: string };
};
type ListRow =
  | { type: "section"; id: string; title: string; count: number }
  | { type: "application"; id: string; data: ApplicationItem }
  | { type: "referral"; id: string; data: ReferralItem }
  | { type: "empty"; id: string; message: string };

type TabType = "all" | "pending" | "accepted";

export default function ApplicationListScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const getWorkerIdValue = (workerId?: WorkerRef) => {
    if (!workerId) return null;
    return typeof workerId === "string" ? workerId : workerId._id;
  };

  const getJobIdValue = (app: ApplicationItem) => {
    if (app.jobId && typeof app.jobId !== "string") return app.jobId._id;
    if (app.jobId && typeof app.jobId === "string") return app.jobId;
    return jobId || null;
  };

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

      const applicationsData = await applicationsRes.json();
      const referralsData = await referralsRes.json();

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
    } catch (error) {
      setApplications([]);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const filteredReferrals = useMemo(
    () =>
      referrals.filter((item) => {
        if (!item.jobId || !jobId) return false;
        return typeof item.jobId === "string"
          ? item.jobId === jobId
          : item.jobId._id === jobId;
      }),
    [referrals, jobId],
  );

  const filteredApps = useMemo(() => {
    if (activeTab === "all") return applications;
    return applications.filter((a) => (a.status || "pending") === activeTab);
  }, [applications, activeTab]);

  const pendingCount = applications.filter(
    (a) => (a.status || "pending") === "pending",
  ).length;
  const acceptedCount = applications.filter(
    (a) => a.status === "accepted",
  ).length;

  const listData: ListRow[] = useMemo(() => {
    const rows: ListRow[] = [];
    rows.push({
      type: "section",
      id: "apps-section",
      title: "Applicants",
      count: filteredApps.length,
    });
    if (filteredApps.length === 0) {
      rows.push({
        type: "empty",
        id: "apps-empty",
        message: "No applicants found",
      });
    } else {
      filteredApps.forEach((item) =>
        rows.push({ type: "application", id: `app-${item._id}`, data: item }),
      );
    }
    if (activeTab === "all") {
      rows.push({
        type: "section",
        id: "ref-section",
        title: "Referred Workers",
        count: filteredReferrals.length,
      });
      if (filteredReferrals.length === 0) {
        rows.push({
          type: "empty",
          id: "ref-empty",
          message: "No referred workers found",
        });
      } else {
        filteredReferrals.forEach((item) =>
          rows.push({ type: "referral", id: `ref-${item._id}`, data: item }),
        );
      }
    }
    return rows;
  }, [filteredApps, filteredReferrals, activeTab]);

  const handleAccept = async (applicationId: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(
        `${API_URL}/api/applications/accept/${applicationId}`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (res.ok) {
        Alert.alert("✅ Accepted", "Worker accepted successfully!");
        fetchData();
      } else Alert.alert("Error", data.message || "Failed to accept");
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleReject = async (applicationId: string) => {
    Alert.alert(
      "Reject Worker",
      "Are you sure you want to reject this applicant?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
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
                Alert.alert("Rejected", "Worker rejected.");
                fetchData();
              } else Alert.alert("Error", data.message || "Failed to reject");
            } catch {
              Alert.alert("Error", "Something went wrong");
            }
          },
        },
      ],
    );
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

  const getStatusColors = (status: string) => {
    const map: Record<string, { bg: string; text: string; dot: string }> = {
      pending: { bg: "#FEF3C7", text: "#D97706", dot: "#F59E0B" },
      accepted: { bg: "#D1FAE5", text: "#059669", dot: "#10B981" },
      rejected: { bg: "#FEE2E2", text: "#DC2626", dot: "#EF4444" },
    };
    return map[status] ?? map.pending;
  };

  const renderItem = ({ item }: { item: ListRow }) => {
    if (item.type === "section") {
      return (
        <View style={st.sectionRow}>
          <View style={st.sectionBar} />
          <Text style={st.sectionTitle}>{item.title}</Text>
          <View style={st.sectionCountBadge}>
            <Text style={st.sectionCountText}>{item.count}</Text>
          </View>
        </View>
      );
    }

    if (item.type === "empty") {
      return (
        <View style={st.emptyCard}>
          <Ionicons name="document-outline" size={28} color="#C5D8EA" />
          <Text style={st.emptyText}>{item.message}</Text>
        </View>
      );
    }

    if (item.type === "application") {
      const app = item.data;
      const workerIdValue = getWorkerIdValue(app.workerId);
      const status = app.status || "pending";
      const sc = getStatusColors(status);

      return (
        <View style={st.card}>
          {/* Card header */}
          <TouchableOpacity
            disabled={!workerIdValue}
            onPress={() =>
              workerIdValue &&
              router.push(
                `/worker-profile?workerId=${workerIdValue}&jobId=${jobId}&applicationId=${app._id}`,
              )
            }
          >
            <View style={st.cardTopRow}>
              <View style={st.workerIconWrap}>
                <Ionicons name="person" size={20} color={P.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.cardName}>
                  {app.workerName ||
                    (typeof app.workerId === "object" && app.workerId?.name) ||
                    "Worker"}
                </Text>
                {app.workerPhone && (
                  <View style={st.cardMetaRow}>
                    <Ionicons
                      name="call-outline"
                      size={12}
                      color={P.textMuted}
                    />
                    <Text style={st.cardMeta}>{app.workerPhone}</Text>
                  </View>
                )}
              </View>
              <View style={[st.statusBadge, { backgroundColor: sc.bg }]}>
                <View style={[st.statusDot, { backgroundColor: sc.dot }]} />
                <Text style={[st.statusText, { color: sc.text }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Skills */}
            {app.skills && app.skills.length > 0 && (
              <View style={st.skillsRow}>
                {app.skills.map((s) => (
                  <View key={s} style={st.skillChip}>
                    <Text style={st.skillChipText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Meta chips */}
            <View style={st.metaChipsRow}>
              <View style={st.metaChip}>
                <Ionicons
                  name={
                    app.source === "referral"
                      ? "git-branch-outline"
                      : "send-outline"
                  }
                  size={11}
                  color={P.accentBlue}
                />
                <Text style={st.metaChipText}>
                  {app.source === "referral" ? "Referred" : "Applied"}
                </Text>
              </View>
              {app.expectedPay && (
                <View style={st.metaChip}>
                  <Ionicons
                    name="cash-outline"
                    size={11}
                    color={P.accentBlue}
                  />
                  <Text style={st.metaChipText}>₹{app.expectedPay}</Text>
                </View>
              )}
              {app.createdAt && (
                <View style={st.metaChip}>
                  <Ionicons
                    name="calendar-outline"
                    size={11}
                    color={P.accentBlue}
                  />
                  <Text style={st.metaChipText}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {workerIdValue && (
              <Text style={st.viewProfileLink}>
                <Ionicons name="eye-outline" size={13} color={P.accentBlue} />{" "}
                View Profile
              </Text>
            )}
          </TouchableOpacity>

          <View style={st.divider} />

          {/* Action buttons */}
          <View style={st.actionRow}>
            {status === "pending" && (
              <>
                <TouchableOpacity
                  style={st.acceptBtn}
                  onPress={() => handleAccept(app._id)}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={15}
                    color={P.white}
                  />
                  <Text style={st.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.rejectBtn}
                  onPress={() => handleReject(app._id)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={15}
                    color={P.errorRed}
                  />
                  <Text style={st.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={st.chatBtn}
              onPress={() => handleChat(app)}
            >
              <Ionicons name="chatbubble-outline" size={15} color={P.white} />
              <Text style={st.chatBtnText}>Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Referral
    const ref = item.data as ReferralItem;
    return (
      <View style={[st.card, st.referralCard]}>
        <View style={st.cardTopRow}>
          <View style={[st.workerIconWrap, { backgroundColor: "#2A6049" }]}>
            <Ionicons name="git-branch" size={18} color={P.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.cardName}>{ref.workerName}</Text>
            <View style={st.cardMetaRow}>
              <Ionicons name="call-outline" size={12} color={P.textMuted} />
              <Text style={st.cardMeta}>{ref.workerPhone}</Text>
            </View>
          </View>
          <View style={[st.statusBadge, { backgroundColor: "#D1FAE5" }]}>
            <View style={[st.statusDot, { backgroundColor: "#10B981" }]} />
            <Text style={[st.statusText, { color: "#059669" }]}>Referred</Text>
          </View>
        </View>
        {ref.skills && ref.skills.length > 0 && (
          <View style={st.skillsRow}>
            {ref.skills.map((s) => (
              <View key={s} style={st.skillChip}>
                <Text style={st.skillChipText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
        {ref.createdAt && (
          <View style={[st.metaChipsRow, { marginTop: 8 }]}>
            <View style={st.metaChip}>
              <Ionicons
                name="calendar-outline"
                size={11}
                color={P.accentBlue}
              />
              <Text style={st.metaChipText}>
                Referred {new Date(ref.createdAt).toLocaleDateString("en-IN")}
              </Text>
            </View>
          </View>
        )}
        <View style={[st.noChatBadge]}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={12}
            color={P.textMuted}
          />
          <Text style={st.noChatText}>No Chat Available</Text>
        </View>
      </View>
    );
  };

  const HEADER_H = 170;
  const CURVE_H = 28;

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.gradientTop} />

      {/* Gradient header */}
      <LinearGradient
        colors={[P.gradientTop, P.gradientMid, P.gradientBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[st.headerGradient, { height: HEADER_H }]}
      >
        <View style={st.decorCircle1} />
        <View style={st.decorCircle2} />

        <SafeAreaView edges={["top"]}>
          <View style={st.topBar}>
            <TouchableOpacity style={st.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color={P.white} />
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              <Text style={st.headerTitle}>Applicants</Text>
              <Text style={st.headerSub}>
                {applications.length} total · {filteredReferrals.length}{" "}
                referred
              </Text>
            </View>
            <TouchableOpacity style={st.refreshBtn} onPress={fetchData}>
              <Ionicons name="refresh-outline" size={18} color={P.white} />
            </TouchableOpacity>
          </View>

          {/* Tab bar inside gradient */}
          <View style={st.tabBar}>
            {(["all", "pending", "accepted"] as TabType[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[st.tabItem, activeTab === tab && st.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[st.tabText, activeTab === tab && st.tabTextActive]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "pending" && pendingCount > 0
                    ? ` (${pendingCount})`
                    : ""}
                  {tab === "accepted" && acceptedCount > 0
                    ? ` (${acceptedCount})`
                    : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>

        <View style={{ height: CURVE_H }} />
      </LinearGradient>

      {/* Curve overlap */}
      <View style={[st.curveSheet, { top: HEADER_H - CURVE_H }]} />

      {/* Content */}
      {loading ? (
        <View style={[st.centered, { marginTop: HEADER_H - CURVE_H + 20 }]}>
          <ActivityIndicator size="large" color={P.accentBlue} />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            st.listContent,
            { paddingTop: HEADER_H - CURVE_H + 12 },
          ]}
          style={[st.list, { marginTop: -CURVE_H }]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 30 }} />}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.sheetBg },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  // Header
  headerGradient: { width: "100%", overflow: "hidden", position: "relative" },
  decorCircle1: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -50,
    right: -40,
  },
  decorCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 10,
    left: -20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
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
  headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },

  // Tabs
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 11,
  },
  tabItemActive: { backgroundColor: P.white },
  tabText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  tabTextActive: { color: P.gradientTop, fontWeight: "700" },

  curveSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: P.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  list: {},
  listContent: { paddingHorizontal: 16, gap: 12 },

  // Section
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: -2,
  },
  sectionBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: P.accentBlue,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: P.textDark, flex: 1 },
  sectionCountBadge: {
    backgroundColor: P.inputBg,
    borderWidth: 1,
    borderColor: P.inputBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sectionCountText: { fontSize: 12, fontWeight: "700", color: P.accentBlue },

  // Cards
  card: {
    backgroundColor: P.cardBg,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: "#1A3C5E",
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  referralCard: { borderLeftWidth: 3, borderLeftColor: "#10B981" },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  workerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: P.gradientMid,
    alignItems: "center",
    justifyContent: "center",
  },
  cardName: { fontSize: 15, fontWeight: "700", color: P.textDark },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  cardMeta: { fontSize: 12, color: P.textMuted },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "700" },

  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: {
    backgroundColor: P.tagBg,
    borderWidth: 1,
    borderColor: P.tagBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skillChipText: { fontSize: 12, color: P.accentBlue, fontWeight: "600" },

  metaChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: P.inputBg,
    borderWidth: 1,
    borderColor: P.inputBorder,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  metaChipText: { fontSize: 11, color: P.labelColor, fontWeight: "600" },

  viewProfileLink: {
    fontSize: 13,
    fontWeight: "700",
    color: P.accentBlue,
    marginTop: 4,
  },

  divider: { height: 1, backgroundColor: P.divider },

  actionRow: { flexDirection: "row", gap: 8 },
  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: P.successGreen,
    borderRadius: 12,
    paddingVertical: 10,
  },
  acceptBtnText: { color: P.white, fontWeight: "700", fontSize: 13 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: P.errorRed,
    borderRadius: 12,
    paddingVertical: 10,
  },
  rejectBtnText: { color: P.errorRed, fontWeight: "700", fontSize: 13 },
  chatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: P.gradientMid,
    borderRadius: 12,
    paddingVertical: 10,
  },
  chatBtnText: { color: P.white, fontWeight: "700", fontSize: 13 },

  noChatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: P.inputBg,
    borderWidth: 1,
    borderColor: P.divider,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 4,
  },
  noChatText: { fontSize: 12, fontWeight: "600", color: P.textMuted },

  emptyCard: {
    backgroundColor: P.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: P.divider,
    borderStyle: "dashed",
  },
  emptyText: { fontSize: 13, color: P.textMuted },
});
