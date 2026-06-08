import { describe, it, expect } from 'vitest';
import { calculatePower, calculateChargeNeeded, calculateDurationMinutes, getOptimizedSchedule } from '../calculationService';
import type { Car, Charger, Tariff } from '../../types';

describe('calculationService', () => {
  const mockCar: Car = {
    model: 'Tesla',
    batterySize: 75,
    avgUsage: 15,
  };

  const mockCharger: Charger = {
    amps: 15,
    voltage: 220,
    phases: 1,
    efficiency: 1.0,
  };

  const mockTariffs: Tariff[] = [
    { id: '1', name: 'Day', rate: 0.30, startTime: '06:00', endTime: '00:00', isDefault: true },
    { id: '2', name: 'Night', rate: 0.10, startTime: '00:00', endTime: '06:00' },
  ];

  it('calculates power correctly', () => {
    expect(calculatePower(mockCharger)).toBe(3.3);
  });

  it('calculates charge needed correctly', () => {
    expect(calculateChargeNeeded(mockCar, 20, 80)).toBe(45); // 60% of 75
  });

  it('calculates duration in minutes correctly', () => {
    expect(calculateDurationMinutes(33, 3.3)).toBe(600); // 10 hours
  });

  it('generates an optimized schedule across tariff changes', () => {
    const startTime = new Date('2026-06-08T04:00:00'); // 4 AM
    const targetTime = new Date('2026-06-08T07:00:00'); // 7 AM
    const kWhNeeded = 3.3; // 1 hour at 3.3 kW
    const powerKW = 3.3;

    const schedule = getOptimizedSchedule(kWhNeeded, powerKW, mockTariffs, targetTime, mockCar, startTime);

    expect(schedule).toHaveLength(1);

    // Only one segment in Night rate (4am-5am)
    expect(schedule[0].tariff.id).toBe('2');
    expect(schedule[0].cost).toBeCloseTo(3.3 * 0.10);
  });
  it('handles midnight tariff transition correctly', () => {
    const startTime = new Date('2026-06-07T22:00:00'); // 10 PM
    const targetTime = new Date('2026-06-08T02:00:00'); // 2 AM
    const kWhNeeded = 13.2; // 4 hours at 3.3 kW
    const powerKW = 3.3;

    const schedule = getOptimizedSchedule(kWhNeeded, powerKW, mockTariffs, targetTime, mockCar, startTime);


    expect(schedule).toHaveLength(2);
    
    // Segment 1: 10 PM to 00:00 (Day rate)
    expect(schedule[0].tariff.id).toBe('1');
    expect(schedule[0].cost).toBeCloseTo(6.6 * 0.30);
    
    // Segment 2: 00:00 to 02:00 (Night rate)
    expect(schedule[1].tariff.id).toBe('2');
    expect(schedule[1].cost).toBeCloseTo(6.6 * 0.10);
  });
});
