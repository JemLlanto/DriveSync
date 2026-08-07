import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export type OdoEntry = {
  id: string;
  odo: number;
  date: string; // ISO string
};

export type Vehicle = {
  id: string;
  name: string;
  odo: number; // current odometer reading
  createdAt: string;
  history: OdoEntry[];
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
    setVehicles(stored);
    setLoading(false);
  }, []);

  useEffect(() => {
    getVehicles();
  }, []);

  const persist = useCallback(async (next: Vehicle[]) => {
    setVehicles(next);
    await saveVehicles(next);
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
        history: [{ id: makeId(), odo, date: new Date().toISOString() }],
      };
      await persist([newVehicle, ...vehicles]);
      return { success: true };
    },
    [vehicles, persist],
  );

  const updateOdo = useCallback(
    async (vehicleId: string, newOdo: number) => {
      const next = vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
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

  const removeVehicle = useCallback(
    async (vehicleId: string) => {
      await persist(vehicles.filter((v) => v.id !== vehicleId));
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
    removeVehicle,
    getVehicle,
  };
}
