// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect, useRouter } from "expo-router";
// import React, { useCallback, useState } from "react";
// // ADD this with other imports at the top
// // import { registerForPushNotifications } from "../_layout";

// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Base_Url } from "../../constants/Config";
// import {
//   KColors as Colors,
//   Radius,
//   Shadow,
//   Spacing,
// } from "../../constants/kaamsetuTheme";

// const API_URL = Base_Url;

// function Avatar({
//   name,
//   profileImage,
//   size = 72,
// }: {
//   name: string;
//   profileImage?: string;
//   size?: number;
// }) {
//   const initials = name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .slice(0, 2)
//     .toUpperCase();

//   return profileImage ? (
//     <Image
//       source={{ uri: profileImage }}
//       style={{ width: size, height: size, borderRadius: size / 2 }}
//     />
//   ) : (
//     <View
//       style={[
//         styles.avatar,
//         { width: size, height: size, borderRadius: size / 2 },
//       ]}
//     >
//       <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
//         {initials}
//       </Text>
//     </View>
//   );
// }

// function StarRating({ rating }: { rating: number }) {
//   return (
//     <View style={styles.starsRow}>
//       {[1, 2, 3, 4, 5].map((i) => (
//         <Text
//           key={i}
//           style={{
//             color: i <= Math.round(rating) ? Colors.starGold : "#DDD",
//             fontSize: 14,
//           }}
//         >
//           ★
//         </Text>
//       ))}
//       <Text style={styles.ratingText}>
//         ({rating > 0 ? rating.toFixed(1) : "0"})
//       </Text>
//     </View>
//   );
// }

// function SectionHeader({ title }: { title: string }) {
//   return (
//     <View style={styles.sectionHeaderRow}>
//       <View style={styles.sectionAccent} />
//       <Text style={styles.sectionTitle}>{title}</Text>
//     </View>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const map: Record<string, { label: string; bg: string; color: string }> = {
//     pending: {
//       label: "Pending",
//       bg: Colors.warningLight,
//       color: Colors.warning,
//     },
//     in_progress: {
//       label: "Work in Progress",
//       bg: Colors.successLight,
//       color: Colors.success,
//     },
//     "in-progress": {
//       label: "Work in Progress",
//       bg: Colors.successLight,
//       color: Colors.success,
//     },
//     completed: { label: "Completed", bg: "#E3F2FD", color: "#1565C0" },
//     cancelled: {
//       label: "Cancelled",
//       bg: Colors.errorLight,
//       color: Colors.error,
//     },
//     accepted: {
//       label: "Accepted",
//       bg: Colors.successLight,
//       color: Colors.success,
//     },
//     rejected: { label: "Rejected", bg: Colors.errorLight, color: Colors.error },
//   };
//   const s = map[status] ?? map.pending;
//   return (
//     <View style={[styles.badge, { backgroundColor: s.bg }]}>
//       <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
//     </View>
//   );
// }

// type UserType = {
//   _id: string;
//   name: string;
//   email: string;
//   phone: string;
//   address?: string;
//   skills?: string[];
//   rating?: number;
//   averageRating?: number;
//   totalRatings?: number;
//   averageEmployerRating?: number;
//   totalEmployerRatings?: number;
//   profileImage?: string;
//   role?: string;
// };

// type JobType = {
//   _id: string;
//   category: string;
//   description: string;
//   address: string;
//   status: string;
//   minBudget?: number;
//   maxBudget?: number;
//   noBudget?: boolean;
//   completedAt?: string;
// };

// type ApplicationType = {
//   _id: string;
//   status: string;
//   expectedPay: number;
//   createdAt: string;
//   completedAt?: string;
//   jobId?: {
//     _id: string;
//     category: string;
//     description?: string;
//     address?: string;
//     status?: string;
//     posterId?: string | { _id: string; name?: string };
//   };
// };

// type ReferralType = {
//   _id: string;
//   workerName: string;
//   workerPhone: string;
//   skills?: string[];
//   createdAt?: string;
//   jobId?: {
//     _id: string;
//     category?: string;
//     description?: string;
//   };
// };

// const safeJson = async (res: Response) => {
//   try {
//     const text = await res.text();
//     return JSON.parse(text);
//   } catch {
//     return null;
//   }
// };

// export default function AccountScreen() {
//   const router = useRouter();

//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState<UserType | null>(null);

//   const [myRequests, setMyRequests] = useState<JobType[]>([]);
//   const [myPastRequests, setMyPastRequests] = useState<JobType[]>([]);
//   const [myApplications, setMyApplications] = useState<ApplicationType[]>([]);
//   const [myPastApplications, setMyPastApplications] = useState<
//     ApplicationType[]
//   >([]);
//   const [myReferrals, setMyReferrals] = useState<ReferralType[]>([]);

//   // ── Referrals modal ──────────────────────────────────────────────────────
//   const [referralsModal, setReferralsModal] = useState(false);

//   const [ratingModal, setRatingModal] = useState<{
//     visible: boolean;
//     jobId: string;
//     workerId: string;
//   }>({ visible: false, jobId: "", workerId: "" });
//   const [employerRatingModal, setEmployerRatingModal] = useState<{
//     visible: boolean;
//     employerId: string;
//     applicationId: string;
//   }>({ visible: false, employerId: "", applicationId: "" });
//   const [rating, setRating] = useState(0);
//   const [review, setReview] = useState("");
//   const [employerRating, setEmployerRating] = useState(0);
//   const [employerReview, setEmployerReview] = useState("");
//   const [ratedApplicationIds, setRatedApplicationIds] = useState<Set<string>>(
//     new Set(),
//   );
//   const loadAccountData = async () => {
//     setLoading(true);
//     const storedRated = await AsyncStorage.getItem("ratedApplicationIds");
//     if (storedRated) {
//       setRatedApplicationIds(new Set(JSON.parse(storedRated)));
//     }
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const userString = await AsyncStorage.getItem("user");

//       if (!token || !userString) {
//         setUser(null);
//         return;
//       }

//       const parsedUser: UserType = JSON.parse(userString);
//       const headers = { Authorization: `Bearer ${token}` };

//       const userRes = await fetch(`${API_URL}/api/auth/me`, { headers });
//       if (userRes.ok) {
//         const userData = await userRes.json();
//         setUser(userData.user || parsedUser);
//         await AsyncStorage.setItem(
//           "user",
//           JSON.stringify(userData.user || parsedUser),
//         );
//       } else {
//         setUser(parsedUser);
//       }

//       if (parsedUser.role === "worker") {
//         const [appsRes, referralsRes, requestsRes, pastRequestsRes] =
//           await Promise.all([
//             fetch(`${API_URL}/api/applications/my-applications`, { headers }),
//             fetch(`${API_URL}/api/referral`, { headers }),
//             fetch(`${API_URL}/api/jobs/my-requests/${parsedUser._id}`, {
//               headers,
//             }),
//             fetch(`${API_URL}/api/jobs/my-past-requests/${parsedUser._id}`, {
//               headers,
//             }),
//           ]);

//         const [appsData, referralsData, requestsData, pastRequestsData] =
//           await Promise.all([
//             safeJson(appsRes),
//             safeJson(referralsRes),
//             safeJson(requestsRes),
//             safeJson(pastRequestsRes),
//           ]);

//         const allApps = appsRes.ok ? (appsData.applications ?? []) : [];
//         setMyApplications(
//           allApps.filter(
//             (a: ApplicationType) =>
//               (a.status === "pending" || a.status === "accepted") &&
//               a.jobId?.status !== "cancelled",
//           ),
//         );
//         setMyPastApplications(
//           allApps.filter(
//             (a: ApplicationType) =>
//               a.status === "rejected" ||
//               a.status === "completed" ||
//               (a.status === "pending" && a.jobId?.status === "cancelled"),
//           ),
//         );
//         setMyReferrals(
//           referralsRes.ok &&
//             referralsData &&
//             Array.isArray(referralsData.referrals)
//             ? referralsData.referrals
//             : [],
//         );
//         setMyRequests(
//           requestsRes.ok && Array.isArray(requestsData) ? requestsData : [],
//         );
//         setMyPastRequests(
//           pastRequestsRes.ok && Array.isArray(pastRequestsData)
//             ? pastRequestsData
//             : [],
//         );
//       } else {
//         const [requestsRes, pastRequestsRes, referralsRes] = await Promise.all([
//           fetch(`${API_URL}/api/jobs/my-requests/${parsedUser._id}`, {
//             headers,
//           }),
//           fetch(`${API_URL}/api/jobs/my-past-requests/${parsedUser._id}`, {
//             headers,
//           }),
//           fetch(`${API_URL}/api/referral`, { headers }),
//         ]);

//         const [requestsData, pastRequestsData, referralsData] =
//           await Promise.all([
//             safeJson(requestsRes),
//             safeJson(pastRequestsRes),
//             safeJson(referralsRes),
//           ]);

//         setMyRequests(
//           requestsRes.ok && Array.isArray(requestsData) ? requestsData : [],
//         );
//         setMyPastRequests(
//           pastRequestsRes.ok && Array.isArray(pastRequestsData)
//             ? pastRequestsData
//             : [],
//         );
//         setMyReferrals(
//           referralsRes.ok &&
//             referralsData &&
//             Array.isArray(referralsData.referrals)
//             ? referralsData.referrals
//             : [],
//         );
//       }
//     } catch (error) {
//       console.log("Account load error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       const loadFreshUser = async () => {
//         try {
//           const token = await AsyncStorage.getItem("token");
//           if (!token) return;
//           const res = await fetch(`${API_URL}/api/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (res.ok) {
//             const data = await res.json();
//             setUser(data.user);
//             await AsyncStorage.setItem("user", JSON.stringify(data.user));
//           }
//         } catch (err) {
//           console.log("Failed to refresh user:", err);
//         }
//       };
//       loadFreshUser();
//     }, []),
//   );

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadAccountData();
//     setRefreshing(false);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       onRefresh();
//     }, []),
//   );

//   const handleLogout = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (token) {
//         await fetch(`${API_URL}/api/auth/clear-token`, {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         });
//       }
//     } catch (err) {
//       console.log("Clear token error:", err);
//     }
//     await AsyncStorage.removeItem("token");
//     await AsyncStorage.removeItem("user");
//     router.replace("/(auth)/login");
//   };

//   const handleUpdateProfile = () => router.push("/update-profile");

//   const handleCancelJob = (jobId: string) => {
//     Alert.alert(
//       "Cancel Request",
//       "Are you sure you want to cancel this job request? Workers will no longer see it.",
//       [
//         { text: "Keep", style: "cancel" },
//         {
//           text: "Cancel Request",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("token");
//               const response = await fetch(`${API_URL}/api/jobs/${jobId}/cancel`, {
//                 method: "PATCH",
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//               const data = await response.json();
//               if (response.ok) {
//                 setMyRequests((prev) => prev.filter((j) => j._id !== jobId));
//                 setMyPastRequests((prev) => [data.job, ...prev]);
//                 Alert.alert("Cancelled", "Job request cancelled successfully.");
//               } else {
//                 Alert.alert("Error", data.error || "Failed to cancel.");
//               }
//             } catch {
//               Alert.alert("Error", "A network error occurred.");
//             }
//           },
//         },
//       ],
//     );
//   };

