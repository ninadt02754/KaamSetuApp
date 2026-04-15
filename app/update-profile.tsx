// // update-profile.tsx — with worker tags from register
// import { Ionicons } from "@expo/vector-icons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as ImagePicker from "expo-image-picker";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { Base_Url , API_BASE} from "../constants/Config";
// import {
//   Alert,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { KColors as Colors, Radius } from "../constants/kaamsetuTheme";

// const BASE_URL = Base_Url;

// const SUGGESTIONS = [
//   "Electrician",
//   "Plumber",
//   "Driver",
//   "Carpenter",
//   "Painter",
//   "Cook",
//   "Cleaner",
//   "Mason",
// ];

// // ─── Avatar ──────────────────────────────────────────────────────────────────
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
//       <Text style={[styles.avatarText, { fontSize: size * 0.35 }]}>
//         {initials}
//       </Text>
//     </View>
//   );
// }

// // ─── Simple text input row ────────────────────────────────────────────────────
// function InputField({
//   label,
//   value,
//   onChangeText,
//   placeholder,
//   multiline = false,
//   keyboardType = "default",
// }: {
//   label: string;
//   value: string;
//   onChangeText: (t: string) => void;
//   placeholder?: string;
//   multiline?: boolean;
//   keyboardType?: any;
// }) {
//   return (
//     <View style={styles.inputGroup}>
//       <Text style={styles.inputLabel}>{label}</Text>
//       <TextInput
//         style={[
//           styles.input,
//           multiline && { height: 80, textAlignVertical: "top" },
//         ]}
//         value={value}
//         onChangeText={onChangeText}
//         placeholder={placeholder}
//         placeholderTextColor={Colors.textMuted}
//         multiline={multiline}
//         keyboardType={keyboardType}
//       />
//     </View>
//   );
// }

// // ─── Main screen ─────────────────────────────────────────────────────────────
// export default function UpdateProfileScreen() {
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [address, setAddress] = useState("");
//   const [image, setImage] = useState<string | null>(null);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [isWorker, setIsWorker] = useState(false);

//   // Tag state
//   const [selectedTags, setSelectedTags] = useState<string[]>([]);
//   const [tagInput, setTagInput] = useState("");

//   // ── Load user from AsyncStorage ──────────────────────────────────────────
//   useEffect(() => {
//     const loadUser = async () => {
//       const storedUser = await AsyncStorage.getItem("user");
//       if (storedUser) {
//         const parsed = JSON.parse(storedUser);
//         setName(parsed.name || "");
//         setAddress(parsed.address || "");
//         setProfileImage(parsed.profileImage || null);
//         setIsWorker(parsed.role === "worker");

//         // skills stored as comma-separated string OR array
//         if (parsed.skills) {
//           if (Array.isArray(parsed.skills)) {
//             setSelectedTags(parsed.skills);
//           } else if (
//             typeof parsed.skills === "string" &&
//             parsed.skills.trim()
//           ) {
//             setSelectedTags(
//               parsed.skills
//                 .split(",")
//                 .map((s: string) => s.trim())
//                 .filter(Boolean),
//             );
//           }
//         }
//       }
//     };
//     loadUser();
//   }, []);

//   // ── Tag helpers ──────────────────────────────────────────────────────────
//   const addTag = (tag: string) => {
//     const trimmed = tag.trim();
//     if (trimmed && !selectedTags.includes(trimmed)) {
//       setSelectedTags([...selectedTags, trimmed]);
//     }
//     setTagInput("");
//   };

//   const removeTag = (tag: string) => {
//     setSelectedTags(selectedTags.filter((t) => t !== tag));
//   };

//   // ── Photo picker ─────────────────────────────────────────────────────────
//   const pickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       quality: 0.7,
//     });
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
//   };

//   // ── Save ─────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     try {
//       const storedUser = await AsyncStorage.getItem("user");
//       const parsedUser = JSON.parse(storedUser!);

//       const formData = new FormData();
//       formData.append("id", parsedUser._id);
//       formData.append("name", name);
//       formData.append("address", address);
//       // Send as comma-separated string (matches register behaviour)
//       formData.append("skills", selectedTags.join(","));

//       if (image) {
//         const filename = image.split("/").pop() || "photo.jpg";
//         formData.append("profileImage", {
//           uri: image,
//           name: filename,
//           type: "image/jpeg",
//         } as any);
//       }

