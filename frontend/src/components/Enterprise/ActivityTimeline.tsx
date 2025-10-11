import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Description as DocumentIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityItem {
  _id: string;
  action: string;
  entityType: string;
  timestamp: string;
  user?: {
    nom?: string;
    prenom?: string;
    email?: string;
  };
  details?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  loading?: boolean;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities, loading }) => {
  const getActionIcon = (action: string, entityType: string) => {
    if (action.includes('CREATE') || action.includes('UPLOAD')) {
      return <UploadIcon />;
    }
    if (action.includes('UPDATE')) {
      return <EditIcon />;
    }
    if (action.includes('VIEW')) {
      return <VisibilityIcon />;
    }
    if (action.includes('VALIDATE') || action.includes('APPROVE')) {
      return <CheckCircleIcon />;
    }

    switch (entityType.toLowerCase()) {
      case 'document':
        return <DocumentIcon />;
      case 'message':
        return <MessageIcon />;
      case 'kpi':
      case 'indicator':
        return <AssessmentIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('CREATE') || action.includes('UPLOAD')) {
      return 'success';
    }
    if (action.includes('UPDATE')) {
      return 'info';
    }
    if (action.includes('DELETE')) {
      return 'error';
    }
    if (action.includes('VALIDATE') || action.includes('APPROVE')) {
      return 'primary';
    }
    return 'default';
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression',
      UPLOAD: 'Téléchargement',
      VALIDATE: 'Validation',
      APPROVE: 'Approbation',
      VIEW: 'Consultation',
      SUBMIT: 'Soumission'
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entityType: string) => {
    const labels: { [key: string]: string } = {
      document: 'Document',
      message: 'Message',
      kpi: 'Indicateur KPI',
      indicator: 'Indicateur',
      entreprise: 'Entreprise',
      user: 'Utilisateur',
      report: 'Rapport',
      control: 'Contrôle'
    };
    return labels[entityType.toLowerCase()] || entityType;
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Chargement de l'activité...</Typography>
      </Paper>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Aucune activité récente
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Activité Récente
      </Typography>
      
      <Stack spacing={2}>
        {activities.map((activity, index) => (
          <Box key={activity._id || index}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {/* Icon */}
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: `${getActionColor(activity.action)}.main`
                }}
              >
                {getActionIcon(activity.action, activity.entityType)}
              </Avatar>

              {/* Content */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip
                    label={getActionLabel(activity.action)}
                    size="small"
                    color={getActionColor(activity.action) as any}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {getEntityLabel(activity.entityType)}
                  </Typography>
                </Box>
                
                {activity.user && (
                  <Typography variant="body2" color="text.secondary">
                    Par: {activity.user.nom} {activity.user.prenom}
                  </Typography>
                )}
                
                {activity.details && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {(() => {
                      // Si details est une chaîne, l'afficher directement
                      if (typeof activity.details === 'string') {
                        return activity.details;
                      }
                      
                      // Si c'est un objet avec conformite, extraire la valeur
                      if (typeof activity.details === 'object' && activity.details !== null) {
                        const detailsObj = activity.details as any;
                        if (detailsObj.conformite && detailsObj.commentaireConformite) {
                          return `Conformité: ${detailsObj.conformite}${detailsObj.commentaireConformite ? ` - ${detailsObj.commentaireConformite}` : ''}`;
                        }
                        if (detailsObj.conformite) {
                          return `Conformité: ${detailsObj.conformite}`;
                        }
                        // Pour d'autres objets, afficher en JSON lisible
                        return JSON.stringify(detailsObj);
                      }
                      
                      // Par défaut, convertir en string
                      return String(activity.details);
                    })()}
                  </Typography>
                )}
              </Box>

              {/* Date */}
              <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(activity.timestamp), 'dd MMM yyyy', { locale: fr })}
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(activity.timestamp), 'HH:mm', { locale: fr })}
                </Typography>
              </Box>
            </Stack>
            {index < activities.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default ActivityTimeline;

