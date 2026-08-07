import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ThemeColors, useTheme } from "../../lib/theme";
import { OdoEntry, useVehicles } from "../../lib/vehicleStore";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getVehicles, getVehicle, updateOdo, removeVehicle, loading } =
    useVehicles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [editing, setEditing] = useState(false);
  const [newOdo, setNewOdo] = useState("");

  const vehicle = getVehicle(id);

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
    const trimmed = newOdo.trim();
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
              await updateOdo(vehicle.id, value);
              setNewOdo("");
              setEditing(false);
            },
          },
        ],
      );
      return;
    }

    await updateOdo(vehicle.id, value);
    setNewOdo("");
    setEditing(false);
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

  const renderHistoryItem = ({ item }: { item: OdoEntry }) => (
    <View style={styles.historyRow}>
      <Ionicons name="time-outline" size={16} color={colors.textFaint} />
      <Text style={styles.historyOdo}>{item.odo.toLocaleString()} km</Text>
      <Text style={styles.historyDate}>
        {new Date(item.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: vehicle.name }} />

      <View style={styles.odoCard}>
        <Text style={styles.odoLabel}>Current Odometer</Text>
        <Text style={styles.odoValue}>{vehicle.odo.toLocaleString()}</Text>
        <Text style={styles.odoUnit}>kilometers</Text>
      </View>

      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            value={newOdo}
            onChangeText={setNewOdo}
            keyboardType="numeric"
            placeholder="New odometer reading"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            autoFocus
          />
          <Pressable style={styles.saveBtn} onPress={handleUpdateOdo}>
            <Ionicons name="checkmark" size={20} color={colors.accentText} />
          </Pressable>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => {
              setEditing(false);
              setNewOdo("");
            }}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.updateButton} onPress={() => setEditing(true)}>
          <Ionicons
            name="speedometer-outline"
            size={18}
            color={colors.accentText}
          />
          <Text style={styles.updateButtonText}>Update Odometer</Text>
        </Pressable>
      )}

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
    odoUnit: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
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