//       const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
//         method: "PUT",
//         body: formData,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         Alert.alert("Error", data.message);
//         return;
//       }

//       await AsyncStorage.setItem("user", JSON.stringify(data.user));
//       Alert.alert("Success", "Profile updated!", [
//         { text: "OK", onPress: () => router.back() },
//       ]);
//     } catch (err) {
//       console.log(err);
//       Alert.alert("Error", "Server error");
//     }
//   };

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()}>
//           <Text style={styles.backText}>‹</Text>
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Update Profile</Text>
//         <View style={{ width: 36 }} />
//       </View>

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Avatar */}
//           <View style={styles.avatarSection}>
//             {image ? (
//               <Image
//                 source={{ uri: image }}
//                 style={{ width: 90, height: 90, borderRadius: 45 }}
//               />
//             ) : profileImage ? (
//               <Image
//                 source={{ uri: profileImage }}
//                 style={{ width: 90, height: 90, borderRadius: 45 }}
//               />
//             ) : (
//               <Avatar name={name || "?"} size={90} />
//             )}

//             <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
//               <Text style={styles.changePhotoText}>Change Photo</Text>
//             </TouchableOpacity>
//           </View>

//           {/* Basic fields */}
//           <View style={styles.formCard}>
//             <InputField label="Full Name" value={name} onChangeText={setName} />
//             <InputField
//               label="Address"
//               value={address}
//               onChangeText={setAddress}
//               placeholder="Your city / locality"
//             />
//           </View>

//           {/* Worker Tags — only shown for workers */}
//           {isWorker && (
//             <View style={styles.formCard}>
//               <Text style={styles.sectionTitle}>Worker Tags</Text>

//               {/* Suggestion chips */}
//               <View style={styles.tagContainer}>
//                 {SUGGESTIONS.map((item) => (
//                   <TouchableOpacity
//                     key={item}
//                     style={[
//                       styles.suggestionChip,
//                       selectedTags.includes(item) && styles.chipSelected,
//                     ]}
//                     onPress={() =>
//                       selectedTags.includes(item)
//                         ? removeTag(item)
//                         : addTag(item)
//                     }
//                   >
//                     <Text
//                       style={[
//                         styles.chipText,
//                         selectedTags.includes(item) && styles.chipTextSelected,
//                       ]}
//                     >
//                       {item}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* Selected tags (custom + suggestions) */}
//               {selectedTags.length > 0 && (
//                 <>
//                   <Text style={[styles.inputLabel, { marginTop: 12 }]}>
//                     Selected
//                   </Text>
//                   <View style={styles.tagContainer}>
//                     {selectedTags.map((tag) => (
//                       <View key={tag} style={styles.selectedTag}>
//                         <Text style={styles.selectedTagText}>{tag}</Text>
//                         <TouchableOpacity onPress={() => removeTag(tag)}>
//                           <Ionicons
//                             name="close-circle"
//                             size={16}
//                             color="#fff"
//                             style={{ marginLeft: 4 }}
//                           />
//                         </TouchableOpacity>
//                       </View>
//                     ))}
//                   </View>
//                 </>
//               )}

//               {/* Custom skill input */}
//               <Text style={[styles.inputLabel, { marginTop: 12 }]}>
//                 Add Custom Skill
//               </Text>
//               <View style={styles.customTagRow}>
//                 <Ionicons
//                   name="pricetag-outline"
//                   size={18}
//                   color={Colors.textMuted}
//                 />
//                 <TextInput
//                   placeholder="Type a skill and press +"
//                   placeholderTextColor={Colors.textMuted}
//                   style={styles.customTagInput}
//                   value={tagInput}
//                   onChangeText={setTagInput}
//                   onSubmitEditing={() => addTag(tagInput)}
//                   returnKeyType="done"
//                 />
//                 <TouchableOpacity
//                   style={styles.addTagBtn}
//                   onPress={() => addTag(tagInput)}
//                   disabled={!tagInput.trim()}
//                 >
//                   <Ionicons
//                     name="add"
//                     size={20}
//                     color={tagInput.trim() ? Colors.primary : Colors.textMuted}
//                   />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {/* Save */}
//           <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
//             <Text style={styles.saveBtnText}>Save Changes</Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// // ─── Styles ──────────────────────────────────────────────────────────────────
// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: Colors.background },

