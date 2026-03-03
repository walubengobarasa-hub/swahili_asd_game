import { router } from "expo-router";
import React from "react";
import { Switch, Text, View } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";
import { useAccessibility } from "../../context/AccessibilityContext";

export default function Settings() {
  const {
    lowStimulation,
    setLowStimulation,
    allowAutoLowStimulation,
    setAllowAutoLowStimulation,
    audioMuted,
    setAudioMuted,
  } = useAccessibility();

  return (
    <ResponsiveScreen>
      <TopBar title="Settings" rightIcon="←" onRight={() => router.back()} />
      <GlassCard>
        <Text style={{ fontWeight: "900", fontSize: 18 }}>Accessibility</Text>
        <Text style={{ marginTop: 8, fontWeight: "700", opacity: 0.8 }}>
          Keep the experience calm and predictable.
        </Text>

        <View style={{ marginTop: 14, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "900" }}>Low stimulation mode</Text>
            <Switch value={lowStimulation} onValueChange={setLowStimulation} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "900" }}>Auto-enable when overwhelmed</Text>
            <Switch value={allowAutoLowStimulation} onValueChange={setAllowAutoLowStimulation} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "900" }}>Mute audio</Text>
            <Switch value={audioMuted} onValueChange={setAudioMuted} />
          </View>

          <Text style={{ marginTop: 6, fontWeight: "700", opacity: 0.75, lineHeight: 20 }}>
            Tip: If you start tapping quickly or pause often, the game will gently switch to a calmer mode and use more
            visuals.
          </Text>
        </View>
      </GlassCard>
    </ResponsiveScreen>
  );
}
