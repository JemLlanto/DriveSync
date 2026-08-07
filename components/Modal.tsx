import { ThemeColors, useTheme } from "@/lib/theme";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import { useVehicles } from "../lib/vehicleStore";
import Button from "./Button";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}
export default function Modal({ visible, onClose }: ModalProps) {
  const { addVehicle } = useVehicles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [name, setName] = useState("");
  const [odo, setOdo] = useState("");

  const resetForm = () => {
    setName("");
    setOdo("");
  };

  const handleAddVehicle = async () => {
    const trimmedOdo = odo.trim();
    const odoNumber = Number(trimmedOdo);

    if (!trimmedOdo || Number.isNaN(odoNumber) || odoNumber < 0) {
      Alert.alert(
        "Invalid odometer",
        "Please enter a valid current odometer reading.",
      );
      return;
    }

    await addVehicle(name, odoNumber);
    resetForm();
    onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Vehicle</Text>

          <Text style={styles.inputLabel}>Vehicle name (optional)</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Toyota Vios"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
          />

          <Text style={styles.inputLabel}>Current odometer (km)</Text>
          <TextInput
            value={odo}
            onChangeText={setOdo}
            placeholder="e.g. 15230"
            placeholderTextColor={colors.textFaint}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.modalActions}>
            <Button buttonText="Cancel" onPress={onClose} />
            <Button buttonText="Save" onPress={handleAddVehicle} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 36,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
      marginBottom: 16,
    },

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
    modalActions: { flexDirection: "row", gap: 12, marginTop: 24 },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    cancelButton: { backgroundColor: colors.cardBorder },
    cancelButtonText: { color: colors.text, fontWeight: "700" },
    saveButton: { backgroundColor: colors.accent },
    saveButtonText: { color: colors.accentText, fontWeight: "700" },
  });
