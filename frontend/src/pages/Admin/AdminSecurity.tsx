import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Paper,
  IconButton,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  Error,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import * as adminService from '../../services/adminService';
import { SecurityAlert, SecurityStatus } from '../../types/security.types';

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

  const getStatusColor = (score: number | undefined) => {
    if (!score) return 'error';
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getStatusIcon = (score: number | undefined) => {
    if (!score) return <Error color="error" />;
    if (score >= 90) return <CheckCircle color="success" />;
    if (score >= 70) return <Warning color="warning" />;
    return <Error color="error" />;
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'info';
    }
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
        <Box display="flex" flexWrap="wrap" gap={3}>
          {/* Security Score Card */}
          <Box flex={1} minWidth={300}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>État de la sécurité</Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h3" color={`${getStatusColor(status.securityScore)}.main`}>
                  {status.securityScore}%
                </Typography>
                {getStatusIcon(status.securityScore)}
              </Box>
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>Niveau de menace</Typography>
                <Chip
                  label={status.threatLevel.toUpperCase()}
                  color={getThreatLevelColor(status.threatLevel)}
                  sx={{ mt: 1 }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={status.securityScore}
                color={getStatusColor(status.securityScore)}
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Dernière mise à jour : {new Date(status.lastUpdate).toLocaleString()}
              </Typography>
            </Paper>
          </Box>

          {/* Metrics Card */}
          <Box flex={1} minWidth={300}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Métriques de sécurité</Typography>
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 2,
                mt: 2
              }}>
                <Box>
                  <Typography variant="h6" color="error.main">
                    {status.metrics.alerts.high}
                  </Typography>
                  <Typography variant="body2">Alertes critiques</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {status.metrics.alerts.medium}
                  </Typography>
                  <Typography variant="body2">Alertes modérées</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {status.metrics.alerts.low}
                  </Typography>
                  <Typography variant="body2">Alertes mineures</Typography>
                </Box>
                <Box>
                  <Typography variant="h6">
                    {status.metrics.alerts.total}
                  </Typography>
                  <Typography variant="body2">Total des alertes</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="error.main">
                    {status.metrics.failedLogins24h}
                  </Typography>
                  <Typography variant="body2">Échecs de connexion (24h)</Typography>
                </Box>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {status.metrics.suspiciousActivities24h}
                  </Typography>
                  <Typography variant="body2">Activités suspectes (24h)</Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Recent Alerts Section */}
      {alerts.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>Alertes Récentes</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {alerts.map((alert) => (
              <Paper key={alert._id} sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle1">{alert.type.replace('_', ' ')}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {alert.description}
                    </Typography>
                    {alert.location && (
                      <Typography variant="caption" color="textSecondary">
                        Localisation: {alert.location}
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={alert.severity.toUpperCase()}
                      color={
                        alert.severity === 'high' ? 'error' :
                        alert.severity === 'medium' ? 'warning' :
                        'info'
                      }
                      size="small"
                    />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                {alert.details && (
                  <Box mt={1}>
                    <Typography variant="caption" color="textSecondary">
                      Détails supplémentaires: {JSON.stringify(alert.details)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminSecurity;
