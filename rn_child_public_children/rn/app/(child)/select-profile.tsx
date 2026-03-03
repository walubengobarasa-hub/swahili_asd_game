import { api } from "@/lib/api";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
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
    else {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem(key, value);
    }
  } catch {}
}

async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return window?.localStorage?.getItem(key) ?? null;
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function SelectProfile() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.caregiverChildren.list();
      setChildren(Array.isArray(list) ? list : (list?.children ?? []));
    } catch (e: any) {
      // likely not logged in caregiver
      setChildren([]);
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

  const goLogin = () => router.push("/login?role=caregiver");

  return (
    <ResponsiveScreen>
      <TopBar title="Select Profile" onBack={() => router.back()} />
      <GlassCard>
        <Text style={styles.h1}>Choose a child profile</Text>
        <Text style={styles.sub}>
          To start the game, select a child profile from the database. If you don’t see any profiles, log in as a caregiver and add one.
        </Text>

        {children.length === 0 ? (
          <View style={{ marginTop: 14 }}>
            <Text style={styles.empty}>No child profiles found.</Text>
            <BigGreenButton label="CARE​GIVER LOGIN" onPress={goLogin} />
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
                  <Text style={styles.meta}>Age: {item.age_years ?? item.age ?? "-"}</Text>
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
