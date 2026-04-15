// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import { useCallback, useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Modal,
//   RefreshControl,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { API_BASE } from "../../constants/Config";

// import Popup from "../../components/Popup";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────────────────────────────────────
// const BASE_URL = API_BASE; // ← same IP as login.tsx

// const PURPLE = "#2196F3";
// const LIGHT_PURPLE = "#F3E5F5";
// const CARD_BG = "#F1F8E9";
// const TEXT_DARK = "#212121";

// // ─────────────────────────────────────────────────────────────────────────────
// // FILTER OPTIONS
// // ─────────────────────────────────────────────────────────────────────────────
// const CATEGORIES = [
//   "All",
//   "Cleaning",
//   "Cooking",
//   "Plumbing",
//   "Electrician",
//   "Babysitting",
//   "Laundry",
//   "Gardening",
//   "Driver",
//   "Carpenter",
//   "Painter",
//   "Other",
// ];

// const PAY_RANGES = [
//   "All",
//   "Under ₹100",
//   "₹100–₹300",
//   "₹300–₹500",
//   "₹500–₹800",
//   "₹800–₹1200",
//   "₹1200–₹2000",
//   "₹2000+",
// ];

// const SCHEDULES = [
//   "Any",
//   "Immediate",
//   "Within 1 hr",
//   "Within 2 hrs",
//   "Within 5 hrs",
//   "Today",
//   "Tomorrow",
//   "Within 3 Days",
//   "Next Week",
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // CATEGORY → ICON MAP
// // ─────────────────────────────────────────────────────────────────────────────
// const CATEGORY_ICONS: Record<string, string> = {
//   Cleaning: "sparkles-outline",
//   Cooking: "restaurant-outline",
//   Plumbing: "water-outline",
//   Electrician: "flash-outline",
//   Babysitting: "people-outline",
//   Laundry: "shirt-outline",
//   Gardening: "leaf-outline",
//   Driver: "car-outline",
//   Carpenter: "hammer-outline",
//   Painter: "color-palette-outline",
//   Other: "grid-outline",
//   default: "briefcase-outline",
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────
// type Job = {
//   _id: string;
//   postedBy: { name: string; _id?: string; rating?: number };
//   category: string;
//   budgetMin: number;
//   budgetMax: number;
//   isNegotiable: boolean;
//   schedule: string;
//   startDate?: string;
//   endSchedule?: string | null;
//   address: string;
//   rating: number;
//   description: string;
//   status: string;
// };

// type FilterKey = "category" | "pay" | "schedule";

// type AppliedApplicationMap = Record<
//   string,
//   {
//     applicationId: string;
//     workerId?: string;
//   }
// >;

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// export default function LiveJobsScreen() {
//   const router = useRouter();

//   // ── Core state ──────────────────────────────────────────────────────────────
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [token, setToken] = useState<string | null>(null);
//   const [isWorker, setIsWorker] = useState(false);

//   const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
//   const [appliedApplications, setAppliedApplications] =
//     useState<AppliedApplicationMap>({});

//   const [applyModal, setApplyModal] = useState(false);
//   const [applyJobId, setApplyJobId] = useState<string | null>(null);

//   const [expectedPay, setExpectedPay] = useState("");
//   const [preferredTime, setPreferredTime] = useState("");
//   const [remarks, setRemarks] = useState("");

//   const [popup, setPopup] = useState("");
//   const [popupType, setPopupType] = useState<"normal" | "error">("normal");

//   // ── Filter state ────────────────────────────────────────────────────────────
//   const [filters, setFilters] = useState({
//     category: "All",
//     pay: "All",
//     schedule: "Any",
//   });
//   const [activeDropdown, setActiveDropdown] = useState<FilterKey | null>(null);

//   // ── View/expand state ───────────────────────────────────────────────────────
//   const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

//   // ── Refer modal state ───────────────────────────────────────────────────────
//   const [referModal, setReferModal] = useState(false);
//   const [referJobId, setReferJobId] = useState<string | null>(null);
//   const [referName, setReferName] = useState("");
//   const [referPhone, setReferPhone] = useState("");
//   const [referSkills, setReferSkills] = useState("");
//   const [referLoading, setReferLoading] = useState(false);

//   // ─────────────────────────────────────────────────────────────────────────
//   // LOAD USER from AsyncStorage → check if worker
//   // ─────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     const loadUser = async () => {
//       const t = await AsyncStorage.getItem("token");
//       const u = await AsyncStorage.getItem("user");
//       setToken(t);

//       if (u) {
//         const parsed = JSON.parse(u);
//         const workerCheck =
//           parsed.role === "worker" ||
//           (Array.isArray(parsed.workerTags) && parsed.workerTags.length > 0);
//         setIsWorker(workerCheck);
//       }
//     };
//     loadUser();
//   }, []);

//   useEffect(() => {
//     const loadAppliedJobs = async () => {
//       const stored = await AsyncStorage.getItem("appliedJobs");
//       if (stored) {
//         setAppliedJobs(JSON.parse(stored));
//       }
//     };
//     loadAppliedJobs();
//   }, []);

//   useEffect(() => {
//     const loadAppliedApplications = async () => {
//       const stored = await AsyncStorage.getItem("appliedApplications");
//       if (stored) {
//         setAppliedApplications(JSON.parse(stored));
//       }
//     };
//     loadAppliedApplications();
//   }, []);

//   // ─────────────────────────────────────────────────────────────────────────
//   // FETCH JOBS from backend
//   // ─────────────────────────────────────────────────────────────────────────
//   const fetchJobs = useCallback(async () => {
//     try {
//       const t = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/jobs`, {
//         headers: {
//           Authorization: `Bearer ${t}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const text = await res.text();
//       console.log("RAW RESPONSE:", text);

//       let data;
//       try {
//         data = JSON.parse(text);
//       } catch (e) {
//         // Try to extract valid jobs before the broken part
//         console.log("Parse failed, trying to find broken job...");
//         setJobs([]);
//         setLoading(false);
//         setRefreshing(false);
//         return;
//       }

//       if (res.ok) {
//         if (Array.isArray(data)) {
//           const formatted = data.map((job) => ({
//             ...job,
//             budgetMin: job.minBudget,
//             budgetMax: job.maxBudget,
//             isNegotiable: job.noBudget,
//             startDate: job.startDate,
//             schedule: new Date(job.startDate).toLocaleString("en-IN", {
//               day: "numeric",
//               month: "short",
//               hour: "numeric",
//               minute: "2-digit",
//             }),
//             endSchedule: job.endDate
//               ? new Date(job.endDate).toLocaleString("en-IN", {
//                   day: "numeric",
//                   month: "short",
//                   hour: "numeric",
//                   minute: "2-digit",
//                 })
//               : null,
//             postedBy: job.postedBy || { name: "User" },
//             rating: job.postedBy?.rating ?? job.rating ?? 0,
//           }));

//           setJobs(formatted);
//         } else {
//           setJobs([]);
//         }
//       } else {
//         console.log("Server error:", data);
//         setJobs([]);
//       }
//     } catch (error) {
//       console.log("Fetch error:", error);
//       setJobs([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchJobs();
//   }, [fetchJobs]);

//   // ─────────────────────────────────────────────────────────────────────────
//   // FILTER LOGIC
//   // ─────────────────────────────────────────────────────────────────────────
//   const filteredJobs = jobs.filter((job) => {
//     // ── Hide completed / cancelled jobs ──────────────────────────────────────
//     const s = (job.status || "").trim().toLowerCase();
//     if (s === "completed" || s === "cancelled") return false;

//     // Category
//     if (filters.category !== "All" && job.category !== filters.category)
//       return false;

