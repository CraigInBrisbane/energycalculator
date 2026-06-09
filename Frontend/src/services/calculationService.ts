import type { Car, Charger, Tariff, ICEComparison } from '../types';
import { addMinutes, differenceInMinutes, format } from 'date-fns';

export const calculatePower = (charger: Charger): number => {
  return (charger.voltage * charger.amps * charger.phases * charger.efficiency) / 1000;
};

export const calculateChargeNeeded = (car: Car, fromPercent: number, toPercent: number): number => {
  console.log('DEBUG calculateChargeNeeded car:', car);
  console.log('DEBUG calculateChargeNeeded from:', fromPercent, 'to:', toPercent);
  const percentNeeded = Math.max(0, toPercent - fromPercent);
  const needed = (car.batterySize * percentNeeded) / 100;
  console.log('DEBUG calculateChargeNeeded result:', needed);
  return needed;
};

export const calculateDurationMinutes = (kWhNeeded: number, powerKW: number): number => {
  if (powerKW === 0) return 0;
  return Math.ceil((kWhNeeded / powerKW) * 60);
};

export interface ChargeScheduleSegment {
  startTime: Date;
  endTime: Date;
  tariff: Tariff;
  kWhCharged: number;
  cost: number;
  rangeAdded: number;
}
export const getOptimizedSchedule = (
  kWhNeeded: number,
  powerKW: number,
  tariffs: Tariff[],
  targetTime: Date,
  car: Car,
  startTime: Date = new Date()
): ChargeScheduleSegment[] => {
  // 1. Generate all boundary changes for the next 48 hours
  const boundaryTimes = new Set<number>();
  boundaryTimes.add(startTime.getTime());
  boundaryTimes.add(targetTime.getTime());

  const tempDate = new Date(startTime);
  tempDate.setHours(0, 0, 0, 0);
  
  // Add boundaries for 2 days to cover crossing midnight
  for (let i = 0; i < 3; i++) {
    tariffs.forEach(t => {
      const [sh, sm] = t.startTime.split(':').map(Number);
      const [eh, em] = t.endTime.split(':').map(Number);
      
      const start = new Date(tempDate);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(tempDate);
      end.setHours(eh, em, 0, 0);
      
      if (start > startTime && start < targetTime) boundaryTimes.add(start.getTime());
      if (end > startTime && end < targetTime) boundaryTimes.add(end.getTime());
    });
    tempDate.setDate(tempDate.getDate() + 1);
  }

  const sortedBoundaries = Array.from(boundaryTimes).sort((a, b) => a - b);
  
  const segments: { startTime: Date, endTime: Date, rate: number, tariff: Tariff }[] = [];
  
  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const sStart = new Date(sortedBoundaries[i]);
    const sEnd = new Date(sortedBoundaries[i+1]);
    const midPoint = new Date((sStart.getTime() + sEnd.getTime()) / 2);
    const activeTariff = findTariffAtTime(midPoint, tariffs);
    
    segments.push({
      startTime: sStart,
      endTime: sEnd,
      rate: activeTariff.rate,
      tariff: activeTariff
    });
  }
  
  // 2. Sort segments by:
  //    a. Rate (cheapest first)
  //    b. Proximity to targetTime (latest first) to keep charge continuous at the end
  const sortedSegments = [...segments].sort((a, b) => {
    if (a.rate !== b.rate) return a.rate - b.rate;
    // Prioritize later times (larger start time)
    return b.startTime.getTime() - a.startTime.getTime();
  });
  
  console.log('DEBUG FINAL Sorted Segments for allocation:', sortedSegments.map(s => ({
    name: s.tariff.name,
    rate: s.rate,
    start: format(s.startTime, 'HH:mm'),
    end: format(s.endTime, 'HH:mm'),
    durationHours: differenceInMinutes(s.endTime, s.startTime) / 60
  })));
  
  // 3. Allocate kWh to the best segments
  let remainingKWh = kWhNeeded;
  const plannedSegments: ChargeScheduleSegment[] = [];
  
  // Check if we can fit everything in one of the segments
  const bestFitSegment = sortedSegments.find(s => {
    const durationMinutes = differenceInMinutes(s.endTime, s.startTime);
    const capacityKWh = (durationMinutes / 60) * powerKW;
    console.log('DEBUG Check segment fit:', s.tariff.name, 'Capacity:', capacityKWh, 'Needed:', remainingKWh);
    return capacityKWh >= remainingKWh;
  });

  if (bestFitSegment) {
    console.log('DEBUG Best fit found:', bestFitSegment.tariff.name);
    const minutesToCharge = Math.ceil((remainingKWh / powerKW) * 60);
    plannedSegments.push({
      startTime: bestFitSegment.startTime,
      endTime: addMinutes(bestFitSegment.startTime, minutesToCharge),
      tariff: bestFitSegment.tariff,
      kWhCharged: remainingKWh,
      cost: remainingKWh * bestFitSegment.rate,
      rangeAdded: (remainingKWh / car.avgUsage) * 100,
    });
  } else {
    console.log('DEBUG No best fit segment, falling back to filling segments');
    for (const segment of sortedSegments) {
      if (remainingKWh <= 0) break;

      const durationMinutes = differenceInMinutes(segment.endTime, segment.startTime);
      const capacityKWh = (durationMinutes / 60) * powerKW;
      const amountToCharge = Math.min(remainingKWh, capacityKWh);
      console.log('DEBUG Filling segment:', segment.tariff.name, 'Capacity:', capacityKWh, 'Charging:', amountToCharge);

      if (amountToCharge > 0) {
        const minutesToCharge = Math.ceil((amountToCharge / powerKW) * 60);
        
        plannedSegments.push({
          startTime: segment.startTime,
          endTime: addMinutes(segment.startTime, minutesToCharge),
          tariff: segment.tariff,
          kWhCharged: amountToCharge,
          cost: amountToCharge * segment.rate,
          rangeAdded: (amountToCharge / car.avgUsage) * 100,
        });
        remainingKWh -= amountToCharge;
      }
    }
  }
  // 4. Sort by startTime for display and merge overlapping or adjacent segments
  return plannedSegments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};


const findTariffAtTime = (time: Date, tariffs: Tariff[]): Tariff => {
  const timeStr = format(time, 'HH:mm');
  
  for (const tariff of tariffs) {
    if (isTimeInRange(timeStr, tariff.startTime, tariff.endTime)) {
      return tariff;
    }
  }
  
  return tariffs.find(t => t.isDefault) || tariffs[0];
};

const isTimeInRange = (time: string, start: string, end: string): boolean => {
  if (start < end) {
    return time >= start && time < end;
  } else {
    // Overlap midnight (e.g., 22:00 to 06:00)
    return time >= start || time < end;
  }
};

export const calculateICEComparison = (
  distance: number,
  ice: ICEComparison,
  car: Car,
  avgCostPerKWh: number
) => {
  const evCost = (distance / 100) * car.avgUsage * avgCostPerKWh;
  const iceCost = (distance / 100) * ice.avgL100km * ice.fuelPrice;
  
  return {
    evCost,
    iceCost,
    savings: iceCost - evCost,
    evCostPerKm: evCost / distance,
    iceCostPerKm: iceCost / distance,
  };
};
