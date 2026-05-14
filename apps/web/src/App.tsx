import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { CaissePage } from './pages/Caisse';
import { ProduitsPage } from './pages/Produits';
import { StockPage } from './pages/Stock';
import { PeremptionsPage } from './pages/Peremptions';
import { VentesPage } from './pages/Ventes';
import { ClientsPage } from './pages/Clients';
import { OrdonnancesPage } from './pages/Ordonnances';
import { AchatsPage } from './pages/Achats';
import { ParametresPage } from './pages/Parametres';
import { MainLayout } from './components/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/caisse" element={<CaissePage />} />
        <Route path="/produits" element={<ProduitsPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/peremptions" element={<PeremptionsPage />} />
        <Route path="/ventes" element={<VentesPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/ordonnances" element={<OrdonnancesPage />} />
        <Route
          path="/achats"
          element={
            <ProtectedRoute roles={['ADMIN', 'PHARMACIEN_TITULAIRE', 'PHARMACIEN_ADJOINT']}>
              <AchatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parametres"
          element={
            <ProtectedRoute roles={['ADMIN', 'PHARMACIEN_TITULAIRE']}>
              <ParametresPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