//     if (filters.pay !== "All") {
//       const min = job.isNegotiable ? 0 : (job.budgetMin ?? 0);
//       const max = job.isNegotiable ? 9999 : (job.budgetMax ?? 0);
//       if (filters.pay === "Under ₹100" && max >= 100) return false;
//       if (filters.pay === "₹100–₹300" && (max < 100 || max > 300)) return false;
//       if (filters.pay === "₹300–₹500" && (max < 300 || max > 500)) return false;
//       if (filters.pay === "₹500–₹800" && (max < 500 || max > 800)) return false;
//       if (filters.pay === "₹800–₹1200" && (max < 800 || max > 1200)) return false;
//       if (filters.pay === "₹1200–₹2000" && (max < 1200 || max > 2000)) return false;
//       if (filters.pay === "₹2000+" && max < 2000) return false;
//     }

//     // Schedule
//     if (filters.schedule !== "Any" && filters.schedule !== "All") {
//       const schedLower = (job.schedule || "").toLowerCase();
//       const filterLower = filters.schedule.toLowerCase();
//       // Map schedule filter to date-based check
//       const now = new Date();
//       const jobStart = job.startDate ? new Date(job.startDate) : null;
//       if (jobStart) {
//         const diffMs = jobStart.getTime() - now.getTime();
//         const diffHrs = diffMs / (1000 * 60 * 60);
//         if (filters.schedule === "Immediate" && diffHrs > 0.5) return false;
//         if (filters.schedule === "Within 1 hr" && diffHrs > 1) return false;
//         if (filters.schedule === "Within 2 hrs" && diffHrs > 2) return false;
//         if (filters.schedule === "Within 5 hrs" && diffHrs > 5) return false;
//         if (filters.schedule === "Today" && diffHrs > 24) return false;
//         if (filters.schedule === "Tomorrow" && (diffHrs < 24 || diffHrs > 48)) return false;
//         if (filters.schedule === "Within 3 Days" && diffHrs > 72) return false;
//         if (filters.schedule === "Next Week" && diffHrs > 168) return false;
//       } else if (!schedLower.includes(filterLower)) {
//         return false;
//       }
//     }

//     return true;
//   });

//   // ─────────────────────────────────────────────────────────────────────────
//   // APPLY TO JOB
//   // ─────────────────────────────────────────────────────────────────────────
//   const handleApply = async (jobId: string) => {
//     if (appliedJobs.includes(jobId)) {
//       const updated = appliedJobs.filter((id) => id !== jobId);

//       setAppliedJobs(updated);
//       await AsyncStorage.setItem("appliedJobs", JSON.stringify(updated));

//       const updatedApplications = { ...appliedApplications };
//       delete updatedApplications[jobId];
//       setAppliedApplications(updatedApplications);
//       await AsyncStorage.setItem(
//         "appliedApplications",
//         JSON.stringify(updatedApplications),
//       );
//       setPopup("Application removed");
//       setPopupType("normal");

//       Alert.alert("Cancelled", "Application removed");
//       return;
//     }

//     Alert.alert("Apply for Job", "Are you sure you want to apply?", [
//       { text: "Cancel", style: "cancel" },
//       {
//         text: "Apply",
//         onPress: async () => {
//           try {
//             const res = await fetch(`${BASE_URL}/jobs/${jobId}/apply`, {
//               method: "POST",
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             });

//             const data = await res.json();

//             if (res.ok) {
//               const updated = [...appliedJobs, jobId];
//               setAppliedJobs(updated);

//               await AsyncStorage.setItem(
//                 "appliedJobs",
//                 JSON.stringify(updated),
//               );

//               setPopup("Application submitted");
//               setPopupType("normal");
//             } else {
//               setPopup(data.message || "Something went wrong");
//               setPopupType("error");
//             }
//           } catch {
//             const updated = [...appliedJobs, jobId];
//             setAppliedJobs(updated);

//             await AsyncStorage.setItem("appliedJobs", JSON.stringify(updated));

//             setPopup("Saved locally");
//             setPopupType("normal");
//           }
//         },
//       },
//     ]);
//   };

//   const handleOpenChat = async (jobId: string) => {
//     try {
//       const t = await AsyncStorage.getItem("token");
//       const u = await AsyncStorage.getItem("user");

//       if (!t || !u) {
//         Alert.alert("Error", "Please login again");
//         return;
//       }

//       const parsedUser = JSON.parse(u);
//       const workerId = parsedUser?._id || parsedUser?.id;

//       const savedApp = appliedApplications[jobId];

//       if (!workerId || !savedApp?.applicationId) {
//         Alert.alert("Error", "Application details not found yet");
//         return;
//       }

//       const res = await fetch(`${BASE_URL}/chat/create`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${t}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           jobId,
//           workerId,
//           applicationId: savedApp.applicationId,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok && data.chat?._id) {
//         router.push(`/job-chat?chatId=${data.chat._id}`);
//       } else {
//         Alert.alert("Error", data.message || "Could not open chat");
//       }
//     } catch (error) {
//       console.log("Chat open error:", error);
//       Alert.alert("Error", "Something went wrong");
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // SUBMIT REFERRAL
//   // ─────────────────────────────────────────────────────────────────────────
//   const closeReferModal = () => {
//     setReferModal(false);
//     setReferJobId(null);
//     setReferName("");
//     setReferPhone("");
//     setReferSkills("");
//   };

//   const handleReferSubmit = async () => {
//     console.log("🚀 Referral submit triggered");

//     if (!referName.trim()) {
//       console.log("❌ Name missing");
//       setPopup("Please enter the worker's name");
//       setPopupType("error");
//       return;
//     }

//     if (!/^\d{10}$/.test(referPhone.trim())) {
//       console.log("❌ Invalid phone:", referPhone);
//       setPopup("Phone number must be exactly 10 digits");
//       setPopupType("error");
//       return;
//     }

//     if (!referSkills.trim()) {
//       console.log("❌ Skills missing");
//       setPopup("Please describe the worker's skills");
//       setPopupType("error");
//       return;
//     }

//     if (!referJobId) {
//       console.log("❌ No jobId");
//       setPopup("No job selected");
//       setPopupType("error");
//       return;
//     }

//     const freshToken = await AsyncStorage.getItem("token");
//     if (!freshToken) {
//       setPopup("Session expired. Please login again.");
//       setPopupType("error");
//       return;
//     }

//     setReferLoading(true);

//     const payload = {
//       workerName: referName.trim(),
//       workerPhone: referPhone.trim(),
//       message: referSkills.trim(),
//       jobId: referJobId,
//     };

//     try {
//       const res = await fetch(`${BASE_URL}/referral/add`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${freshToken}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       const text = await res.text();
//       console.log("Referral raw response:", text);

//       let data: any = {};
//       try {
//         data = JSON.parse(text);
//       } catch {
//         console.log("Response was not JSON:", text);
//       }

//       if (!res.ok) {
//         setPopup(data.message || `Server error: ${res.status}`);
//         setPopupType("error");
//         return;
//       }

//       setPopup("Worker added to your referrals");
//       setPopupType("normal");
//       closeReferModal();

//     } catch (error) {
//       console.log("Network error:", error);
//       setPopup(`Network error: ${String(error)}`);
//       setPopupType("error");
//     } finally {
//       setReferLoading(false);
//     }
//   }
//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER: Filter Pill + Dropdown
//   // ─────────────────────────────────────────────────────────────────────────
//   const renderFilterPill = (
//     label: string,
//     key: FilterKey,
//     options: string[],
//     value: string,
//   ) => {
//     const isOpen = activeDropdown === key;
//     const displayValue = value === "All" || value === "Any" ? "All" : value;

//     return (
//       <View style={styles.filterPillWrapper} key={key}>
//         <TouchableOpacity
//           style={[styles.filterPill, isOpen && styles.filterPillActive]}
//           onPress={() => setActiveDropdown(isOpen ? null : key)}
//           activeOpacity={0.8}
//         >
//           <Text style={[styles.filterPillText, isOpen && styles.filterPillTextActive]} numberOfLines={1}>
//             {label}: {displayValue}
//           </Text>
//           <Ionicons
//             name={isOpen ? "chevron-up" : "chevron-down"}
//             size={11}
//             color={isOpen ? "#FFFFFF" : "#1A3C5E"}
//             style={{ marginLeft: 3 }}
//           />
//         </TouchableOpacity>

