import Button from "@/components/Button";
import { ThemeColors, useTheme } from "@/lib/theme";
import { Vehicle } from "@/lib/vehicleStore";
import { formatNumber, roundUp2 } from "@/utils/formatting";
import { Ionicons } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import HistoryModal from "./HistoryModal";

interface DataCardsProps {
  vehicle: Vehicle;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  setFullTankMethod: Dispatch<SetStateAction<boolean>>;
  resetTripMeter: () => void;
}

export default function DataCards({
  vehicle,
  setModalVisible,
  setFullTankMethod,
  resetTripMeter,
}: DataCardsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);

  return (
    <>
      {/* ODO READING */}
      <View style={styles.odoCard}>
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            margin: 15,
          }}
        >
          {/* HISTORY BUTTON */}
          <Pressable
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setHistoryVisible(true)}
          >
            <Ionicons name="time-outline" size={30} color={colors.text} />
          </Pressable>
        </View>
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

      {/* HISTORY MODAL */}
      <HistoryModal
        data={vehicle.history}
        visible={historyVisible}
        setModalVisible={setHistoryVisible}
      />
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    odoCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 24,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      position: "relative",
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
  });
