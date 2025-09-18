import React from 'react';
import { Typography, Box, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

interface ComplianceTrafficLightProps {
  status: 'green' | 'yellow' | 'red';
  details?: {
    requiredDocuments: number;
    submittedDocuments: number;
    validDocuments: number;
    lastUpdated: string;
  };
}

const Light = styled(Box)<{ color: string }>(({ theme, color }) => ({
  width: 44,
  height: 44,
  borderRadius: '50%',
  backgroundColor: color,
  opacity: 0.3,
  transition: 'opacity 0.3s ease',
  '&.active': {
    opacity: 1,
    boxShadow: `0 0 14px ${color}`
  }
}));

const StatusWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2)
}));

const ComplianceTrafficLight: React.FC<ComplianceTrafficLightProps> = ({ status, details }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'green':
        return {
          color: '#4caf50',
          label: 'Conforme'
        };
      case 'yellow':
        return {
          color: '#ffb300',
          label: 'À améliorer'
        };
      case 'red':
        return {
          color: '#f44336',
          label: 'Non conforme'
        };
      default:
        return {
          color: '#9e9e9e',
          label: 'Statut inconnu'
        };
    }
  };

  const config = getStatusConfig();
  const progress = details && details.requiredDocuments > 0
    ? (details.validDocuments / details.requiredDocuments) * 100
    : 0;

  return (
    <StatusWrapper>
      <Tooltip
        title={
          details ?
          `Documents valides: ${details.validDocuments}/${details.requiredDocuments}\nDernière mise à jour: ${new Date(details.lastUpdated).toLocaleDateString('fr-FR')}` :
          config.label
        }
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <Light color={config.color} className="active" />
          {details && (
            <CircularProgress
              variant="determinate"
              value={Math.min(100, Math.max(0, progress))}
              sx={{
                position: 'absolute',
                left: -3,
                top: -3,
                width: '50px !important',
                height: '50px !important',
                color: config.color
              }}
            />
          )}
        </Box>
      </Tooltip>

      <Box>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 600 }}>
          {config.label}
        </Typography>
        {details && (
          <Typography variant="caption" color="text.secondary">
            {details.validDocuments} / {details.requiredDocuments} documents validés
          </Typography>
        )}
      </Box>
    </StatusWrapper>
  );
};

export default ComplianceTrafficLight;
