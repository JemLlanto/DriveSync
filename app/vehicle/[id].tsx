import { formatNumber, formatRelativeDate } from "@/utils/formatting";
import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ThemeColors, useTheme } from "../../lib/theme";
import { OdoEntry, useVehicles } from "../../lib/vehicleStore";
import DataCards from "./DataCards";
import UpdateModal from "./UpdateModal";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getVehicle,
    updateOdo,
    computeGasConsumption,
    removeVehicle,
    resetTripMeterOdo,
    loading,
  } = useVehicles();
  const vehicle = getVehicle(id);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [editing, setEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    lastFullTankOdo: "",
    latestOdo: "",
    littersAdded: "",
  });
  const [FullTankMethod, setFullTankMethod] = useState<boolean>(false);
  useFocusEffect(
    useCallback(() => {
      setFormData((prev) => ({
        ...prev,
        lastFullTankOdo: String(vehicle?.lastFullTankOdo) || "",
      }));
    }, [vehicle]),
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
    const trimmed = String(formData.latestOdo).trim();
    const value = Number(trimmed);

    if (!trimmed || Number.isNaN(value) || value < 0) {
      Alert.alert("Invalid odometer", "Please enter a valid number.");
      return;
    }
    if (value < vehicle.odo) {
      Alert.alert(
        "Lower than current",
        `New reading (${value}) is less than the current odometer (${vehicle.odo}). Continue anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: async () => {
              FullTankMethod
                ? await computeGasConsumption(vehicle.id, formData)
                : await updateOdo(vehicle.id, value);
              setFormData({
                lastFullTankOdo: formData.latestOdo,
                latestOdo: "",
                littersAdded: "",
              });
              setEditing(false);
              setModalVisible(false);
              setFullTankMethod(false);
            },
          },
        ],
      );
      return;
    }

    FullTankMethod
      ? await computeGasConsumption(vehicle.id, formData)
      : await updateOdo(vehicle.id, value);
    setFormData({
      lastFullTankOdo: formData.latestOdo,
      latestOdo: "",
      littersAdded: "",
    });
    setEditing(false);
    setModalVisible(false);
    setFullTankMethod(false);
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
            await removeVehicle(vehicle.id);
            router.back();
          },
        },
      ],
    );
  };

  const resetTripMeter = () => {
    Alert.alert(
      "Reset Trip Meter",
      `Reset the trip meter for "${vehicle.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetTripMeterOdo(vehicle.id);
            getVehicle(id);
          },
        },
      ],
    );
  };

  const renderHistoryItem = ({ item }: { item: OdoEntry }) => (
    <View style={styles.historyRow}>
      <Ionicons name="time-outline" size={16} color={colors.textFaint} />
      <Text style={styles.historyAction}>
        {item.action || "Odometer update"}:
      </Text>
      <Text style={styles.historyOdo}>{formatNumber(item.odo)} km</Text>
      <Text style={styles.historyDate}>{formatRelativeDate(item.date)}</Text>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <Stack.Screen options={{ title: vehicle.name }} />

        {/* CARD FOR ODOMETER, TRIP AND GAS CONSUMPTION */}
        <DataCards
          vehicle={vehicle}
          setModalVisible={setModalVisible}
          setFullTankMethod={setFullTankMethod}
          resetTripMeter={resetTripMeter}
        />

        {/* HISTORY */}
        <Text style={styles.sectionLabel}>History</Text>
        <FlatList
          data={vehicle.history}
          keyExtractor={(item) => item.id}
          renderItem={renderHistoryItem}
          contentContainerStyle={{ paddingBottom: 12 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No history yet.</Text>
          }
        />

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
    container: { flex: 1, backgroundColor: colors.background, padding: 20 },
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
    historyRow: {
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
    historyAction: { color: colors.accent, fontWeight: "600" },
    historyOdo: { color: colors.text, fontWeight: "600", flex: 1 },
    historyDate: { color: colors.textFaint, fontSize: 12 },
    emptyText: { color: colors.textFaint, fontSize: 13 },
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
