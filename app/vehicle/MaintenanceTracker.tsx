import Button from "@/components/Button";
import { ThemeColors, useTheme } from "@/lib/theme";
import { MaintenanceEntry, Vehicle } from "@/lib/vehicleStore";
import { formatNumber } from "@/utils/formatting";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MaintenanceModal from "./Maintenance.modal";

interface MaintenanceProps {
  vehicle: Vehicle;
  setVehicle: Dispatch<SetStateAction<Vehicle>>;
}

export default function MaintenanceTracker({
  vehicle,
  setVehicle,
}: MaintenanceProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [addModal, setAddModal] = useState<boolean>(false);

  const openModal = () => {
    setAddModal(true);
  };

  const renderMaintenanceItem = ({ item }: { item: MaintenanceEntry }) => {
    const dueOdo = item.tripLimit;
    const currentTrip = item.currentTrip;
    const remainingTrip = dueOdo - currentTrip;
    const rawProgress = remainingTrip / dueOdo;
    const progress = 100 - Math.min(Math.max(rawProgress, 0), 1) * 100; // clamp 0-1

    return (
      <View style={styles.maintenanceRow}>
        <Text style={styles.maintenanceName}>{item.name}:</Text>
        <Text style={styles.maintenanceMeter}>
          Remain Trip: {formatNumber(remainingTrip)}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%` },
              progress > 90 && styles.progressBarFillOverdue,
            ]}
          />
        </View>
        {/* <Text style={styles.historyDate}>{formatRelativeDate(item.date)}</Text> */}
      </View>
    );
  };
  return (
    <>
      <Button
        icon="construct-outline"
        buttonText="Add Maintenance Service"
        onPress={openModal}
      />
      <FlatList
        data={vehicle?.maintenance}
        keyExtractor={(item) => item.id}
        renderItem={renderMaintenanceItem}
        contentContainerStyle={{ paddingBottom: 12 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No maintenances yet.</Text>
        }
      />
      <MaintenanceModal
        vehicleId={vehicle.id}
        setVehicle={setVehicle}
        visible={addModal}
        setModalVisible={setAddModal}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    maintenanceRow: {
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
    progressBarTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.textMuted, // or any subtle track color
      overflow: "hidden",
      marginVertical: 6,
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 4,
      backgroundColor: colors.success, // or colors.tint / colors.accent
    },
    progressBarFillOverdue: {
      backgroundColor: colors.danger ?? "#e74c3c", // fallback if you don't have an error color token
    },
  });
