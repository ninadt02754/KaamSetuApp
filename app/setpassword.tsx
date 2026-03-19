import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function SetPassword() {

    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (password.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }

        setError("");
        alert("Account Created Successfully!");
        router.push("/");
    };

    return (
        <View style={styles.container}>

            <Text style={styles.logo}>KaamSetu</Text>
            <Text style={styles.subtitle}>Set your password</Text>

            <View style={styles.card}>
                <TextInput
                    placeholder="Enter password"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Finish</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#eef2f7",
    },
    logo: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        color: "#4a6cf7",
    },
    subtitle: {
        textAlign: "center",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 15,
    },
    input: {
        backgroundColor: "#f1f1f1",
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    button: {
        backgroundColor: "#6c4ef6",
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "bold",
    },
    error: {
        color: "red",
        marginTop: 5,
    },
});