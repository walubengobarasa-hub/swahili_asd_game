import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import PrimaryButton from "../../components/PrimaryButton";

export default function Rewards() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rewards</Text>

      <View style={styles.card}>
        <Text style={styles.big}>⭐ +1 Star</Text>
        <Text style={styles.small}>Keep going!</Text>
      </View>

      <PrimaryButton label="BACK TO TOPICS" onPress={() => router.replace("/(child)/topics")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#CFEAFF", padding: 24, paddingTop: 80, gap: 18 },
  title: { fontSize: 34, fontWeight: "900", color: "#1C3557" },
  card: { backgroundColor: "#fff", borderRadius: 22, padding: 20, elevation: 2, alignItems: "center" },
  big: { fontSize: 28, fontWeight: "900", color: "#1C3557" },
  small: { marginTop: 6, fontSize: 18, fontWeight: "800", color: "#1C3557", opacity: 0.8 },
});
