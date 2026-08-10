import Button from "@/components/Button";
import { ThemeColors, useTheme } from "@/lib/theme";
import { MaintenanceEntry } from "@/lib/vehicleStore";
import { formatNumber } from "@/utils/formatting";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MaintenanceModal from "./Maintenance.modal";

interface MaintenanceProps {
  vehicle?: MaintenanceEntry[];
}

export default function MaintenanceTracker({ vehicle }: MaintenanceProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [addModal, setAddModal] = useState<boolean>(false);

  const openModal = () => {
    setAddModal(true);
  };

  const renderMaintenanceItem = ({ item }: { item: MaintenanceEntry }) => (
    <View style={styles.maintenanceRow}>
      <Text style={styles.maintenanceName}>Change Oil:</Text>
      <Text style={styles.maintenanceMeter}>
        {formatNumber(item.currentTrip)}/25,155 km
      </Text>
      {/* Progress Bar */}
      <View></View>
      {/* <Text style={styles.historyDate}>{formatRelativeDate(item.date)}</Text> */}
    </View>
  );
  return (
    <>
      <Button buttonText="Add Maintenances" onPress={openModal} />
      <FlatList
        data={vehicle}
        keyExtractor={(item) => item.id}
        renderItem={renderMaintenanceItem}
        contentContainerStyle={{ paddingBottom: 12 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No maintenances yet.</Text>
        }
      />
      <MaintenanceModal visible={addModal} setModalVisible={setAddModal} />
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    maintenanceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    maintenanceName: { color: colors.accent, fontWeight: "900", fontSize: 14 },
    maintenanceMeter: { color: colors.text, fontWeight: "400", flex: 1 },
    historyDate: { color: colors.textFaint, fontSize: 12 },
    emptyText: {
      textAlign: "center",
      color: colors.textFaint,
      fontSize: 13,
      padding: 10,
    },
  });
