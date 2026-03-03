import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";
import { api } from "../../lib/api";

type LexiconItem = {
  id: number;
  topic: string;
  pos: string;
  difficulty: number;
  en_word: string;
  sw_word: string;
  example_sw?: string | null;
  example_en?: string | null;
  tags?: string | null;
  image_asset_id?: string | null;
  audio_asset_id?: string | null;
};

export default function TeacherLexicon() {
  const [topic, setTopic] = useState("");
  const [items, setItems] = useState<LexiconItem[]>([]);

  const [en, setEn] = useState("");
  const [sw, setSw] = useState("");

  const canCreate = useMemo(() => topic.trim() && en.trim() && sw.trim(), [topic, en, sw]);

  async function load() {
    try {
      const q = topic.trim() ? `?topic=${encodeURIComponent(topic.trim())}` : "";
      const res = await api.get<LexiconItem[]>(`/teacher/lexicon${q}`);
      setItems(res);
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "Could not load lexicon");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!canCreate) {
      Alert.alert("Missing", "Topic, English word, and Swahili word are required");
      return;
    }
    try {
      await api.post("/teacher/lexicon", {
        topic: topic.trim(),
        pos: "noun",
        difficulty: 1,
        en_word: en.trim(),
        sw_word: sw.trim(),
      });
      setEn("");
      setSw("");
      await load();
    } catch (e: any) {
      Alert.alert("Create failed", e?.message || "Error");
    }
  }

  async function remove(item: LexiconItem) {
    Alert.alert("Delete", `Delete '${item.en_word}'?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/teacher/lexicon/${item.id}`);
            await load();
          } catch (e: any) {
            Alert.alert("Delete failed", e?.message || "Error");
          }
        },
      },
    ]);
  }

  return (
    <ResponsiveScreen>
      <TopBar title="Lexicon" rightIcon="←" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Filter</Text>
        <Text style={styles.sub}>Enter a topic key (e.g. animals) and tap Reload</Text>
        <TextInput value={topic} onChangeText={setTopic} placeholder="animals" placeholderTextColor={COLORS.muted} style={styles.input} autoCapitalize="none" />
        <Pressable style={styles.btnGhost} onPress={load}>
          <Text style={styles.btnGhostTxt}>Reload</Text>
        </Pressable>
      </GlassCard>

      <GlassCard>
        <Text style={styles.h1}>Add Word</Text>
        <TextInput value={en} onChangeText={setEn} placeholder="English (dog)" placeholderTextColor={COLORS.muted} style={styles.input} />
        <TextInput value={sw} onChangeText={setSw} placeholder="Swahili (mbwa)" placeholderTextColor={COLORS.muted} style={styles.input} />
        <Pressable style={[styles.btn, !canCreate && { opacity: 0.6 }]} onPress={create} disabled={!canCreate}>
          <Text style={styles.btnTxt}>Add</Text>
        </Pressable>
      </GlassCard>

      <GlassCard>
        <Text style={styles.h1}>Items</Text>
        <Text style={styles.sub}>{items.length} words</Text>

        <FlatList
          data={items}
          keyExtractor={(x) => String(x.id)}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.en_word} • {item.sw_word}</Text>
                <Text style={styles.itemDesc}>topic: {item.topic} • level: {item.difficulty}</Text>
              </View>
              <Pressable style={styles.smallBtn} onPress={() => remove(item)}>
                <Text style={styles.smallBtnTxt}>Delete</Text>
              </Pressable>
            </View>
          )}
        />
      </GlassCard>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink },
  sub: { marginTop: 6, fontWeight: "700", color: "rgba(28,53,87,0.72)" },
  input: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    color: COLORS.ink,
  },
  btn: { marginTop: 12, backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: 12, alignItems: "center" },
  btnTxt: { color: "#fff", fontWeight: "900" },
  btnGhost: { marginTop: 10, backgroundColor: COLORS.cream, borderRadius: RADIUS.lg, padding: 12, alignItems: "center", borderWidth: 1, borderColor: COLORS.stroke },
  btnGhostTxt: { color: COLORS.ink, fontWeight: "900" },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    borderRadius: RADIUS.lg,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  itemTitle: { fontWeight: "900", color: COLORS.ink },
  itemDesc: { marginTop: 4, fontWeight: "700", color: "rgba(28,53,87,0.72)" },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: RADIUS.lg, backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.stroke },
  smallBtnTxt: { fontWeight: "900", color: COLORS.ink },
});
