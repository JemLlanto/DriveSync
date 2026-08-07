import { ThemeColors, useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonProps {
  variant?: "primary" | "secondary";
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  buttonText: string;
  onPress: () => void;
}

export default function Button({
  variant,
  icon,
  buttonText,
  onPress,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {icon && <Ionicons name={icon} size={22} color={colors.accentText} />}

      <Text style={styles.buttonText}>{buttonText}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accent,
      paddingVertical: 14,
      borderRadius: 14,
      marginBottom: 24,
    },
    buttonText: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: "700",
    },
  });
