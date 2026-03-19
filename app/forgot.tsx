import { router } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Forgot() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = () => {
    if (phone.length !== 10) {
      setError("Enter valid 10-digit phone number");
      return;
    }

    setError("");

    router.push({
      pathname: "/resetpassword",
      params: { phone },
    });
  };

  return (
    <LinearGradient colors={["#6c4ef6", "#4a6cf7"]} style={styles.container}>
      <Text style={styles.logo}>KaamSetu</Text>
      <Text style={styles.subtitle}>Reset your password</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>

        <TextInput
          placeholder="Enter phone number"
          keyboardType="numeric"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={handleSendOTP}>
          <LinearGradient
            colors={["#6c4ef6", "#4a6cf7"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Send OTP</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => router.back()}>
          Back to Login
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  logo: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  subtitle: { textAlign: "center", marginBottom: 20, color: "#eee" },
  card: { backgroundColor: "#fff", padding: 25, borderRadius: 20 },
  title: { textAlign: "center", fontWeight: "bold", marginBottom: 10 },
  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  button: { padding: 15, borderRadius: 10, marginTop: 20 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  link: { textAlign: "center", marginTop: 10 },
  error: { color: "red", textAlign: "center", marginTop: 10 },
});