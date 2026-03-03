import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import BigGreenButton from "../../components/BigGreenButton";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import { COLORS } from "../../constants/theme";

export default function CaregiverPin() {
  const [pin, setPin] = useState("");

  const go = () => {
    if (pin === "1234") router.push("/(caregiver)/home");
    else setPin("");
  };

  return (
    <ResponsiveScreen>
      <GlassCard>
        <Text style={styles.h1}>Caregiver PIN</Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          placeholder="Enter PIN"
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          style={styles.input}
        />
        <BigGreenButton label="CONTINUE" onPress={go} />
        <Text style={styles.note}>Default PIN: 1234</Text>
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "900", color: COLORS.ink, textAlign: "center", marginBottom: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    padding: 14,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "rgba(28,53,87,0.15)",
    marginBottom: 14,
  },
  note: { marginTop: 10, textAlign: "center", fontWeight: "700", color: "rgba(28,53,87,0.65)" },
});
