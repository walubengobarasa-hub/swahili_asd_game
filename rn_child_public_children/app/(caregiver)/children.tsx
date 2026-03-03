import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import GlassCard from "../../components/GlassCard";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { deleteJSON, getJSON, postJSON } from "../../lib/api";

type Child = { id: number; display_name: string; age_years?: number; current_level?: number };

export default function CaregiverChildren() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Child[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("5");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getJSON<Child[]>("/caregiver/children");
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load children.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const display_name = name.trim();
    if (!display_name) return Alert.alert("Missing", "Child name is required.");
    try {
      await postJSON("/caregiver/children", {
        display_name,
        age_years: Number(age) || 5,
        min_level: 1,
        max_level: 5,
        current_level: 1,
        notes: null,
      });
      setName("");
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create child.");
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteJSON(`/caregiver/children/${id}`);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to delete child.");
    }
  };

  return (
    <ResponsiveScreen>
      <TopBar title="Children" />
      <GlassCard>
        <Text style={styles.h2}>Add Child</Text>

        <View style={styles.row}>
          <TextInput value={name} onChangeText={setName} placeholder="Child name" placeholderTextColor={COLORS.muted} style={styles.input} />
        </View>
        <View style={styles.row}>
          <TextInput value={age} onChangeText={setAge} placeholder="Age" placeholderTextColor={COLORS.muted} keyboardType="number-pad" style={styles.input} />
        </View>

        <Pressable style={styles.primaryBtn} onPress={create}>
          <Text style={styles.primaryTxt}>Create</Text>
        </Pressable>

        <View style={{ height: 16 }} />
        <Text style={styles.h2}>Your Children</Text>

        {loading ? <ActivityIndicator /> : (
          <FlatList
            data={items}
            keyExtractor={(c) => String(c.id)}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.display_name}</Text>
                  <Text style={styles.itemSub}>Age: {item.age_years ?? "-"} • Level: {item.current_level ?? "-"}</Text>
                </View>

                <Pressable style={styles.secondaryBtn} onPress={() => router.push(`/(child)/start?childId=${item.id}`)}>
                  <Text style={styles.secondaryTxt}>Start</Text>
                </Pressable>

                <Pressable style={styles.dangerBtn} onPress={() => remove(item.id)}>
                  <Text style={styles.dangerTxt}>Delete</Text>
                </Pressable>
              </View>
            )}
          />
        )}
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: 16, fontWeight: "900", color: COLORS.ink, marginBottom: 8 },
  row: { marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: COLORS.stroke, borderRadius: RADIUS.lg,
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff", color: COLORS.ink,
  },
  primaryBtn: { backgroundColor: COLORS.green, borderWidth: 1, borderColor: COLORS.greenDark, paddingVertical: 12, borderRadius: RADIUS.lg, alignItems: "center" },
  primaryTxt: { color: "#fff", fontWeight: "900" },
  item: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.stroke, gap: 8 },
  itemTitle: { fontSize: 15, fontWeight: "900", color: COLORS.ink },
  itemSub: { fontSize: 12, fontWeight: "700", color: COLORS.muted, marginTop: 2 },
  secondaryBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.greenDark },
  secondaryTxt: { color: COLORS.greenDark, fontWeight: "900" },
  dangerBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: "#ffb3b3" },
  dangerTxt: { color: "#b00020", fontWeight: "900" },
});
