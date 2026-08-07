import { ThemeColors, useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  variant?: "primary" | "secondary";
  buttonText: string;
  onPress: () => void;
}

export default function Button({ variant, buttonText, onPress }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable style={styles.addButton} onPress={onPress}>
      <Ionicons name="add-circle" size={22} color={colors.accentText} />
      <Text style={styles.addButtonText}>{buttonText}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accent,
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 24,
    },
    addButtonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: "700",
    },
  });
