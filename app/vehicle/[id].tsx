import Button from "@/components/Button";
import InputValue from "@/components/InputValue";
import ModalComponent from "@/components/ModalComponent";
import {
  formatNumber,
  formatRelativeDate,
  roundUp2,
  sanitizeNumberInput,
} from "@/utils/formatting";
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

        {/* ODO READING */}
        <View style={styles.odoCard}>
          <Text style={styles.odoLabel}>Current Odometer</Text>
          <Text style={styles.odoValue}>{formatNumber(vehicle.odo)}</Text>
          <Text style={styles.odoUnit}>kilometers</Text>
          <Button
            icon="speedometer-outline"
            buttonText="Update Odometer"
            onPress={() => setModalVisible(true)}
          />
        </View>
        {/* TRIP ODO & GAS CONSUMPTION */}
        <View style={styles.TripGasCard}>
          {/* TRIP CARD */}
          <View
            style={{
              flex: 1,
              flexShrink: 1,
              alignItems: "center",
            }}
          >
            <Text style={styles.odoLabel}>Current Trip</Text>
            <Text style={styles.GasConsValue}>
              {roundUp2(vehicle.tripOdo || 0)} km
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Button
                variant="secondary"
                icon="refresh-outline"
                buttonText="Reset"
                onPress={resetTripMeter}
              />
            </View>
          </View>
          {/* GAS CONSUMPTION CARD */}
          <View
            style={{
              flex: 1,
              flexShrink: 1,
              alignItems: "center",
            }}
          >
            <Text style={styles.odoLabel}>Gas Consumption</Text>
            <Text style={styles.GasConsValue}>
              {roundUp2(vehicle.gasConsumption || 0)} km/ltr
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <Button
                variant="secondary"
                icon="calculator-outline"
                buttonText="Calculate"
                onPress={() => {
                  setModalVisible(true);
                  setFullTankMethod(true);
                }}
              />
            </View>
          </View>
        </View>

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

        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.deleteButtonText}>Delete Vehicle</Text>
        </Pressable>
      </View>
      {/* ADDING VEHICLE MODAL */}
      <ModalComponent
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        modalHeader={
          FullTankMethod ? "Calculate Gas Consumption" : "Update Odometer"
        }
        modalFooter={
          <>
            <View
              style={{
                width: "100%",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {/* Row 1 */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={styles.buttonContainer}>
                  <Button
                    variant="secondary"
                    buttonText={
                      FullTankMethod
                        ? "Update Odometer"
                        : "Calculate Gas Consumption"
                    }
                    onPress={() => setFullTankMethod((prev) => !prev)}
                  />
                </View>
              </View>

              {/* Row 2 */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={styles.buttonContainer}>
                  <Button
                    variant="secondary"
                    buttonText="Cancel"
                    onPress={() => setModalVisible(false)}
                  />
                </View>
                <View style={styles.buttonContainer}>
                  <Button buttonText="Save" onPress={handleUpdateOdo} />
                </View>
              </View>
            </View>
          </>
        }
      >
        {FullTankMethod ? (
          // FULL TANK METHOD FORM
          <>
            {/* Last Full Tank Odometer Reading */}
            <InputValue
              label="Last Full Tank Odometer Reading"
              name={
                formData.lastFullTankOdo
                  ? formatNumber(formData.lastFullTankOdo)
                  : ""
              }
              setName={(text) => {
                let value = sanitizeNumberInput(text);
                setFormData((prev) => ({
                  ...prev,
                  lastFullTankOdo: value,
                }));
              }}
              placeholder="Last full tank odometer reading"
              keyboardType="decimal-pad"
            />
            {/* Latest Odometer Reading */}
            <InputValue
              label="Latest Odometer Reading"
              name={formData.latestOdo ? formatNumber(formData.latestOdo) : ""}
              setName={(text) => {
                let value = sanitizeNumberInput(text);
                setFormData((prev) => ({
                  ...prev,
                  latestOdo: value,
                }));
              }}
              placeholder="Latest odometer reading"
              keyboardType="decimal-pad"
            />
            {/* Litters Added */}
            <InputValue
              label="Litters Added"
              name={
                formData.littersAdded ? formatNumber(formData.littersAdded) : ""
              }
              setName={(text) => {
                let value = sanitizeNumberInput(text);
                setFormData((prev) => ({
                  ...prev,
                  littersAdded: value,
                }));
              }}
              placeholder="Litters added"
              keyboardType="decimal-pad"
            />
          </>
        ) : (
          <InputValue
            label="New Odometer Reading"
            name={formatNumber(formData.latestOdo)}
            setName={(text) => {
              let value = sanitizeNumberInput(text);
              setFormData((prev) => ({ ...prev, latestOdo: value }));
            }}
            placeholder="New odometer reading"
            keyboardType="decimal-pad"
          />
        )}
      </ModalComponent>
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
    odoCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 24,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    odoLabel: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
    odoValue: {
      color: colors.accent,
      fontSize: 44,
      fontWeight: "800",
      marginTop: 6,
    },
    odoUnit: {
      color: colors.textFaint,
      fontSize: 13,
      marginTop: 2,
      marginBottom: 12,
    },
    TripGasCard: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-around",
      gap: 12,
      backgroundColor: colors.cardBorder,
      borderRadius: 18,
      padding: 24,
      marginBottom: 16,
    },
    GasConsValue: {
      color: colors.accent,
      fontSize: 22,
      fontWeight: "800",
      marginTop: 6,
    },
    updateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accent,
      paddingVertical: 13,
      borderRadius: 12,
      marginBottom: 24,
    },
    updateButtonText: {
      color: colors.accentText,
      fontWeight: "700",
      fontSize: 15,
    },
    editRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 24,
      alignItems: "center",
    },
    input: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    saveBtn: { backgroundColor: colors.accent, padding: 12, borderRadius: 10 },
    cancelBtn: {
      backgroundColor: colors.cardBorder,
      padding: 12,
      borderRadius: 10,
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
    buttonContainer: {
      flex: 1,
    },
  });
