import { describe, it, expect } from 'vitest';
import { calculateChargeNeeded } from '../calculationService';
import type { Car } from '../../types';

describe('calculationService - Energy Calculation', () => {
  it('correctly calculates 100% charge for a 77.5kWh battery', () => {
    const mockCar: Car = {
      model: 'Test',
      batterySize: 77.5,
      avgUsage: 16,
    };
    
    // 0% to 100% should equal the full battery size
    const needed = calculateChargeNeeded(mockCar, 0, 100);
    expect(needed).toBe(77.5);
  });
});
