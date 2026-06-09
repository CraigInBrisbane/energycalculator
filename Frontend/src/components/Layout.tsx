import { useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, LayoutDashboard, Calculator } from 'lucide-react';
import { VersionFooter } from './VersionFooter';

interface LayoutProps {
  children: ReactNode;
  activeTab: 'dashboard' | 'planner' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'planner' | 'settings') => void;
}

export const Layout = ({ children, activeTab, setActiveTab }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sync tab state with URL after mount/location change
  useEffect(() => {
    const tab = location.pathname.replace('/', '') as 'dashboard' | 'planner' | 'settings';
    if (tab && activeTab !== tab && (tab === 'dashboard' || tab === 'planner' || tab === 'settings')) {
      setActiveTab(tab);
    }
  }, [location.pathname, activeTab, setActiveTab]);

  const handleNavigate = (tab: 'dashboard' | 'planner' | 'settings') => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 md:pb-0 md:pl-24 lg:pl-72">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-full w-24 lg:w-72 glass border-r-0 hidden md:flex flex-col p-6 z-40">
        <div className="flex items-center gap-3 mb-12 lg:px-4">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Calculator className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tighter hidden lg:block">EnergyCalc</h1>
        </div>
        
        <nav className="flex flex-col gap-3">
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activeTab === 'dashboard'}
            onClick={() => handleNavigate('dashboard')}
          />
          <NavItem
            icon={Calculator}
            label="Planner"
            active={activeTab === 'planner'}
            onClick={() => handleNavigate('planner')}
          />
          <NavItem
            icon={Settings}
            label="Settings"
            active={activeTab === 'settings'}
            onClick={() => handleNavigate('settings')}
          />
        </nav>

        <div className="mt-auto lg:px-4">
          <div className="glass p-4 rounded-2xl hidden lg:block">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">PRO VERSION</p>
            <p className="text-sm text-slate-300">Unlock advanced analytics</p>
          </div>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="fixed bottom-6 left-6 right-6 glass p-2 rounded-[2rem] flex justify-around md:hidden z-50 shadow-2xl">
        <MobileNavItem
          icon={LayoutDashboard}
          active={activeTab === 'dashboard'}
          onClick={() => handleNavigate('dashboard')}
        />
        <MobileNavItem
          icon={Calculator}
          active={activeTab === 'planner'}
          onClick={() => handleNavigate('planner')}
        />
        <MobileNavItem
          icon={Settings}
          active={activeTab === 'settings'}
          onClick={() => handleNavigate('settings')}
        />
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-12 lg:p-16">
        {children}
        <VersionFooter />
      </main>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-4 rounded-2xl font-semibold transition-all duration-300 group ${
      active
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
        : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
    }`}
  >
    <Icon size={24} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
    <span className="hidden lg:block">{label}</span>
  </button>
);

const MobileNavItem = ({ icon: Icon, active, onClick }: { icon: LucideIcon, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-2xl transition-all duration-300 ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400'
    }`}
  >
    <Icon size={24} />
  </button>
);
