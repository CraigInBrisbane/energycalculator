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
  car: Car
): ChargeScheduleSegment[] => {
  // Simple strategy: start as late as possible to finish at targetTime
  
  const totalDurationMinutes = calculateDurationMinutes(kWhNeeded, powerKW);
  const startTime = addMinutes(targetTime, -totalDurationMinutes);
  
  const segments: ChargeScheduleSegment[] = [];
  let currentTime = startTime;
  let remainingMinutes = totalDurationMinutes;

  while (remainingMinutes > 0) {
    const activeTariff = findTariffAtTime(currentTime, tariffs);
    const nextTariffChange = findNextTariffChange(currentTime, tariffs);
    
    const minutesToChange = differenceInMinutes(nextTariffChange, currentTime);
    const durationInThisSegment = Math.min(remainingMinutes, minutesToChange);
    
    const segmentEndTime = addMinutes(currentTime, durationInThisSegment);
    const kWhInSegment = (durationInThisSegment / 60) * powerKW;
    
    segments.push({
      startTime: currentTime,
      endTime: segmentEndTime,
      tariff: activeTariff,
      kWhCharged: kWhInSegment,
      cost: kWhInSegment * activeTariff.rate,
      rangeAdded: (kWhInSegment / car.avgUsage) * 100,
    });

    currentTime = segmentEndTime;
    remainingMinutes -= durationInThisSegment;
  }

  return segments;
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
