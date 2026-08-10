import Button from "@/components/Button";
import InputValue from "@/components/InputValue";
import ModalComponent from "@/components/ModalComponent";
import { formatNumber, sanitizeNumberInput } from "@/utils/formatting";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ComboBox } from "./ComboBox.modal";

export interface maintenanceFormDataProps {
  name: string;
  currentTrip: string;
  tripLimit: string;
}

interface UpdateModalProps {
  visible: boolean;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
}

const COMMON_MAINTENANCE_TYPES = [
  "Change Oil",
  "Brake Pads",
  "CVT Cleaning",
  "Tire Rotation",
  "Air Filter Replacement",
  "Coolant Flush",
  "Spark Plug Replacement",
  "Battery Check",
];

export default function MaintenanceModal({
  visible,
  setModalVisible,
}: UpdateModalProps) {
  const styles = useMemo(() => createStyles(), []);
  const [formData, setFormData] = useState<maintenanceFormDataProps>({
    name: "",
    currentTrip: "",
    tripLimit: "",
  });

  const handleAddMaintenance = () => {};

  return (
    <ModalComponent
      visible={visible}
      onClose={() => {
        setModalVisible(false);
      }}
      modalHeader={"Add Maintenance Service"}
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
            <Button buttonText="Save" onPress={handleAddMaintenance} />
          </View>
        </>
      }
    >
      <ComboBox
        options={COMMON_MAINTENANCE_TYPES}
        value={formData.name}
        setFormData={setFormData}
        label="Maintenance Type"
        placeholder="e.g. Change Oil"
      />
      <InputValue
        label="Maintenance Interval"
        value={formatNumber(formData?.tripLimit)}
        setValue={(text) => {
          let value = sanitizeNumberInput(text);
          setFormData((prev) => ({ ...prev, tripLimit: value }));
        }}
        placeholder="e.g. 3,000 (in kilometers)"
        keyboardType="decimal-pad"
      />
    </ModalComponent>
  );
}
const createStyles = () =>
  StyleSheet.create({
    buttonContainer: {
      flex: 1,
    },
  });
