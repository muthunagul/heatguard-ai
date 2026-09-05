import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastPage } from './pages/ForecastPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { AlertsPage } from './pages/AlertsPage';
import { ExplainPage } from './pages/ExplainPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AboutPage } from './pages/AboutPage';
import { AuthorityPage } from './pages/AuthorityPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/forecast" element={<Layout><ForecastPage /></Layout>} />
          <Route path="/risk-map" element={<Layout><RiskMapPage /></Layout>} />
          <Route path="/alerts" element={<Layout><AlertsPage /></Layout>} />
          <Route path="/explain" element={<Layout><ExplainPage /></Layout>} />
          <Route path="/simulator" element={<Layout><SimulatorPage /></Layout>} />
          <Route path="/methodology" element={<Layout><MethodologyPage /></Layout>} />
          <Route path="/authority" element={<Layout><AuthorityPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
