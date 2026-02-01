import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import BigGreenButton from "../../components/BigGreenButton";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";

export default function TeacherDashboard() {
  return (
    <ResponsiveScreen>
      <TopBar title="Teacher (Web)" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Academic Control</Text>
        <Text style={styles.p}>
          Generate curriculum-aligned tasks and review AI outputs before children see them.
        </Text>
      </GlassCard>

      <View style={{ marginTop: 14 }}>
        <BigGreenButton label="GENERATE TASK" onPress={() => router.push("/(teacher)/generate")} />
      </View>

      <View style={{ marginTop: 12 }}>
        <BigGreenButton label="REVIEW PENDING" onPress={() => router.push("/(teacher)/review")} />
      </View>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center" },
  p: { marginTop: 8, fontWeight: "700", color: "rgba(28,53,87,0.75)", textAlign: "center" },
});
