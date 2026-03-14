import { api, getSession } from "@/lib/api";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import BigGreenButton from "../../components/BigGreenButton";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

const CHILD_ID_KEY = "child_selected_id";
const CHILD_NAME_KEY = "child_selected_name";

async function storageSet(key: string, value: string) {
  try {
    if (Platform.OS === "web") window?.localStorage?.setItem(key, value);
  } catch {}
}

export default function SelectProfile() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);

    try {
      const { token, role } = await getSession();
      const ok = !!token && role === "caregiver";
      setLoggedIn(ok);

      if (!ok) {
        setChildren([]);
        setErr("Caregiver login is required to see child profiles.");
        return;
      }

      const list = await api.childrenPublic.list();
      setChildren(Array.isArray(list) ? list : list?.children ?? []);
    } catch (e: any) {
      setChildren([]);
      setErr(e?.message || "Failed to load your child profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pick = async (c: any) => {
    const id = String(c.id ?? c.child_id ?? "");
    if (!id) return;
    await storageSet(CHILD_ID_KEY, id);
    await storageSet(CHILD_NAME_KEY, String(c.display_name ?? c.name ?? "Child"));
    router.replace("/(child)/topics");
  };

  return (
    <ResponsiveScreen>
      <TopBar title="Select Profile" onBack={() => router.back()} />
      <GlassCard>
        <Text style={styles.h1}>Choose a child profile</Text>
        <Text style={styles.sub}>
          Only children linked to the logged-in caregiver are shown here.
        </Text>

        {!!err && <Text style={styles.err}>{err}</Text>}

        {!loggedIn ? (
          <View style={{ marginTop: 14 }}>
            <BigGreenButton label="CAREGIVER LOGIN" onPress={() => router.push("/login?role=caregiver")} />
          </View>
        ) : children.length === 0 ? (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.empty}>{loading ? "Loading..." : "No child profiles found for your account."}</Text>
            <BigGreenButton label="ADD CHILDREN" onPress={() => router.push("/(caregiver)/children")} />
            <View style={{ height: 10 }} />
            <BigGreenButton label="REFRESH" onPress={load} />
          </View>
        ) : (
          <FlatList
            style={{ marginTop: 12 }}
            data={children}
            keyExtractor={(item) => String(item.id ?? item.child_id)}
            refreshing={loading}
            onRefresh={load}
            renderItem={({ item }) => (
              <Pressable onPress={() => pick(item)} style={styles.row}>
                <View>
                  <Text style={styles.name}>{item.display_name ?? item.name ?? "Child"}</Text>
                  <Text style={styles.meta}>
                    Age: {item.age_years ?? item.age ?? "-"} • Level: {item.current_level ?? 1}
                  </Text>
                </View>
                <Text style={styles.cta}>Select</Text>
              </Pressable>
            )}
          />
        )}
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  sub: { marginTop: 6, color: COLORS.textMuted, lineHeight: 18 },
  err: { marginTop: 10, color: "#b42318", fontWeight: "800" },
  empty: { color: COLORS.textMuted, marginBottom: 10 },
  row: {
    padding: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  name: { color: COLORS.text, fontWeight: "800", fontSize: 16 },
  meta: { color: COLORS.textMuted, marginTop: 2 },
  cta: { color: COLORS.primary, fontWeight: "800" },
});