import { useState } from 'react';
import { Layout } from './components/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PlannerPage } from './features/planner/PlannerPage';
import { SettingsPage } from './features/settings/SettingsPage';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'settings'>('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardPage />}
      {activeTab === 'planner' && <PlannerPage />}
      {activeTab === 'settings' && <SettingsPage />}
    </Layout>
  );
}

export default App;