//   const handleDeleteJob = (jobId: string) => {
//     Alert.alert(
//       "Delete Request",
//       "Are you sure you want to delete this job request? This action cannot be undone.",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Delete",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("token");
//               const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
//                 method: "DELETE",
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//               const data = await response.json();
//               if (response.ok) {
//                 setMyRequests((prev) => prev.filter((j) => j._id !== jobId));
//                 Alert.alert("Success", "Job deleted successfully.");
//               } else {
//                 Alert.alert("Error", data.error || "Failed to delete the job.");
//               }
//             } catch {
//               Alert.alert(
//                 "Error",
//                 "A network error occurred while trying to delete.",
//               );
//             }
//           },
//         },
//       ],
//     );
//   };

//   const handleCompleteJob = (jobId: string) => {
//     Alert.alert(
//       "Mark as Completed",
//       "Confirm that the work has been done and mark this job as completed?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Complete",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("token");
//               const response = await fetch(
//                 `${API_URL}/api/jobs/${jobId}/complete`,
//                 {
//                   method: "PATCH",
//                   headers: { Authorization: `Bearer ${token}` },
//                 },
//               );
//               const data = await response.json();
//               if (response.ok) {
//                 setMyRequests((prev) => prev.filter((j) => j._id !== jobId));
//                 setMyPastRequests((prev) => [data.job, ...prev]);
//                 if (data.workerId) {
//                   setRatingModal({
//                     visible: true,
//                     jobId,
//                     workerId: data.workerId.toString(),
//                   });
//                 } else {
//                   Alert.alert("Success", "Job marked as completed!");
//                 }
//               } else {
//                 Alert.alert(
//                   "Error",
//                   data.error || "Failed to complete the job.",
//                 );
//               }
//             } catch {
//               Alert.alert("Error", "A network error occurred.");
//             }
//           },
//         },
//       ],
//     );
//   };

//   const handleRatingSubmit = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const res = await fetch(`${API_URL}/api/auth/rate-worker`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           workerId: ratingModal.workerId,
//           rating,
//           review,
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         Alert.alert("Thank you!", "Rating submitted.");
//       } else {
//         Alert.alert("Error", data.message || "Failed to submit rating.");
//       }
//     } catch {
//       Alert.alert("Error", "Network error.");
//     } finally {
//       setRatingModal({ visible: false, jobId: "", workerId: "" });
//       setRating(0);
//       setReview("");
//       await loadAccountData();
//     }
//   };

//   const handleEmployerRatingSubmit = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const res = await fetch(`${API_URL}/api/auth/rate-employer`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           employerId: employerRatingModal.employerId,
//           rating: employerRating,
//           review: employerReview,
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         Alert.alert("Thank you!", "Rating submitted.");
//       } else {
//         Alert.alert("Error", data.message || "Failed to submit rating.");
//       }
//     } catch {
//       Alert.alert("Error", "Network error.");
//     } finally {
//       const ratedId = employerRatingModal.applicationId;
//       if (ratedId) {
//         setRatedApplicationIds((prev) => {
//           const updated = new Set(prev);
//           updated.add(ratedId);
//           AsyncStorage.setItem(
//             "ratedApplicationIds",
//             JSON.stringify([...updated]),
//           );
//           return updated;
//         });
//       }
//       setEmployerRatingModal({
//         visible: false,
//         employerId: "",
//         applicationId: "",
//       });
//       setEmployerRating(0);
//       setEmployerReview("");
//     }
//   };

//   const handleWithdrawApplication = (applicationId: string) => {
//     Alert.alert(
//       "Withdraw Application",
//       "Are you sure you want to withdraw this application?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Withdraw",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("token");
//               const response = await fetch(
//                 `${API_URL}/api/applications/withdraw/${applicationId}`,
//                 {
//                   method: "DELETE",
//                   headers: { Authorization: `Bearer ${token}` },
//                 },
//               );
//               const data = await response.json();
//               if (response.ok) {
//                 setMyApplications((prev) =>
//                   prev.filter((a) => a._id !== applicationId),
//                 );
//                 Alert.alert("Success", "Application withdrawn.");
//               } else {
//                 Alert.alert("Error", data.message || "Failed to withdraw.");
//               }
//             } catch {
//               Alert.alert("Error", "A network error occurred.");
//             }
//           },
//         },
//       ],
//     );
//   };

//   const handleOpenChat = async (app: ApplicationType) => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       const userString = await AsyncStorage.getItem("user");
//       if (!token || !userString) {
//         Alert.alert("Error", "Please login again.");
//         return;
//       }
//       const parsedUser = JSON.parse(userString);
//       const workerId = parsedUser?._id || parsedUser?.id;
//       if (!app?.jobId?._id || !workerId || !app?._id) {
//         Alert.alert("Error", "Missing chat details.");
//         return;
//       }
//       const response = await fetch(`${API_URL}/api/chat/create`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           jobId: app.jobId._id,
//           workerId,
//           applicationId: app._id,
//         }),
//       });
//       const data = await response.json();
//       if (response.ok && data.chat?._id) {
//         router.push(`/job-chat?chatId=${data.chat._id}`);
//       } else {
//         Alert.alert("Error", data.message || "Could not open chat.");
//       }
//     } catch (error) {
//       console.log("Chat open error:", error);
//       Alert.alert("Error", "A network error occurred.");
//     }
//   };

//   const handleDeletePastApplication = (applicationId: string) => {
//     Alert.alert(
//       "Remove from History",
//       "Remove this application record from your history?",
//       [
//         { text: "Cancel", style: "cancel" },
//         {
//           text: "Remove",
//           style: "destructive",
//           onPress: async () => {
//             try {
//               const token = await AsyncStorage.getItem("token");
//               const response = await fetch(
//                 `${API_URL}/api/applications/delete/${applicationId}`,
//                 {
//                   method: "DELETE",
//                   headers: { Authorization: `Bearer ${token}` },
//                 },
//               );
//               const data = await response.json();
//               if (response.ok) {
//                 setMyPastApplications((prev) =>
//                   prev.filter((a) => a._id !== applicationId),
//                 );
//               } else {
//                 Alert.alert(
//                   "Error",
//                   data.message || "Failed to remove record.",
//                 );
//               }
//             } catch {
//               Alert.alert("Error", "A network error occurred.");
//             }
//           },
//         },
//       ],
//     );
//   };

//   const renderEmpty = (message: string) => (
//     <View style={styles.emptyCard}>
//       <Text style={styles.emptyText}>{message}</Text>
//     </View>
//   );

//   const renderLoadingSpinner = () => (
//     <View style={styles.centered}>
//       <ActivityIndicator size="large" color={Colors.primary} />
//     </View>
//   );

//   // ── Referred Workers tap card ────────────────────────────────────────────
//   const renderReferredWorkersSection = () => (
//     <>
//       <SectionHeader title="Referred Workers" />
//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="small" color={Colors.primary} />
//         </View>
//       ) : myReferrals.length === 0 ? (
//         renderEmpty("No referred workers found.")
//       ) : (
//         <TouchableOpacity
//           style={styles.quickCard}
//           onPress={() => setReferralsModal(true)}
//         >
//           <Text style={styles.quickCardTitle}>👷 Referred Workers</Text>
//           <Text style={styles.quickCardSub}>
//             {myReferrals.length} referred worker(s) — tap to view
//           </Text>
//         </TouchableOpacity>
//       )}
//     </>
//   );

//   const renderUserSections = () => (
//     <>
//       <SectionHeader title="My Requests" />
//       {loading
//         ? renderLoadingSpinner()
//         : myRequests.length === 0
//           ? renderEmpty("No active requests found.")
//           : myRequests.map((job) => (
//               <View key={job._id} style={styles.requestCard}>
//                 {(job.status || "").toLowerCase() === "pending" && (
//                   <TouchableOpacity
//                     style={styles.topRightDeleteBtn}
//                     onPress={() => handleDeleteJob(job._id)}
//                   >
//                     <Text style={styles.topRightDeleteIcon}>🗑️</Text>
//                   </TouchableOpacity>
//                 )}
//                 <Text style={[styles.requestTitle, { paddingRight: 36 }]}>
//                   {job.category}
//                 </Text>
//                 <Text style={styles.requestSub}>{job.description}</Text>
//                 <Text style={styles.requestSub}>📍 {job.address}</Text>
//                 <StatusBadge status={job.status} />
//                 {job.noBudget ? (
//                   <Text style={styles.requestSub}>Budget: Not specified</Text>
//                 ) : (
//                   <Text style={styles.requestSub}>
//                     💰 Budget: ₹{job.minBudget || 0} – ₹{job.maxBudget || 0}
//                   </Text>
//                 )}
//                 <TouchableOpacity
//                   style={styles.outlineBtn}
//                   onPress={() => router.push(`/applications?jobId=${job._id}`)}
//                 >
//                   <Text style={styles.outlineBtnText}>View Applicants</Text>
//                 </TouchableOpacity>
//                 {["in_progress", "in-progress"].includes(
//                   (job.status || "").toLowerCase(),
//                 ) && (
//                   <TouchableOpacity
//                     style={styles.completeBtn}
//                     onPress={() => handleCompleteJob(job._id)}
//                   >
//                     <Text style={styles.completeBtnText}>
//                       ✅ Mark as Completed
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//                 {["pending", "in-progress", "in_progress"].includes(
//                   (job.status || "").toLowerCase(),
//                 ) && (
//                   <TouchableOpacity
//                     style={[styles.outlineBtn, { borderColor: "#DC2626", marginTop: 6 }]}
//                     onPress={() => handleCancelJob(job._id)}
//                   >
//                     <Text style={[styles.outlineBtnText, { color: "#DC2626" }]}>🚫 Cancel Request</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}

//       <SectionHeader title="Past Requests" />
//       {loading
//         ? renderLoadingSpinner()
//         : myPastRequests.length === 0
//           ? renderEmpty("No past requests found.")
//           : myPastRequests.map((job) => (
//               <View key={job._id} style={[styles.requestCard, styles.pastCard]}>
//                 <Text style={styles.requestTitle}>{job.category}</Text>
//                 <Text style={styles.requestSub}>{job.description}</Text>
//                 <Text style={styles.requestSub}>📍 {job.address}</Text>
//                 <StatusBadge status={job.status} />
//                 {job.noBudget ? (
//                   <Text style={styles.requestSub}>Budget: Not specified</Text>
//                 ) : (
//                   <Text style={styles.requestSub}>
//                     💰 Budget: ₹{job.minBudget || 0} – ₹{job.maxBudget || 0}
//                   </Text>
//                 )}
//                 {job.completedAt && (
//                   <Text style={styles.requestSub}>
//                     🗓 Completed:{" "}
//                     {new Date(job.completedAt).toLocaleDateString()}
//                   </Text>
//                 )}
//               </View>
//             ))}

//       {renderReferredWorkersSection()}
//     </>
//   );

