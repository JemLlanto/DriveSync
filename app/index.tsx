import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeColors, useTheme } from "../lib/theme";
import { useVehicles, Vehicle } from "../lib/vehicleStore";

export default function IndexScreen() {
  const { vehicles, loading } = useVehicles();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [modalVisible, setModalVisible] = useState(false);

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <Pressable
      style={({ pressed }) => [
        styles.vehicleCard,
        pressed && styles.vehicleCardPressed,
      ]}
      onPress={() => router.push(`/vehicle/${item.id}`)}
    >
      <View style={styles.vehicleIconWrap}>
        <Ionicons name="car-sport" size={24} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.vehicleName}>{item.name}</Text>
        <Text style={styles.vehicleOdo}>{item.odo.toLocaleString()} km</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Button buttonText="Add Vehicle" onPress={() => setModalVisible(true)} />
      <Text style={styles.sectionLabel}>
        {loading
          ? "Loading..."
          : vehicles.length
            ? "Your Vehicles"
            : "No vehicles yet"}
      </Text>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicle}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="speedometer-outline"
                size={40}
                color={colors.cardBorder}
              />
              <Text style={styles.emptyStateText}>
                Tap "Add Vehicle" to start tracking your odometer and
                maintenance schedule.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "flex-start",
    },
    title: { fontSize: 28, fontWeight: "800", color: colors.text },
    subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
    sectionLabel: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 10,
    },
    vehicleCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      gap: 12,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    vehicleCardPressed: { opacity: 0.7 },
    vehicleIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    vehicleName: { color: colors.text, fontSize: 16, fontWeight: "700" },
    vehicleOdo: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
    emptyState: {
      alignItems: "center",
      marginTop: 60,
      paddingHorizontal: 30,
      gap: 12,
    },
    emptyStateText: {
      color: colors.textFaint,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
    },
  });
