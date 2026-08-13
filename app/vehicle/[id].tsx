import { formatNumber } from "@/utils/formatting";
import { Ionicons } from "@expo/vector-icons";
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors, useTheme } from "../../lib/theme";
import { emptyVehicle, useVehicles, Vehicle } from "../../lib/vehicleStore";
import DataCards from "./DataCards";
import MaintenanceTracker from "./MaintenanceTracker";
import UpdateModal from "./Update.modal";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getVehicle,
    updateOdo,
    computeGasConsumption,
    removeVehicle,
    loading,
  } = useVehicles();
  const currentVehicle = getVehicle(id);
  const [vehicle, setVehicle] = useState<Vehicle>(
    currentVehicle || emptyVehicle,
  );

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    lastFullTankOdo: "",
    latestOdo: "",
    littersAdded: "",
  });
  const [FullTankMethod, setFullTankMethod] = useState<boolean>(false);

  useEffect(() => {
    console.log("[id] usetate vehicle: ", vehicle);
  }, [vehicle]);

  useFocusEffect(
    useCallback(() => {
      const currentVehicle = getVehicle(id);
      // console.log("currentVehicle: ", currentVehicle, id);

      if (!currentVehicle) return;

      setVehicle(currentVehicle);
      setFormData((prev) => ({
        ...prev,
        lastFullTankOdo: String(currentVehicle?.odo) ?? "",
      }));
    }, [id, loading]),
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Vehicle not found.</Text>
      </View>
    );
  }

  const handleUpdateOdo = async () => {
    try {
      const trimmed = String(formData.latestOdo).trim();
      const value = Number(trimmed);

      if (!trimmed || Number.isNaN(value) || value < 0) {
        Alert.alert("Invalid odometer", "Please enter a valid number.");
        return;
      }
      if (value < vehicle.odo) {
        Alert.alert(
          "Error: Lower than current",
          `New reading "${formatNumber(value)}km" can not be less than the current odometer "${formatNumber(vehicle.odo)}km".`,
          [{ text: "Cancel", style: "cancel" }],
        );
        return;
      }

      const response = FullTankMethod
        ? await computeGasConsumption(vehicle.id, formData)
        : await updateOdo(vehicle.id, value);
      if (response.success) {
        // console.log("New Data: ", response.data);

        setVehicle((prev) => ({
          ...prev,
          ...response.data,
        }));
        setFormData({
          lastFullTankOdo: formData.latestOdo,
          latestOdo: "",
          littersAdded: "",
        });
        setModalVisible(false);
        setFullTankMethod(false);
      }
    } catch (err) {
      console.error("Error occured: ", err);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete vehicle",
      `Remove "${vehicle.name}" and all its history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const response = await removeVehicle(vehicle.id);
            if (response.success) {
              router.back();
            }
          },
        },
      ],
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Stack.Screen options={{ title: vehicle.name }} />

        {/* CARD FOR ODOMETER, TRIP AND GAS CONSUMPTION */}
        <DataCards
          vehicle={vehicle}
          setVehicle={setVehicle}
          setModalVisible={setModalVisible}
          setFullTankMethod={setFullTankMethod}
        />

        {/* MAINTENANCE LIST */}
        <View style={{ flex: 1, minHeight: 0 }}>
          <Text style={styles.sectionLabel}>Maintenance Tracker</Text>
          <MaintenanceTracker vehicle={vehicle} setVehicle={setVehicle} />
        </View>

        {/* DELETE BUTTON */}
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Vehicle</Text>
        </Pressable>
      </View>

      {/* UPDATE ODO MODAL */}
      <UpdateModal
        formData={formData}
        visible={modalVisible}
        FullTankMethod={FullTankMethod}
        setFullTankMethod={setFullTankMethod}
        setModalVisible={setModalVisible}
        setFormData={setFormData}
        handleUpdateOdo={handleUpdateOdo}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    loadingText: {
      color: colors.textMuted,
      marginTop: 60,
      textAlign: "center",
    },
    sectionLabel: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 10,
    },
    deleteButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      marginTop: 8,
    },
    deleteButtonText: { color: colors.danger, fontWeight: "600", fontSize: 13 },
  });
