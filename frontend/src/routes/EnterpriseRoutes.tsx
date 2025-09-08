import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import EnterpriseLayout from '../layouts/EnterpriseLayout';
import PrivateRoute from '../components/PrivateRoute';
import EnterpriseDashboard from '../pages/Enterprise/EnterpriseDashboard';
import EntrepriseOverview from '../pages/Enterprise/EntrepriseOverview';
import ProfilePage from '../pages/Enterprise/ProfilePage';
import MonEntreprise from '../pages/Enterprise/MonEntreprise';
import EntrepriseAffiliations from '../pages/Enterprise/EntrepriseAffiliations';
import DocumentsPage from '../pages/Enterprise/DocumentsPage';
import KPIHistoryPage from '../pages/Enterprise/KPIHistoryPage';
import ControlsPage from '../pages/Enterprise/ControlsPage';
import MessagesPage from '../pages/Enterprise/MessagesPage';
import ReportsPage from '../pages/Enterprise/ReportsPage';

const EnterpriseRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        element={
          <PrivateRoute>
            <EnterpriseLayout>
              <Outlet />
            </EnterpriseLayout>
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<EnterpriseDashboard />} />
        <Route path="overview" element={<EntrepriseOverview />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="company" element={<MonEntreprise />} />
        <Route path="affiliations" element={<EntrepriseAffiliations />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="kpi-history" element={<KPIHistoryPage />} />
        <Route path="controls" element={<ControlsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
};

export default EnterpriseRoutes; 