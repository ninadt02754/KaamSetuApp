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

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleRegister = () => {
    if (name.length < 2) {
      setError("Enter valid name");
      return;
    }

    if (phone.length !== 10) {
      setError("Enter valid 10-digit phone number");
      return;
    }

    setError("");

    // 👉 move to OTP screen with phone
    router.push({
      pathname: "/otp",
      params: { phone },
    });
  };

  return (
    <LinearGradient
      colors={["#6c4ef6", "#4a6cf7"]}
      style={styles.container}
    >
      <Text style={styles.logo}>KaamSetu</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>

        {/* Name */}
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        {/* Phone */}
        <TextInput
          placeholder="Phone Number"
          keyboardType="numeric"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
        />

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Button */}
        <TouchableOpacity onPress={handleRegister}>
          <LinearGradient
            colors={["#6c4ef6", "#4a6cf7"]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Continue</Text>
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
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  logo: {
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 20,
    color: "#eee",
  },

  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
  },

  title: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  button: {
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    marginTop: 10,
    color: "#555",
  },

  error: {
    color: "red",
    marginTop: 10,
    textAlign: "center",
  },
});