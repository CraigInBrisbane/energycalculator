import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { getOptimizedSchedule, calculatePower, calculateChargeNeeded, calculateDurationMinutes } from '../../services/calculationService';
import { format, addDays, setHours, setMinutes, addMinutes } from 'date-fns';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Clock, DollarSign, Target, Calendar, Battery, Info } from 'lucide-react';

export const PlannerPage = () => {
  const { car, charger, tariffs, plannerSettings, setPlannerSettings } = useAppStore();
  
  const [currentPct, setCurrentPct] = useState(plannerSettings.currentPct.toString());
  const [targetPct, setTargetPct] = useState(plannerSettings.targetPct.toString());
  const [targetTime, setTargetTime] = useState('08:00');
  const [targetDate, setTargetDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [error, setError] = useState<string | null>(null);

  const validateAndSave = (c: string, t: string) => {
    const cNum = parseInt(c) || 0;
    const tNum = parseInt(t) || 0;

    if (cNum < 0 || cNum > 100 || tNum < 0 || tNum > 100 || cNum >= tNum) {
      setError("Please ensure 0-100% and Current < Target");
      return;
    }
    
    setError(null);
    setPlannerSettings({ currentPct: cNum, targetPct: tNum });
  };

  const schedule = useMemo(() => {
    const powerKW = calculatePower(charger);
    // Use stored validated settings for calculation
    const kWhNeeded = calculateChargeNeeded(car, plannerSettings.currentPct, plannerSettings.targetPct);
    
    const [hours, minutes] = targetTime.split(':').map(Number);
    let target = new Date(targetDate);
    target = setHours(target, hours);
    target = setMinutes(target, minutes);

    return getOptimizedSchedule(kWhNeeded, powerKW, tariffs, target, car, new Date());
  }, [car, charger, tariffs, plannerSettings.currentPct, plannerSettings.targetPct, targetTime, targetDate]);
const totalCost = schedule.reduce((sum, s) => sum + s.cost, 0);
const totalKWh = schedule.reduce((sum, s) => sum + s.kWhCharged, 0);
const totalRange = schedule.reduce((sum, s) => sum + s.rangeAdded, 0);

const kWhNeeded = calculateChargeNeeded(car, plannerSettings.currentPct, plannerSettings.targetPct);
const totalDurationMinutes = calculateDurationMinutes(kWhNeeded, calculatePower(charger));
const completionTime = addMinutes(new Date(), totalDurationMinutes);

const isGoalUnmet = totalKWh < kWhNeeded - 0.1; // Small epsilon for float comparison

const startTime = schedule.length > 0 ? schedule[0].startTime : null;
const powerKW = calculatePower(charger);

return (
  <div className="flex flex-col gap-8 max-w-[1600px] mx-auto">
    {/* 1. Header */}
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tighter text-white">Charge Planner</h2>
        <p className="text-slate-500 text-sm font-medium">Smart Scheduling & Cost Optimization</p>
      </div>
    </header>

    {/* Warning Banner */}
    {isGoalUnmet && (
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 text-amber-400">
         <Info size={24} />
         <div>
           <p className="font-bold">Charging Goal Not Met</p>
           <p className="text-xs">Based on your charger's power ({powerKW.toFixed(1)} kW), you cannot reach your target % by the selected time. Only {totalKWh.toFixed(1)} kWh can be added by {targetTime} {targetDate}. To get your required target charge, it will complete at approximately <span className="font-bold">{format(completionTime, 'HH:mm')}</span>.</p>

         </div>
      </div>
    )}

      {/* 2. Full Width Charge Goal Panel */}
      <section className="space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Target Configuration</h4>
        <Card className="!p-6 bg-blue-600/[0.02] border-blue-500/10">
          <div className="flex flex-col gap-8">
            {/* Header Row */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 text-white">
                <Target size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Primary Goal</p>
                <h3 className="text-sm font-bold text-white uppercase tracking-tighter">Charge Settings</h3>
              </div>
            </div>

            {/* Inputs Row */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end gap-5 w-full">
                  <div className="flex-1 min-w-[100px]">
                    <Input
                      label="Current %"
                      type="number"
                      min="0"
                      max="100"
                      value={currentPct}
                      onChange={(e) => {
                        setCurrentPct(e.target.value);
                        validateAndSave(e.target.value, targetPct);
                      }}
                      className={clsx("text-lg py-2 font-bold", error && "border-red-500")}
                    />
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <Input
                      label="Target %"
                      type="number"
                      min="0"
                      max="100"
                      value={targetPct}
                      onChange={(e) => {
                        setTargetPct(e.target.value);
                        validateAndSave(currentPct, e.target.value);
                      }}
                      className={clsx("text-lg py-2 font-bold", error && "border-red-500")}
                    />
                  </div>
                  <div className="flex-[1.5] min-w-[160px]">
                    <Input
                      label="Target Date"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="text-lg py-2 font-bold"
                    />
                  </div>
                  <div className="flex-1 min-w-[110px]">
                    <Input
                      label="Target Time"
                      type="time"
                      value={targetTime}
                      onChange={(e) => setTargetTime(e.target.value)}
                      className="text-lg py-2 font-bold"
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-red-400 text-xs font-bold">{error}</p>
                )}
            </div>
          </div>
        </Card>
      </section>

      {/* 3. Results Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryStat
          icon={Clock}
          accentClass="text-blue-400"
          label="Begin charging at"
          value={startTime ? format(startTime, 'HH:mm') : 'N/A'}
          subValue={startTime ? format(startTime, 'MMM do, yyyy') : ''}
        />
        <SummaryStat
          icon={Battery}
          accentClass="text-cyan-400"
          label="Range to add"
          value={`+${totalRange.toFixed(0)} km`}
          subValue={`${totalKWh.toFixed(1)} kWh energy`}
        />
        <SummaryStat
          icon={DollarSign}
          accentClass="text-emerald-400"
          label="Total charge cost"
          value={`$${totalCost.toFixed(2)}`}
          highlight
        />
      </div>

      {/* 4. Schedule Breakdown */}
      <section className="space-y-6">
        <div className="flex items-center justify-between ml-2">
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Optimized Schedule Timeline</h4>
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest italic">Lowest Cost Strategy Applied</span>
           </div>
        </div>
        
        <Card className="!p-0 overflow-hidden border-slate-800/40">
          <div className="flex flex-col divide-y divide-slate-800/50">
            {schedule.map((segment, i) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center gap-6 p-6 hover:bg-slate-900/30 transition-all group">
                <div className="flex items-center gap-6 md:min-w-[200px]">
                <div className="flex flex-col items-center justify-center p-3 bg-slate-900 rounded-xl border border-slate-800 min-w-[70px]">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-1">Start</p>
                  <p className="text-sm font-bold text-white leading-none">{format(segment.startTime, 'HH:mm')}</p>
                </div>
                <div className="h-px w-4 bg-slate-800" />
                <div className="flex flex-col items-center justify-center p-3 bg-slate-900 rounded-xl border border-slate-800 min-w-[70px]">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter leading-none mb-1">End</p>
                  <p className="text-sm font-bold text-white leading-none">{format(segment.endTime, 'HH:mm')}</p>
                </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 lg:gap-12">
                <div className="md:min-w-[140px]">
                  <p className="text-sm font-bold text-white tracking-tight mb-1">{segment.tariff.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{format(segment.startTime, 'HH:mm')} — {format(segment.endTime, 'HH:mm')}</p>
                </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-slate-500 group-hover:text-blue-400 transition-colors">Session Energy</span>
                      <span className="text-white">+{segment.rangeAdded.toFixed(0)} km added</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-500" style={{ width: `${(segment.kWhCharged / (totalKWh || 1)) * 100}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium">
                       <span>{segment.kWhCharged.toFixed(2)} kWh produced</span>
                       <span className="text-emerald-400/80 tracking-tighter italic">Optimized</span>
                    </div>
                  </div>

                  <div className="md:text-right min-w-[100px]">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Segment Cost</p>
                    <p className="text-xl font-bold text-white tracking-tighter">${segment.cost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {schedule.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="p-6 bg-slate-900 rounded-[2.5rem] mb-6 border border-slate-800 shadow-2xl">
                  <Calendar className="text-slate-700" size={48} />
                </div>
                <h5 className="text-lg font-bold text-white mb-2">Awaiting Configuration</h5>
                <p className="text-slate-500 max-w-xs mx-auto">Please adjust your current and target charge levels to generate an optimized charging timeline.</p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

const SummaryStat = ({ icon: Icon, accentClass, label, value, subValue, highlight }: { icon: LucideIcon, accentClass: string, label: string, value: string, subValue?: string, highlight?: boolean }) => (
  <Card className={clsx("!p-5 border-slate-800/40", highlight && "bg-emerald-500/[0.03] border-emerald-500/10")}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-800/60 rounded-xl text-slate-400">
        <Icon className={accentClass} size={20} />
      </div>
      {highlight && (
        <div className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/20 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          Optimal
        </div>
      )}
    </div>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className={clsx("text-3xl font-bold tracking-tighter text-white leading-none", highlight && "glow-emerald")}>{value}</p>
    {subValue && (
      <p className="text-[11px] text-slate-600 font-medium mt-2 tracking-tight">
        {subValue}
      </p>
    )}
  </Card>
);
