import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Paper,
  IconButton,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Error,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import * as adminService from '../../services/adminService';
import { SecurityAlert, SecurityStatus } from '../../types/admin.types';

const AdminSecurity: React.FC = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [status, setStatus] = useState<SecurityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [alertsData, statusData] = await Promise.all([
        adminService.getSecurityAlerts(),
        adminService.getSecurityStatus()
      ]);
      setAlerts(alertsData);
      setStatus(statusData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données de sécurité');
      console.error('Security data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle color="success" />;
    if (score >= 70) return <Warning color="warning" />;
    return <Error color="error" />;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Sécurité</Typography>
        <IconButton onClick={fetchData} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Réessayer
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      ) : status && (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: '1 1 50%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>État de la Sécurité</Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h3" color={`${getStatusColor(status.securityScore || 0)}.main`}>
                  {status.securityScore || 0}%
                </Typography>
                {getStatusIcon(status.securityScore || 0)}
              </Box>
              <LinearProgress
                variant="determinate"
                value={status.securityScore || 0}
                color={getStatusColor(status.securityScore || 0)}
                sx={{ mt: 2 }}
              />
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 50%' }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Résumé des Alertes</Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2
              }}>
                <Box textAlign="center">
                  <Typography variant="h4" color="error.main">
                    {alerts.filter(a => a.severity === 'high').length}
                  </Typography>
                  <Typography variant="body2">Critiques</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {alerts.filter(a => a.severity === 'medium').length}
                  </Typography>
                  <Typography variant="body2">Moyennes</Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {alerts.filter(a => a.severity === 'low').length}
                  </Typography>
                  <Typography variant="body2">Faibles</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {alerts.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>Alertes Récentes</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert) => (
              <Paper key={alert.id} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">{alert.type}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {alert.description}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={alert.severity}
                      color={
                        alert.severity === 'high' ? 'error' :
                        alert.severity === 'medium' ? 'warning' :
                        'info'
                      }
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(alert.timestamp).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminSecurity;
