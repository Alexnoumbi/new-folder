import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout';
import PrivateRoute from '../components/PrivateRoute';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminMonitoring from '../pages/Admin/AdminMonitoring';
import AdminReports from '../pages/Admin/AdminReports';
import AdminAudit from '../pages/Admin/AdminAudit';
import AdminCompliance from '../pages/Admin/AdminCompliance';
import AdminKPIs from '../pages/Admin/AdminKPIs';
import AdminPortfolio from '../pages/Admin/AdminPortfolio';
import AdminSettings from '../pages/Admin/AdminSettings';
import AdminOCR from '../pages/Admin/AdminOCR';
import AdminResultsFramework from '../pages/Admin/AdminResultsFramework';
import AdminPerformance from '../pages/Admin/AdminPerformance';
import AdminProjects from '../pages/Admin/AdminProjects';
import AdminBudget from '../pages/Admin/AdminBudget';
import AdminSubmissions from '../pages/Admin/AdminSubmissions';
import AdminIndicators from '../pages/Admin/AdminIndicators';
import AdminDiscussions from '../pages/Admin/AdminDiscussions';
import AdminWorkflows from '../pages/Admin/AdminWorkflows';
import AdminApprovals from '../pages/Admin/AdminApprovals';
import AdminScheduledExports from '../pages/Admin/AdminScheduledExports';
import AdminReportTemplates from '../pages/Admin/AdminReportTemplates';
import AdminEntreprises from '../pages/Admin/AdminEntreprises';
import AdminFormBuilder from '../pages/Admin/AdminFormBuilder';

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
        <Route path="performance" element={<AdminPerformance />} />
        <Route path="entreprises" element={<AdminEntreprises />} />
        <Route path="form-builder" element={<AdminFormBuilder />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="monitoring" element={<AdminMonitoring />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit" element={<AdminAudit />} />
        <Route path="compliance" element={<AdminCompliance />} />
        <Route path="kpis" element={<AdminKPIs />} />
        <Route path="portfolio" element={<AdminPortfolio />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="ocr" element={<AdminOCR />} />
        <Route path="results-framework" element={<AdminResultsFramework />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="budget" element={<AdminBudget />} />
        <Route path="submissions" element={<AdminSubmissions />} />
        <Route path="indicators" element={<AdminIndicators />} />
        <Route path="discussions" element={<AdminDiscussions />} />
        <Route path="workflows" element={<AdminWorkflows />} />
        <Route path="approvals" element={<AdminApprovals />} />
        <Route path="scheduled-exports" element={<AdminScheduledExports />} />
        <Route path="report-templates" element={<AdminReportTemplates />} />
      </Route>
    </Routes>
  );
};


export default AdminRoutes;