//   const renderWorkerSections = () => (
//     <>
//       <SectionHeader title="My Requests" />
//       {loading
//         ? renderLoadingSpinner()
//         : myRequests.length === 0
//           ? renderEmpty("No active requests found.")
//           : myRequests.map((job) => (
//               <View key={job._id} style={styles.requestCard}>
//                 {(job.status || "").toLowerCase() === "pending" && (
//                   <TouchableOpacity
//                     style={styles.topRightDeleteBtn}
//                     onPress={() => handleDeleteJob(job._id)}
//                   >
//                     <Text style={styles.topRightDeleteIcon}>🗑️</Text>
//                   </TouchableOpacity>
//                 )}
//                 <Text style={[styles.requestTitle, { paddingRight: 36 }]}>
//                   {job.category}
//                 </Text>
//                 <Text style={styles.requestSub}>{job.description}</Text>
//                 <Text style={styles.requestSub}>📍 {job.address}</Text>
//                 <StatusBadge status={job.status} />
//                 {job.noBudget ? (
//                   <Text style={styles.requestSub}>Budget: Not specified</Text>
//                 ) : (
//                   <Text style={styles.requestSub}>
//                     💰 Budget: ₹{job.minBudget || 0} – ₹{job.maxBudget || 0}
//                   </Text>
//                 )}
//                 <TouchableOpacity
//                   style={styles.outlineBtn}
//                   onPress={() => router.push(`/applications?jobId=${job._id}`)}
//                 >
//                   <Text style={styles.outlineBtnText}>View Applicants</Text>
//                 </TouchableOpacity>
//                 {["in_progress", "in-progress"].includes(
//                   (job.status || "").toLowerCase(),
//                 ) && (
//                   <TouchableOpacity
//                     style={styles.completeBtn}
//                     onPress={() => handleCompleteJob(job._id)}
//                   >
//                     <Text style={styles.completeBtnText}>
//                       ✅ Mark as Completed
//                     </Text>
//                   </TouchableOpacity>
//                 )}
//                 {["pending", "in-progress", "in_progress"].includes(
//                   (job.status || "").toLowerCase(),
//                 ) && (
//                   <TouchableOpacity
//                     style={[styles.outlineBtn, { borderColor: "#DC2626", marginTop: 6 }]}
//                     onPress={() => handleCancelJob(job._id)}
//                   >
//                     <Text style={[styles.outlineBtnText, { color: "#DC2626" }]}>🚫 Cancel Request</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}

//       <SectionHeader title="Past Requests" />
//       {loading
//         ? renderLoadingSpinner()
//         : myPastRequests.length === 0
//           ? renderEmpty("No past requests found.")
//           : myPastRequests.map((job) => (
//               <View key={job._id} style={[styles.requestCard, styles.pastCard]}>
//                 <Text style={styles.requestTitle}>{job.category}</Text>
//                 <Text style={styles.requestSub}>{job.description}</Text>
//                 <Text style={styles.requestSub}>📍 {job.address}</Text>
//                 <StatusBadge status={job.status} />
//                 {job.noBudget ? (
//                   <Text style={styles.requestSub}>Budget: Not specified</Text>
//                 ) : (
//                   <Text style={styles.requestSub}>
//                     💰 Budget: ₹{job.minBudget || 0} – ₹{job.maxBudget || 0}
//                   </Text>
//                 )}
//                 {job.completedAt && (
//                   <Text style={styles.requestSub}>
//                     🗓 Completed:{" "}
//                     {new Date(job.completedAt).toLocaleDateString()}
//                   </Text>
//                 )}
//               </View>
//             ))}

