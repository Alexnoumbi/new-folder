import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Avatar,
  useTheme,
  alpha,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Download,
  Event,
  Person
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Snapshot {
  date: string | Date;
  visitId: string;
  visitType: string;
  visitStatus: string;
  outcome?: string;
  inspector?: {
    nom: string;
    prenom: string;
  };
  snapshot: any;
}

interface RevisionsTimelineProps {
  snapshots: Snapshot[];
}

const RevisionsTimeline: React.FC<RevisionsTimelineProps> = ({ snapshots }) => {
  const theme = useTheme();

  const getOutcomeIcon = (outcome?: string) => {
    switch (outcome) {
      case 'COMPLIANT': return <CheckCircle color="success" />;
      case 'NON_COMPLIANT': return <ErrorIcon color="error" />;
      case 'NEEDS_FOLLOW_UP': return <Warning color="warning" />;
      default: return <Event color="action" />;
    }
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case 'COMPLIANT': return 'success';
      case 'NON_COMPLIANT': return 'error';
      case 'NEEDS_FOLLOW_UP': return 'warning';
      default: return 'default';
    }
  };

  const handleDownload = (snapshot: Snapshot) => {
    // Créer un fichier JSON téléchargeable
    const dataStr = JSON.stringify(snapshot.snapshot, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `snapshot_${snapshot.visitId}_${format(new Date(snapshot.date), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (snapshots.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Aucune révision enregistrée pour le moment. Les données seront capturées lors des prochaines visites.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {snapshots.length} révision(s) enregistrée(s)
      </Typography>
      <Stack spacing={2} sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
        {snapshots.map((snapshot, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              position: 'relative',
              '&:hover': {
                boxShadow: theme.shadows[4],
                borderColor: 'primary.main'
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="start">
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                {getOutcomeIcon(snapshot.outcome)}
              </Avatar>
              <Box flex={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={1}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      Révision #{snapshots.length - index}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(snapshot.date), 'PPP à HH:mm', { locale: fr })}
                    </Typography>
                  </Box>
                  {snapshot.outcome && (
                    <Chip
                      label={snapshot.outcome}
                      size="small"
                      color={getOutcomeColor(snapshot.outcome) as any}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                  <Chip
                    label={snapshot.visitType}
                    size="small"
                    variant="outlined"
                  />
                  {snapshot.inspector && (
                    <Chip
                      icon={<Person fontSize="small" />}
                      label={`${snapshot.inspector.prenom} ${snapshot.inspector.nom}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Button
                  size="small"
                  startIcon={<Download />}
                  onClick={() => handleDownload(snapshot)}
                  variant="outlined"
                >
                  Télécharger Version
                </Button>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default RevisionsTimeline;