//   header: {
//     backgroundColor: Colors.primary,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 15,
//   },

//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   backText: { color: "#fff", fontSize: 24 },

//   scrollContent: { padding: 20, gap: 16 },

//   avatarSection: { alignItems: "center", marginBottom: 4 },

//   avatar: {
//     backgroundColor: Colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   avatarText: { color: "#fff", fontWeight: "bold" },

//   changePhotoBtn: {
//     backgroundColor: Colors.primaryPale,
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: Radius.full,
//     marginTop: 10,
//   },
//   changePhotoText: { color: Colors.primary, fontWeight: "600" },

//   formCard: {
//     backgroundColor: "#fff",
//     padding: 15,
//     borderRadius: 12,
//     gap: 10,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 2,
//   },

//   sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },

//   inputGroup: { gap: 4 },
//   inputLabel: { fontWeight: "600", fontSize: 13, color: "#444" },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     borderRadius: 8,
//     fontSize: 14,
//   },

//   // ── Tag styles ────────────────────────────────────────────────────────────
//   tagContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//     marginTop: 4,
//   },

//   suggestionChip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     borderColor: Colors.primary,
//     backgroundColor: "#fff",
//   },
//   chipSelected: {
//     backgroundColor: Colors.primary,
//   },
//   chipText: {
//     fontSize: 13,
//     color: Colors.primary,
//     fontWeight: "500",
//   },
//   chipTextSelected: {
//     color: "#fff",
//   },

//   selectedTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//   },
//   selectedTagText: { color: "#fff", fontSize: 13, fontWeight: "500" },

//   customTagRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f1f1f1",
//     padding: 10,
//     borderRadius: 10,
//     gap: 8,
//   },
//   customTagInput: { flex: 1, fontSize: 14 },
//   addTagBtn: { padding: 2 },

//   // ── Save button ───────────────────────────────────────────────────────────
//   saveBtn: {
//     backgroundColor: Colors.primary,
//     padding: 15,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 4,
//   },
//   saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
// });
// update-profile.tsx — Premium Redesign
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Base_Url } from "../constants/Config";
import { Radius } from "../constants/kaamsetuTheme";

const BASE_URL = Base_Url;
const { width } = Dimensions.get("window");

// ── Premium Color Tokens ──────────────────────────────────────────────────────
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
  inputFocus: "#4A90D9",
  labelColor: "#3A5A82",
  textDark: "#0F2040",
  textMuted: "#7A95B5",
  chipBorder: "#4A90D9",
  chipSelectedBg: "#1A4880",
  tagBg: "#1A4880",
  saveBtnTop: "#1A5799",
  saveBtnBottom: "#0F2D55",
  white: "#FFFFFF",
  divider: "#E2ECF8",
  avatarRing: "#FFFFFF",
  avatarInner: "#1E5799",
  badgeBg: "#4A90D9",
};

const SUGGESTIONS = [
  "Electrician",
  "Plumber",
  "Driver",
  "Carpenter",
  "Painter",
  "Cook",
  "Cleaner",
  "Mason",
];

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ name, size = 88 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <LinearGradient
      colors={[P.accentBlue, P.gradientTop]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>
        {initials}
      </Text>
    </LinearGradient>
  );
}