//       <SectionHeader title="My Applications" />
//       {loading
//         ? renderLoadingSpinner()
//         : myApplications.length === 0
//           ? renderEmpty("No active applications found.")
//           : myApplications.map((app) => (
//               <View key={app._id} style={styles.requestCard}>
//                 <Text style={styles.requestTitle}>
//                   {app.jobId?.category || "Job"}
//                 </Text>
//                 <Text style={styles.requestSub}>{app.jobId?.description}</Text>
//                 {app.jobId?.address && (
//                   <Text style={styles.requestSub}>📍 {app.jobId.address}</Text>
//                 )}
//                 <StatusBadge status={app.status} />
//                 <Text style={styles.requestSub}>
//                   💰 Expected Pay: ₹{app.expectedPay}
//                 </Text>
//                 <Text style={styles.requestSub}>
//                   📅 Applied: {new Date(app.createdAt).toLocaleDateString()}
//                 </Text>
//                 {app.status === "pending" ? (
//                   <View style={styles.workerActionRow}>
//                     <TouchableOpacity
//                       style={styles.chatBtn}
//                       onPress={() => handleOpenChat(app)}
//                     >
//                       <Text style={styles.chatBtnText}>Chat</Text>
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.dangerOutlineBtnCompact}
//                       onPress={() => handleWithdrawApplication(app._id)}
//                     >
//                       <Text style={styles.dangerOutlineBtnText}>Withdraw</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ) : app.status === "accepted" ? (
//                   <TouchableOpacity
//                     style={styles.chatBtnSingle}
//                     onPress={() => handleOpenChat(app)}
//                   >
//                     <Text style={styles.chatBtnText}>Chat</Text>
//                   </TouchableOpacity>
//                 ) : app.status === "completed" ? (
//                   <View style={styles.workerActionRow}>
//                     <TouchableOpacity
//                       style={styles.chatBtn}
//                       onPress={() => handleOpenChat(app)}
//                     >
//                       <Text style={styles.chatBtnText}>Chat</Text>
//                     </TouchableOpacity>
//                     {!ratedApplicationIds.has(app._id) ? (
//                       <TouchableOpacity
//                         style={[
//                           styles.dangerOutlineBtnCompact,
//                           { borderColor: Colors.primary },
//                         ]}
//                         onPress={() => {
//                           const employerId =
//                             typeof app.jobId?.posterId === "object"
//                               ? (app.jobId?.posterId as any)?._id
//                               : (app.jobId?.posterId as string | undefined);
//                           if (employerId) {
//                             setEmployerRatingModal({
//                               visible: true,
//                               employerId,
//                               applicationId: app._id,
//                             });
//                           } else {
//                             Alert.alert(
//                               "Error",
//                               "Employer info not available.",
//                             );
//                           }
//                         }}
//                       >
//                         <Text
//                           style={[
//                             styles.dangerOutlineBtnText,
//                             { color: Colors.primary },
//                           ]}
//                         >
//                           Rate
//                         </Text>
//                       </TouchableOpacity>
//                     ) : (
//                       <View
//                         style={[
//                           styles.dangerOutlineBtnCompact,
//                           { borderColor: "#ccc" },
//                         ]}
//                       >
//                         <Text
//                           style={[
//                             styles.dangerOutlineBtnText,
//                             { color: "#aaa" },
//                           ]}
//                         >
//                           ✓ Rated
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 ) : (
//                   <TouchableOpacity
//                     style={styles.chatBtnSingle}
//                     onPress={() => handleOpenChat(app)}
//                   >
//                     <Text style={styles.chatBtnText}>Chat</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             ))}

//       <SectionHeader title="Past Applications" />
//       {loading
//         ? renderLoadingSpinner()
//         : myPastApplications.length === 0
//           ? renderEmpty("No past applications found.")
//           : myPastApplications.map((app) => (
//               <View key={app._id} style={[styles.requestCard, styles.pastCard]}>
//                 <TouchableOpacity
//                   style={styles.topRightDeleteBtn}
//                   onPress={() => handleDeletePastApplication(app._id)}
//                 >
//                   <Text style={styles.topRightDeleteIcon}>🗑️</Text>
//                 </TouchableOpacity>
//                 <Text style={[styles.requestTitle, { paddingRight: 36 }]}>
//                   {app.jobId?.category || "Job"}
//                 </Text>
//                 <StatusBadge status={app.status} />
//                 <Text style={styles.requestSub}>
//                   💰 Expected Pay: ₹{app.expectedPay}
//                 </Text>
//                 <Text style={styles.requestSub}>
//                   📅 Applied: {new Date(app.createdAt).toLocaleDateString()}
//                 </Text>
//                 {app.status === "completed" &&
//                   (!ratedApplicationIds.has(app._id) ? (
//                     <TouchableOpacity
//                       style={[
//                         styles.outlineBtn,
//                         { borderColor: Colors.primary },
//                       ]}
//                       onPress={() => {
//                         const employerId =
//                           typeof app.jobId?.posterId === "object"
//                             ? (app.jobId?.posterId as any)?._id
//                             : (app.jobId?.posterId as string | undefined);
//                         if (employerId) {
//                           setEmployerRatingModal({
//                             visible: true,
//                             employerId,
//                             applicationId: app._id,
//                           });
//                         } else {
//                           Alert.alert("Error", "Employer info not available.");
//                         }
//                       }}
//                     >
//                       <Text
//                         style={[
//                           styles.outlineBtnText,
//                           { color: Colors.primary },
//                         ]}
//                       >
//                         ⭐ Rate Employer
//                       </Text>
//                     </TouchableOpacity>
//                   ) : (
//                     <View style={[styles.outlineBtn, { borderColor: "#ccc" }]}>
//                       <Text style={[styles.outlineBtnText, { color: "#aaa" }]}>
//                         ✓ Already Rated
//                       </Text>
//                     </View>
//                   ))}

//                 {app.completedAt && (
//                   <Text style={styles.requestSub}>
//                     🗓 Completed:{" "}
//                     {new Date(app.completedAt).toLocaleDateString()}
//                   </Text>
//                 )}
//               </View>
//             ))}

//       {renderReferredWorkersSection()}
//     </>
//   );

//   return (
//     <SafeAreaView style={styles.safe} edges={["top"]}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Account</Text>
//       </View>

//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.profileCard}>
//           <View style={styles.profileTop}>
//             <Avatar
//               name={user?.name || "User"}
//               profileImage={
//                 user?.profileImage
//                   ? `${API_URL}${user.profileImage}`
//                   : undefined
//               }
//               size={72}
//             />
//             <View style={styles.profileInfo}>
//               <View style={styles.profileNameRow}>
//                 <Text style={styles.profileName}>
//                   {user?.name || "Loading..."}
//                 </Text>
//                 <TouchableOpacity
//                   onPress={handleUpdateProfile}
//                   style={styles.editIcon}
//                 >
//                   <Text style={styles.editIconText}>✏️</Text>
//                 </TouchableOpacity>
//               </View>
//               <StarRating
//                 rating={
//                   user?.role === "worker"
//                     ? user?.averageRating || 0
//                     : user?.averageEmployerRating || 0
//                 }
//               />
//               {user?.role && (
//                 <View
//                   style={[
//                     styles.roleBadge,
//                     {
//                       backgroundColor:
//                         user.role === "worker"
//                           ? Colors.primary + "20"
//                           : Colors.warningLight,
//                     },
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.roleBadgeText,
//                       {
//                         color:
//                           user.role === "worker"
//                             ? Colors.primary
//                             : Colors.warning,
//                       },
//                     ]}
//                   >
//                     {user.role === "worker" ? "👷 Worker" : "🧑‍💼 Employer"}
//                   </Text>
//                 </View>
//               )}
//               {user?.role === "worker" &&
//                 user.skills &&
//                 user.skills.length > 0 && (
//                   <View style={styles.tagsRow}>
//                     {user.skills.map((tag) => (
//                       <View key={tag} style={styles.tag}>
//                         <Text style={styles.tagText}>{tag}</Text>
//                       </View>
//                     ))}
//                   </View>
//                 )}
//               <Text style={styles.profileText}>
//                 Email: {user?.email || "-"}
//               </Text>
//               <Text style={styles.profileText}>
//                 Phone: {user?.phone || "-"}
//               </Text>
//               <Text style={styles.profileText}>
//                 Address: {user?.address?.trim() ? user.address : "-"}
//               </Text>
//             </View>
//           </View>
//           <TouchableOpacity
//             style={styles.primaryBtn}
//             onPress={handleUpdateProfile}
//           >
//             <Text style={styles.primaryBtnText}>Update Profile</Text>
//           </TouchableOpacity>
//         </View>

//         {user?.role === "worker"
//           ? renderWorkerSections()
//           : renderUserSections()}

//         <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//           <Text style={styles.logoutBtnText}>Logout</Text>
//         </TouchableOpacity>
//         <View style={{ height: 20 }} />
//       </ScrollView>

//       {/* ─── Referrals Bottom Sheet Modal ───────────────────────────────── */}
//       <Modal
//         visible={referralsModal}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setReferralsModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalHeaderText}>Referred Workers</Text>
//               <TouchableOpacity onPress={() => setReferralsModal(false)}>
//                 <Text
//                   style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}
//                 >
//                   ✕
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView
//               style={styles.modalBody}
//               showsVerticalScrollIndicator={false}
//             >
//               {myReferrals.map((ref) => (
//                 <View key={ref._id} style={styles.referralCard}>
//                   <Text style={styles.referralName}>👷 {ref.workerName}</Text>
//                   <Text style={styles.referralSub}>📞 {ref.workerPhone}</Text>
//                   {ref.skills && ref.skills.length > 0 && (
//                     <Text style={styles.referralSub}>
//                       🛠 {ref.skills.join(", ")}
//                     </Text>
//                   )}
//                   {ref.jobId?.category && (
//                     <Text style={styles.referralSub}>
//                       💼 Job: {ref.jobId.category}
//                     </Text>
//                   )}
//                 </View>
//               ))}
//               <View style={{ height: 30 }} />
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* ─── Rate Worker Modal ───────────────────────────────────────────── */}
//       <Modal transparent animationType="fade" visible={ratingModal.visible}>
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.5)",
//             justifyContent: "center",
//             alignItems: "center",
//             padding: 20,
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: "#fff",
//               borderRadius: 16,
//               padding: 24,
//               width: "100%",
//               gap: 12,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 18,
//                 fontWeight: "800",
//                 color: Colors.textPrimary,
//               }}
//             >
//               Rate the Worker
//             </Text>
//             <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
//               How was their work?
//             </Text>
//             <View style={{ flexDirection: "row", gap: 6 }}>
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <TouchableOpacity key={i} onPress={() => setRating(i)}>
//                   <Text
//                     style={{
//                       fontSize: 28,
//                       color: i <= rating ? Colors.starGold : "#DDD",
//                     }}
//                   >
//                     ★
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             <TextInput
//               style={{
//                 borderWidth: 1,
//                 borderColor: "#DDD",
//                 borderRadius: 10,
//                 padding: 10,
//                 fontSize: 14,
//                 minHeight: 80,
//                 textAlignVertical: "top",
//               }}
//               placeholder="Write a review (optional)..."
//               placeholderTextColor="#aaa"
//               value={review}
//               onChangeText={setReview}
//               multiline
//             />
//             <View style={{ flexDirection: "row", gap: 10 }}>
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   padding: 12,
//                   borderRadius: 999,
//                   backgroundColor: "#F1F3F5",
//                   alignItems: "center",
//                 }}
//                 onPress={() => {
//                   setRatingModal({ visible: false, jobId: "", workerId: "" });
//                   setRating(0);
//                   setReview("");
//                 }}
//               >
//                 <Text
//                   style={{ fontWeight: "600", color: Colors.textSecondary }}
//                 >
//                   Skip
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   padding: 12,
//                   borderRadius: 999,
//                   backgroundColor: Colors.primary,
//                   alignItems: "center",
//                 }}
//                 onPress={handleRatingSubmit}
//               >
//                 <Text style={{ fontWeight: "700", color: "#fff" }}>Submit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* ─── Rate Employer Modal ─────────────────────────────────────────── */}
//       <Modal
//         transparent
//         animationType="fade"
//         visible={employerRatingModal.visible}
//       >
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: "rgba(0,0,0,0.5)",
//             justifyContent: "center",
//             alignItems: "center",
//             padding: 20,
//           }}
//         >
//           <View
//             style={{
//               backgroundColor: "#fff",
//               borderRadius: 16,
//               padding: 24,
//               width: "100%",
//               gap: 12,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 18,
//                 fontWeight: "800",
//                 color: Colors.textPrimary,
//               }}
//             >
//               Rate the Employer
//             </Text>
//             <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
//               How was your experience?
//             </Text>
//             <View style={{ flexDirection: "row", gap: 6 }}>
//               {[1, 2, 3, 4, 5].map((i) => (
//                 <TouchableOpacity key={i} onPress={() => setEmployerRating(i)}>
//                   <Text
//                     style={{
//                       fontSize: 28,
//                       color: i <= employerRating ? Colors.starGold : "#DDD",
//                     }}
//                   >
//                     ★
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//             <TextInput
//               style={{
//                 borderWidth: 1,
//                 borderColor: "#DDD",
//                 borderRadius: 10,
//                 padding: 10,
//                 fontSize: 14,
//                 minHeight: 80,
//                 textAlignVertical: "top",
//               }}
//               placeholder="Write a review (optional)..."
//               placeholderTextColor="#aaa"
//               value={employerReview}
//               onChangeText={setEmployerReview}
//               multiline
//             />
//             <View style={{ flexDirection: "row", gap: 10 }}>
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   padding: 12,
//                   borderRadius: 999,
//                   backgroundColor: "#F1F3F5",
//                   alignItems: "center",
//                 }}
//                 onPress={() => {
//                   setEmployerRatingModal({ visible: false, employerId: "" ,applicationId: " "});
//                   setEmployerRating(0);
//                   setEmployerReview("");
//                 }}
//               >
//                 <Text
//                   style={{ fontWeight: "600", color: Colors.textSecondary }}
//                 >
//                   Skip
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={{
//                   flex: 1,
//                   padding: 12,
//                   borderRadius: 999,
//                   backgroundColor: Colors.primary,
//                   alignItems: "center",
//                 }}
//                 onPress={handleEmployerRatingSubmit}
//               >
//                 <Text style={{ fontWeight: "700", color: "#fff" }}>Submit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: "#F0F4F9" },
//   header: {
//     backgroundColor: "#1A3C5E", paddingVertical: 20, paddingHorizontal: 20,
//     shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
//   },
//   headerTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", letterSpacing: 0.3 },
//   scrollContent: { padding: 16, gap: 14 },
//   centered: { paddingVertical: 28, alignItems: "center", justifyContent: "center" },
//   profileCard: {
//     backgroundColor: "#FFFFFF", borderRadius: 16, padding: 18,
//     borderWidth: 1, borderColor: "#D4E0EE",
//     shadowColor: "#1A3C5E", shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.10, shadowRadius: 10, elevation: 5, gap: 12,
//   },
//   profileTop: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
//   profileInfo: { flex: 1, gap: 4 },
//   profileNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   profileName: { fontSize: 20, fontWeight: "800", color: "#0F1C2E" },
//   profileText: { fontSize: 14, color: "#3D5470" },
//   editIcon: { padding: 4 },
//   editIconText: { fontSize: 16 },
//   avatar: { backgroundColor: "#1A3C5E", alignItems: "center", justifyContent: "center" },
//   avatarText: { color: "#FFFFFF", fontWeight: "700" },
//   starsRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
//   ratingText: { fontSize: 13, color: "#3D5470" },
//   roleBadge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
//   roleBadgeText: { fontSize: 12, fontWeight: "700" },
//   tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
//   tag: { backgroundColor: "#EBF0F8", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#D4E0EE" },
//   tagText: { fontSize: 12, color: "#1A3C5E", fontWeight: "600" },
//   sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
//   sectionAccent: { width: 4, height: 20, borderRadius: 2, backgroundColor: "#F59E0B" },
//   sectionTitle: { fontSize: 17, fontWeight: "800", color: "#0F1C2E", marginTop: 6, letterSpacing: 0.2 },
//   badge: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
//   badgeText: { fontSize: 12, fontWeight: "600" },
//   primaryBtn: {
//     backgroundColor: "#1A3C5E", borderRadius: 10, paddingVertical: 13, alignItems: "center",
//     shadowColor: "#1A3C5E", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3,
//   },
//   primaryBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14, letterSpacing: 0.2 },
//   logoutBtn: { backgroundColor: "#DC2626", borderRadius: 10, paddingVertical: 13, alignItems: "center" },
//   logoutBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
//   outlineBtn: { borderWidth: 1.5, borderColor: "#1A3C5E", borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 6 },
//   outlineBtnText: { color: "#1A3C5E", fontWeight: "700", fontSize: 13 },
//   completeBtn: {
//     backgroundColor: "#059669", borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 6,
//     shadowColor: "#059669", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2,
//   },
//   completeBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
//   dangerOutlineBtn: { borderWidth: 1.5, borderColor: "#DC2626", borderRadius: 10, paddingVertical: 10, alignItems: "center", marginTop: 6 },
//   dangerOutlineBtnCompact: { flex: 1, borderWidth: 1.5, borderColor: "#DC2626", borderRadius: 10, paddingVertical: 10, alignItems: "center", justifyContent: "center", marginTop: 6 },
//   dangerOutlineBtnText: { color: "#DC2626", fontWeight: "700", fontSize: 13 },
//   chatBtn: { flex: 1, backgroundColor: "#1A3C5E", borderRadius: 10, paddingVertical: 10, alignItems: "center", justifyContent: "center", marginTop: 6 },
//   chatBtnSingle: { backgroundColor: "#1A3C5E", borderRadius: 10, paddingVertical: 10, alignItems: "center", justifyContent: "center", marginTop: 6 },
//   chatBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
//   emptyCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 18, borderWidth: 1, borderColor: "#E8EFF7", alignItems: "center" },
//   emptyText: { fontSize: 14, color: "#7A8FA6", textAlign: "center", lineHeight: 20 },
//   requestCard: {
//     backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16,
//     borderWidth: 1, borderColor: "#E8EFF7",
//     shadowColor: "#1A3C5E", shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, gap: 6, position: "relative",
//   },
//   pastCard: { opacity: 0.82 },
//   requestTitle: { fontSize: 16, fontWeight: "700", color: "#0F1C2E", letterSpacing: 0.1 },
//   requestSub: { fontSize: 13, color: "#3D5470", lineHeight: 19 },
//   workerActionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
//   topRightDeleteBtn: { position: "absolute", top: 14, right: 14, zIndex: 10, padding: 6, backgroundColor: "#FEE2E2", borderRadius: 8 },
//   topRightDeleteIcon: { fontSize: 15 },
//   quickCard: {
//     backgroundColor: "#FFFFFF", borderRadius: 14, padding: 16,
//     borderWidth: 1, borderColor: "#E8EFF7",
//     shadowColor: "#1A3C5E", shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
//   },
//   quickCardTitle: { fontSize: 15, fontWeight: "700", color: "#0F1C2E" },
//   quickCardSub: { marginTop: 5, fontSize: 13, color: "#3D5470" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
//   modalSheet: { backgroundColor: "#F8FAFC", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "80%", overflow: "hidden" },
//   modalHeader: {
//     backgroundColor: "#1A3C5E", flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", paddingVertical: 16, paddingHorizontal: 20,
//   },
//   modalHeaderText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.2 },
//   modalBody: { paddingHorizontal: 16, paddingTop: 14 },
//   referralCard: {
//     backgroundColor: "#FFFFFF", borderRadius: 12, padding: 14, marginBottom: 10,
//     borderWidth: 1, borderColor: "#E8EFF7", gap: 4,
//     shadowColor: "#1A3C5E", shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
//   },
//   referralName: { fontSize: 15, fontWeight: "700", color: "#0F1C2E" },
//   referralSub: { fontSize: 13, color: "#3D5470" },
// });
// account.tsx — Premium Redesign (consistent with update-profile.tsx)
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Base_Url } from "../../constants/Config";

const API_URL = Base_Url;
const { width } = Dimensions.get("window");

// ── Design Tokens (matching update-profile) ───────────────────────────────────
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
  starGold: "#F59E0B",
  errorRed: "#DC2626",
  successGreen: "#059669",
  tagBg: "#EAF3FF",
  tagBorder: "#C5DCFA",

  // Job card gradients
  jobCardTop: "#1A3F70",
  jobCardBottom: "#2A5FA8",

  // Status colours
  statusPendingBg: "#FEF3C7",
  statusPendingText: "#D97706",
  statusProgressBg: "#D1FAE5",
  statusProgressText: "#059669",
  statusCompletedBg: "#DBEAFE",
  statusCompletedText: "#1D4ED8",
  statusCancelledBg: "#FEE2E2",
  statusCancelledText: "#DC2626",
  statusAcceptedBg: "#D1FAE5",
  statusAcceptedText: "#059669",
  statusRejectedBg: "#FEE2E2",
  statusRejectedText: "#DC2626",
};

