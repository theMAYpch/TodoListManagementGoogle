import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsStore = {
  apiKey: string;
  setApiKey: (key: string) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      apiKey: "",
      setApiKey: (key) => set({ apiKey: key }),
    }),
    {
      name: "settings-storage",
    }
  )
);
