import { describe, it, expect } from 'vitest';
import { calculateICEComparison } from '../calculationService';
import type { Car, ICEComparison } from '../../types';

describe('calculationService - Trip Cost Audit', () => {
  it('calculateICEComparison: correctly calculates EV trip cost', () => {
    const mockCar: Car = {
      model: 'Tesla',
      batterySize: 77.5,
      avgUsage: 15,
    };
    const mockICE: ICEComparison = { fuelPrice: 2.0, avgL100km: 8 };
    
    // Trip: 100km, Usage: 15kWh/100km, Cost: $0.20/kWh
    // Formula: (100 / 100) * 15 * 0.20 = 3.00
    const res = calculateICEComparison(100, mockICE, mockCar, 0.20);
    expect(res.evCost).toBe(3.00);
  });
});
