import Button from "@/components/Button";
import ModalComponent from "@/components/ModalComponent";
import { ThemeColors, useTheme } from "@/lib/theme";
import { OdoEntry } from "@/lib/vehicleStore";
import { formatNumber, formatRelativeDate } from "@/utils/formatting";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

interface UpdateModalProps {
  data: OdoEntry[];
  visible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
}

export default function HistoryModal({
  data,
  visible,
  setModalVisible,
}: UpdateModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderHistoryItem = ({ item }: { item: OdoEntry }) => (
    <View style={styles.historyContainer}>
      <Text style={styles.historyAction}>
        {item.action || "Odometer update"}:
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
        <Ionicons name="analytics-outline" size={17} color={colors.textFaint} />
        <Text style={styles.historyOdo}>{formatNumber(item.odo)} km</Text>
        <Text style={styles.historyDate}>{formatRelativeDate(item.date)}</Text>
      </View>
    </View>
  );

  return (
    <ModalComponent
      visible={visible}
      onClose={() => {
        setModalVisible(false);
      }}
      modalHeader={"History"}
      modalFooter={
        <>
          <View style={styles.buttonContainer}>
            <Button
              variant="secondary"
              buttonText="Close"
              onPress={() => {
                setModalVisible(false);
              }}
            />
          </View>
        </>
      }
    >
      <View style={{ maxHeight: 350 }}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={{ paddingBottom: 12 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No history yet.</Text>
          }
        />
      </View>
    </ModalComponent>
  );
}
const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    buttonContainer: {
      flex: 1,
    },
    historyContainer: {
      gap: 5,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    historyAction: { color: colors.accent, fontWeight: "600" },
    historyOdo: {
      color: colors.text,
      fontWeight: "600",
      flex: 1,
      fontSize: 17,
    },
    historyDate: { color: colors.textFaint, textAlign: "right", fontSize: 12 },
    emptyText: { color: colors.textFaint, fontSize: 13 },
  });
