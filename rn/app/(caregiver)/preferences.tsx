import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Switch, Text, TextInput, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import PrimaryButton from "../../components/PrimaryButton";
import { api } from "../../lib/api";

export default function Preferences() {
  const [childId, setChildId] = useState("1");
  const [sessionMinutes, setSessionMinutes] = useState("10");
  const [soundOn, setSoundOn] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setMsg(null);
    try {
      const data = await api.getCaregiverSettings(Number(childId));
      setSessionMinutes(String(data.session_minutes ?? 10));
      setSoundOn(Boolean(data.sound_on ?? true));
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to load");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setMsg(null);
    try {
      await api.updateCaregiverSettings({
        child_id: Number(childId),
        session_minutes: Number(sessionMinutes),
        sound_on: soundOn,
      });
      setMsg("Saved ✅");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to save");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0b1020" }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Stack.Screen options={{ title: "Preferences" }} />

      <GlassCard>
        <Text style={{ color: "#e5e7eb", fontSize: 18, fontWeight: "800" }}>Caregiver Settings</Text>

        <View style={{ marginTop: 12, gap: 10 }}>
          <Text style={{ color: "#e5e7eb", fontWeight: "700" }}>Child ID</Text>
          <TextInput
            value={childId}
            onChangeText={setChildId}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor="rgba(229,231,235,0.45)"
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              color: "#e5e7eb",
            }}
          />
          <PrimaryButton title="Load" onPress={load} />

          <Text style={{ color: "#e5e7eb", fontWeight: "700" }}>Session Minutes</Text>
          <TextInput
            value={sessionMinutes}
            onChangeText={setSessionMinutes}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor="rgba(229,231,235,0.45)"
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              color: "#e5e7eb",
            }}
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            <Text style={{ color: "#e5e7eb", fontWeight: "700" }}>Sound</Text>
            <Switch value={soundOn} onValueChange={setSoundOn} />
          </View>

          <PrimaryButton title="Save" onPress={save} />

          {!!msg && <Text style={{ color: msg.includes("✅") ? "#86efac" : "#fca5a5" }}>{msg}</Text>}
        </View>
      </GlassCard>
    </ScrollView>
  );
}
