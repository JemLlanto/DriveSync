import Button from "@/components/Button";
import InputValue from "@/components/InputValue";
import ModalComponent from "@/components/ModalComponent";
import { formatNumber, sanitizeNumberInput } from "@/utils/formatting";
import { Dispatch, SetStateAction, useMemo } from "react";
import { StyleSheet, View } from "react-native";

interface formDataProps {
  lastFullTankOdo: string;
  latestOdo: string;
  littersAdded: string;
}

interface UpdateModalProps {
  formData: formDataProps;
  visible: boolean;
  FullTankMethod: boolean;
  setFullTankMethod: Dispatch<SetStateAction<boolean>>;
  setModalVisible: Dispatch<SetStateAction<boolean>>;
  setFormData: Dispatch<SetStateAction<formDataProps>>;
  handleUpdateOdo: () => void;
}

export default function UpdateModal({
  formData,
  visible,
  FullTankMethod,
  setFullTankMethod,
  setModalVisible,
  setFormData,
  handleUpdateOdo,
}: UpdateModalProps) {
  const styles = useMemo(() => createStyles(), []);

  return (
    <ModalComponent
      visible={visible}
      onClose={() => {
        setModalVisible(false);
        setFullTankMethod(false);
      }}
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
                  onPress={() => {
                    setModalVisible(false);
                    setFullTankMethod(false);
                  }}
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
  );
}
const createStyles = () =>
  StyleSheet.create({
    buttonContainer: {
      flex: 1,
    },
  });
