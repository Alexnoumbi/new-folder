import React from 'react';
import { Route, Routes, Navigate, Outlet, useLocation } from 'react-router-dom';
import EnterpriseLayout from '../components/Layout/EnterpriseLayout';
import EnterpriseDashboard from '../pages/Enterprise/EnterpriseDashboard';
import DocumentsPage from '../pages/Enterprise/DocumentsPage';
import MessagesPage from '../pages/Enterprise/MessagesPage';
import ProfilePage from '../pages/Enterprise/ProfilePage';
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

        {/* Documents route */}
        <Route path="documents" element={<DocumentsPage />} />

        {/* Messages route */}
        <Route path="messages" element={<MessagesPage />} />

        {/* Profile route */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};

export default EnterpriseRoutes;
