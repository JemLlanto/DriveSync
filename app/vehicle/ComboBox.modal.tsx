// components/ComboBox.tsx
import { ThemeColors, useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  FlatList,
  Pressable,
  Modal as RNModal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { maintenanceFormDataProps } from "./Maintenance.modal";

type ComboBoxProps = {
  options: string[];
  value: string;
  setFormData: Dispatch<SetStateAction<maintenanceFormDataProps>>;
  label: string;
  placeholder: string;
};

export function ComboBox({
  options,
  value,
  setFormData,
  label,
  placeholder,
}: ComboBoxProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);

  const handleSelect = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
    }));
    setOpen(false);
  };

  const handleTextChange = (text: string) => {
    setFormData((prev) => ({
      ...prev,
      name: text,
    }));
    // custom value flows straight through
    // setOpen(true);
  };

  return (
    <>
      <Text style={styles.inputLabel}>{label}</Text>

      <View style={{ position: "relative" }}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
        />
        <Pressable
          style={{
            position: "absolute",
            top: "50%",
            right: 0,
            transform: [{ translateY: "-50%" }],
            paddingRight: 10,
          }}
          onPress={() => setOpen(true)}
        >
          <Ionicons name="chevron-down-outline" size={20} color={colors.text} />
        </Pressable>
        <RNModal visible={open} transparent animationType="fade">
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          >
            <View style={styles.dropdown}>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No options yet.</Text>
                }
              />
            </View>
          </TouchableOpacity>
        </RNModal>
      </View>
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
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 8,
      padding: 12,
      color: colors.text,
      backgroundColor: colors.background,
    },
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.3)",
      justifyContent: "center",
      padding: 24,
    },
    dropdown: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 8,
      maxHeight: 300,
    },
    option: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.cardBorder,
    },
    optionText: {
      color: colors.text,
    },
    emptyText: {
      // textAlign: "center",
      color: colors.textFaint,
      fontSize: 13,
      padding: 10,
    },
  });
