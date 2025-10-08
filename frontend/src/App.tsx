import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { store } from './store/store';
import modernTheme from './theme/modernTheme';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminRoutes from './routes/AdminRoutes';
import EnterpriseRoutes from './routes/EnterpriseRoutes';
import PublicFormSubmission from './pages/PublicFormSubmission';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={modernTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/form/:formId" element={<PublicFormSubmission />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/enterprise/*" element={<EnterpriseRoutes />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;