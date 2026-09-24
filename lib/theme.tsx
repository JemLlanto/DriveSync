import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  background: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentText: string;
  danger: string;
  warning: string;
  success: string;
};

const darkColors: ThemeColors = {
  background: "#0b1a20",
  card: "#112933",
  cardBorder: "#1e343b",
  text: "#F8FAFC",
  textMuted: "#94b0b8",
  textFaint: "#647f8b",
  accent: "#38f2f8",
  accentText: "#0B1220",
  danger: "#F87171",
  warning: "#f8cd71",
  success: "#53f348",
};

const lightColors: ThemeColors = {
  background: "#F8FAFC",
  card: "#FFFFFF",
  cardBorder: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#476369",
  textFaint: "#94b0b8",
  accent: "#008b84",
  accentText: "#FFFFFF",
  danger: "#f13535",
  warning: "#d39924",
  success: "#25af1b",
};

const STORAGE_KEY = "@drivesync/theme";

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === "light" ? "light" : "dark",
  );
  const [loaded, setLoaded] = useState(false);

  // Load saved preference on mount (falls back to system scheme if none saved)
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setMode(saved);
        }
      } catch (e) {
        console.warn("Failed to load theme preference", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persistMode = async (next: ThemeMode) => {
    setMode(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      console.warn("Failed to save theme preference", e);
    }
  };

  const toggleTheme = () => persistMode(mode === "dark" ? "light" : "dark");
  const setTheme = (next: ThemeMode) => persistMode(next);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === "dark" ? darkColors : lightColors,
      toggleTheme,
      setTheme,
    }),
    [mode],
  );

  // Avoid a flash of the wrong theme before AsyncStorage resolves
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