// ── Types ─────────────────────────────────────────────────────────────────────
type UserType = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  skills?: string[];
  rating?: number;
  averageRating?: number;
  totalRatings?: number;
  averageEmployerRating?: number;
  totalEmployerRatings?: number;
  profileImage?: string;
  role?: string;
};
type JobType = {
  _id: string;
  category: string;
  description: string;
  address: string;
  status: string;
  minBudget?: number;
  maxBudget?: number;
  noBudget?: boolean;
  completedAt?: string;
  workerName?: string;
  workerPhone?: string;
  completedByReferral?: boolean;
};
type ApplicationType = {
  _id: string;
  status: string;
  expectedPay: number;
  createdAt: string;
  completedAt?: string;
  jobId?: {
    _id: string;
    category: string;
    description?: string;
    address?: string;
    status?: string;
    posterId?: string | { _id: string; name?: string };
  };
};
type ReferralType = {
  _id: string;
  workerName: string;
  workerPhone: string;
  skills?: string[];
  createdAt?: string;
  jobId?: { _id: string; category?: string; description?: string };
};

const safeJson = async (res: Response) => {
  try {
    return JSON.parse(await res.text());
  } catch {
    return null;
  }
};

// ── Sub-components ────────────────────────────────────────────────────────────
function Avatar({
  name,
  profileImage,
  size = 80,
}: {
  name: string;
  profileImage?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return profileImage ? (
    <Image
      source={{ uri: profileImage }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  ) : (
    <LinearGradient
      colors={[P.accentBlue, P.gradientTop]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{ color: P.white, fontWeight: "800", fontSize: size * 0.34 }}
      >
        {initials}
      </Text>
    </LinearGradient>
  );
}

function StarRow({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= rounded ? "star" : "star-outline"}
          size={13}
          color={i <= rounded ? P.starGold : "#C8D8EC"}
        />
      ))}
      <Text style={{ fontSize: 12, color: P.textMuted, marginLeft: 4 }}>
        {rating > 0 ? rating.toFixed(1) : "No ratings yet"}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    pending: {
      label: "Pending",
      bg: P.statusPendingBg,
      color: P.statusPendingText,
    },
    in_progress: {
      label: "In Progress",
      bg: P.statusProgressBg,
      color: P.statusProgressText,
    },
    "in-progress": {
      label: "In Progress",
      bg: P.statusProgressBg,
      color: P.statusProgressText,
    },
    completed: {
      label: "Completed",
      bg: P.statusCompletedBg,
      color: P.statusCompletedText,
    },
    cancelled: {
      label: "Cancelled",
      bg: P.statusCancelledBg,
      color: P.statusCancelledText,
    },
    accepted: {
      label: "Accepted",
      bg: P.statusAcceptedBg,
      color: P.statusAcceptedText,
    },
    rejected: {
      label: "Rejected",
      bg: P.statusRejectedBg,
      color: P.statusRejectedText,
    },
  };
  const s = map[status] ?? map.pending;
  return (
    <View style={[st.badge, { backgroundColor: s.bg }]}>
      <View style={[st.badgeDot, { backgroundColor: s.color }]} />
      <Text style={[st.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

function SectionLabel({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={st.sectionLabelRow}>
      <View style={st.sectionLabelBar} />
      <Ionicons name={icon as any} size={15} color={P.accentBlue} />
      <Text style={st.sectionLabelText}>{title}</Text>
    </View>
  );
}

// ── Job Card (gradient blue) ───────────────────────────────────────────────────
function JobCard({
  job,
  onDelete,
  onCancel,
  onComplete,
  onViewApplicants,
  isPast,
}: {
  job: JobType;
  isPast?: boolean;
  onDelete?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  onViewApplicants?: () => void;
}) {
  const statusNorm = (job.status || "").toLowerCase();
  return (
    <View style={st.jobCardOuter}>
      <LinearGradient
        colors={[P.jobCardTop, P.jobCardBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.jobCardGradient}
      >
        {/* Top row */}
        <View style={st.jobCardTopRow}>
          <View style={st.jobCategoryPill}>
            <Ionicons name="briefcase-outline" size={12} color={P.accentGlow} />
            <Text style={st.jobCategoryText}>{job.category}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <StatusBadge status={job.status} />
            {!isPast && statusNorm === "pending" && onDelete && (
              <TouchableOpacity style={st.deleteBtn} onPress={onDelete}>
                <Ionicons name="trash-outline" size={14} color="#F87171" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Description */}
        {job.description ? (
          <Text style={st.jobDesc} numberOfLines={2}>
            {job.description}
          </Text>
        ) : null}

        {/* Meta row */}
        <View style={st.jobMetaRow}>
          <View style={st.jobMetaItem}>
            <Ionicons
              name="location-outline"
              size={13}
              color="rgba(255,255,255,0.6)"
            />
            <Text style={st.jobMetaText} numberOfLines={1}>
              {job.address}
            </Text>
          </View>
          {!job.noBudget && (
            <View style={st.jobBudgetPill}>
              <Text style={st.jobBudgetText}>
                ₹{job.minBudget}–{job.maxBudget}
              </Text>
            </View>
          )}
        </View>

        {job.completedAt && (
          <View style={st.jobMetaItem}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color="rgba(255,255,255,0.6)"
            />
            <Text style={st.jobMetaText}>
              Completed {new Date(job.completedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Worker info for past completed jobs */}
        {isPast && job.status === "completed" && (
          <View style={{ marginTop: 8, padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8 }}>
            {job.completedByReferral ? (
              <View style={st.jobMetaItem}>
                <Ionicons name="people-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={[st.jobMetaText, { color: "#FCD34D" }]}>
                  ✓ Work done via Referral Worker
                  {job.workerName ? `: ${job.workerName}` : ""}
                  {job.workerPhone ? ` • ${job.workerPhone}` : ""}
                </Text>
              </View>
            ) : job.workerName ? (
              <>
                <View style={st.jobMetaItem}>
                  <Ionicons name="person-outline" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={[st.jobMetaText, { color: "#A5F3FC" }]}>Worker: {job.workerName}</Text>
                </View>
                {job.workerPhone ? (
                  <View style={[st.jobMetaItem, { marginTop: 4 }]}>
                    <Ionicons name="call-outline" size={13} color="rgba(255,255,255,0.8)" />
                    <Text style={[st.jobMetaText, { color: "#A5F3FC" }]}>{job.workerPhone}</Text>
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        )}

        {/* Action buttons */}
        {!isPast && (
          <View style={st.jobActionsRow}>
            {onViewApplicants && (
              <TouchableOpacity
                style={st.jobActionBtn}
                onPress={onViewApplicants}
              >
                <Ionicons name="people-outline" size={14} color={P.white} />
                <Text style={st.jobActionBtnText}>Applicants</Text>
              </TouchableOpacity>
            )}
            {["in_progress", "in-progress"].includes(statusNorm) &&
              onComplete && (
                <TouchableOpacity
                  style={[st.jobActionBtn, st.jobActionBtnGreen]}
                  onPress={onComplete}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={14}
                    color={P.white}
                  />
                  <Text style={st.jobActionBtnText}>Complete</Text>
                </TouchableOpacity>
              )}

          </View>
        )}
      </LinearGradient>
    </View>
  );
}

// ── Application Card ──────────────────────────────────────────────────────────
function AppCard({
  app,
  onChat,
  onWithdraw,
  onRate,
  onDelete,
  isRated,
  isPast,
}: {
  app: ApplicationType;
  isPast?: boolean;
  isRated?: boolean;
  onChat?: () => void;
  onWithdraw?: () => void;
  onRate?: () => void;
  onDelete?: () => void;
}) {
  const statusNorm = app.status.toLowerCase();
  return (
    <View style={st.appCard}>
      {isPast && onDelete && statusNorm !== "completed" && (
        <TouchableOpacity style={st.appDeleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={14} color="#F87171" />
        </TouchableOpacity>
      )}
      <View style={st.appCardTop}>
        <View style={st.appIconWrap}>
          <Ionicons name="hammer-outline" size={18} color={P.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.appTitle}>{app.jobId?.category || "Job"}</Text>
          {app.jobId?.address && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
              }}
            >
              <Ionicons name="location-outline" size={12} color={P.textMuted} />
              <Text style={st.appSub} numberOfLines={1}>
                {app.jobId.address}
              </Text>
            </View>
          )}
        </View>
        <StatusBadge status={app.status} />
      </View>

      {app.jobId?.description && (
        <Text style={[st.appSub, { marginTop: 6 }]} numberOfLines={2}>
          {app.jobId.description}
        </Text>
      )}

      <View style={st.appMetaRow}>
        <View style={st.appMetaChip}>
          <Ionicons name="cash-outline" size={12} color={P.accentBlue} />
          <Text style={st.appMetaChipText}>₹{app.expectedPay}</Text>
        </View>
        <View style={st.appMetaChip}>
          <Ionicons name="calendar-outline" size={12} color={P.accentBlue} />
          <Text style={st.appMetaChipText}>
            {new Date(app.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {app.completedAt && (
          <View style={st.appMetaChip}>
            <Ionicons
              name="checkmark-outline"
              size={12}
              color={P.successGreen}
            />
            <Text style={[st.appMetaChipText, { color: P.successGreen }]}>
              {new Date(app.completedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {!isPast && (
        <View style={st.appActionsRow}>
          {onChat && (
            <TouchableOpacity style={st.appChatBtn} onPress={onChat}>
              <Ionicons name="chatbubble-outline" size={14} color={P.white} />
              <Text style={st.appChatBtnText}>Chat</Text>
            </TouchableOpacity>
          )}
          {statusNorm === "pending" && onWithdraw && (
            <TouchableOpacity style={st.appOutlineBtn} onPress={onWithdraw}>
              <Text style={[st.appOutlineBtnText, { color: P.errorRed }]}>
                Withdraw
              </Text>
            </TouchableOpacity>
          )}
          {statusNorm === "completed" &&
            (isRated ? (
              <View style={[st.appOutlineBtn, { borderColor: "#C5D8EA" }]}>
                <Ionicons name="checkmark-circle" size={13} color="#A0B8D0" />
                <Text
                  style={[
                    st.appOutlineBtnText,
                    { color: "#A0B8D0", marginLeft: 4 },
                  ]}
                >
                  Rated
                </Text>
              </View>
            ) : (
              onRate && (
                <TouchableOpacity
                  style={[st.appOutlineBtn, { borderColor: P.starGold }]}
                  onPress={onRate}
                >
                  <Ionicons name="star-outline" size={13} color={P.starGold} />
                  <Text
                    style={[
                      st.appOutlineBtnText,
                      { color: P.starGold, marginLeft: 4 },
                    ]}
                  >
                    Rate
                  </Text>
                </TouchableOpacity>
              )
            ))}
        </View>
      )}
      {isPast && statusNorm === "completed" && (
        <View style={st.appActionsRow}>
          {isRated ? (
            <View style={[st.appOutlineBtn, { borderColor: "#C5D8EA" }]}>
              <Ionicons name="checkmark-circle" size={13} color="#A0B8D0" />
              <Text
                style={[
                  st.appOutlineBtnText,
                  { color: "#A0B8D0", marginLeft: 4 },
                ]}
              >
                Already Rated
              </Text>
            </View>
          ) : (
            onRate && (
              <TouchableOpacity
                style={[st.appOutlineBtn, { borderColor: P.starGold }]}
                onPress={onRate}
              >
                <Ionicons name="star-outline" size={13} color={P.starGold} />
                <Text
                  style={[
                    st.appOutlineBtnText,
                    { color: P.starGold, marginLeft: 4 },
                  ]}
                >
                  Rate Employer
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}
    </View>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ message, icon }: { message: string; icon: string }) {
  return (
    <View style={st.emptyCard}>
      <Ionicons name={icon as any} size={28} color="#C5D8EA" />
      <Text style={st.emptyText}>{message}</Text>
    </View>
  );
}

// ── Rating Modal ──────────────────────────────────────────────────────────────
function RatingModal({
  visible,
  title,
  subtitle,
  rating,
  review,
  onSetRating,
  onSetReview,
  onSubmit,
  onSkip,
}: {
  visible: boolean;
  title: string;
  subtitle: string;
  rating: number;
  review: string;
  onSetRating: (r: number) => void;
  onSetReview: (r: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={st.modalOverlay}>
        <View style={st.ratingModal}>
          <LinearGradient
            colors={[P.gradientTop, P.gradientMid]}
            style={st.ratingModalHeader}
          >
            <Text style={st.ratingModalTitle}>{title}</Text>
            <Text style={st.ratingModalSub}>{subtitle}</Text>
          </LinearGradient>
          <View style={st.ratingModalBody}>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <TouchableOpacity key={i} onPress={() => onSetRating(i)}>
                  <Ionicons
                    name={i <= rating ? "star" : "star-outline"}
                    size={34}
                    color={i <= rating ? P.starGold : "#C8D8EC"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={st.ratingInput}
              placeholder="Write a review (optional)..."
              placeholderTextColor={P.textMuted}
              value={review}
              onChangeText={onSetReview}
              multiline
              textAlignVertical="top"
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={st.ratingSkipBtn} onPress={onSkip}>
                <Text style={st.ratingSkipText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.ratingSubmitBtn} onPress={onSubmit}>
                <LinearGradient
                  colors={[P.accentGlow, P.gradientTop]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={st.ratingSubmitGrad}
                >
                  <Text style={st.ratingSubmitText}>Submit</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AccountScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [myRequests, setMyRequests] = useState<JobType[]>([]);
  const [myPastRequests, setMyPastRequests] = useState<JobType[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationType[]>([]);
  const [myPastApplications, setMyPastApplications] = useState<
    ApplicationType[]
  >([]);
  const [myReferrals, setMyReferrals] = useState<ReferralType[]>([]);
  const [referralsModal, setReferralsModal] = useState(false);
  const [ratingModal, setRatingModal] = useState<{
    visible: boolean;
    jobId: string;
    workerId: string;
  }>({ visible: false, jobId: "", workerId: "" });
  const [employerRatingModal, setEmployerRatingModal] = useState<{
    visible: boolean;
    employerId: string;
    applicationId: string;
  }>({ visible: false, employerId: "", applicationId: "" });
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [employerRating, setEmployerRating] = useState(0);
  const [employerReview, setEmployerReview] = useState("");
  const [ratedApplicationIds, setRatedApplicationIds] = useState<Set<string>>(
    new Set(),
  );
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const loadAccountData = async () => {
    setLoading(true);
    const storedRated = await AsyncStorage.getItem("ratedApplicationIds");
    if (storedRated) setRatedApplicationIds(new Set(JSON.parse(storedRated)));
    try {
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      if (!token || !userString) {
        setUser(null);
        return;
      }
      const parsedUser: UserType = JSON.parse(userString);
      const headers = { Authorization: `Bearer ${token}` };
      const userRes = await fetch(`${API_URL}/api/auth/me`, { headers });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user || parsedUser);
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(userData.user || parsedUser),
        );
      } else {
        setUser(parsedUser);
      }

      const fetchCommon = async () => {
        const [requestsRes, pastRequestsRes, referralsRes] = await Promise.all([
          fetch(`${API_URL}/api/jobs/my-requests/${parsedUser._id}`, {
            headers,
          }),
          fetch(`${API_URL}/api/jobs/my-past-requests/${parsedUser._id}`, {
            headers,
          }),
          fetch(`${API_URL}/api/referral`, { headers }),
        ]);
        const [requestsData, pastRequestsData, referralsData] =
          await Promise.all([
            safeJson(requestsRes),
            safeJson(pastRequestsRes),
            safeJson(referralsRes),
          ]);
        // Filter out jobs whose endTime has passed (expired but not yet marked cancelled)
        const filterExpiredJobs = (jobs: any[]) => {
          const now = new Date();
          return jobs.filter((job: any) => {
            if (!job.endTime) return true;
            const endTime = new Date(job.endTime);
            const baseDate = job.endDate
              ? new Date(job.endDate)
              : new Date(job.startDate);
            const expiry = new Date(
              baseDate.getFullYear(),
              baseDate.getMonth(),
              baseDate.getDate(),
              endTime.getHours(),
              endTime.getMinutes(),
              endTime.getSeconds(),
            );
            return now <= expiry;
          });
        };
        setMyRequests(
          requestsRes.ok && Array.isArray(requestsData)
            ? filterExpiredJobs(requestsData)
            : [],
        );
        setMyPastRequests(
          pastRequestsRes.ok && Array.isArray(pastRequestsData)
            ? pastRequestsData
            : [],
        );
        setMyReferrals(
          referralsRes.ok &&
            referralsData &&
            Array.isArray(referralsData.referrals)
            ? referralsData.referrals
            : [],
        );
      };

      if (parsedUser.role === "worker") {
        const appsRes = await fetch(
          `${API_URL}/api/applications/my-applications`,
          { headers },
        );
        const appsData = await safeJson(appsRes);
        const allApps = appsRes.ok ? (appsData.applications ?? []) : [];
        setMyApplications(
          allApps.filter(
            (a: ApplicationType) =>
              (a.status === "pending" || a.status === "accepted") &&
              a.jobId?.status !== "cancelled",
          ),
        );
        setMyPastApplications(
          allApps.filter(
            (a: ApplicationType) =>
              a.status === "rejected" ||
              a.status === "completed" ||
              (a.status === "pending" && a.jobId?.status === "cancelled"),
          ),
        );
        await fetchCommon();
      } else {
        await fetchCommon();
      }
    } catch (error) {
      console.log("Account load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const loadFreshUser = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          if (!token) return;
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
          }
        } catch (err) {
          console.log("Failed to refresh user:", err);
        }
      };
      loadFreshUser();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAccountData();
    setRefreshing(false);
  };
  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, []),
  );

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token)
        await fetch(`${API_URL}/api/auth/clear-token`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
      console.log("Clear token error:", err);
    }
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/login");
  };

  const handleCancelJob = (jobId: string) => {
    Alert.alert(
      "Cancel Request",
      "Are you sure you want to cancel this job request?",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Cancel Request",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${API_URL}/api/jobs/${jobId}/cancel`,
                {
                  method: "PATCH",
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              const data = await response.json();
              if (response.ok) {
                setMyRequests((p) => p.filter((j) => j._id !== jobId));
                setMyPastRequests((p) => [data.job, ...p]);
                Alert.alert("Cancelled", "Job request cancelled.");
              } else Alert.alert("Error", data.error || "Failed to cancel.");
            } catch {
              Alert.alert("Error", "Network error.");
            }
          },
        },
      ],
    );
  };

  const handleDeleteJob = (jobId: string) => {
    Alert.alert("Delete Request", "Delete this job? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              setMyRequests((p) => p.filter((j) => j._id !== jobId));
              Alert.alert("Deleted", "Job deleted.");
            } else Alert.alert("Error", "Failed to delete.");
          } catch {
            Alert.alert("Error", "Network error.");
          }
        },
      },
    ]);
  };

  const handleCompleteJob = (jobId: string) => {
    Alert.alert("Mark as Completed", "Confirm work is done?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(
              `${API_URL}/api/jobs/${jobId}/complete`,
              {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const data = await response.json();
            if (response.ok) {
              setMyRequests((p) => p.filter((j) => j._id !== jobId));
              setMyPastRequests((p) => [data.job, ...p]);
              if (data.workerId)
                setRatingModal({
                  visible: true,
                  jobId,
                  workerId: data.workerId.toString(),
                });
              else Alert.alert("Success", "Job completed!");
            } else Alert.alert("Error", data.error || "Failed.");
          } catch {
            Alert.alert("Error", "Network error.");
          }
        },
      },
    ]);
  };

  const handleRatingSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/rate-worker`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workerId: ratingModal.workerId,
          rating,
          review,
        }),
      });
      const data = await res.json();
      if (res.ok) Alert.alert("Thank you!", "Rating submitted.");
      else Alert.alert("Error", data.message || "Failed to submit rating.");
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      setRatingModal({ visible: false, jobId: "", workerId: "" });
      setRating(0);
      setReview("");
      await loadAccountData();
    }
  };

  const handleEmployerRatingSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/rate-employer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employerId: employerRatingModal.employerId,
          rating: employerRating,
          review: employerReview,
        }),
      });
      const data = await res.json();
      if (res.ok) Alert.alert("Thank you!", "Rating submitted.");
      else Alert.alert("Error", data.message || "Failed.");
    } catch {
      Alert.alert("Error", "Network error.");
    } finally {
      const ratedId = employerRatingModal.applicationId;
      if (ratedId) {
        setRatedApplicationIds((prev) => {
          const updated = new Set(prev);
          updated.add(ratedId);
          AsyncStorage.setItem(
            "ratedApplicationIds",
            JSON.stringify([...updated]),
          );
          return updated;
        });
      }
      setEmployerRatingModal({
        visible: false,
        employerId: "",
        applicationId: "",
      });
      setEmployerRating(0);
      setEmployerReview("");
    }
  };

  const handleWithdrawApplication = (applicationId: string) => {
    Alert.alert("Withdraw Application", "Withdraw this application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Withdraw",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(
              `${API_URL}/api/applications/withdraw/${applicationId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const data = await response.json();
            if (response.ok) {
              // Find the jobId before removing from state
              const withdrawn = myApplications.find(
                (a) => a._id === applicationId,
              );
              const jobId = withdrawn?.jobId?._id;

              setMyApplications((p) =>
                p.filter((a) => a._id !== applicationId),
              );

              // Sync AsyncStorage so the Live Jobs tab shows "Apply" again
              if (jobId) {
                const s1 = await AsyncStorage.getItem("appliedJobs");
                const s2 = await AsyncStorage.getItem("appliedApplications");
                const storedJobs: string[] = s1 ? JSON.parse(s1) : [];
                const storedApps: Record<string, unknown> = s2
                  ? JSON.parse(s2)
                  : {};

                const updatedJobs = storedJobs.filter((id) => id !== jobId);
                delete storedApps[jobId];

                await AsyncStorage.setItem(
                  "appliedJobs",
                  JSON.stringify(updatedJobs),
                );
                await AsyncStorage.setItem(
                  "appliedApplications",
                  JSON.stringify(storedApps),
                );
              }

              Alert.alert("Withdrawn", "Application withdrawn.");
            } else Alert.alert("Error", data.message || "Failed.");
          } catch {
            Alert.alert("Error", "Network error.");
          }
        },
      },
    ]);
  };

  const handleOpenChat = async (app: ApplicationType) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      if (!token || !userString) {
        Alert.alert("Error", "Please login again.");
        return;
      }
      const parsedUser = JSON.parse(userString);
      const workerId = parsedUser?._id || parsedUser?.id;
      if (!app?.jobId?._id || !workerId || !app?._id) {
        Alert.alert("Error", "Missing chat details.");
        return;
      }
      const response = await fetch(`${API_URL}/api/chat/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: app.jobId._id,
          workerId,
          applicationId: app._id,
        }),
      });
      const data = await response.json();
      if (response.ok && data.chat?._id)
        router.push(`/job-chat?chatId=${data.chat._id}`);
      else Alert.alert("Error", data.message || "Could not open chat.");
    } catch {
      Alert.alert("Error", "Network error.");
    }
  };

  const handleDeletePastApplication = (applicationId: string) => {
    Alert.alert("Remove Record", "Remove this application from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const response = await fetch(
              `${API_URL}/api/applications/delete/${applicationId}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const data = await response.json();
            if (response.ok)
              setMyPastApplications((p) =>
                p.filter((a) => a._id !== applicationId),
              );
            else Alert.alert("Error", data.message || "Failed.");
          } catch {
            Alert.alert("Error", "Network error.");
          }
        },
      },
    ]);
  };

  const getEmployerId = (app: ApplicationType): string | undefined => {
    if (typeof app.jobId?.posterId === "object")
      return (app.jobId?.posterId as any)?._id;
    return app.jobId?.posterId as string | undefined;
  };

  const isWorker = user?.role === "worker";
  const avatarRating = isWorker
    ? user?.averageRating || 0
    : user?.averageEmployerRating || 0;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.gradientTop} />

      {/* ── Gradient Header ─────────────────────────────────────────────── */}
      <LinearGradient
        colors={[P.gradientTop, P.gradientMid, P.gradientBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.headerGradient}
      >
        <View style={st.decorCircle1} />
        <View style={st.decorCircle2} />

        <SafeAreaView edges={["top"]}>
          <View style={st.topBar}>
            <Text style={st.headerTitle}>My Account</Text>
            <TouchableOpacity style={st.logoutIconBtn} onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color="rgba(255,255,255,0.85)"
              />
            </TouchableOpacity>
          </View>

          {/* Profile Hero */}
          <View style={st.profileHero}>
            {/* Avatar */}
            <View style={st.avatarRingOuter}>
              <TouchableOpacity
                onPress={() => {
                  if (user?.profileImage) setPhotoModalVisible(true);
                }}
                activeOpacity={user?.profileImage ? 0.8 : 1}
              >
                <View style={st.avatarRingInner}>
                  <Avatar
                    name={user?.name || "U"}
                    profileImage={
                      user?.profileImage
                        ? `${API_URL}${user.profileImage}`
                        : undefined
                    }
                    size={82}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={st.editAvatarBadge}
                onPress={() => router.push("/update-profile")}
              >
                <Ionicons name="pencil" size={12} color={P.white} />
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={st.profileHeroInfo}>
              <Text style={st.heroName}>{user?.name || "Loading..."}</Text>
              <StarRow rating={avatarRating} />
              {user?.role && (
                <View style={st.rolePill}>
                  <Ionicons
                    name={isWorker ? "construct-outline" : "briefcase-outline"}
                    size={11}
                    color={P.white}
                  />
                  <Text style={st.rolePillText}>
                    {isWorker ? "Worker" : "Employer"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats row */}
          <View style={st.statsRow}>
            <View style={st.statItem}>
              <Text style={st.statValue}>{myRequests.length}</Text>
              <Text style={st.statLabel}>Active Jobs</Text>
            </View>
            <View style={st.statDivider} />
            <View style={st.statItem}>
              <Text style={st.statValue}>{myPastRequests.length}</Text>
              <Text style={st.statLabel}>Completed</Text>
            </View>
            {isWorker && (
              <>
                <View style={st.statDivider} />
                <View style={st.statItem}>
                  <Text style={st.statValue}>{myApplications.length}</Text>
                  <Text style={st.statLabel}>Applications</Text>
                </View>
              </>
            )}
            <View style={st.statDivider} />
            <View style={st.statItem}>
              <Text style={st.statValue}>{myReferrals.length}</Text>
              <Text style={st.statLabel}>Referrals</Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={st.curveSpacer} />
      </LinearGradient>

      {/* Curve overlap sheet */}
      <View style={st.curveSheet} />

      {/* ── Scrollable Content ─────────────────────────────────────────── */}
      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={P.accentBlue}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Info Card ──────────────────────────────────────── */}
        <View style={st.infoCard}>
          <View style={st.infoRow}>
            <View style={st.infoIconWrap}>
              <Ionicons name="mail-outline" size={15} color={P.white} />
            </View>
            <View>
              <Text style={st.infoLabel}>Email</Text>
              <Text style={st.infoValue}>{user?.email || "—"}</Text>
            </View>
          </View>
          <View style={st.infoDivider} />
          <View style={st.infoRow}>
            <View style={st.infoIconWrap}>
              <Ionicons name="call-outline" size={15} color={P.white} />
            </View>
            <View>
              <Text style={st.infoLabel}>Phone</Text>
              <Text style={st.infoValue}>{user?.phone || "—"}</Text>
            </View>
          </View>
          <View style={st.infoDivider} />
          <View style={st.infoRow}>
            <View style={st.infoIconWrap}>
              <Ionicons name="location-outline" size={15} color={P.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.infoLabel}>Address</Text>
              <Text style={st.infoValue}>{user?.address?.trim() || "—"}</Text>
            </View>
          </View>

          {isWorker && user?.skills && user.skills.length > 0 && (
            <>
              <View style={st.infoDivider} />
              <View style={[st.infoRow, { alignItems: "flex-start" }]}>
                <View style={st.infoIconWrap}>
                  <Ionicons
                    name="construct-outline"
                    size={15}
                    color={P.white}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.infoLabel}>Skills</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    {user.skills.map((s) => (
                      <View key={s} style={st.skillChip}>
                        <Text style={st.skillChipText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Update profile button */}
          <TouchableOpacity
            onPress={() => router.push("/update-profile")}
            activeOpacity={0.85}
            style={{ marginTop: 4 }}
          >
            <LinearGradient
              colors={[P.accentGlow, P.gradientMid, P.gradientTop]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={st.updateBtn}
            >
              <Ionicons
                name="create-outline"
                size={17}
                color={P.white}
                style={{ marginRight: 8 }}
              />
              <Text style={st.updateBtnText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── My Active Requests ─────────────────────────────────────── */}
        <SectionLabel title="Active Requests" icon="flash-outline" />
        {loading ? (
          <ActivityIndicator
            color={P.accentBlue}
            style={{ paddingVertical: 20 }}
          />
        ) : myRequests.length === 0 ? (
          <EmptyState
            message="No active job requests"
            icon="clipboard-outline"
          />
        ) : (
          myRequests.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              onDelete={() => handleDeleteJob(job._id)}
              onComplete={() => handleCompleteJob(job._id)}
              onViewApplicants={() =>
                router.push(`/applications?jobId=${job._id}`)
              }
            />
          ))
        )}

        {/* ── Past Requests ─────────────────────────────────────────── */}
        <SectionLabel title="Past Requests" icon="time-outline" />
        {loading ? (
          <ActivityIndicator
            color={P.accentBlue}
            style={{ paddingVertical: 20 }}
          />
        ) : myPastRequests.length === 0 ? (
          <EmptyState message="No past requests" icon="archive-outline" />
        ) : (
          myPastRequests.map((job) => (
            <JobCard key={job._id} job={job} isPast />
          ))
        )}

        {/* ── Worker-only sections ───────────────────────────────────── */}
        {isWorker && (
          <>
            <SectionLabel title="My Applications" icon="paper-plane-outline" />
            {loading ? (
              <ActivityIndicator
                color={P.accentBlue}
                style={{ paddingVertical: 20 }}
              />
            ) : myApplications.length === 0 ? (
              <EmptyState
                message="No active applications"
                icon="document-outline"
              />
            ) : (
              myApplications.map((app) => (
                <AppCard
                  key={app._id}
                  app={app}
                  isRated={ratedApplicationIds.has(app._id)}
                  onChat={() => handleOpenChat(app)}
                  onWithdraw={() => handleWithdrawApplication(app._id)}
                  onRate={() => {
                    const eid = getEmployerId(app);
                    if (eid)
                      setEmployerRatingModal({
                        visible: true,
                        employerId: eid,
                        applicationId: app._id,
                      });
                    else Alert.alert("Error", "Employer info not available.");
                  }}
                />
              ))
            )}

            <SectionLabel
              title="Past Applications"
              icon="checkmark-done-outline"
            />
            {loading ? (
              <ActivityIndicator
                color={P.accentBlue}
                style={{ paddingVertical: 20 }}
              />
            ) : myPastApplications.length === 0 ? (
              <EmptyState
                message="No past applications"
                icon="archive-outline"
              />
            ) : (
              myPastApplications.map((app) => (
                <AppCard
                  key={app._id}
                  app={app}
                  isPast
                  isRated={ratedApplicationIds.has(app._id)}
                  onDelete={() => handleDeletePastApplication(app._id)}
                  onRate={() => {
                    const eid = getEmployerId(app);
                    if (eid)
                      setEmployerRatingModal({
                        visible: true,
                        employerId: eid,
                        applicationId: app._id,
                      });
                    else Alert.alert("Error", "Employer info not available.");
                  }}
                />
              ))
            )}
          </>
        )}

        {/* ── Referrals ──────────────────────────────────────────────── */}
        <SectionLabel title="Referred Workers" icon="people-outline" />
        {myReferrals.length === 0 ? (
          <EmptyState
            message="No referred workers yet"
            icon="person-add-outline"
          />
        ) : (
          <TouchableOpacity
            style={st.referralSummaryCard}
            onPress={() => setReferralsModal(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#0F3460", "#1A4880"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={st.referralSummaryGrad}
            >
              <View style={st.referralSummaryLeft}>
                <Ionicons name="people" size={26} color={P.accentGlow} />
                <View style={{ marginLeft: 14 }}>
                  <Text style={st.referralSummaryCount}>
                    {myReferrals.length} Workers Referred
                  </Text>
                  <Text style={st.referralSummarySub}>Tap to view details</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={st.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color={P.errorRed}
            style={{ marginRight: 8 }}
          />
          <Text style={st.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Referrals Modal ────────────────────────────────────────────────── */}
      <Modal
        visible={referralsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setReferralsModal(false)}
      >
        <View style={st.sheetOverlay}>
          <View style={st.bottomSheet}>
            <LinearGradient
              colors={[P.gradientTop, P.gradientMid]}
              style={st.sheetHeader}
            >
              <Text style={st.sheetHeaderTitle}>Referred Workers</Text>
              <TouchableOpacity
                onPress={() => setReferralsModal(false)}
                style={st.sheetCloseBtn}
              >
                <Ionicons name="close" size={20} color={P.white} />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView
              style={{ padding: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {myReferrals.map((ref) => (
                <View key={ref._id} style={st.referralCard}>
                  <View style={st.referralAvatar}>
                    <Ionicons name="person" size={18} color={P.white} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.referralName}>{ref.workerName}</Text>
                    <Text style={st.referralSub}>📞 {ref.workerPhone}</Text>
                    {ref.skills && ref.skills.length > 0 && (
                      <Text style={st.referralSub}>
                        🛠 {ref.skills.join(", ")}
                      </Text>
                    )}
                    {ref.jobId?.category && (
                      <Text style={st.referralSub}>
                        💼 {ref.jobId.category}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Rating Modals ──────────────────────────────────────────────────── */}
      <RatingModal
        visible={ratingModal.visible}
        title="Rate the Worker"
        subtitle="How was their performance?"
        rating={rating}
        review={review}
        onSetRating={setRating}
        onSetReview={setReview}
        onSubmit={handleRatingSubmit}
        onSkip={() => {
          setRatingModal({ visible: false, jobId: "", workerId: "" });
          setRating(0);
          setReview("");
        }}
      />
      <RatingModal
        visible={employerRatingModal.visible}
        title="Rate the Employer"
        subtitle="How was your experience?"
        rating={employerRating}
        review={employerReview}
        onSetRating={setEmployerRating}
        onSetReview={setEmployerReview}
        onSubmit={handleEmployerRatingSubmit}
        onSkip={() => {
          setEmployerRatingModal({
            visible: false,
            employerId: "",
            applicationId: "",
          });
          setEmployerRating(0);
          setEmployerReview("");
        }}
      />

      {/* ── Full-screen Photo Modal (Bug 6) ──────────────────────────── */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", justifyContent: "center", alignItems: "center" }}
          activeOpacity={1}
          onPress={() => setPhotoModalVisible(false)}
        >
          {user?.profileImage && (
            <Image
              source={{ uri: `${API_URL}${user.profileImage}` }}
              style={{ width: 320, height: 320, borderRadius: 160 }}
              resizeMode="cover"
            />
          )}
          <Text style={{ color: "rgba(255,255,255,0.5)", marginTop: 20, fontSize: 13 }}>
            Tap anywhere to close
          </Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const HEADER_H = 320;
const CURVE_H = 30;

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.sheetBg },

  // Header
  headerGradient: {
    width: "100%",
    height: HEADER_H,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.05)",
    top: -70,
    right: -60,
  },
  decorCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 20,
    left: -40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerTitle: {
    color: P.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  logoutIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Profile hero
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  avatarRingOuter: {
    padding: 3,
    borderRadius: 54,
    backgroundColor: "rgba(255,255,255,0.22)",
    position: "relative",
  },
  avatarRingInner: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: P.white,
    overflow: "hidden",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: P.accentBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: P.white,
  },
  profileHeroInfo: { flex: 1, gap: 5 },
  heroName: {
    color: P.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 2,
  },
  rolePillText: {
    color: P.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Stats row
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { color: P.white, fontSize: 18, fontWeight: "800" },
  statLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  curveSpacer: { height: CURVE_H },
  curveSheet: {
    position: "absolute",
    top: HEADER_H - CURVE_H,
    left: 0,
    right: 0,
    height: CURVE_H + 2,
    backgroundColor: P.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Scroll
  scroll: { marginTop: -CURVE_H },
  scrollContent: {
    paddingTop: HEADER_H - CURVE_H - 260,
    paddingHorizontal: 16,
    gap: 12,
  },

  // Section label
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: -2,
  },
  sectionLabelBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: P.accentBlue,
  },
  sectionLabelText: {
    fontSize: 16,
    fontWeight: "800",
    color: P.textDark,
    letterSpacing: 0.2,
  },

  // Info card
  infoCard: {
    backgroundColor: P.cardBg,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    shadowColor: "#1A3C5E",
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: P.gradientMid,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: P.textMuted,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  infoValue: {
    fontSize: 14,
    color: P.textDark,
    fontWeight: "600",
    marginTop: 1,
  },
  infoDivider: { height: 1, backgroundColor: P.divider },
  skillChip: {
    backgroundColor: P.tagBg,
    borderWidth: 1,
    borderColor: P.tagBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  skillChipText: { fontSize: 12, color: P.accentBlue, fontWeight: "600" },
  updateBtn: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  updateBtnText: {
    color: P.white,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },

  // Job card
  jobCardOuter: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: P.gradientTop,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  jobCardGradient: { padding: 16, gap: 10 },
  jobCardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  jobCategoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  jobCategoryText: { color: P.white, fontSize: 13, fontWeight: "700" },
  jobDesc: { color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 18 },
  jobMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  jobMetaItem: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  jobMetaText: { color: "rgba(255,255,255,0.65)", fontSize: 12, flex: 1 },
  jobBudgetPill: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  jobBudgetText: { color: P.white, fontSize: 12, fontWeight: "700" },
  jobActionsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  jobActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  jobActionBtnGreen: { backgroundColor: "rgba(5,150,105,0.4)" },
  jobActionBtnRed: { backgroundColor: "rgba(220,38,38,0.3)" },
  jobActionBtnText: { color: P.white, fontSize: 12, fontWeight: "700" },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(248,113,113,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },

  // App card
  appCard: {
    backgroundColor: P.cardBg,
    borderRadius: 18,
    padding: 16,
    gap: 10,
    shadowColor: "#1A3C5E",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  appCardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  appIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: P.gradientMid,
    alignItems: "center",
    justifyContent: "center",
  },
  appTitle: { fontSize: 15, fontWeight: "700", color: P.textDark },
  appSub: { fontSize: 12, color: P.textMuted, lineHeight: 17 },
  appMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  appMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: P.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: P.inputBorder,
  },
  appMetaChipText: { fontSize: 12, color: P.labelColor, fontWeight: "600" },
  appActionsRow: { flexDirection: "row", gap: 8, marginTop: 2 },
  appChatBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: P.gradientMid,
    paddingVertical: 10,
    borderRadius: 12,
  },
  appChatBtnText: { color: P.white, fontWeight: "700", fontSize: 13 },
  appOutlineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: P.errorRed,
    paddingVertical: 10,
    borderRadius: 12,
  },
  appOutlineBtnText: { color: P.errorRed, fontWeight: "700", fontSize: 13 },
  appDeleteBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  // Empty state
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
  emptyText: { fontSize: 13, color: P.textMuted, textAlign: "center" },

  // Referral summary card
  referralSummaryCard: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: P.gradientTop,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  referralSummaryGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  referralSummaryLeft: { flexDirection: "row", alignItems: "center" },
  referralSummaryCount: { color: P.white, fontSize: 15, fontWeight: "700" },
  referralSummarySub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "#FECACA",
    marginTop: 8,
  },
  logoutBtnText: { color: P.errorRed, fontWeight: "700", fontSize: 15 },

  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: P.sheetBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "80%",
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sheetHeaderTitle: { color: P.white, fontSize: 16, fontWeight: "700" },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  referralCard: {
    backgroundColor: P.cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    shadowColor: "#1A3C5E",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: P.gradientMid,
    alignItems: "center",
    justifyContent: "center",
  },
  referralName: { fontSize: 14, fontWeight: "700", color: P.textDark },
  referralSub: { fontSize: 12, color: P.textMuted, marginTop: 2 },

  // Rating modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  ratingModal: {
    backgroundColor: P.cardBg,
    borderRadius: 22,
    overflow: "hidden",
    width: "100%",
  },
  ratingModalHeader: { padding: 20 },
  ratingModalTitle: { color: P.white, fontSize: 18, fontWeight: "800" },
  ratingModalSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginTop: 4,
  },
  ratingModalBody: { padding: 20 },
  ratingInput: {
    borderWidth: 1.5,
    borderColor: P.inputBorder,
    backgroundColor: P.inputBg,
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    color: P.textDark,
  },
  ratingSkipBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: P.inputBg,
    alignItems: "center",
  },
  ratingSkipText: { fontWeight: "600", color: P.textMuted },
  ratingSubmitBtn: { flex: 1, borderRadius: 14, overflow: "hidden" },
  ratingSubmitGrad: { paddingVertical: 13, alignItems: "center" },
  ratingSubmitText: { color: P.white, fontWeight: "700", fontSize: 15 },
});
