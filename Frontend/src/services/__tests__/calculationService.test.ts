import { describe, it, expect } from 'vitest';
import { 
  calculatePower, 
  calculateChargeNeeded, 
  calculateDurationMinutes, 
  getOptimizedSchedule, 
  calculateICEComparison 
} from '../calculationService';
import type { Car, Charger, Tariff, ICEComparison } from '../../types';

describe('calculationService - Comprehensive Audit', () => {
  const mockCar: Car = {
    model: 'Tesla Model Y',
    batterySize: 77.5,
    avgUsage: 16, // kWh/100km
  };

  const mockCharger: Charger = {
    amps: 15,
    voltage: 240, // Changed to 240V per user context
    phases: 1,
    efficiency: 0.9,
  };

  const mockTariffs: Tariff[] = [
    { id: '1', name: 'Standard', rate: 0.32, startTime: '06:00', endTime: '00:00' },
    { id: '2', name: 'Off-Peak', rate: 0.08, startTime: '00:00', endTime: '06:00' },
  ];

  it('calculatePower: 240V * 15A * 0.9 efficiency / 1000', () => {
    // (240 * 15 * 0.9) / 1000 = 3.24
    expect(calculatePower(mockCharger)).toBe(3.24);
  });

  it('calculateChargeNeeded: 0% to 100% of 77.5kWh', () => {
    expect(calculateChargeNeeded(mockCar, 0, 100)).toBe(77.5);
  });

  it('calculateChargeNeeded: 50% to 80% of 77.5kWh', () => {
    // 30% of 77.5 = 23.25
    expect(calculateChargeNeeded(mockCar, 50, 80)).toBe(23.25);
  });

  it('calculateDurationMinutes: 23.25 kWh at 3.24 kW', () => {
    // (23.25 / 3.24) * 60 = 430.55... -> ceil -> 431
    expect(calculateDurationMinutes(23.25, 3.24)).toBe(431);
  });

  it('calculateICEComparison: 100km cost at 16kWh/100km and $0.08/kWh', () => {
    // (100 / 100) * 16 * 0.08 = 1.28
    const ice: ICEComparison = { fuelPrice: 2.0, avgL100km: 8 };
    const res = calculateICEComparison(100, ice, mockCar, 0.08);
    expect(res.evCost).toBeCloseTo(1.28, 2);
  });

  it('getOptimizedSchedule: prioritizes Off-Peak (00:00-06:00)', () => {
    // Need 40kWh. Power 3.24kW. Duration ~12.35 hours.
    // Off-Peak provides 6 hours (19.44 kWh).
    // Should fill all 19.44 kWh in Off-Peak, remaining 20.56 in Standard.
    const startTime = new Date('2026-06-08T18:00:00'); // 6 PM
    const targetTime = new Date('2026-06-09T10:00:00'); // 10 AM (16 hours)
    const kWhNeeded = 40;
    const powerKW = 3.24;

    const schedule = getOptimizedSchedule(kWhNeeded, powerKW, mockTariffs, targetTime, mockCar, startTime);

    const offPeak = schedule.filter(s => s.tariff.name === 'Off-Peak');
    const offPeakKWh = offPeak.reduce((sum, s) => sum + s.kWhCharged, 0);
    
    // Expect all available Off-Peak energy used
    expect(offPeakKWh).toBeCloseTo(19.44, 1);
    
    // Expect total energy to match needed
    const totalKWh = schedule.reduce((sum, s) => sum + s.kWhCharged, 0);
    expect(totalKWh).toBeCloseTo(kWhNeeded, 1);
  });
});
