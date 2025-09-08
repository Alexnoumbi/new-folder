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
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: color,
  opacity: 0.3,
  transition: 'opacity 0.3s ease',
  '&.active': {
    opacity: 1,
    boxShadow: `0 0 20px ${color}`
  }
}));

const StatusWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3)
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
          color: '#ff9800',
          label: 'Partiellement Conforme'
        };
      case 'red':
        return {
          color: '#f44336',
          label: 'Non Conforme'
        };
      default:
        return {
          color: '#9e9e9e',
          label: 'Statut Inconnu'
        };
    }
  };

  const config = getStatusConfig();
  const progress = details ? (details.validDocuments / details.requiredDocuments) * 100 : 0;

  return (
    <StatusWrapper>
      <Tooltip
        title={
          details ?
          `Documents valides: ${details.validDocuments}/${details.requiredDocuments}
           Dernière mise à jour: ${new Date(details.lastUpdated).toLocaleDateString('fr-FR')}` :
          config.label
        }
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <Light color={config.color} className="active" />
          {details && (
            <CircularProgress
              variant="determinate"
              value={progress}
              sx={{
                position: 'absolute',
                left: -4,
                top: -4,
                width: '68px !important',
                height: '68px !important',
                color: config.color
              }}
            />
          )}
        </Box>
      </Tooltip>

      <Box>
        <Typography variant="h6" component="div">
          {config.label}
        </Typography>
        {details && (
          <Typography variant="body2" color="text.secondary">
            {details.validDocuments} sur {details.requiredDocuments} documents validés
          </Typography>
        )}
      </Box>
    </StatusWrapper>
  );
};

export default ComplianceTrafficLight;
