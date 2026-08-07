import { ThemeColors, useTheme } from "@/lib/theme";
import { ReactNode, useMemo } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useVehicles } from "../lib/vehicleStore";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  modalHeader: string;
  modalFooter?: ReactNode;
}
export default function ModalComponent({
  visible,
  onClose,
  children,
  modalHeader,
  modalFooter,
}: ModalProps) {
  const { addVehicle } = useVehicles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{modalHeader}</Text>
          {children}
          {modalFooter && (
            <View style={styles.modalActions}>{modalFooter}</View>
          )}
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

    modalActions: {
      width: "100%",
      flexDirection: "row",
      gap: 12,
      marginTop: 24,
    },

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