//         {isOpen && (
//           <View style={styles.dropdownMenu}>
//             {options.map((opt) => (
//               <TouchableOpacity
//                 key={opt}
//                 style={[
//                   styles.dropdownItem,
//                   value === opt && styles.dropdownItemActive,
//                 ]}
//                 onPress={() => {
//                   setFilters((prev) => ({ ...prev, [key]: opt }));
//                   setActiveDropdown(null);
//                 }}
//               >
//                 <Text
//                   style={[
//                     styles.dropdownItemText,
//                     value === opt && styles.dropdownItemTextActive,
//                   ]}
//                 >
//                   {opt}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
//       </View>
//     );
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER: Single Job Card
//   // ─────────────────────────────────────────────────────────────────────────
//   const renderJobCard = ({ item: job }: { item: Job }) => {
//     const isExpanded = expandedJobId === job._id;
//     const iconName =
//       (CATEGORY_ICONS[job.category] as any) || CATEGORY_ICONS.default;
//     const budgetText = job.isNegotiable
//       ? "Negotiable"
//       : `₹${job.budgetMin} – ₹${job.budgetMax}`;

//     return (
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Ionicons
//             name={iconName}
//             size={17}
//             color="#fff"
//             style={{ marginRight: 8 }}
//           />
//           <Text style={styles.cardHeaderText} numberOfLines={2}>
//             Posted by: {job.postedBy?.name}
//             {"   "}|{"   "}
//             Category: {job.category}
//           </Text>
//         </View>

//         <View style={styles.cardBody}>
//           {isExpanded && (
//             <View style={styles.expandedSection}>
//               <View style={styles.ratingRow}>
//                 <Text style={styles.ratingLabel}>User Rating: </Text>
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <Ionicons
//                     key={star}
//                     name={
//                       job.rating >= star
//                         ? "star"
//                         : job.rating >= star - 0.5
//                           ? "star-half"
//                           : "star-outline"
//                     }
//                     size={15}
//                     color="#FFC107"
//                   />
//                 ))}
//                 <Text style={styles.ratingScore}> ({job.rating}/5)</Text>
//               </View>

//               <Text style={styles.descText}>{job.description}</Text>

//               <View style={styles.divider} />
//             </View>
//           )}

//           <Text style={styles.infoText}>
//             <Text style={styles.infoLabel}>Budget: </Text>
//             {budgetText}
//             {"     "}
//             <Text style={styles.infoLabel}>Start: </Text>
//             {job.schedule}
//             {job.endSchedule ? (
//               <>
//                 {"   "}
//                 <Text style={styles.infoLabel}>End: </Text>
//                 {job.endSchedule}
//               </>
//             ) : null}
//           </Text>

//           <Text style={styles.infoText}>
//             <Text style={styles.infoLabel}>Address: </Text>
//             {job.address}
//           </Text>

//           <View style={styles.buttonRow}>
//             {/* Apply Now — workers only */}
//             {isWorker && (
//               // <TouchableOpacity
//               //   style={styles.btnApply}
//               //   onPress={() => handleApply(job._id)}
//               //   activeOpacity={0.85}
//               // >
//               //   <Text style={styles.btnText}>Apply Now</Text>
//               // </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.btnApply,
//                   appliedJobs.includes(job._id) && styles.btnApplied,
//                 ]}
//                 onPress={async () => {
//                   if (appliedJobs.includes(job._id)) {
//                     const updated = appliedJobs.filter((id) => id !== job._id);

//                     setAppliedJobs(updated);

//                     await AsyncStorage.setItem(
//                       "appliedJobs",
//                       JSON.stringify(updated),
//                     );

//                     const updatedApplications = { ...appliedApplications };
//                     delete updatedApplications[job._id];
//                     setAppliedApplications(updatedApplications);
//                     await AsyncStorage.setItem(
//                       "appliedApplications",
//                       JSON.stringify(updatedApplications),
//                     );

//                     Alert.alert("Cancelled", "Application removed");
//                     setPopup("Application removed");
//                     setPopupType("normal");
//                     return;
//                   }

//                   setApplyJobId(job._id);
//                   setApplyModal(true);
//                 }}
//               >
//                 <Text style={styles.btnText}>
//                   {appliedJobs.includes(job._id) ? "Applied" : "Apply Now"}
//                 </Text>
//               </TouchableOpacity>
//             )}

//             {isWorker && appliedJobs.includes(job._id) && (
//               <TouchableOpacity
//                 style={styles.btnChat}
//                 onPress={() => handleOpenChat(job._id)}
//                 activeOpacity={0.85}
//               >
//                 <Text style={styles.btnText}>Chat</Text>
//               </TouchableOpacity>
//             )}

//             <TouchableOpacity
//               style={styles.btnRefer}
//               onPress={() => {
//                 setReferJobId(job._id);
//                 setReferModal(true);
//               }}
//               activeOpacity={0.85}
//             >
//               <Text style={styles.btnText}>Refer</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.btnView, isExpanded && styles.btnViewActive]}
//               onPress={() => setExpandedJobId(isExpanded ? null : job._id)}
//               activeOpacity={0.85}
//             >
//               <Text style={styles.btnText}>
//                 {isExpanded ? "Close" : "View"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // LOADING STATE
//   // ─────────────────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={PURPLE} />
//         <Text style={styles.loadingText}>Loading live jobs…</Text>
//       </SafeAreaView>
//     );
//   }

//   // ─────────────────────────────────────────────────────────────────────────
//   // MAIN RENDER
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.container} edges={["top"]}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Live Jobs</Text>

//         <TouchableOpacity
//           style={styles.refreshBtn}
//           onPress={() => {
//             setLoading(true);
//             fetchJobs();
//           }}
//         >
//           <Ionicons name="refresh-outline" size={22} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.filterBar}>
//         {renderFilterPill("Category", "category", CATEGORIES, filters.category)}
//         {renderFilterPill("Pay", "pay", PAY_RANGES, filters.pay)}
//         {renderFilterPill("Schedule", "schedule", SCHEDULES, filters.schedule)}
//       </View>

//       <FlatList
//         data={filteredJobs}
//         keyExtractor={(item) => item._id}
//         renderItem={renderJobCard}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={() => {
//               setRefreshing(true);
//               fetchJobs();
//             }}
//             colors={[PURPLE]}
//             tintColor={PURPLE}
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="search-outline" size={52} color="#BDBDBD" />
//             <Text style={styles.emptyText}>No jobs match your filters</Text>
//             <TouchableOpacity
//               onPress={() =>
//                 setFilters({ category: "All", pay: "All", schedule: "Any" })
//               }
//             >
//               <Text style={styles.clearFiltersText}>Clear Filters</Text>
//             </TouchableOpacity>
//           </View>
//         }
//       />

//       <Modal
//         visible={referModal}
//         animationType="slide"
//         transparent
//         onRequestClose={closeReferModal}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalHeaderText}>Refer a Worker</Text>
//               <TouchableOpacity onPress={closeReferModal}>
//                 <Ionicons name="close" size={22} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               style={styles.modalBody}
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//             >
//               <Text style={styles.inputLabel}>Worker's Name</Text>
//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="Enter name"
//                 value={referName}
//                 onChangeText={setReferName}
//                 placeholderTextColor="#BDBDBD"
//               />

//               <Text style={styles.inputLabel}>Worker's Phone Number</Text>
//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="Enter 10-digit number"
//                 keyboardType="numeric"
//                 maxLength={10}
//                 value={referPhone}
//                 onChangeText={setReferPhone}
//                 placeholderTextColor="#BDBDBD"
//               />

//               <Text style={styles.inputLabel}>Description / Skills</Text>
//               <TextInput
//                 style={[styles.modalInput, styles.textArea]}
//                 placeholder="Describe worker's skills and experience"
//                 multiline
//                 numberOfLines={4}
//                 textAlignVertical="top"
//                 value={referSkills}
//                 onChangeText={setReferSkills}
//                 placeholderTextColor="#BDBDBD"
//               />

