import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { getOptimizedSchedule, calculatePower, calculateChargeNeeded } from '../../services/calculationService';
import { format, addDays, setHours, setMinutes } from 'date-fns';
import type { LucideIcon } from 'lucide-react';
import { Clock, Zap, DollarSign, Target, Calendar } from 'lucide-react';

export const PlannerPage = () => {
  const { car, charger, tariffs } = useAppStore();
  
  const [currentPct, setCurrentPct] = useState(22);
  const [targetPct, setTargetPct] = useState(80);
  const [targetTime, setTargetTime] = useState('08:00');
  const [targetDate, setTargetDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

  const schedule = useMemo(() => {
    const powerKW = calculatePower(charger);
    const kWhNeeded = calculateChargeNeeded(car, currentPct, targetPct);
    
    const [hours, minutes] = targetTime.split(':').map(Number);
    let target = new Date(targetDate);
    target = setHours(target, hours);
    target = setMinutes(target, minutes);

    return getOptimizedSchedule(kWhNeeded, powerKW, tariffs, target, car);
  }, [car, charger, tariffs, currentPct, targetPct, targetTime, targetDate]);

  const totalCost = schedule.reduce((sum, s) => sum + s.cost, 0);
  const totalKWh = schedule.reduce((sum, s) => sum + s.kWhCharged, 0);
  const totalRange = schedule.reduce((sum, s) => sum + s.rangeAdded, 0);
  const startTime = schedule.length > 0 ? schedule[0].startTime : null;
  const powerKW = calculatePower(charger);

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h2 className="text-5xl font-bold tracking-tighter text-white">Charge Planner</h2>
        <p className="text-slate-400 mt-2 text-lg">Optimize your schedule for the lowest rates.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <Card title="Charge Goal" subtitle="Set your target parameters">
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Current %"
                type="number"
                min="0"
                max="100"
                value={currentPct}
                onChange={(e) => setCurrentPct(parseInt(e.target.value) || 0)}
              />
              <Input
                label="Target %"
                type="number"
                min="0"
                max="100"
                value={targetPct}
                onChange={(e) => setTargetPct(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-4">
              <Input
                label="Target Date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
              <Input
                label="Target Time"
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
              />
            </div>
            
            <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Zap size={18} className="text-blue-400" />
                <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Live Specs</span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Rate</p>
                  <p className="text-xl font-bold text-white">{powerKW.toFixed(2)} kW</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold uppercase">Need</p>
                  <p className="text-xl font-bold text-white">{totalKWh.toFixed(1)} kWh</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryStat
              icon={Clock}
              accentClass="text-blue-400"
              label="Start Time"
              value={startTime ? format(startTime, 'h:mm a') : 'N/A'}
              subValue={startTime ? format(startTime, 'MMM do') : ''}
            />
            <SummaryStat
              icon={Target}
              accentClass="text-cyan-400"
              label="Range Added"
              value={`+${totalRange.toFixed(0)} km`}
              subValue={`${totalKWh.toFixed(1)} kWh`}
            />
            <SummaryStat
              icon={DollarSign}
              accentClass="text-emerald-400"
              label="Est. Cost"
              value={`$${totalCost.toFixed(2)}`}
              highlight
            />
          </div>

          <Card title="Schedule Breakdown" subtitle="Hourly segments optimized for cost">
            <div className="flex flex-col gap-4">
              {schedule.map((segment, i) => (
                <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
                  <div className="flex flex-col items-center justify-center p-3 bg-slate-800 rounded-xl min-w-[80px]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Window</p>
                    <p className="text-sm font-bold text-white">{format(segment.startTime, 'h:mm')}</p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-white tracking-tight">{format(segment.startTime, 'h:mm a')} — {format(segment.endTime, 'h:mm a')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/10 text-blue-400 border border-blue-500/20 uppercase">
                            {segment.tariff.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                            +{segment.rangeAdded.toFixed(0)} km range
                          </span>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white">${segment.cost.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${(segment.kWhCharged / (totalKWh || 1)) * 100}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 font-bold">{segment.kWhCharged.toFixed(2)} kWh</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {schedule.length === 0 && (
                <div className="py-12 text-center glass rounded-2xl border-dashed border-2">
                  <Calendar className="mx-auto text-slate-700 mb-4" size={48} />
                  <p className="text-slate-500 font-medium">Configure your goal to see the schedule</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SummaryStat = ({ icon: Icon, accentClass, label, value, subValue, highlight }: { icon: LucideIcon, accentClass: string, label: string, value: string, subValue?: string, highlight?: boolean }) => (
  <Card className={`p-6 flex flex-row items-center gap-5 ${highlight ? 'ring-2 ring-emerald-500/20 bg-emerald-500/5' : ''}`}>
    <div className="p-4 bg-slate-800/80 rounded-[1.25rem]">
      <Icon className={accentClass} size={28} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold tracking-tight text-white ${highlight ? 'glow-emerald' : ''}`}>{value}</p>
      {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
    </div>
  </Card>
);
