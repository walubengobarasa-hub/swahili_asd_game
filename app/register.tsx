import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import ResponsiveScreen from "../components/ResponsiveScreen";
import GlassCard from "../components/GlassCard";
import { COLORS, RADIUS } from "../constants/theme";
import { postJSON, setSession } from "../lib/api";

export default function Register() {
  const params = useLocalSearchParams<{ role?: string }>();
  const role = useMemo(() => (params.role === "teacher" ? "teacher" : "caregiver"), [params.role]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await postJSON("/auth/register", { full_name: fullName, email, password, role });
      const res: any = await postJSON("/auth/login", { email, password, role });
      const token = res?.access_token || res?.token || res?.accessToken;
      if (!token) throw new Error("Missing access token.");
      await setSession(token, role);
      if (role === "teacher") router.replace("/(teacher)/home");
      else router.replace("/(caregiver)/home");
    } catch (e: any) {
      Alert.alert("Register failed", e?.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveScreen>
      <GlassCard>
        <Text style={styles.h1}>{role === "teacher" ? "Teacher Register" : "Caregiver Register"}</Text>

        <View style={styles.field}>
          <Text style={styles.lbl}>Full name</Text>
          <TextInput value={fullName} onChangeText={setFullName}
            style={styles.input} placeholder="Your name" placeholderTextColor={COLORS.muted} />
        </View>

        <View style={styles.field}>
          <Text style={styles.lbl}>Email</Text>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
            style={styles.input} placeholder="you@example.com" placeholderTextColor={COLORS.muted} />
        </View>

        <View style={styles.field}>
          <Text style={styles.lbl}>Password</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry
            style={styles.input} placeholder="********" placeholderTextColor={COLORS.muted} />
        </View>

        <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryTxt}>Register</Text>}
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.linkTxt}>Back to login</Text>
        </Pressable>
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: "900", color: COLORS.ink, marginBottom: 14 },
  field: { marginBottom: 12 },
  lbl: { fontSize: 13, fontWeight: "800", color: COLORS.ink, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.stroke,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    color: COLORS.ink,
  },
  primaryBtn: {
    marginTop: 6,
    backgroundColor: COLORS.green,
    borderWidth: 1,
    borderColor: COLORS.greenDark,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  primaryTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
  linkBtn: { marginTop: 12, alignItems: "center" },
  linkTxt: { color: COLORS.greenDark, fontWeight: "900" },
});
