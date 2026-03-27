import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type PopupProps = {
  message: string;
  onClose: () => void;
};

export default function Popup({ message, onClose }: PopupProps) {
  if (!message) return null;

  return (
    <View style={styles.popup}>
      <View style={styles.popupBox}>
        <Text style={styles.popupText}>{message}</Text>

        <TouchableOpacity style={styles.btn} onPress={onClose}>
          <Text style={styles.btnText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  popup: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  popupBox: {
    backgroundColor: "#2196F3",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },

  popupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  btn: {
    marginTop: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 8,
  },

  btnText: {
    color: "#2196F3",
    fontWeight: "600",
  },
});