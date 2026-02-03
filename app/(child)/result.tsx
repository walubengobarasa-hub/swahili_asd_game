import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import BigGreenButton from "../../components/BigGreenButton";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { clamp } from "../../constants/responsive";
import { COLORS } from "../../constants/theme";

export default function Result() {
  const {
    ok,
    topic,
    step,
    session_id,
    child_id,
  } = useLocalSearchParams<{
    ok?: string;
    topic?: string;
    step?: string;
    session_id?: string;
    child_id?: string;
  }>();

  const isOk = ok === "1";
  const { width } = useWindowDimensions();

  const titleSize = clamp(width * 0.07, 22, 32);
  const bodySize = clamp(width * 0.04, 14, 18);

  const nextStep = String((parseInt(step ?? "1", 10) || 1) + 1);

  return (
    <ResponsiveScreen>
      <TopBar title="Result" rightIcon="⚙️" onRight={() => router.push("/(child)/caregiver-pin")} />

      <GlassCard>
        <Text style={styles.rewardRow}>⭐  +1 Star</Text>
        <Text style={styles.stars}>⭐ ⭐ ⭐ ⭐ ⭐ ☆ ☆ ☆</Text>
      </GlassCard>

      <View style={{ marginTop: 16 }}>
        <GlassCard>
          <View style={styles.iconWrap}>
            {isOk ? (
              <Ionicons name="checkmark-circle" size={56} color={COLORS.greenDark} />
            ) : (
              <Ionicons name="close-circle" size={56} color="#D64545" />
            )}
          </View>

          <Text style={[styles.msg, { fontSize: titleSize }]}>{isOk ? "Vizuri!" : "Jaribu tena"}</Text>

          <Text style={[styles.small, { fontSize: bodySize }]}>
            {isOk ? "Umejibu sawa." : "Chagua jibu sahihi."}
          </Text>
        </GlassCard>
      </View>

      <View style={{ marginTop: 18 }}>
        <BigGreenButton
          label={isOk ? "NEXT ▶" : "TRY AGAIN ▶"}
          onPress={() =>
            router.replace({
              pathname: "/(child)/play",
              params: {
                session_id: String(session_id ?? ""),
                child_id: String(child_id ?? ""),
                topic: String(topic ?? ""),
                step: nextStep,
              },
            })
          }
        />
      </View>

      <View style={{ marginTop: 12 }}>
        <BigGreenButton label="TOPICS" onPress={() => router.replace("/(child)/topics")} />
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  rewardRow: { fontSize: 22, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  stars: { marginTop: 10, textAlign: "center", fontSize: 18 },
  iconWrap: { alignItems: "center", marginBottom: 8 },
  msg: { fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  small: { marginTop: 6, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },
});
