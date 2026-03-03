import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import GlassCard from "../../components/GlassCard";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { deleteJSON, getJSON, postJSON } from "../../lib/api";

type Topic = { key: string; label_en?: string; label_sw?: string; is_active?: boolean };

export default function TeacherTopics() {
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [key, setKey] = useState("");
  const [en, setEn] = useState("");
  const [sw, setSw] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getJSON<Topic[]>("/teacher/topics");
      setTopics(Array.isArray(data) ? data : []);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const topicKey = key.trim().toLowerCase().replace(/\s+/g, "_");
    if (!topicKey) return Alert.alert("Missing", "Topic key is required.");
    try {
      await postJSON("/teacher/topics", {
        key: topicKey,
        label_en: en.trim() || topicKey,
        label_sw: sw.trim() || en.trim() || topicKey,
        is_active: true,
      });
      setKey(""); setEn(""); setSw("");
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create topic.");
    }
  };

  const remove = async (topicKey: string) => {
    try {
      await deleteJSON(`/teacher/topics/${encodeURIComponent(topicKey)}`);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to delete topic.");
    }
  };

  return (
    <ResponsiveScreen>
      <TopBar title="Topics" />
      <GlassCard>
        <Text style={styles.h2}>Add Topic</Text>
        <View style={styles.row}>
          <TextInput value={key} onChangeText={setKey} placeholder="key e.g. food" placeholderTextColor={COLORS.muted} style={styles.input} />
        </View>
        <View style={styles.row}>
          <TextInput value={en} onChangeText={setEn} placeholder="English label" placeholderTextColor={COLORS.muted} style={styles.input} />
        </View>
        <View style={styles.row}>
          <TextInput value={sw} onChangeText={setSw} placeholder="Swahili label" placeholderTextColor={COLORS.muted} style={styles.input} />
        </View>

        <Pressable style={styles.primaryBtn} onPress={create}>
          <Text style={styles.primaryTxt}>Create</Text>
        </Pressable>

        <View style={{ height: 16 }} />
        <Text style={styles.h2}>All Topics</Text>

        {loading ? <ActivityIndicator /> : (
          <FlatList
            data={topics}
            keyExtractor={(t) => t.key}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.label_en || item.key}</Text>
                  <Text style={styles.itemSub}>{item.key} • {item.label_sw || ""}</Text>
                </View>
                <Pressable style={styles.dangerBtn} onPress={() => remove(item.key)}>
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
  item: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.stroke },
  itemTitle: { fontSize: 15, fontWeight: "900", color: COLORS.ink },
  itemSub: { fontSize: 12, fontWeight: "700", color: COLORS.muted, marginTop: 2 },
  dangerBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: "#ffb3b3" },
  dangerTxt: { color: "#b00020", fontWeight: "900" },
});
