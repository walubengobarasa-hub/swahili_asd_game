import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import BigGreenButton from "../../components/BigGreenButton";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { COLORS } from "../../constants/theme";
import { getJSON } from "../../lib/api";

export default function CaregiverDashboard() {
  const { child_id } = useLocalSearchParams<{ child_id?: string }>();
  const childId = Number(child_id ?? "1") || 1;

  const [report, setReport] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  const load = async () => {
    const r = await getJSON(`/reports/child/${childId}`);
    const s = await getJSON(`/caregiver/settings/${childId}`);
    setReport(r);
    setSettings(s);
  };

  useEffect(() => {
    load();
  }, [childId]);

  return (
    <ResponsiveScreen>
      <TopBar title="Caregiver" rightIcon="✕" onRight={() => router.back()} />

      <GlassCard>
        <Text style={styles.h1}>Progress Summary</Text>
        <Text style={styles.row}>Child ID: <Text style={styles.bold}>{childId}</Text></Text>
        <Text style={styles.row}>Total Attempts: <Text style={styles.bold}>{report?.total_attempts ?? 0}</Text></Text>
        <Text style={styles.row}>Correct: <Text style={styles.bold}>{report?.correct ?? 0}</Text></Text>
        <Text style={styles.row}>Accuracy: <Text style={styles.bold}>{Math.round((report?.accuracy ?? 0) * 100)}%</Text></Text>
      </GlassCard>

      <View style={{ marginTop: 14 }}>
        <GlassCard>
          <Text style={styles.h1}>Session Settings</Text>
          <Text style={styles.row}>Session Length: <Text style={styles.bold}>{settings?.session_minutes ?? 10} min</Text></Text>
          <Text style={styles.row}>Sound: <Text style={styles.bold}>{(settings?.sound_on ?? true) ? "On" : "Off"}</Text></Text>

          <View style={{ marginTop: 12 }}>
            <BigGreenButton
              label="EDIT SETTINGS"
              onPress={() => router.push({ pathname: "/(caregiver)/settings", params: { child_id: String(childId) } })}
            />
          </View>
        </GlassCard>
      </View>

      <View style={{ marginTop: 14 }}>
        <BigGreenButton label="REFRESH" onPress={load} />
      </View>

      <Pressable style={{ marginTop: 10, alignSelf: "center" }} onPress={() => router.replace("/(child)/topics")}>
        <Text style={{ fontWeight: "900", color: "rgba(28,53,87,0.75)" }}>Back to Child App</Text>
      </Pressable>
    </ResponsiveScreen>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 18, fontWeight: "900", color: COLORS.ink, textAlign: "center", marginBottom: 8 },
  row: { fontSize: 14, fontWeight: "700", color: "rgba(28,53,87,0.8)", marginTop: 6 },
  bold: { fontWeight: "900", color: COLORS.ink },
});