// ─── Floating Label Input ─────────────────────────────────────────────────────
function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  icon?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputWrapperFocused,
          multiline && { height: 90, alignItems: "flex-start" },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={17}
            color={focused ? P.accentBlue : P.textMuted}
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            multiline && {
              height: 75,
              textAlignVertical: "top",
              paddingTop: 4,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={P.textMuted}
          multiline={multiline}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={true}
          selectTextOnFocus={false}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </View>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon as any} size={14} color={P.white} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function UpdateProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isWorker, setIsWorker] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setName(parsed.name || "");
        setAddress(parsed.address || "");
        setProfileImage(parsed.profileImage || null);
        setIsWorker(parsed.role === "worker");
        if (parsed.skills) {
          if (Array.isArray(parsed.skills)) {
            setSelectedTags(parsed.skills);
          } else if (
            typeof parsed.skills === "string" &&
            parsed.skills.trim()
          ) {
            setSelectedTags(
              parsed.skills
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean),
            );
          }
        }
      }
    };
    loadUser();
  }, []);

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const parsedUser = JSON.parse(storedUser!);
      const formData = new FormData();
      formData.append("id", parsedUser._id);
      formData.append("name", name);
      formData.append("address", address);
      formData.append("skills", selectedTags.join(","));
      if (image) {
        const filename = image.split("/").pop() || "photo.jpg";
        formData.append("profileImage", {
          uri: image,
          name: filename,
          type: "image/jpeg",
        } as any);
      }
      const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data.message);
        return;
      }
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Server error");
    }
  };

  // ── Bug 8: Password update state ─────────────────────────────────────────
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [oldPassword, setOldPassword]         = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading]           = useState(false);
  const [showOld, setShowOld]                 = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);

  // Bug 9: Strong password validator
  const strongPwd = (p: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/.test(p);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (!strongPwd(newPassword)) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 8 characters with uppercase, lowercase, number and special character (@$!%*?&#)."
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }
    setPwdLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/auth/update-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Success", "Password updated successfully!");
        setPwdModalVisible(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        Alert.alert("Error", data.message || "Failed to update password.");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setPwdLoading(false);
    }
  };

  // ─── Avatar URI ────────────────────────────────────────────────────────────
  const avatarUri = image || (profileImage ? `${BASE_URL}${profileImage}` : null);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={P.gradientTop} />

      {/* ── Gradient Header Zone ──────────────────────────────────────────── */}
      <LinearGradient
        colors={[P.gradientTop, P.gradientMid, P.gradientBottom]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {/* Decorative circles */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        {/* Top bar */}
        <SafeAreaView>
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={20} color={P.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 38 }} />
          </View>
        </SafeAreaView>

        {/* Avatar section inside gradient */}
        <View style={styles.avatarArea}>
          <View style={styles.avatarRingOuter}>
            <View style={styles.avatarRingInner}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={{ width: 88, height: 88, borderRadius: 44 }}
                />
              ) : (
                <Avatar name={name || "?"} size={88} />
              )}
            </View>
            {/* Camera badge */}
            <TouchableOpacity style={styles.cameraBadge} onPress={pickImage}>
              <Ionicons name="camera" size={14} color={P.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.avatarName}>{name || "Your Name"}</Text>
          <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
            <Ionicons
              name="image-outline"
              size={13}
              color={P.white}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Curved bottom edge */}
        <View style={styles.curveSpacer} />
      </LinearGradient>

      {/* White curve overlap */}
      <View style={styles.curveSheet} pointerEvents="none" />

      {/* ── Scrollable Content ────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.kvFlex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          style={styles.scrollStyle}
          nestedScrollEnabled={true}
        >
          {/* ── Update Password Button (Bug 8) ──────────────────────── */}
          <TouchableOpacity
            onPress={() => setPwdModalVisible(true)}
            activeOpacity={0.85}
            style={styles.saveBtnWrapper}
          >
            <LinearGradient
              colors={["#1E3A5F", "#1A4880", "#1E5799"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={P.white}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveBtnText}>Update Password</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* ── Personal Info Card ──────────────────────────────────────── */}
          <View style={styles.card}>
            <SectionHeader title="Personal Information" icon="person-outline" />
            <View style={styles.divider} />
            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              icon="person-outline"
            />
            <InputField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Your city / locality"
              icon="location-outline"
            />
          </View>

          {/* ── Worker Skills Card ──────────────────────────────────────── */}
          {isWorker && (
            <View style={styles.card}>
              <SectionHeader
                title="Skills & Expertise"
                icon="construct-outline"
              />
              <View style={styles.divider} />

              <Text style={styles.subLabel}>Quick Select</Text>
              <View style={styles.tagContainer}>
                {SUGGESTIONS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.suggestionChip,
                      selectedTags.includes(item) && styles.chipSelected,
                    ]}
                    onPress={() =>
                      selectedTags.includes(item)
                        ? removeTag(item)
                        : addTag(item)
                    }
                  >
                    {selectedTags.includes(item) && (
                      <Ionicons
                        name="checkmark"
                        size={11}
                        color={P.white}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={[
                        styles.chipText,
                        selectedTags.includes(item) && styles.chipTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedTags.length > 0 && (
                <>
                  <Text style={[styles.subLabel, { marginTop: 14 }]}>
                    Selected ({selectedTags.length})
                  </Text>
                  <View style={styles.tagContainer}>
                    {selectedTags.map((tag) => (
                      <View key={tag} style={styles.selectedTag}>
                        <Text style={styles.selectedTagText}>{tag}</Text>
                        <TouchableOpacity
                          onPress={() => removeTag(tag)}
                          style={styles.removeTagBtn}
                        >
                          <Ionicons name="close" size={12} color={P.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </>
              )}

              <Text style={[styles.subLabel, { marginTop: 14 }]}>
                Add Custom Skill
              </Text>
              <View style={styles.customTagRow}>
                <Ionicons
                  name="pricetag-outline"
                  size={16}
                  color={P.textMuted}
                />
                <TextInput
                  placeholder="Type a skill and press +"
                  placeholderTextColor={P.textMuted}
                  style={styles.customTagInput}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={() => addTag(tagInput)}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.addTagBtn,
                    tagInput.trim() && styles.addTagBtnActive,
                  ]}
                  onPress={() => addTag(tagInput)}
                  disabled={!tagInput.trim()}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={tagInput.trim() ? P.white : P.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── Save Button ─────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            style={styles.saveBtnWrapper}
          >
            <LinearGradient
              colors={[P.accentGlow, P.gradientMid, P.gradientTop]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={P.white}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Update Password Modal (Bug 8 & 9) ─────────────────────────── */}
      <Modal
        visible={pwdModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPwdModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 20, overflow: "hidden" }}>
            <LinearGradient
              colors={[P.gradientTop, P.gradientMid]}
              style={{ padding: 20, alignItems: "center" }}
            >
              <Ionicons name="lock-closed-outline" size={28} color={P.white} />
              <Text style={{ color: P.white, fontSize: 18, fontWeight: "700", marginTop: 8 }}>
                Update Password
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4, textAlign: "center" }}>
                Min 8 chars • Uppercase • Lowercase • Number • Special char
              </Text>
            </LinearGradient>

            <View style={{ padding: 20 }}>
              {/* Old Password */}
              <Text style={{ color: P.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>Current Password</Text>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F0F5FF", borderRadius: 10, paddingHorizontal: 12, marginBottom: 14, borderWidth: 1, borderColor: "#D5E3F7" }}>
                <Ionicons name="lock-closed-outline" size={16} color={P.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, height: 44, color: "#111" }}
                  placeholder="Enter current password"
                  placeholderTextColor={P.textMuted}
                  secureTextEntry={!showOld}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                  <Ionicons name={showOld ? "eye-off-outline" : "eye-outline"} size={18} color={P.textMuted} />
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={{ color: P.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>New Password</Text>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F0F5FF", borderRadius: 10, paddingHorizontal: 12, marginBottom: 6, borderWidth: 1, borderColor: newPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#]).{8,}$/.test(newPassword) ? "#F87171" : "#D5E3F7" }}>
                <Ionicons name="key-outline" size={16} color={P.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, height: 44, color: "#111" }}
                  placeholder="Enter new password"
                  placeholderTextColor={P.textMuted}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={18} color={P.textMuted} />
                </TouchableOpacity>
              </View>
              {newPassword.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&#]).{8,}$/.test(newPassword) && (
                <Text style={{ color: "#EF4444", fontSize: 11, marginBottom: 10 }}>
                  ⚠ Must have uppercase, lowercase, number & special char
                </Text>
              )}

              {/* Confirm Password */}
              <Text style={{ color: P.textMuted, fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 4 }}>Confirm New Password</Text>
              <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F0F5FF", borderRadius: 10, paddingHorizontal: 12, marginBottom: 6, borderWidth: 1, borderColor: confirmPassword && confirmPassword !== newPassword ? "#F87171" : "#D5E3F7" }}>
                <Ionicons name="key-outline" size={16} color={P.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={{ flex: 1, height: 44, color: "#111" }}
                  placeholder="Re-enter new password"
                  placeholderTextColor={P.textMuted}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={18} color={P.textMuted} />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                <Text style={{ color: "#EF4444", fontSize: 11, marginBottom: 8 }}>
                  ⚠ Passwords do not match
                </Text>
              )}

              {/* Action buttons */}
              <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  style={{ flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#D5E3F7", alignItems: "center" }}
                  onPress={() => { setPwdModalVisible(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                >
                  <Text style={{ color: P.textMuted, fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}
                  onPress={handleUpdatePassword}
                  disabled={pwdLoading}
                >
                  <LinearGradient
                    colors={[P.gradientTop, P.gradientMid]}
                    style={{ padding: 14, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
                  >
                    {pwdLoading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={{ color: "#fff", fontWeight: "700" }}>Update</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const HEADER_HEIGHT = 260;
const CURVE_HEIGHT = 30;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.sheetBg },
  kvFlex: { flex: 1 },

  // ── Gradient header ───────────────────────────────────────────────────────
  headerGradient: {
    width: "100%",
    height: HEADER_HEIGHT,
    position: "relative",
    overflow: "hidden",
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
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.04)",
    bottom: 10,
    left: -30,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },

  backBtn: {
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
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Avatar ────────────────────────────────────────────────────────────────
  avatarArea: {
    alignItems: "center",
    marginTop: 8,
  },

  avatarRingOuter: {
    padding: 4,
    borderRadius: 54,
    backgroundColor: "rgba(255,255,255,0.25)",
    position: "relative",
  },

  avatarRingInner: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: P.white,
    overflow: "hidden",
  },

  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: { color: P.white, fontWeight: "800" },

  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: P.accentBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: P.white,
  },

  avatarName: {
    color: P.white,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 10,
    letterSpacing: 0.2,
  },

  changePhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  changePhotoText: {
    color: P.white,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  curveSpacer: { height: CURVE_HEIGHT },

  // ── White curve overlap ───────────────────────────────────────────────────
  curveSheet: {
    position: "absolute",
    top: HEADER_HEIGHT - CURVE_HEIGHT,
    left: 0,
    right: 0,
    height: CURVE_HEIGHT + 2,
    backgroundColor: P.sheetBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollStyle: {
    marginTop: -CURVE_HEIGHT, // pull up under the curve
  },

  scrollContent: {
    paddingTop: HEADER_HEIGHT - CURVE_HEIGHT - 180,
    paddingHorizontal: 16,
    gap: 14,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: P.cardBg,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    shadowColor: "#1A3C5E",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: P.gradientMid,
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: P.textDark,
    letterSpacing: 0.2,
  },

  divider: {
    height: 1,
    backgroundColor: P.divider,
    marginVertical: -2,
  },

  subLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: P.labelColor,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  // ── Input ─────────────────────────────────────────────────────────────────
  inputGroup: { gap: 6 },

  inputLabel: {
    fontWeight: "600",
    fontSize: 13,
    color: P.labelColor,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.inputBg,
    borderWidth: 1.5,
    borderColor: P.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },

  inputWrapperFocused: {
    borderColor: P.accentBlue,
    backgroundColor: "#EAF3FF",
    shadowColor: P.accentBlue,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },

  inputIcon: { marginRight: 8 },

  input: {
    flex: 1,
    fontSize: 14,
    color: P.textDark,
    paddingVertical: 0,
  },

  // ── Tags ──────────────────────────────────────────────────────────────────
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: P.chipBorder,
    backgroundColor: "#EAF3FF",
  },

  chipSelected: {
    backgroundColor: P.chipSelectedBg,
    borderColor: P.chipSelectedBg,
  },

  chipText: {
    fontSize: 13,
    color: P.accentBlue,
    fontWeight: "600",
  },

  chipTextSelected: { color: P.white },

  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.tagBg,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },

  selectedTagText: { color: P.white, fontSize: 13, fontWeight: "500" },

  removeTagBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  customTagRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.inputBg,
    borderWidth: 1.5,
    borderColor: P.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },

  customTagInput: {
    flex: 1,
    fontSize: 14,
    color: P.textDark,
  },

  addTagBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: P.divider,
    alignItems: "center",
    justifyContent: "center",
  },

  addTagBtnActive: {
    backgroundColor: P.accentBlue,
  },

  // ── Save button ───────────────────────────────────────────────────────────
  saveBtnWrapper: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 4,
    shadowColor: P.gradientTop,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
  },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },

  saveBtnText: {
    color: P.white,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
