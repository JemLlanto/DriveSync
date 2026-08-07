import { ThemeColors, useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

export default function ThemeTogglerButton() {
  const { colors, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable style={styles.themeToggle} onPress={toggleTheme} hitSlop={10}>
      <Ionicons
        name={mode === "dark" ? "sunny-outline" : "moon-outline"}
        size={20}
        color={colors.text}
      />
    </Pressable>
  );
}
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
  });
