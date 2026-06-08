import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { calculateICEComparison } from '../../services/calculationService';
import type { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Fuel, Zap, TrendingDown, MapPin, Gauge } from 'lucide-react';

export const DashboardPage = () => {
  const { car, iceComparison, tariffs } = useAppStore();
  const [tripDistance, setTripDistance] = useState(37);

  const avgElectricityRate = tariffs.reduce((sum, t) => sum + t.rate, 0) / tariffs.length;
  
  const comparison100km = calculateICEComparison(100, iceComparison, car, avgElectricityRate);
  const comparisonYearly = calculateICEComparison(15000, iceComparison, car, avgElectricityRate);
  
  const tripStats = calculateICEComparison(tripDistance, iceComparison, car, avgElectricityRate);
  const tripKWh = (tripDistance / 100) * car.avgUsage;
  const tripLitres = (tripDistance / 100) * iceComparison.avgL100km;
  const tripBatteryPct = (tripKWh / car.batterySize) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      {/* 1. Compact Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tighter text-white">Dashboard</h2>
          <p className="text-slate-500 text-sm font-medium">Efficiency & Cost Overview</p>
        </div>
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border-emerald-500/10">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
        </div>
      </header>

      {/* 2. Slim Vehicle Bar */}
      <section>
        <div className="glass rounded-[1.25rem] p-3 lg:px-6 border-cyan-500/10 bg-cyan-500/[0.01]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Gauge className="text-cyan-400" size={20} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Profile</p>
                <h3 className="text-sm font-bold text-white tracking-tight leading-none">{car.model}</h3>
              </div>
            </div>

            <div className="hidden lg:block h-8 w-px bg-slate-800/50" />

            <div className="flex items-center gap-8">
              <div className="text-center lg:text-left">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Battery</p>
                <p className="text-sm font-bold text-white">{car.batterySize} <span className="text-[10px] text-slate-500 font-medium">kWh</span></p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Efficiency</p>
                <p className="text-sm font-bold text-white">{car.avgUsage} <span className="text-[10px] text-slate-500 font-medium">kW/h</span></p>
              </div>
              <div className="hidden sm:block min-w-[140px]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 text-center lg:text-left">Index</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" style={{ width: '30%' }} />
                  </div>
                  <span className="text-[9px] font-bold text-cyan-400 whitespace-nowrap">30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Data Grid - Grouped for Visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Overall Stats + Trip Calculator */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* Grouped Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="EV cost/100kms"
              value={`$${comparison100km.evCost.toFixed(2)}`}
              icon={Zap}
              accentClass="text-cyan-400"
              description="Per 100km"
            />
            <StatCard
              title="ICE cost/100kms"
              value={`$${comparison100km.iceCost.toFixed(2)}`}
              icon={Fuel}
              accentClass="text-slate-500"
              description="Per 100km"
            />
            <StatCard
              title="EV Savings per 100kms"
              value={`$${comparison100km.savings.toFixed(2)}`}
              icon={TrendingDown}
              accentClass="text-emerald-400"
              description={`${((comparison100km.savings / comparison100km.iceCost) * 100).toFixed(0)}% lower`}
              highlight
            />
            <StatCard
              title="EV Yearly Savings"
              value={`$${comparisonYearly.savings.toFixed(0)}`}
              icon={TrendingDown}
              accentClass="text-emerald-400"
              description="Based on 15k km"
              highlight
            />
          </div>

          {/* Compact Trip Calculator */}
          <Card title="Trip Calculator" subtitle="Specific route analysis" className="bg-slate-900/20">
            <div className="flex flex-col gap-6">
              <div className="flex items-end gap-4 max-w-sm">
                <div className="flex-1">
                  <Input
                    label="Distance (km)"
                    type="number"
                    value={tripDistance}
                    onChange={(e) => setTripDistance(parseFloat(e.target.value) || 0)}
                    className="text-lg py-2 font-bold"
                  />
                </div>
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
                  <MapPin size={24} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-[1.25rem] bg-slate-950/40 border border-blue-500/10 relative overflow-hidden group">
                  <div className="absolute -top-2 -right-2 p-4 text-blue-500/5">
                    <Zap size={60} />
                  </div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Total EV Trip Cost</p>
                  <p className="text-4xl font-bold tracking-tighter text-white glow-cyan mb-4">${tripStats.evCost.toFixed(2)}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium tracking-wide">Energy</span>
                      <span className="text-slate-200 font-bold">{tripKWh.toFixed(1)} kWh</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5">
                      <div className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all duration-500" style={{ width: `${Math.min(100, tripBatteryPct * 2)}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                       <span className="text-slate-500 font-bold uppercase tracking-widest">Battery</span>
                       <span className="text-cyan-400 font-bold">{tripBatteryPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-[1.25rem] bg-slate-950/40 border border-slate-800 relative overflow-hidden group">
                  <div className="absolute -top-2 -right-2 p-4 text-slate-500/5">
                    <Fuel size={60} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total ICE Trip Cost</p>
                  <p className="text-4xl font-bold tracking-tighter text-white mb-4">${tripStats.iceCost.toFixed(2)}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium tracking-wide">Fuel</span>
                      <span className="text-slate-200 font-bold">{tripLitres.toFixed(1)} L</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl mt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Savings</span>
                      <span className="text-lg font-bold text-emerald-400 glow-emerald">${tripStats.savings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Tariffs - More compact list */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card title="Active Tariffs" className="h-full border-slate-800/20">
            <div className="flex flex-col gap-3">
              {tariffs.map((tariff) => (
                <div key={tariff.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/50 hover:border-slate-700 transition-all group">
                  <div>
                    <p className="text-xs font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{tariff.name}</p>
                    <p className="text-[9px] text-slate-600 font-bold mt-0.5 uppercase tracking-widest">{tariff.startTime} — {tariff.endTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white leading-none">${tariff.rate.toFixed(2)}</p>
                    <p className="text-[8px] text-slate-700 font-bold uppercase mt-0.5">kWh</p>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-3 rounded-xl bg-slate-900/30 border border-slate-800/40">
                 <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1 text-center">Average Rate</p>
                 <p className="text-lg font-bold text-slate-300 text-center tracking-tighter">${avgElectricityRate.toFixed(3)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, accentClass, description, highlight }: { title: string, value: string, icon: LucideIcon, accentClass: string, description: string, highlight?: boolean }) => (
  <Card className={clsx("!p-4 border-slate-800/40", highlight && "bg-emerald-500/[0.03] border-emerald-500/10")}>
    <div className="flex justify-between items-start mb-3">
      <div className="p-1.5 bg-slate-800/60 rounded-lg text-slate-400">
        <Icon className={accentClass} size={16} />
      </div>
      {highlight && (
        <div className="text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
          <TrendingDown size={14} />
        </div>
      )}
    </div>
    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{title}</p>
    <p className={clsx("text-2xl font-bold tracking-tighter text-white leading-none", highlight && "glow-emerald")}>{value}</p>
    <p className="text-[10px] text-slate-600 font-medium mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
      {description}
    </p>
  </Card>
);
