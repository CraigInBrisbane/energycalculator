import { useAppStore } from '../../store/useAppStore';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Trash2, Plus, Car as CarIcon, Zap, Fuel } from 'lucide-react';
import type { Tariff } from '../../types';

export const SettingsPage = () => {
  const { car, charger, iceComparison, tariffs, setCar, setCharger, setIceComparison, addTariff, removeTariff, updateTariff } = useAppStore();

  const handleAddTariff = () => {
    const newTariff: Tariff = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Tariff',
      rate: 0.25,
      startTime: '00:00',
      endTime: '00:00',
    };
    addTariff(newTariff);
  };

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h2 className="text-5xl font-bold tracking-tighter text-white">Settings</h2>
        <p className="text-slate-400 mt-2 text-lg">Configure your vehicle and energy profile.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Car Settings */}
        <Card title="Vehicle" subtitle="Primary EV specifications">
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-4 mb-2">
              <div className="p-3 bg-blue-600 rounded-xl">
                <CarIcon className="text-white" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Selected Profile</p>
                <p className="text-sm text-slate-300 font-medium">{car.model}</p>
              </div>
            </div>
            
            <Input
              label="Car Model"
              value={car.model}
              onChange={(e) => setCar({ ...car, model: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Battery Size (kWh)"
                type="number"
                value={car.batterySize}
                onChange={(e) => setCar({ ...car, batterySize: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Avg. Usage (kWh/100km)"
                type="number"
                value={car.avgUsage}
                onChange={(e) => setCar({ ...car, avgUsage: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>

        {/* Charger Settings */}
        <Card title="Charger" subtitle="Home charging capabilities">
          <div className="flex flex-col gap-6">
             <div className="p-4 bg-cyan-600/10 border border-cyan-500/20 rounded-2xl flex items-center gap-4 mb-2">
              <div className="p-3 bg-cyan-600 rounded-xl">
                <Zap className="text-white" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Active Equipment</p>
                <p className="text-sm text-slate-300 font-medium">{charger.amps}A / {charger.voltage}V</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Voltage (V)"
                type="number"
                value={charger.voltage}
                onChange={(e) => setCharger({ ...charger, voltage: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Amperage (A)"
                type="number"
                value={charger.amps}
                onChange={(e) => setCharger({ ...charger, amps: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phases"
                type="number"
                value={charger.phases}
                onChange={(e) => setCharger({ ...charger, phases: parseInt(e.target.value) || 0 })}
              />
              <Input
                label="Efficiency (0.1 - 1.0)"
                type="number"
                step="0.05"
                value={charger.efficiency}
                onChange={(e) => setCharger({ ...charger, efficiency: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>

        {/* ICE Comparison Settings */}
        <Card title="Combustion Comparison" subtitle="ICE baseline for savings data">
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-slate-800 rounded-2xl flex items-center gap-4 mb-2">
              <div className="p-3 bg-slate-700 rounded-xl">
                <Fuel className="text-slate-300" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Comparison Baseline</p>
                <p className="text-sm text-slate-300 font-medium">{iceComparison.avgL100km}L/100km @ ${iceComparison.fuelPrice}/L</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fuel Price ($/L)"
                type="number"
                step="0.01"
                value={iceComparison.fuelPrice}
                onChange={(e) => setIceComparison({ ...iceComparison, fuelPrice: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label="Avg. L/100km"
                type="number"
                step="0.1"
                value={iceComparison.avgL100km}
                onChange={(e) => setIceComparison({ ...iceComparison, avgL100km: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>

        {/* Tariff Settings */}
        <Card title="Energy Tariffs" subtitle="Manage your time-of-use windows" className="lg:col-span-2">
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              {tariffs.map((tariff) => (
                <div key={tariff.id} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end p-6 rounded-[1.5rem] bg-slate-900/50 border border-slate-800 transition-all hover:border-slate-700">
                  <div className="md:col-span-1">
                    <Input
                      label="Window Name"
                      value={tariff.name}
                      onChange={(e) => updateTariff({ ...tariff, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      label="Rate ($/kWh)"
                      type="number"
                      step="0.001"
                      value={tariff.rate}
                      onChange={(e) => updateTariff({ ...tariff, rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Input
                      label="Start"
                      type="time"
                      value={tariff.startTime}
                      onChange={(e) => updateTariff({ ...tariff, startTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Input
                      label="End"
                      type="time"
                      value={tariff.endTime}
                      onChange={(e) => updateTariff({ ...tariff, endTime: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="danger"
                      className="w-full md:w-auto px-4"
                      onClick={() => removeTariff(tariff.id)}
                      disabled={tariffs.length <= 1}
                    >
                      <Trash2 size={20} />
                      <span className="md:hidden ml-2">Remove</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full py-4 border-dashed border-2 rounded-[1.5rem] hover:bg-slate-900/50" onClick={handleAddTariff}>
              <Plus size={20} /> Add Rate Window
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
