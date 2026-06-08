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
    <div className="flex flex-col gap-10">
      {/* 1. Header & System Status */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-5xl font-bold tracking-tighter text-white">Dashboard</h2>
          <p className="text-slate-400 mt-2 text-lg font-medium">Performance & Cost Analytics</p>
        </div>
        <div className="flex items-center gap-3 glass px-6 py-3 rounded-2xl border-emerald-500/20">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
          <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Active Monitoring</span>
        </div>
      </header>

      {/* 2. Top Info Bar (Vehicle) - Full Width */}
      <section>
        <div className="glass rounded-[2.5rem] p-4 lg:px-8 border-cyan-500/10 bg-cyan-500/[0.02]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-800 rounded-2xl shadow-inner">
                <Gauge className="text-cyan-400" size={32} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Active Vehicle Profile</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{car.model}</h3>
              </div>
            </div>

            <div className="h-px lg:h-12 w-full lg:w-px bg-slate-800" />

            <div className="flex flex-wrap justify-center lg:justify-end gap-12 flex-1">
              <div className="text-center lg:text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Battery Cap</p>
                <p className="text-xl font-bold text-white">{car.batterySize} <span className="text-xs text-slate-500">kWh</span></p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Efficiency</p>
                <p className="text-xl font-bold text-white">{car.avgUsage} <span className="text-xs text-slate-500">kW/h</span></p>
              </div>
              <div className="hidden xl:block min-w-[200px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Efficiency Index</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                    <div className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" style={{ width: '30%' }} />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400">Top 30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Overall Costs Grid */}
      <section className="space-y-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Overall Performance Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="EV Trip Cost"
            value={`$${comparison100km.evCost.toFixed(2)}`}
            icon={Zap}
            accentClass="text-cyan-400"
            description="Per 100km travel"
          />
          <StatCard
            title="ICE Comparison"
            value={`$${comparison100km.iceCost.toFixed(2)}`}
            icon={Fuel}
            accentClass="text-slate-500"
            description="Per 100km travel"
          />
          <StatCard
            title="Net Savings"
            value={`$${comparison100km.savings.toFixed(2)}`}
            icon={TrendingDown}
            accentClass="text-emerald-400"
            description={`${((comparison100km.savings / comparison100km.iceCost) * 100).toFixed(0)}% lower cost`}
            highlight
          />
          <StatCard
            title="Annual Forecast"
            value={`$${comparisonYearly.savings.toFixed(0)}`}
            icon={TrendingDown}
            accentClass="text-emerald-400"
            description="Based on 15k km/yr"
            highlight
          />
        </div>
      </section>

      {/* 4. Trip Calculator & Rates Section */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Precision Route Calculator</h4>
          <Card className="!p-10 bg-slate-900/30">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col md:flex-row md:items-end gap-8">
                <div className="flex-1">
                  <Input
                    label="Target Trip Distance (km)"
                    type="number"
                    value={tripDistance}
                    onChange={(e) => setTripDistance(parseFloat(e.target.value) || 0)}
                    className="text-2xl py-4 font-bold"
                  />
                </div>
                <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-600/30">
                  <MapPin size={36} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-[2.5rem] bg-slate-950/50 border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/40 transition-all">
                  <div className="absolute top-0 right-0 p-8 text-blue-500/5 group-hover:text-blue-500/10 transition-colors">
                    <Zap size={100} />
                  </div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-6">Electric Consumption</p>
                  <p className="text-6xl font-bold tracking-tighter text-white glow-cyan mb-8">${tripStats.evCost.toFixed(2)}</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-semibold tracking-wide">Energy Usage</span>
                      <span className="text-white font-bold">{tripKWh.toFixed(1)} <span className="text-slate-500 text-[10px]">kWh</span></span>
                    </div>
                    <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div className="h-full bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-500" style={{ width: `${Math.min(100, tripBatteryPct * 2)}%` }} />
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Battery Impact</span>
                       <span className="text-xs text-cyan-400 font-bold">{tripBatteryPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-slate-950/50 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="absolute top-0 right-0 p-8 text-slate-500/5 group-hover:text-slate-500/10 transition-colors">
                    <Fuel size={100} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Internal Combustion</p>
                  <p className="text-6xl font-bold tracking-tighter text-white mb-8">${tripStats.iceCost.toFixed(2)}</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-semibold tracking-wide">Fuel Estimate</span>
                      <span className="text-white font-bold">{tripLitres.toFixed(1)} <span className="text-slate-500 text-[10px]">Litres</span></span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[1.5rem] mt-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Route Savings</span>
                      <span className="text-2xl font-bold text-emerald-400 glow-emerald">${tripStats.savings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Rates Section - Sidebar on Desktop */}
        <div className="space-y-6">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-2">Active Tariffs</h4>
          <Card className="!p-6 h-full border-slate-800/30">
            <div className="flex flex-col gap-4">
              {tariffs.map((tariff) => (
                <div key={tariff.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-950/40 border border-slate-800 hover:border-slate-600 transition-all group">
                  <div>
                    <p className="font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{tariff.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-[0.15em]">{tariff.startTime} — {tariff.endTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">${tariff.rate.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase">per kWh</p>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/50">
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 text-center">Average Rate</p>
                 <p className="text-2xl font-bold text-white text-center tracking-tighter">${avgElectricityRate.toFixed(3)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, accentClass, description, highlight }: { title: string, value: string, icon: LucideIcon, accentClass: string, description: string, highlight?: boolean }) => (
  <Card className={highlight ? "ring-2 ring-emerald-500/20 bg-emerald-500/5" : ""}>
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-slate-800/80 rounded-2xl text-slate-400">
        <Icon className={accentClass} size={24} />
      </div>
      {highlight && (
        <div className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">
          High Perf
        </div>
      )}
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">{title}</p>
    <p className={clsx("text-4xl font-bold mb-2 tracking-tighter text-white", highlight && "glow-emerald")}>{value}</p>
    <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
      {description}
    </p>
  </Card>
);
