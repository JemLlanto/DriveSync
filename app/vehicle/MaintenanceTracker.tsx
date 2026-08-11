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

  const renderMaintenanceItem = ({ item }: { item: MaintenanceEntry }) => (
    <View style={styles.maintenanceRow}>
      <Text style={styles.maintenanceName}>{item.name}:</Text>
      <Text style={styles.maintenanceMeter}>
        {formatNumber(item.tripLimit)}
      </Text>
      {/* Progress Bar */}
      <View></View>
      {/* <Text style={styles.historyDate}>{formatRelativeDate(item.date)}</Text> */}
    </View>
  );
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
