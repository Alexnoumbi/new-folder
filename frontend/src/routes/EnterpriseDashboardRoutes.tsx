import React from 'react';
import { Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import EnterpriseDashboard from '../pages/Enterprise/EnterpriseDashboard';
import KPIHistory from '../pages/Enterprise/KPIHistory';

export const enterpriseDashboardRoutes = [
  <Route
    key="enterprise-dashboard"
    path="/enterprise/dashboard"
    element={
      <PrivateRoute>
        <EnterpriseDashboard />
      </PrivateRoute>
    }
  />,
  <Route
    key="enterprise-kpi-history"
    path="/enterprise/kpi-history"
    element={
      <PrivateRoute>
        <KPIHistory />
      </PrivateRoute>
    }
  />
];
