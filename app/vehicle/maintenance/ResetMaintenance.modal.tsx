import Button from "@/components/Button";
import ModalComponent from "@/components/ModalComponent";
import { useTheme } from "@/lib/theme";
import { MaintenanceEntry, useVehicles, Vehicle } from "@/lib/vehicleStore";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export interface maintenanceFormDataProps {
  name: string;
  currentTrip?: string;
  tripLimit: string;
}

interface UpdateModalProps {
  vehicleId: string;
  item: MaintenanceEntry;
  visible: boolean;
  setVehicle: Dispatch<SetStateAction<Vehicle>>;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
}

export default function ResetMaintenance({
  vehicleId,
  item,
  visible,
  setVehicle,
  setModalVisible,
}: UpdateModalProps) {
  const { colors } = useTheme();
  const { resetMaintenanceService } = useVehicles();
  const styles = useMemo(() => createStyles(), []);
  const [formData, setFormData] = useState<maintenanceFormDataProps>({
    name: "",
    tripLimit: "",
  });

  const handleResetMaintenance = async () => {
    try {
      const response = await resetMaintenanceService(vehicleId, item);

      if (response.success) {
        setModalVisible(false);

        setFormData({
          name: "",
          tripLimit: "",
        });

        setVehicle((prev) => ({
          ...prev,
          maintenance: (prev.maintenance || []).map((maintenance) =>
            maintenance.id === response.toBeReset
              ? {
                  ...maintenance,
                  currentTrip: 0,
                }
              : maintenance,
          ),
          history: response.newHistory
            ? [response.newHistory, ...prev.history]
            : prev.history,
        }));
      }
    } catch (err) {
      console.error("Error Occured: ", err);
    }
  };

  return (
    <ModalComponent
      visible={visible}
      onClose={() => {
        setModalVisible(false);
      }}
      modalHeader={"Reset Maintenance"}
      modalFooter={
        <>
          <View style={styles.buttonContainer}>
            <Button
              variant="secondary"
              buttonText="Cancel"
              onPress={() => {
                setModalVisible(false);
              }}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button buttonText="Confirm" onPress={handleResetMaintenance} />
          </View>
        </>
      }
    >
      <Text style={{ color: colors.text }}>
        Are you sure you want to reset trip for {item.name}?
      </Text>
    </ModalComponent>
  );
}
const createStyles = () =>
  StyleSheet.create({
    buttonContainer: {
      flex: 1,
    },
  });
