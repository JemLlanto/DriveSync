import { ThemeColors, useTheme } from "@/lib/theme";
import { useMemo } from "react";
import { StyleSheet, Text, TextInput } from "react-native";

interface InputValueProps {
  label?: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  keyboardType?:
    | "default"
    | "numeric"
    | "email-address"
    | "phone-pad"
    | "decimal-pad";
}

export default function InputValue({
  label,
  value,
  setValue,
  placeholder,
  keyboardType = "default",
}: InputValueProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder || ""}
        placeholderTextColor={colors.textFaint}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    inputLabel: {
      color: colors.textMuted,
      fontSize: 13,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 15,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
  });
