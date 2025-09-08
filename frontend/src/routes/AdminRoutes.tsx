import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import PrivateRoute from '../components/PrivateRoute';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminMonitoring from '../pages/Admin/AdminMonitoring';
import AdminReports from '../pages/Admin/AdminReports';
import AdminSecurity from '../pages/Admin/AdminSecurity';
import AdminSystem from '../pages/Admin/AdminSystem';
import AdminAudit from '../pages/Admin/AdminAudit';
import AdminAuditTrail from '../pages/Admin/AdminAuditTrail';
import AdminCompliance from '../pages/Admin/AdminCompliance';
import AdminKPIs from '../pages/Admin/AdminKPIs';
import AdminPortfolio from '../pages/Admin/AdminPortfolio';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        element={
          <PrivateRoute>
            <AdminLayout>
              <Outlet />
            </AdminLayout>
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="monitoring" element={<AdminMonitoring />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="system" element={<AdminSystem />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="audit-trail" element={<AdminAuditTrail />} />
        <Route path="compliance" element={<AdminCompliance />} />
        <Route path="kpis" element={<AdminKPIs />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
