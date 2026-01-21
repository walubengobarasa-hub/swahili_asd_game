import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS, RADIUS } from "../../constants/theme";

const TOPICS = [
  { key: "animals", label: "Animals", icon: "paw" as const },
  { key: "food", label: "Food", icon: "restaurant" as const },
  { key: "greetings", label: "Greetings", icon: "hand-left" as const },
  { key: "school", label: "School", icon: "school" as const },
];

export default function Topics() {
  return (
    <ResponsiveScreen>
      <TopBar title="Choose Topic" rightIcon="⚙️" onRight={() => router.push("/(child)/caregiver-pin")} />

      <GlassCard>
        <Text style={styles.title}>Select a topic to start</Text>
      </GlassCard>

      <View style={{ marginTop: 14, gap: 12 }}>
        {TOPICS.map((t) => (
          <Pressable
            key={t.key}
            style={styles.topicCard}
            onPress={() =>
              router.push({
                pathname: "/(child)/task-image",
                params: { topic: t.key, step: "1" },
              })
            }
          >
            <View style={styles.topicLeft}>
              <View style={styles.iconBubble}>
                <Ionicons name={t.icon} size={20} color={COLORS.ink} />
              </View>
              <Text style={styles.topicText}>{t.label}</Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="rgba(28,53,87,0.65)" />
          </Pressable>
        ))}
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },

  topicCard: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: RADIUS.xl,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topicLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.cream,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    alignItems: "center",
    justifyContent: "center",
  },
  topicText: { fontSize: 18, fontWeight: "900", color: COLORS.ink },
});
