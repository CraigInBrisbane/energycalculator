import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Car, Charger, Tariff, ICEComparison, PlannerSettings } from '../types';

interface AppStore extends AppState {
  setCar: (car: Car) => void;
  setCharger: (charger: Charger) => void;
  setIceComparison: (ice: ICEComparison) => void;
  setPlannerSettings: (plannerSettings: PlannerSettings) => void;
  addTariff: (tariff: Tariff) => void;
  removeTariff: (id: string) => void;
  updateTariff: (tariff: Tariff) => void;
}

const DEFAULT_STATE: AppState = {
  car: {
    model: 'Tesla Model Y LR AWD',
    batterySize: 77.5,
    avgUsage: 16,
  },
  charger: {
    amps: 15,
    voltage: 220,
    phases: 1,
    efficiency: 0.9,
  },
  plannerSettings: {
    currentPct: 22,
    targetPct: 80,
  },
  tariffs: [
    {
      id: '1',
      name: 'Standard',
      rate: 0.32,
      startTime: '06:00',
      endTime: '00:00',
      isDefault: true,
    },
    {
      id: '2',
      name: 'Off-Peak',
      rate: 0.08,
      startTime: '00:00',
      endTime: '06:00',
    },
  ],
  iceComparison: {
    fuelPrice: 1.85,
    avgL100km: 8.5,
  },
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setCar: (car) => set({ car }),
      setCharger: (charger) => set({ charger }),
      setIceComparison: (iceComparison) => set({ iceComparison }),
      setPlannerSettings: (plannerSettings) => set({ plannerSettings }),
      addTariff: (tariff) => set((state) => ({ tariffs: [...state.tariffs, tariff] })),
      removeTariff: (id) =>
        set((state) => ({ tariffs: state.tariffs.filter((t) => t.id !== id) })),
      updateTariff: (tariff) =>
        set((state) => ({
          tariffs: state.tariffs.map((t) => (t.id === tariff.id ? tariff : t)),
        })),
    }),
    {
      name: 'energy-calculator-storage',
    }
  )
);