//               <TouchableOpacity
//                 style={[styles.submitBtn, referLoading && { opacity: 0.7 }]}
//                 onPress={handleReferSubmit}
//                 disabled={referLoading}
//                 activeOpacity={0.85}
//               >
//                 {referLoading ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.submitBtnText}>Submit Referral</Text>
//                 )}
//               </TouchableOpacity>

//               <View style={{ height: 30 }} />
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={applyModal}
//         animationType="slide"
//         transparent
//         onRequestClose={() => setApplyModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalHeaderText}>Apply for Job</Text>

//               <TouchableOpacity onPress={() => setApplyModal(false)}>
//                 <Ionicons name="close" size={22} color="#fff" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView style={styles.modalBody}>
//               <Text style={styles.inputLabel}>Expected Pay</Text>

//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="Enter expected pay"
//                 value={expectedPay}
//                 onChangeText={setExpectedPay}
//                 keyboardType="numeric"
//               />

//               <Text style={styles.inputLabel}>Preferred Time</Text>

//               <TextInput
//                 style={styles.modalInput}
//                 placeholder="Enter your preferred schedule"
//                 value={preferredTime}
//                 maxLength={50}
//                 onChangeText={setPreferredTime}
//               />

//               <Text style={styles.inputLabel}>Other Remarks (optional)</Text>

//               <TextInput
//                 style={[styles.modalInput, styles.textArea]}
//                 placeholder=""
//                 value={remarks}
//                 maxLength={100}
//                 multiline
//                 onChangeText={setRemarks}
//               />

//               <TouchableOpacity
//                 style={styles.submitBtn}
//                 onPress={async () => {
//                   if (!applyJobId) return;

//                   if (!expectedPay.trim()) {
//                     setPopup("Expected pay is required");
//                     setPopupType("error");
//                     return;
//                   }

//                   if (!preferredTime.trim()) {
//                     setPopup("Preferred time is required");
//                     setPopupType("error");
//                     return;
//                   }

//                   if (appliedJobs.includes(applyJobId)) {
//                     const updated = appliedJobs.filter(
//                       (id) => id !== applyJobId,
//                     );

//                     setAppliedJobs(updated);

//                     await AsyncStorage.setItem(
//                       "appliedJobs",
//                       JSON.stringify(updated),
//                     );

//                     const updatedApplications = { ...appliedApplications };
//                     delete updatedApplications[applyJobId];
//                     setAppliedApplications(updatedApplications);
//                     await AsyncStorage.setItem(
//                       "appliedApplications",
//                       JSON.stringify(updatedApplications),
//                     );

//                     setApplyModal(false);

//                     setPopup("Application removed");
//                     setPopupType("normal");

//                     return;
//                   }

//                   try {
//                     const res = await fetch(`${BASE_URL}/applications/apply`, {
//                       method: "POST",
//                       headers: {
//                         Authorization: `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                       },
//                       body: JSON.stringify({
//                         jobId: applyJobId,
//                         expectedPay: Number(expectedPay),
//                         preferredTime,
//                         remarks,
//                       }),
//                     });

//                     const data = await res.json();

//                     if (res.ok) {
//                       const updated = [...appliedJobs, applyJobId];
//                       setAppliedJobs(updated);

//                       await AsyncStorage.setItem(
//                         "appliedJobs",
//                         JSON.stringify(updated),
//                       );

//                       const applicationId =
//                         data?.application?._id ||
//                         data?._id ||
//                         data?.applicationId ||
//                         "";

//                       const updatedApplications = {
//                         ...appliedApplications,
//                         [applyJobId]: {
//                           applicationId,
//                           workerId: data?.application?.workerId || undefined,
//                         },
//                       };

//                       setAppliedApplications(updatedApplications);

//                       await AsyncStorage.setItem(
//                         "appliedApplications",
//                         JSON.stringify(updatedApplications),
//                       );

//                       setApplyModal(false);
//                       setExpectedPay("");
//                       setPreferredTime("");
//                       setRemarks("");

//                       setPopup("Application submitted successfully");
//                       setPopupType("normal");
//                     } else {
//                       setPopup(data.message || "Failed to apply");
//                       setPopupType("error");
//                     }
//                   } catch (err) {
//                     console.log(err);
//                     setPopup("Something went wrong");
//                     setPopupType("error");
//                   }
//                 }}
//               >
//                 <Text style={styles.submitBtnText}>Submit Application</Text>
//               </TouchableOpacity>

//               <View style={{ height: 40 }} />
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       <Popup
//         message={popup}
//         type={popupType}
//         onClose={() => {
//           setPopup("");
//           setPopupType("normal");
//         }}
//       />
//     </SafeAreaView>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // STYLES
// // ─────────────────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F0F4F9" },
//   loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F0F4F9" },
//   loadingText: { color: "#1A3C5E", marginTop: 12, fontSize: 15, fontWeight: "500" },
//   listContent: { padding: 14, paddingBottom: 30 },
//   header: {
//     backgroundColor: "#1A3C5E",
//     paddingVertical: 16, paddingHorizontal: 20,
//     flexDirection: "row", alignItems: "center", justifyContent: "space-between",
//     shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15, shadowRadius: 6, elevation: 6,
//   },
//   headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", letterSpacing: 0.3 },
//   refreshBtn: { padding: 4 },
//   filterBar: {
//     flexDirection: "row", paddingHorizontal: 12, paddingBottom: 10,
//     backgroundColor: "#FFFFFF", gap: 8, zIndex: 100, marginTop: 0,
//     borderBottomWidth: 1, borderBottomColor: "#E8EFF7", paddingTop: 10,
//   },
//   filterPillWrapper: { flex: 1, zIndex: 100, position: "relative" },
//   filterPill: {
//     flexDirection: "row", alignItems: "center", justifyContent: "center",
//     borderWidth: 1.5, borderColor: "#1A3C5E", borderRadius: 20,
//     paddingVertical: 7, paddingHorizontal: 8, backgroundColor: "#FFFFFF",
//   },
//   filterPillActive: { backgroundColor: "#1A3C5E" },
//   filterPillText: { fontSize: 11, color: "#1A3C5E", fontWeight: "600", flexShrink: 1 },
//   filterPillTextActive: { color: "#FFFFFF" },
//   dropdownMenu: {
//     position: "absolute", top: 38, left: 0, right: 0,
//     backgroundColor: "#FFFFFF", borderRadius: 10, borderWidth: 1,
//     borderColor: "#D4E0EE", elevation: 10, zIndex: 999,
//     shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8,
//     shadowOffset: { width: 0, height: 4 }, maxHeight: 260,
//   },
//   dropdownItem: { paddingVertical: 11, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#F0F4F9" },
//   dropdownItemActive: { backgroundColor: "#EBF0F8" },
//   dropdownItemText: { fontSize: 13, color: "#3D5470", fontWeight: "500" },
//   dropdownItemTextActive: { color: "#1A3C5E", fontWeight: "700" },
//   card: {
//     borderRadius: 14, marginBottom: 12, overflow: "hidden",
//     elevation: 3, shadowColor: "#1A3C5E", shadowOpacity: 0.08,
//     shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
//     borderWidth: 1, borderColor: "#E8EFF7",
//   },
//   cardHeader: {
//     backgroundColor: "#1A3C5E", flexDirection: "row", alignItems: "center",
//     paddingVertical: 11, paddingHorizontal: 14,
//   },
//   cardHeaderText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", flex: 1, lineHeight: 19 },
//   cardBody: { backgroundColor: "#FFFFFF", paddingHorizontal: 14, paddingVertical: 12 },
//   infoText: { fontSize: 13, color: "#3D5470", marginBottom: 5, lineHeight: 19 },
//   infoLabel: { fontWeight: "700", color: "#0F1C2E" },
//   expandedSection: { marginBottom: 10 },
//   ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
//   ratingLabel: { fontSize: 13, fontWeight: "700", color: "#0F1C2E", marginRight: 4 },
//   ratingScore: { fontSize: 13, color: "#3D5470" },
//   descText: { fontSize: 13, color: "#7A8FA6", lineHeight: 20, marginBottom: 10 },
//   divider: { height: 1, backgroundColor: "#E8EFF7", marginBottom: 10 },
//   buttonRow: { flexDirection: "row", marginTop: 10, flexWrap: "wrap", gap: 8 },
//   btnApply: {
//     backgroundColor: "#1A3C5E", paddingVertical: 9, paddingHorizontal: 16,
//     borderRadius: 8, elevation: 2,
//   },
//   btnRefer: { backgroundColor: "#F59E0B", paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8 },
//   btnView: { backgroundColor: "#2A5298", paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8 },
//   btnViewActive: { backgroundColor: "#1A3C5E" },
//   btnChat: { backgroundColor: "#059669", paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8 },
//   btnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 0.2 },
//   btnApplied: { backgroundColor: "#059669" },
//   emptyContainer: { alignItems: "center", marginTop: 70, paddingHorizontal: 24 },
//   emptyText: { color: "#7A8FA6", fontSize: 15, marginTop: 14, textAlign: "center", lineHeight: 22 },
//   clearFiltersText: { color: "#1A3C5E", fontSize: 14, fontWeight: "700", marginTop: 10, textDecorationLine: "underline" },
//   modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" },
//   modalSheet: { backgroundColor: "#F8FAFC", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "85%", overflow: "hidden" },
//   modalHeader: {
//     backgroundColor: "#1A3C5E", flexDirection: "row", justifyContent: "space-between",
//     alignItems: "center", paddingHorizontal: 20, paddingVertical: 16,
//   },
//   modalHeaderText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
//   modalBody: { padding: 20 },
//   inputLabel: { fontSize: 13, fontWeight: "700", color: "#0F1C2E", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: 0.3 },
//   modalInput: { borderWidth: 1.5, borderColor: "#D4E0EE", borderRadius: 10, padding: 12, fontSize: 14, color: "#0F1C2E", backgroundColor: "#FFFFFF" },
//   textArea: { height: 90, textAlignVertical: "top" },
//   submitBtn: {
//     backgroundColor: "#1A3C5E", borderRadius: 10, paddingVertical: 14,
//     alignItems: "center", marginTop: 20,
//     shadowColor: "#1A3C5E", shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
//   },
//   submitBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
// });
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Popup from "../../components/Popup";
import { API_BASE } from "../../constants/Config";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  gradTop: "#0A1F3C",
  gradMid: "#0F2D55",
  gradBot: "#1A4880",
  navy: "#0F2040",
  navyMid: "#1A3C5E",
  navyLight: "#2A5298",
  accentGold: "#F59E0B",
  accentTeal: "#0EA5C9",
  accentGreen: "#059669",
  sheetBg: "#F0F5FF",
  cardBg: "#FFFFFF",
  inputBg: "#F0F5FF",
  border: "#D5E3F7",
  textDark: "#0F2040",
  textMid: "#2A4A6E",
  textMuted: "#7A95B5",
  white: "#FFFFFF",
  tagBg: "#EAF3FF",
  tagBorder: "#C5DCFA",
  glassBg: "rgba(255,255,255,0.12)",
  glassBorder: "rgba(255,255,255,0.25)",
};

