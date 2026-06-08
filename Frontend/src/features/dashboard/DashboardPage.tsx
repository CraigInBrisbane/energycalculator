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
    <div className="flex flex-col gap-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-bold tracking-tighter text-white">Dashboard</h2>
          <p className="text-slate-400 mt-2 text-lg">Your efficiency and cost overview.</p>
        </div>
        <div className="flex items-center gap-3 glass px-6 py-3 rounded-3xl">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-sm font-bold text-slate-200">System Live</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="EV Cost / 100km"
          value={`$${comparison100km.evCost.toFixed(2)}`}
          icon={Zap}
          accentClass="text-cyan-400"
          description={`${car.avgUsage} kWh used`}
        />
        <StatCard
          title="ICE Cost / 100km"
          value={`$${comparison100km.iceCost.toFixed(2)}`}
          icon={Fuel}
          accentClass="text-slate-400"
          description={`${iceComparison.avgL100km} L used`}
        />
        <StatCard
          title="Savings / 100km"
          value={`$${comparison100km.savings.toFixed(2)}`}
          icon={TrendingDown}
          accentClass="text-emerald-400"
          description={`${((comparison100km.savings / comparison100km.iceCost) * 100).toFixed(0)}% cheaper`}
          highlight
        />
        <StatCard
          title="Est. Yearly Savings"
          value={`$${comparisonYearly.savings.toFixed(0)}`}
          icon={TrendingDown}
          accentClass="text-emerald-400"
          description="Based on 15,000 km/yr"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trip Calculator */}
        <Card title="Trip Calculator" subtitle="Estimate specific route costs" className="lg:col-span-2">
          <div className="flex flex-col gap-10">
            <div className="flex items-end gap-6">
              <div className="flex-1">
                <Input
                  label="Trip Distance (km)"
                  type="number"
                  value={tripDistance}
                  onChange={(e) => setTripDistance(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-600/20">
                <MapPin size={28} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                  <Zap size={80} />
                </div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Electric Trip</p>
                <p className="text-5xl font-bold tracking-tighter text-white glow-cyan mb-6">${tripStats.evCost.toFixed(2)}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Energy</span>
                    <span className="text-slate-200 font-bold">{tripKWh.toFixed(1)} kWh</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${Math.min(100, tripBatteryPct * 2)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 text-right">{tripBatteryPct.toFixed(1)}% battery</p>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-slate-500/10 group-hover:text-slate-500/20 transition-colors">
                  <Fuel size={80} />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Combustion Trip</p>
                <p className="text-5xl font-bold tracking-tighter text-white mb-6">${tripStats.iceCost.toFixed(2)}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Fuel used</span>
                    <span className="text-slate-200 font-bold">{tripLitres.toFixed(1)} Litres</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Savings</span>
                    <span className="text-emerald-400 font-bold glow-emerald">${tripStats.savings.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-8">
          <Card title="Vehicle" className="flex-1">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active Model</p>
                  <p className="text-2xl font-bold text-white tracking-tight">{car.model}</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-2xl">
                  <Gauge className="text-cyan-400" size={24} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 glass rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Capacity</p>
                  <p className="text-lg font-bold">{car.batterySize} <span className="text-xs text-slate-500 font-medium">kWh</span></p>
                </div>
                <div className="p-4 glass rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Avg Usage</p>
                  <p className="text-lg font-bold">{car.avgUsage} <span className="text-xs text-slate-500 font-medium">kW/h</span></p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold flex items-center gap-2 text-slate-300 uppercase tracking-widest">
                  Efficiency Index
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-cyan-500" style={{ width: '30%' }} />
                    <div className="h-full bg-slate-700" style={{ width: '70%' }} />
                  </div>
                  <span className="text-xs font-bold text-cyan-400">Top 30%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Rates" className="flex-1">
            <div className="flex flex-col gap-4">
              {tariffs.map((tariff) => (
                <div key={tariff.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all cursor-default group">
                  <div>
                    <p className="font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">{tariff.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">{tariff.startTime} - {tariff.endTime}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">${tariff.rate.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">per kWh</p>
                  </div>
                </div>
              ))}
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
