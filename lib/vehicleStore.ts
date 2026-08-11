import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export type OdoEntry = {
  id: string;
  odo: number;
  action?: string;
  date: string; // ISO string
};

export type FullTankMethodEntry = {
  lastFullTankOdo: number;
  latestOdo: number;
  littersAdded: number;
};

export type MaintenanceEntry = {
  id: string;
  name: string;
  currentTrip: number;
  tripLimit: number;
};

export type Vehicle = {
  id: string;
  name: string;
  odo: number; // current odometer reading
  tripOdo?: number; // optional trip odometer reading
  gasConsumption?: number; // optional gas consumption value
  lastFullTankOdo?: number; // optional last full tank odometer reading
  createdAt: string;
  updatedAt: string;
  maintenance?: MaintenanceEntry[];
  history: OdoEntry[];
};

export const emptyVehicle = {
  id: makeId(),
  name: "",
  odo: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  history: [{ id: makeId(), odo: 0, date: new Date().toISOString() }],
};

const STORAGE_KEY = "@drivesync/vehicles";

async function loadVehicles(): Promise<Vehicle[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Vehicle[]) : [];
  } catch (e) {
    console.warn("Failed to load vehicles", e);
    return [];
  }
}

async function saveVehicles(vehicles: Vehicle[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  } catch (e) {
    console.warn("Failed to save vehicles", e);
  }
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Hook that exposes the vehicle list plus CRUD helpers.
 * Backed by AsyncStorage so data survives app restarts.
 */
export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const getVehicles = useCallback(async () => {
    const stored = await loadVehicles();
    setLoading(false);
    return { success: true, vehicles: stored };
  }, []);

  const fetchVehicles = async () => {
    const response = await getVehicles();
    if (response.success) {
      setVehicles(response.vehicles);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const persist = useCallback(async (next: Vehicle[]) => {
    try {
      console.log("Persisting vehicles:", next);
      setVehicles(next);
      await saveVehicles(next);
      return { success: true };
    } catch (err) {
      console.error("Error Occured: ", err);
    }
  }, []);

  const addVehicle = useCallback(
    async (name: string, odo: number) => {
      const trimmedName = name.trim() || "Unnamed Vehicle";

      const isDuplicate = vehicles.some(
        (v) => v.name.trim().toLowerCase() === trimmedName.toLowerCase(),
      );

      if (isDuplicate) {
        Alert.alert(
          "Vehicle Already Exists",
          `A vehicle named "${trimmedName}" already exists. Please choose a different name.`,
        );
        return { success: false };
      }
      const newVehicle: Vehicle = {
        id: makeId(),
        name: name.trim() || "Unnamed Vehicle",
        odo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{ id: makeId(), odo, date: new Date().toISOString() }],
      };
      await persist([newVehicle, ...vehicles]);
      return { success: true };
    },
    [vehicles, persist],
  );

  const updateOdo = useCallback(
    async (vehicleId: string, newOdo: number) => {
      // console.log("Updating odometer for vehicle:", vehicleId, newOdo);
      const next = vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              updatedAt: new Date().toISOString(),
              tripOdo: (v.tripOdo || 0) + (newOdo - v.odo),
              odo: newOdo,
              history: [
                { id: makeId(), odo: newOdo, date: new Date().toISOString() },
                ...v.history,
              ],
            }
          : v,
      );
      await persist(next);
    },
    [vehicles, persist],
  );

  const computeGasConsumption = useCallback(
    async (vehicleId: string, data: any) => {
      const formData: FullTankMethodEntry = data as FullTankMethodEntry;
      let consumption =
        (formData.latestOdo - formData.lastFullTankOdo) / formData.littersAdded;

      console.log(
        "Computing gas consumption for vehicle:",
        `${consumption} km/liters`,
        vehicleId,
        formData,
      );
      const next = vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              updatedAt: new Date().toISOString(),
              tripOdo: (v.tripOdo || 0) + (formData.latestOdo - v.odo),
              lastFullTankOdo: formData.latestOdo,
              odo: formData.latestOdo,
              gasConsumption: consumption,
              history: [
                {
                  id: makeId(),
                  odo: formData.latestOdo,
                  action: "Full tank method",
                  date: new Date().toISOString(),
                },
                ...v.history,
              ],
            }
          : v,
      );
      await persist(next);
    },
    [vehicles, persist],
  );

  const resetTripMeterOdo = useCallback(
    async (vehicleId: string) => {
      // console.log("Updating odometer for vehicle:", vehicleId, newOdo);
      const next = vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              updatedAt: new Date().toISOString(),
              tripOdo: 0,
              history: [
                {
                  id: makeId(),
                  odo: v.odo,
                  action: "Trip meter reset",
                  date: new Date().toISOString(),
                },
                ...v.history,
              ],
            }
          : v,
      );
      await persist(next);
    },
    [vehicles, persist],
  );

  const removeVehicle = useCallback(
    async (vehicleId: string) => {
      await persist(vehicles.filter((v) => v.id !== vehicleId));
    },
    [vehicles, persist],
  );

  const addMaintenanceService = useCallback(
    async (vehicleId: string, data: any) => {
      const formData: MaintenanceEntry = data as MaintenanceEntry;
      const newMaintenance = {
        id: makeId(),
        name: formData.name,
        tripLimit: formData.tripLimit,
        currentTrip: 0,
      };
      const next = vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              maintenance: [newMaintenance, ...(v.maintenance || [])],
              history: [
                {
                  id: makeId(),
                  odo: v.odo,
                  action: "New Maintenance Added",
                  date: new Date().toISOString(),
                },
                ...v.history,
              ],
            }
          : v,
      );
      const response = await persist(next);
      return { success: response?.success, data: newMaintenance };
    },
    [vehicles, persist],
  );

  const getVehicle = useCallback(
    (vehicleId: string) => vehicles.find((v) => v.id === vehicleId),
    [vehicles],
  );

  return {
    getVehicles,
    vehicles,
    loading,
    addVehicle,
    updateOdo,
    computeGasConsumption,
    removeVehicle,
    resetTripMeterOdo,
    getVehicle,
    addMaintenanceService,
  };
}
