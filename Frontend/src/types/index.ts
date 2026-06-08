export interface Tariff {
  id: string;
  name: string;
  rate: number; // Cost per kWh
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isDefault?: boolean;
}

export interface Car {
  model: string;
  batterySize: number; // kWh
  avgUsage: number; // kWh/100km
}

export interface Charger {
  amps: number;
  voltage: number;
  phases: number;
  efficiency: number; // 0.1 to 1.0 (e.g., 0.9 for 90%)
}

export interface ICEComparison {
  fuelPrice: number; // Cost per Litre
  avgL100km: number; // Litres/100km
}

export interface AppState {
  car: Car;
  charger: Charger;
  tariffs: Tariff[];
  iceComparison: ICEComparison;
}
