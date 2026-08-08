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
  variant = "primary",
  icon,
  buttonText,
  onPress,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, variant),
    [colors, variant],
  );
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {icon && <Ionicons name={icon} size={22} color={colors.accentText} />}

      <Text style={styles.buttonText}>{buttonText}</Text>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors, variant: "primary" | "secondary") =>
  StyleSheet.create({
    button: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor:
        variant === "primary" ? colors.accent : colors.cardBorder,
      paddingVertical: 14,
      borderRadius: 14,
    },
    buttonText: {
      color: variant === "primary" ? colors.accentText : colors.text,
      fontSize: 16,
      fontWeight: "700",
    },
  });
