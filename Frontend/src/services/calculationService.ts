import type { Car, Charger, Tariff, ICEComparison } from '../types';
import { addMinutes, differenceInMinutes, parse, format, startOfDay } from 'date-fns';

export const calculatePower = (charger: Charger): number => {
  return (charger.voltage * charger.amps * charger.phases * charger.efficiency) / 1000;
};

export const calculateChargeNeeded = (car: Car, fromPercent: number, toPercent: number): number => {
  const percentNeeded = Math.max(0, toPercent - fromPercent);
  return (car.batterySize * percentNeeded) / 100;
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
  // 1. Generate all rate segments between startTime and targetTime
  const segments: { startTime: Date, endTime: Date, rate: number, tariff: Tariff }[] = [];
  let currentTime = startTime;
  
  while (currentTime < targetTime) {
    const activeTariff = findTariffAtTime(currentTime, tariffs);
    const nextChange = findNextTariffChange(currentTime, tariffs);
    const segmentEnd = nextChange > targetTime ? targetTime : nextChange;
    
    segments.push({
      startTime: currentTime,
      endTime: segmentEnd,
      rate: activeTariff.rate,
      tariff: activeTariff
    });
    
    currentTime = segmentEnd;
  }
  
  // 2. Sort segments by:
  //    a. Rate (cheapest first)
  //    b. Proximity to targetTime (latest first) to keep charge continuous at the end
  const sortedSegments = [...segments].sort((a, b) => {
    if (a.rate !== b.rate) return a.rate - b.rate;
    return b.startTime.getTime() - a.startTime.getTime();
  });
  
  // 3. Allocate kWh to the best segments
  let remainingKWh = kWhNeeded;
  const plannedSegments: ChargeScheduleSegment[] = [];
  
  for (const segment of sortedSegments) {
    if (remainingKWh <= 0) break;
    
    const durationMinutes = differenceInMinutes(segment.endTime, segment.startTime);
    const capacityKWh = (durationMinutes / 60) * powerKW;
    const amountToCharge = Math.min(remainingKWh, capacityKWh);
    
    if (amountToCharge > 0) {
      // For continuous charging, we want to fix the start/end times based on the segment rate
      // But since we are filling segments out of order, this is tricky.
      // Simplification: Allocate energy from the latest possible cheap time.
      const minutesToCharge = Math.ceil((amountToCharge / powerKW) * 60);
      
      // To ensure it finishes as close to target as possible,
      // we need to reserve the latest time in the cheap segment.
      const chargeStart = addMinutes(segment.endTime, -minutesToCharge);
      
      plannedSegments.push({
        startTime: chargeStart,
        endTime: segment.endTime,
        tariff: segment.tariff,
        kWhCharged: amountToCharge,
        cost: amountToCharge * segment.rate,
        rangeAdded: (amountToCharge / car.avgUsage) * 100,
      });
      remainingKWh -= amountToCharge;
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

const findNextTariffChange = (time: Date, tariffs: Tariff[]): Date => {
  const baseDate = startOfDay(time);
  const changeTimes: Date[] = [];
  
  tariffs.forEach(t => {
    const start = parse(t.startTime, 'HH:mm', baseDate);
    const end = parse(t.endTime, 'HH:mm', baseDate);
    changeTimes.push(start, end, addMinutes(start, 1440), addMinutes(end, 1440));
  });

  return changeTimes
    .filter(t => t > time)
    .sort((a, b) => a.getTime() - b.getTime())[0];
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
