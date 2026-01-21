import { Pressable, StyleSheet, Text } from "react-native";

export default function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <Text style={styles.txt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: "#2FB15D", paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  txt: { color: "#fff", fontSize: 22, fontWeight: "900" },
});
