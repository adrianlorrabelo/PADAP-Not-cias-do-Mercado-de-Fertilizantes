import { createContext, type ReactNode } from "react";
import { defaultSettings } from "../data/mockMarket";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { Settings } from "../types";

interface AppSettingsContextValue {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

export const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>("padap.settings", defaultSettings);
  return <AppSettingsContext.Provider value={{ settings, setSettings }}>{children}</AppSettingsContext.Provider>;
}
