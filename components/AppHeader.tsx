import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AppHeader({ title, rightIcon, onRightPress }:{
  title: string; rightIcon?: string; onRightPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {rightIcon ? (
        <Pressable onPress={onRightPress}>
          <Text style={styles.icon}>{rightIcon}</Text>
        </Pressable>
      ) : <View style={{ width: 28 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 56, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: "900", color: "#1C3557" },
  icon: { fontSize: 26 },
});
