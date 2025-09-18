import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminKPIs from '../pages/Admin/AdminKPIs';

const KPIRoutes = () => {
  return (
    <Routes>
      <Route
        path="/admin/kpis"
        element={<AdminKPIs />}
      />
    </Routes>
  );
};

export default KPIRoutes;
