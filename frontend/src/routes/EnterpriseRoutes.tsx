import React from 'react';
import { Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import EnterpriseLayout from '../components/Layout/EnterpriseLayout';
import EnterpriseDashboard from '../pages/Enterprise/EnterpriseDashboard';
import EntrepriseOverview from '../pages/Enterprise/EntrepriseOverview';
import KPIHistory from '../pages/Enterprise/KPIHistory';
import DocumentsPage from '../pages/Enterprise/DocumentsPage';
import EntrepriseAffiliations from '../pages/Enterprise/EntrepriseAffiliations';
import MessagesPage from '../pages/Enterprise/MessagesPage';
import ProfilePage from '../pages/Enterprise/ProfilePage';
import ReportsPage from '../pages/Enterprise/ReportsPage';
import OCRPage from '../pages/Enterprise/OCRPage';
import { useAuth } from '../hooks/useAuth';

const EnterpriseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.typeCompte !== 'entreprise') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const EnterpriseRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <EnterpriseWrapper>
            <EnterpriseLayout>
              <Outlet />
            </EnterpriseLayout>
          </EnterpriseWrapper>
        }
      >
        {/* Default route redirects to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard route */}
        <Route path="dashboard" element={<EnterpriseDashboard />} />

        {/* KPI History route */}
        <Route path="kpi-history" element={<KPIHistory />} />

        {/* Documents route */}
        <Route path="documents" element={<DocumentsPage />} />

        {/* Affiliations route */}
        <Route path="affiliations" element={<EntrepriseAffiliations />} />

        {/* Messages route */}
        <Route path="messages" element={<MessagesPage />} />

        {/* Profile route */}
        <Route path="profile" element={<ProfilePage />} />

        {/* Reports route */}
        <Route path="reports" element={<ReportsPage />} />

        {/* Enterprise Overview route */}
        <Route path="overview" element={<EntrepriseOverview />} />

        {/* OCR route */}
        <Route path="ocr" element={<OCRPage />} />
      </Route>
    </Routes>
  );
};

export default EnterpriseRoutes;
