import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { PlannerPage } from './features/planner/PlannerPage';
import { SettingsPage } from './features/settings/SettingsPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'settings'>('dashboard');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter basename="/energycalculator">
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
