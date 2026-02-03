import { router } from "expo-router";
import React from "react";
import { Text } from "react-native";
import GlassCard from "../../components/GlassCard";
import ResponsiveScreen from "../../components/ResponsiveScreen";
import TopBar from "../../components/TopBar";

export default function UploadWords() {
  return (
    <ResponsiveScreen>
      <TopBar title="Upload Words" rightIcon="←" onRight={() => router.back()} />
      <GlassCard>
        <Text style={{ fontWeight: "800" }}>
          Coming next: upload CSV (english, swahili, topic, image_url) → API import.
        </Text>
      </GlassCard>
    </ResponsiveScreen>
  );
}
