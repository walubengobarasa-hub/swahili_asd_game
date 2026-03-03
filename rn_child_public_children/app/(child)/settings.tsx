import { router } from "expo-router";
import React from "react";
import { Text } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";

export default function Settings() {
  return (
    <ResponsiveScreen>
      <TopBar title="Settings" rightIcon="←" onRight={() => router.back()} />
      <GlassCard>
        <Text style={{ fontWeight: "800" }}>Coming next: audio, difficulty, language, accessibility.</Text>
      </GlassCard>
    </ResponsiveScreen>
  );
}
