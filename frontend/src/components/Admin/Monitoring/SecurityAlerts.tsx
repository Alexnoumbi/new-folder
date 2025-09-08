import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { SecurityAlert } from '../../../services/monitoringService';

interface SecurityAlertsProps {
  alerts: SecurityAlert[];
}

const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'failedLogin':
        return <ErrorIcon color="error" />;
      case 'suspiciousIP':
        return <WarningIcon color="warning" />;
      case 'blockedIP':
        return <SecurityIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  const getAlertSeverity = (type: string) => {
    switch (type) {
      case 'failedLogin':
        return 'error';
      case 'suspiciousIP':
        return 'warning';
      case 'blockedIP':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Alertes de Sécurité
        </Typography>
        <Chip
          label={`${alerts.length} alertes`}
          color={alerts.length > 0 ? "warning" : "success"}
        />
      </Box>

      {alerts.length === 0 ? (
        <Box textAlign="center" py={3}>
          <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography>Aucune alerte de sécurité</Typography>
        </Box>
      ) : (
        <List>
          {alerts.map((alert) => (
            <ListItem
              key={alert.id}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            >
              <ListItemIcon>
                {getAlertIcon(alert.type)}
              </ListItemIcon>
              <ListItemText
                primary={alert.message}
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.secondary">
                      IP: {alert.ipAddress}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      {formatDate(alert.timestamp)}
                    </Typography>
                  </React.Fragment>
                }
              />
              <Box>
                <Chip
                  size="small"
                  label={alert.resolved ? 'Résolu' : 'En cours'}
                  color={alert.resolved ? 'success' : 'warning'}
                  sx={{ mr: 1 }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SecurityAlerts;
