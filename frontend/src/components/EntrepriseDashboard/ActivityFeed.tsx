import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import {
  Description,
  Assessment,
  Event,
  Message,
  CheckCircle,
  Upload,
  Edit,
  Visibility
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Activity {
  timestamp: string | Date;
  action: string;
  entityType: string;
  details?: any;
  userId?: {
    nom: string;
    prenom: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const theme = useTheme();

  const getActivityIcon = (entityType: string, action: string) => {
    if (entityType === 'DOCUMENT' || action === 'UPLOAD') return <Description />;
    if (entityType === 'KPI' || entityType === 'INDICATOR') return <Assessment />;
    if (entityType === 'VISIT') return <Event />;
    if (entityType === 'MESSAGE') return <Message />;
    if (action === 'VALIDATE') return <CheckCircle />;
    if (action === 'UPDATE') return <Edit />;
    if (action === 'VIEW') return <Visibility />;
    return <Upload />;
  };

  const getActivityColor = (action: string) => {
    if (action === 'CREATE' || action === 'UPLOAD') return theme.palette.success.main;
    if (action === 'UPDATE' || action === 'EDIT') return theme.palette.info.main;
    if (action === 'DELETE') return theme.palette.error.main;
    if (action === 'VALIDATE' || action === 'APPROVE') return theme.palette.primary.main;
    return theme.palette.grey[600];
  };

  const getActivityLabel = (action: string, entityType: string) => {
    const actions: Record<string, string> = {
      CREATE: 'Créé',
      UPDATE: 'Modifié',
      DELETE: 'Supprimé',
      UPLOAD: 'Téléversé',
      VALIDATE: 'Validé',
      APPROVE: 'Approuvé',
      REJECT: 'Rejeté',
      VIEW: 'Consulté',
      SUBMIT: 'Soumis'
    };
    
    const entities: Record<string, string> = {
      DOCUMENT: 'Document',
      KPI: 'KPI',
      INDICATOR: 'Indicateur',
      VISIT: 'Visite',
      MESSAGE: 'Message',
      REPORT: 'Rapport'
    };

    return `${actions[action] || action} - ${entities[entityType] || entityType}`;
  };

  if (activities.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Aucune activité récente
      </Alert>
    );
  }

  return (
    <Stack spacing={1.5} sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
      {activities.map((activity, index) => (
        <Paper
          key={index}
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.grey[500], 0.02),
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderColor: alpha(theme.palette.primary.main, 0.3)
            }
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: alpha(getActivityColor(activity.action), 0.1),
                color: getActivityColor(activity.action)
              }}
            >
              {getActivityIcon(activity.entityType, activity.action)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={600}>
                {getActivityLabel(activity.action, activity.entityType)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(activity.timestamp), { 
                  addSuffix: true,
                  locale: fr
                })}
              </Typography>
            </Box>
            <Chip 
              label={activity.action} 
              size="small"
              sx={{
                bgcolor: alpha(getActivityColor(activity.action), 0.1),
                color: getActivityColor(activity.action),
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default ActivityFeed;