const BASE_URL = API_BASE;

const CATEGORIES = [
  "All",
  "Cleaning",
  "Cooking",
  "Plumber",
  "Electrician",
  "Babysitting",
  "Laundry",
  "Gardening",
  "Driver",
  "Carpenter",
  "Painter",
  "Other",
];
const PAY_RANGES = [
  "All",
  "Under ₹100",
  "₹100–₹300",
  "₹300–₹500",
  "₹500–₹800",
  "₹800–₹1200",
  "₹1200–₹2000",
  "₹2000+",
];
const SCHEDULES = [
  "Any",
  "Immediate",
  "Within 1 hr",
  "Within 2 hrs",
  "Within 5 hrs",
  "Today",
  "Tomorrow",
  "Within 3 Days",
  "Next Week",
];

const CATEGORY_ICONS: Record<string, string> = {
  Cleaning: "sparkles-outline",
  Cooking: "restaurant-outline",
  Plumber: "water-outline",
  Electrician: "flash-outline",
  Babysitting: "people-outline",
  Laundry: "shirt-outline",
  Gardening: "leaf-outline",
  Driver: "car-outline",
  Carpenter: "hammer-outline",
  Painter: "color-palette-outline",
  Other: "grid-outline",
  default: "briefcase-outline",
};

const CATEGORY_ACCENT: Record<string, string> = {
  Cleaning: "#0EA5C9",
  Cooking: "#F59E0B",
  Plumber: "#3B82F6",
  Electrician: "#EAB308",
  Babysitting: "#EC4899",
  Laundry: "#8B5CF6",
  Gardening: "#22C55E",
  Driver: "#64748B",
  Carpenter: "#92400E",
  Painter: "#F97316",
  Other: "#6366F1",
  default: "#1A4880",
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Job = {
  _id: string;
  postedBy: { name: string; _id?: string; rating?: number };
  category: string;
  budgetMin: number;
  budgetMax: number;
  isNegotiable: boolean;
  schedule: string;
  startDate?: string;
  endSchedule?: string | null;
  address: string;
  rating: number;
  description: string;
  status: string;
};

type FilterKey = "category" | "pay" | "schedule";
type AppliedApplicationMap = Record<
  string,
  { applicationId: string; workerId?: string }
>;
type DropdownPos = { x: number; y: number; width: number };

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING DROPDOWN — uses Modal so it's NEVER clipped by any parent
// ─────────────────────────────────────────────────────────────────────────────
function FloatingDropdown({
  options,
  value,
  pos,
  onSelect,
  onClose,
}: {
  options: string[];
  value: string;
  pos: DropdownPos;
  onSelect: (opt: string) => void;
  onClose: () => void;
}) {
  // Clamp so dropdown doesn't go off right edge
  const menuWidth = Math.max(pos.width, 160);
  const left = Math.min(pos.x, SCREEN_WIDTH - menuWidth - 12);

  return (
    <Modal transparent animationType="none" visible onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback>
            <View
              style={[
                fdStyles.menu,
                { top: pos.y + 46, left, width: menuWidth },
              ]}
            >
              <ScrollView
                style={{ maxHeight: 280 }}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                bounces={false}
                keyboardShouldPersistTaps="handled"
              >
                {options.map((opt) => {
                  const active = value === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[fdStyles.item, active && fdStyles.itemActive]}
                      onPress={() => {
                        onSelect(opt);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          fdStyles.itemText,
                          active && fdStyles.itemTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                      {active && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={C.navyMid}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const fdStyles = StyleSheet.create({
  menu: {
    position: "absolute",
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 30,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4FA",
  },
  itemActive: { backgroundColor: "#EEF5FF" },
  itemText: { fontSize: 14, color: C.textMid, fontWeight: "500" },
  itemTextActive: { color: C.navyMid, fontWeight: "700" },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function LiveJobsScreen() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isWorker, setIsWorker] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>([]);
  const [appliedApplications, setAppliedApplications] =
    useState<AppliedApplicationMap>({});
  const [applyModal, setApplyModal] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [expectedPay, setExpectedPay] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [popup, setPopup] = useState("");
  const [popupType, setPopupType] = useState<"normal" | "error">("normal");
  const [filters, setFilters] = useState({
    category: "All",
    pay: "All",
    schedule: "Any",
  });
  const [activeDropdown, setActiveDropdown] = useState<FilterKey | null>(null);
  const [dropdownPos, setDropdownPos] = useState<DropdownPos>({
    x: 0,
    y: 0,
    width: 120,
  });
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [referModal, setReferModal] = useState(false);
  const [referJobId, setReferJobId] = useState<string | null>(null);
  const [referName, setReferName] = useState("");
  const [referPhone, setReferPhone] = useState("");
  const [referSkills, setReferSkills] = useState("");
  const [referLoading, setReferLoading] = useState(false);

  // Refs to measure pill positions on screen
  const pillRefs = useRef<Partial<Record<FilterKey, any>>>({});

  useEffect(() => {
    const loadUser = async () => {
      const t = await AsyncStorage.getItem("token");
      const u = await AsyncStorage.getItem("user");
      setToken(t);
      if (u) {
        const parsed = JSON.parse(u);
        setIsWorker(
          parsed.role === "worker" ||
            (Array.isArray(parsed.workerTags) && parsed.workerTags.length > 0),
        );
      }
    };
    loadUser();
  }, []);

  // Reload applied-jobs state every time this tab comes into focus so that
  // a withdrawal done on the Profile tab is immediately reflected here.
  useFocusEffect(
    useCallback(() => {
      const loadApplied = async () => {
        const s1 = await AsyncStorage.getItem("appliedJobs");
        const s2 = await AsyncStorage.getItem("appliedApplications");
        setAppliedJobs(s1 ? JSON.parse(s1) : []);
        setAppliedApplications(s2 ? JSON.parse(s2) : {});
      };
      loadApplied();
    }, []),
  );

  const fetchJobs = useCallback(async () => {
    try {
      const t = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        setJobs([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (res.ok && Array.isArray(data)) {
        setJobs(
          data.map((job) => ({
            ...job,
            budgetMin: job.minBudget,
            budgetMax: job.maxBudget,
            isNegotiable: job.noBudget,
            startDate: job.startDate,
            endTime: job.endTime ?? null,
            schedule: new Date(job.startDate).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            }),
            endSchedule: job.endDate
              ? new Date(job.endDate).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : null,
            postedBy: job.postedBy || { name: "User" },
            rating: job.postedBy?.rating ?? job.rating ?? 0,
          })),
        );
      } else {
        setJobs([]);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter((job) => {
    const s = (job.status || "").trim().toLowerCase();
    if (s === "completed" || s === "cancelled") return false;

    // Auto-hide jobs that ended more than 4 hours ago
    const now = new Date();
    // Hide job if its endTime has passed
    if (job.endTime) {
      const endTime = new Date(job.endTime);
      const baseDate = job.endDate
        ? new Date(job.endDate)
        : job.startDate
        ? new Date(job.startDate)
        : null;
      if (baseDate) {
        const expiry = new Date(
          baseDate.getFullYear(),
          baseDate.getMonth(),
          baseDate.getDate(),
          endTime.getHours(),
          endTime.getMinutes(),
          endTime.getSeconds(),
        );
        if (now > expiry) return false;
      }
    }

    if (filters.category !== "All" && job.category !== filters.category)
      return false;
    if (filters.pay !== "All") {
      const max = job.isNegotiable ? 9999 : (job.budgetMax ?? 0);
      if (filters.pay === "Under ₹100" && max >= 100) return false;
      if (filters.pay === "₹100–₹300" && (max < 100 || max > 300)) return false;
      if (filters.pay === "₹300–₹500" && (max < 300 || max > 500)) return false;
      if (filters.pay === "₹500–₹800" && (max < 500 || max > 800)) return false;
      if (filters.pay === "₹800–₹1200" && (max < 800 || max > 1200))
        return false;
      if (filters.pay === "₹1200–₹2000" && (max < 1200 || max > 2000))
        return false;
      if (filters.pay === "₹2000+" && max < 2000) return false;
    }
    if (filters.schedule !== "Any" && filters.schedule !== "All") {
      const now = new Date();
      const jobStart = job.startDate ? new Date(job.startDate) : null;
      if (!jobStart || isNaN(jobStart.getTime())) return false;
      const diffHrs = (jobStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      const absHrs = Math.abs(diffHrs);
      if (filters.schedule === "Immediate" && absHrs > 0.5) return false;
      if (filters.schedule === "Within 1 hr" && absHrs > 1) return false;
      if (filters.schedule === "Within 2 hrs" && absHrs > 2) return false;
      if (filters.schedule === "Within 5 hrs" && absHrs > 5) return false;
      if (filters.schedule === "Today" && absHrs > 24) return false;
      if (filters.schedule === "Tomorrow" && (diffHrs < 24 || diffHrs > 48))
        return false;
      if (filters.schedule === "Within 3 Days" && absHrs > 72) return false;
      if (filters.schedule === "Next Week" && absHrs > 168) return false;
    }
    return true;
  });

  const handleOpenChat = async (jobId: string) => {
    try {
      const t = await AsyncStorage.getItem("token");
      const u = await AsyncStorage.getItem("user");
      if (!t || !u) {
        Alert.alert("Error", "Please login again");
        return;
      }
      const parsedUser = JSON.parse(u);
      const workerId = parsedUser?._id || parsedUser?.id;
      const savedApp = appliedApplications[jobId];
      if (!workerId || !savedApp?.applicationId) {
        Alert.alert("Error", "Application details not found yet");
        return;
      }
      const res = await fetch(`${BASE_URL}/chat/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          workerId,
          applicationId: savedApp.applicationId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.chat?._id) {
        router.push(`/job-chat?chatId=${data.chat._id}` as any);
      } else {
        Alert.alert("Error", data.message || "Could not open chat");
      }
    } catch {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const closeReferModal = () => {
    setReferModal(false);
    setReferJobId(null);
    setReferName("");
    setReferPhone("");
    setReferSkills("");
  };

  const handleReferSubmit = async () => {
    if (!referName.trim()) {
      setPopup("Please enter the worker's name");
      setPopupType("error");
      return;
    }
    if (!/^\d{10}$/.test(referPhone.trim())) {
      setPopup("Phone number must be exactly 10 digits");
      setPopupType("error");
      return;
    }
    if (!referSkills.trim()) {
      setPopup("Please describe the worker's skills");
      setPopupType("error");
      return;
    }
    if (!referJobId) {
      setPopup("No job selected");
      setPopupType("error");
      return;
    }
    const freshToken = await AsyncStorage.getItem("token");
    if (!freshToken) {
      setPopup("Session expired. Please login again.");
      setPopupType("error");
      return;
    }
    setReferLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/referral/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${freshToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workerName: referName.trim(),
          workerPhone: referPhone.trim(),
          message: referSkills.trim(),
          jobId: referJobId,
        }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {}
      if (!res.ok) {
        setPopup(data.message || `Server error: ${res.status}`);
        setPopupType("error");
        return;
      }
      setPopup("Worker added to your referrals");
      setPopupType("normal");
      closeReferModal();
    } catch (error) {
      setPopup(`Network error: ${String(error)}`);
      setPopupType("error");
    } finally {
      setReferLoading(false);
    }
  };

  // Measure pill position then open dropdown as floating Modal
  const openDropdown = (key: FilterKey) => {
    const ref = pillRefs.current[key];
    if (!ref) return;
    ref.measureInWindow((x: number, y: number, width: number) => {
      setDropdownPos({ x, y, width });
      setActiveDropdown(key);
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Filter Pill
  // ─────────────────────────────────────────────────────────────────────────
  const renderFilterPill = (
    label: string,
    key: FilterKey,
    options: string[],
    value: string,
  ) => {
    const isOpen = activeDropdown === key;
    const isActive = value !== "All" && value !== "Any";
    return (
      <TouchableOpacity
        key={key}
        ref={(r) => {
          pillRefs.current[key] = r;
        }}
        style={[
          styles.filterPill,
          isOpen && styles.filterPillOpen,
          isActive && !isOpen && styles.filterPillSelected,
        ]}
        onPress={() => (isOpen ? setActiveDropdown(null) : openDropdown(key))}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.filterPillText,
            (isOpen || isActive) && styles.filterPillTextActive,
          ]}
          numberOfLines={1}
        >
          {isActive ? value : label}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={11}
          color={isOpen || isActive ? C.white : "rgba(255,255,255,0.7)"}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Job Card
  // ─────────────────────────────────────────────────────────────────────────
  const renderJobCard = ({ item: job }: { item: Job }) => {
    const isExpanded = expandedJobId === job._id;
    const isApplied = appliedJobs.includes(job._id);
    const iconName =
      (CATEGORY_ICONS[job.category] as any) || CATEGORY_ICONS.default;
    const accent = CATEGORY_ACCENT[job.category] || CATEGORY_ACCENT.default;
    const budgetText = job.isNegotiable
      ? "Negotiable"
      : `₹${job.budgetMin} – ₹${job.budgetMax}`;

    return (
      <View style={styles.card}>
        {/* Gradient accent strip across top */}
        <LinearGradient
          colors={[accent, accent + "AA"]}
          style={styles.cardTopStrip}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />

        <View style={styles.cardInner}>
          {/* TOP ROW */}
          <View style={styles.cardTopRow}>
            <LinearGradient
              colors={[accent + "30", accent + "15"]}
              style={styles.iconBadge}
            >
              <Ionicons name={iconName} size={22} color={accent} />
            </LinearGradient>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.posterName}>{job.postedBy?.name}</Text>
              <View
                style={[
                  styles.categoryTag,
                  {
                    borderColor: accent + "55",
                    backgroundColor: accent + "15",
                  },
                ]}
              >
                <Text style={[styles.categoryTagText, { color: accent }]}>
                  {job.category}
                </Text>
              </View>
            </View>

            <LinearGradient
              colors={[C.gradMid, C.gradBot]}
              style={styles.budgetBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.budgetBadgeText}>{budgetText}</Text>
            </LinearGradient>
          </View>

          <View style={styles.innerDivider} />

          {/* INFO CHIPS */}
          <View style={styles.infoRow}>
            <View style={styles.infoChip}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={C.accentTeal}
              />
              <Text style={styles.infoChipText}>{job.schedule}</Text>
            </View>
            <View style={styles.infoChip}>
              <Ionicons
                name="location-outline"
                size={13}
                color={C.accentGold}
              />
              <Text style={styles.infoChipText} numberOfLines={1}>
                {job.address}
              </Text>
            </View>
          </View>

          {job.endSchedule && (
            <View
              style={[
                styles.infoChip,
                { marginTop: 8, alignSelf: "flex-start" },
              ]}
            >
              <Ionicons name="flag-outline" size={13} color={C.textMuted} />
              <Text style={styles.infoChipText}>Ends: {job.endSchedule}</Text>
            </View>
          )}

          {/* EXPANDED SECTION */}
          {isExpanded && (
            <View style={styles.expandedBlock}>
              <View style={styles.innerDivider} />
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Poster Rating</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={
                        job.rating >= star
                          ? "star"
                          : job.rating >= star - 0.5
                            ? "star-half"
                            : "star-outline"
                      }
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                  <Text style={styles.ratingScore}> {job.rating}/5</Text>
                </View>
              </View>
              <Text style={styles.descText}>{job.description}</Text>
            </View>
          )}

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            {isWorker && (
              <TouchableOpacity
                style={styles.actionBtnWrap}
                onPress={async () => {
                  if (isApplied) {
                    setPopup(
                      "Already applied. To withdraw, go to Profile → My Applications. After withdrawing, you can apply again.",
                    );
                    setPopupType("normal");
                    return;
                  }
                  setApplyJobId(job._id);
                  setApplyModal(true);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    isApplied
                      ? ["#059669", "#047857"]
                      : [C.navyMid, C.navyLight]
                  }
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons
                    name={
                      isApplied ? "checkmark-circle-outline" : "send-outline"
                    }
                    size={13}
                    color={C.white}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.actionBtnText}>
                    {isApplied ? "Applied" : "Apply"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isWorker && isApplied && (
              <TouchableOpacity
                style={styles.actionBtnWrap}
                onPress={() => handleOpenChat(job._id)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#0891B2", "#0EA5C9"]}
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={13}
                    color={C.white}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.actionBtnText}>Chat</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionBtnWrap}
              onPress={() => {
                setReferJobId(job._id);
                setReferModal(true);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#D97706", "#F59E0B"]}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name="person-add-outline"
                  size={13}
                  color={C.white}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.actionBtnText}>Refer</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtnWrap}
              onPress={() => setExpandedJobId(isExpanded ? null : job._id)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isExpanded ? [C.navy, C.navyMid] : [C.navyLight, "#3B6BC9"]
                }
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name={isExpanded ? "chevron-up-outline" : "eye-outline"}
                  size={13}
                  color={C.white}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.actionBtnText}>
                  {isExpanded ? "Less" : "View"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.gradTop }} edges={[]}>
        <LinearGradient
          colors={[C.gradTop, C.gradMid, C.gradBot]}
          style={styles.loadingGrad}
        >
          <ActivityIndicator size="large" color={C.white} />
          <Text style={styles.loadingText}>Loading live jobs…</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.gradTop }} edges={[]}>
      <StatusBar barStyle="light-content" backgroundColor={C.gradTop} />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={[C.gradTop, C.gradMid, C.gradBot]}
        style={styles.headerGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles for depth */}
        <View style={styles.decCircle1} />
        <View style={styles.decCircle2} />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Live Jobs</Text>
            <Text style={styles.headerSub}>
              {filteredJobs.length} opportunities near you
            </Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => {
              setLoading(true);
              fetchJobs();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color={C.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterBar}>
          {renderFilterPill(
            "Category",
            "category",
            CATEGORIES,
            filters.category,
          )}
          {renderFilterPill("Pay", "pay", PAY_RANGES, filters.pay)}
          {renderFilterPill(
            "Schedule",
            "schedule",
            SCHEDULES,
            filters.schedule,
          )}
        </View>
      </LinearGradient>

      {/* ── SHEET — round top curves over the gradient ── */}
      <View style={styles.sheet}>
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item._id}
          renderItem={renderJobCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchJobs();
              }}
              colors={[C.navyMid]}
              tintColor={C.navyMid}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={[C.tagBg, "#DDE8FA"]}
                style={styles.emptyIconWrap}
              >
                <Ionicons name="search-outline" size={36} color={C.navyMid} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>No jobs found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your filters
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setFilters({ category: "All", pay: "All", schedule: "Any" })
                }
              >
                <LinearGradient
                  colors={[C.navyMid, C.navyLight]}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearBtnText}>Clear Filters</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      </View>

      {/* ── FLOATING DROPDOWN — Modal-based, never clipped ── */}
      {activeDropdown && (
        <FloatingDropdown
          options={
            activeDropdown === "category"
              ? CATEGORIES
              : activeDropdown === "pay"
                ? PAY_RANGES
                : SCHEDULES
          }
          value={filters[activeDropdown]}
          pos={dropdownPos}
          onSelect={(opt) =>
            setFilters((prev) => ({ ...prev, [activeDropdown!]: opt }))
          }
          onClose={() => setActiveDropdown(null)}
        />
      )}

      {/* ── REFER MODAL ── */}
      <Modal
        visible={referModal}
        animationType="slide"
        transparent
        onRequestClose={closeReferModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={[C.gradTop, C.gradMid, C.gradBot]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modalHeaderText}>Refer a Worker</Text>
              <TouchableOpacity
                onPress={closeReferModal}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={C.white} />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Worker's Name</Text>
              <View style={styles.modalInputWrap}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={C.accentTeal}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter name"
                  value={referName}
                  onChangeText={setReferName}
                  placeholderTextColor={C.textMuted}
                />
              </View>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.modalInputWrap}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={C.accentTeal}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="10-digit number"
                  keyboardType="numeric"
                  maxLength={10}
                  value={referPhone}
                  onChangeText={setReferPhone}
                  placeholderTextColor={C.textMuted}
                />
              </View>
              <Text style={styles.inputLabel}>Skills & Description</Text>
              <View
                style={[
                  styles.modalInputWrap,
                  { alignItems: "flex-start", paddingTop: 12 },
                ]}
              >
                <Ionicons
                  name="construct-outline"
                  size={16}
                  color={C.accentTeal}
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <TextInput
                  style={[
                    styles.modalInput,
                    { minHeight: 80, textAlignVertical: "top" },
                  ]}
                  placeholder="Describe skills and experience"
                  multiline
                  value={referSkills}
                  onChangeText={setReferSkills}
                  placeholderTextColor={C.textMuted}
                />
              </View>
              <TouchableOpacity
                style={{ marginTop: 24 }}
                onPress={handleReferSubmit}
                disabled={referLoading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[C.gradMid, C.gradBot]}
                  style={[styles.submitBtn, referLoading && { opacity: 0.7 }]}
                >
                  {referLoading ? (
                    <ActivityIndicator color={C.white} />
                  ) : (
                    <>
                      <Ionicons
                        name="paper-plane-outline"
                        size={16}
                        color={C.white}
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.submitBtnText}>Submit Referral</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── APPLY MODAL ── */}
      <Modal
        visible={applyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setApplyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={[C.gradTop, C.gradMid, C.gradBot]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.modalHeaderText}>Apply for Job</Text>
              <TouchableOpacity
                onPress={() => setApplyModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={C.white} />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>Expected Pay (₹)</Text>
              <View style={styles.modalInputWrap}>
                <Ionicons
                  name="cash-outline"
                  size={16}
                  color={C.accentTeal}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter expected pay"
                  value={expectedPay}
                  onChangeText={setExpectedPay}
                  keyboardType="numeric"
                  placeholderTextColor={C.textMuted}
                />
              </View>
              <Text style={styles.inputLabel}>Preferred Time</Text>
              <View style={styles.modalInputWrap}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={C.accentTeal}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Morning, 9 AM"
                  value={preferredTime}
                  maxLength={50}
                  onChangeText={setPreferredTime}
                  placeholderTextColor={C.textMuted}
                />
              </View>
              <Text style={styles.inputLabel}>Remarks (optional)</Text>
              <View
                style={[
                  styles.modalInputWrap,
                  { alignItems: "flex-start", paddingTop: 12 },
                ]}
              >
                <Ionicons
                  name="chatbox-outline"
                  size={16}
                  color={C.accentTeal}
                  style={{ marginRight: 8, marginTop: 2 }}
                />
                <TextInput
                  style={[
                    styles.modalInput,
                    { minHeight: 70, textAlignVertical: "top" },
                  ]}
                  placeholder="Any additional notes"
                  value={remarks}
                  maxLength={100}
                  multiline
                  onChangeText={setRemarks}
                  placeholderTextColor={C.textMuted}
                />
              </View>
              <TouchableOpacity
                style={{ marginTop: 24 }}
                activeOpacity={0.85}
                onPress={async () => {
                  if (!applyJobId) return;
                  if (!expectedPay.trim()) {
                    setPopup("Expected pay is required");
                    setPopupType("error");
                    return;
                  }
                  if (!preferredTime.trim()) {
                    setPopup("Preferred time is required");
                    setPopupType("error");
                    return;
                  }
                  // Defensive guard — if somehow modal opened for an already-applied job
                  if (appliedJobs.includes(applyJobId)) {
                    setApplyModal(false);
                    setPopup(
                      "Already applied. Withdraw from Profile → My Applications first.",
                    );
                    setPopupType("normal");
                    return;
                  }
                  try {
                    const res = await fetch(`${BASE_URL}/applications/apply`, {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        jobId: applyJobId,
                        expectedPay: Number(expectedPay),
                        preferredTime,
                        remarks,
                      }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      const updated = [...appliedJobs, applyJobId];
                      setAppliedJobs(updated);
                      await AsyncStorage.setItem(
                        "appliedJobs",
                        JSON.stringify(updated),
                      );
                      const applicationId =
                        data?.application?._id ||
                        data?._id ||
                        data?.applicationId ||
                        "";
                      const updatedApps = {
                        ...appliedApplications,
                        [applyJobId]: {
                          applicationId,
                          workerId: data?.application?.workerId || undefined,
                        },
                      };
                      setAppliedApplications(updatedApps);
                      await AsyncStorage.setItem(
                        "appliedApplications",
                        JSON.stringify(updatedApps),
                      );
                      setApplyModal(false);
                      setExpectedPay("");
                      setPreferredTime("");
                      setRemarks("");
                      setPopup("Application submitted successfully");
                      setPopupType("normal");
                    } else {
                      setPopup(data.message || "Failed to apply");
                      setPopupType("error");
                    }
                  } catch {
                    setPopup("Something went wrong");
                    setPopupType("error");
                  }
                }}
              >
                <LinearGradient
                  colors={[C.gradMid, C.gradBot]}
                  style={styles.submitBtn}
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={16}
                    color={C.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.submitBtnText}>Submit Application</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Popup
        message={popup}
        type={popupType}
        onClose={() => {
          setPopup("");
          setPopupType("normal");
        }}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  loadingGrad: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    color: C.white,
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.85,
  },

  // Header — no overflow clipping, gradient behind everything
  headerGrad: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 52, // tall enough so sheet overlap doesn't hide pills
  },

  // Decorative background circles inside gradient
  decCircle1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.045)",
    top: -70,
    right: -70,
  },
  decCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.055)",
    bottom: 30,
    left: -50,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: C.white,
    letterSpacing: 0.3,
  },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 3 },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.glassBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.glassBorder,
  },

  // Filter pills — flat row, no overflow issues
  filterBar: { flexDirection: "row", gap: 8 },
  filterPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.glassBorder,
    borderRadius: 24,
    paddingVertical: 9,
    paddingHorizontal: 10,
    backgroundColor: C.glassBg,
  },
  filterPillOpen: {
    backgroundColor: "rgba(255,255,255,0.28)",
    borderColor: C.white,
  },
  filterPillSelected: {
    backgroundColor: C.accentGold,
    borderColor: C.accentGold,
  },
  filterPillText: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    flexShrink: 1,
  },
  filterPillTextActive: { color: C.white },

  // Sheet with fully rounded top corners overlapping gradient
  sheet: {
    flex: 1,
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -36, // pulls up exactly by border radius to seal gap
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 14,
  },
  listContent: { padding: 16, paddingTop: 26, paddingBottom: 50 },

  // Card — fully rounded with gradient top strip
  card: {
    backgroundColor: C.cardBg,
    borderRadius: 26,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: C.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTopStrip: { height: 4 },
  cardInner: { padding: 16 },
  cardTopRow: { flexDirection: "row", alignItems: "center" },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  posterName: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 5,
  },
  categoryTag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryTagText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  budgetBadge: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  budgetBadgeText: { color: C.white, fontSize: 11.5, fontWeight: "700" },

  innerDivider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  infoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: C.border,
    gap: 5,
    flexShrink: 1,
  },
  infoChipText: {
    fontSize: 12,
    color: C.textMid,
    fontWeight: "500",
    flexShrink: 1,
  },

  expandedBlock: { marginTop: 0 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textDark,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ratingScore: { fontSize: 12, color: C.textMuted, marginLeft: 4 },
  descText: { fontSize: 13, color: C.textMuted, lineHeight: 21 },

  // Action buttons with gradient — overflow:hidden on wrapper for rounded clip
  actionRow: { flexDirection: "row", marginTop: 14, gap: 8, flexWrap: "wrap" },
  actionBtnWrap: { borderRadius: 14, overflow: "hidden" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  actionBtnText: { color: C.white, fontSize: 12, fontWeight: "700" },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    marginBottom: 22,
  },
  clearBtn: { borderRadius: 16, paddingHorizontal: 28, paddingVertical: 12 },
  clearBtnText: { color: C.white, fontWeight: "700", fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10,20,40,0.65)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    maxHeight: "88%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  modalHeaderText: { color: C.white, fontSize: 18, fontWeight: "700" },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: { padding: 20 },
  inputLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: C.navyMid,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 7,
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  modalInput: { flex: 1, fontSize: 14, color: C.textDark, paddingVertical: 10 },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 16,
  },
  submitBtnText: { color: C.white, fontSize: 15, fontWeight: "700" },
});
