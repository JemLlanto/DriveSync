import { ThemeColors, useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
}

export default function MiniButton({
  variant = "primary",
  icon,
  onPress,
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, variant),
    [colors, variant],
  );
  return (
    <Pressable style={styles.button} onPress={onPress}>
      {icon && (
        <Ionicons
          name={icon}
          size={13}
          color={
            variant === "primary"
              ? colors.accentText
              : variant === "danger"
                ? "#F8FAFC"
                : colors.text
          }
        />
      )}
    </Pressable>
  );
}

const createStyles = (
  colors: ThemeColors,
  variant: "primary" | "secondary" | "danger",
) =>
  StyleSheet.create({
    button: {
      height: 20,
      width: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        variant === "primary"
          ? colors.accent
          : variant === "danger"
            ? colors.danger
            : colors.textFaint,
      padding: 1,
      borderRadius: 5,
    },
  });
