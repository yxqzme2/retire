import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Events from './pages/Events';
import Assumptions from './pages/Assumptions';
import Scenarios from './pages/Scenarios';
import Projections from './pages/Projections';
import Import from './pages/Import';
import Settings from './pages/Settings';
import Instructions from './pages/Instructions';
import { getScenarios } from './api/scenarios';
import { useAppStore } from './store/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Auto-select the base case scenario on first load if none is selected
function ScenarioAutoSelect() {
  const { activeScenarioId, setActiveScenario } = useAppStore();
  const { data: scenarios } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => getScenarios(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!activeScenarioId && scenarios && scenarios.length > 0) {
      const base = scenarios.find((s) => s.is_base_case) ?? scenarios[0];
      setActiveScenario(base.id);
    }
  }, [scenarios, activeScenarioId, setActiveScenario]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScenarioAutoSelect />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#F1F5F9',
            border: '1px solid #334155',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#0B1120' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#0B1120' } },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/events" element={<Events />} />
            <Route path="/assumptions" element={<Assumptions />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/projections" element={<Projections />} />
            <Route path="/import" element={<Import />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/instructions" element={<Instructions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
