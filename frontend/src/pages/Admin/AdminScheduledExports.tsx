import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Schedule,
  Add,
  Refresh,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  CalendarToday,
  CloudDownload
} from '@mui/icons-material';
import axios from 'axios';

interface ScheduledExport {
  _id: string;
  name: string;
  reportType: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  format: 'PDF' | 'EXCEL' | 'CSV';
  destination: string;
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  runCount: number;
}

const AdminScheduledExports: React.FC = () => {
  const theme = useTheme();
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExports();
  }, []);

  const fetchExports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/enhanced-reports/scheduled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExports(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching scheduled exports:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des exports planifiés');
      setExports([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExport = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/enhanced-reports/scheduled/${id}`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchExports();
    } catch (err) {
      alert('Erreur lors de la modification');
    }
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      DAILY: 'Quotidien',
      WEEKLY: 'Hebdomadaire',
      MONTHLY: 'Mensuel',
      QUARTERLY: 'Trimestriel'
    };
    return labels[freq] || freq;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Exports Planifiés
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configuration des exports automatiques de rapports
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchExports}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              }}
            >
              Nouvel Export
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {exports.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun export planifié. Configurez votre premier export automatique!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {exports.map((exp) => (
            <Grid item xs={12} md={6} key={exp._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 1,
                  borderColor: exp.isActive ? alpha(theme.palette.success.main, 0.3) : 'divider',
                  bgcolor: exp.isActive ? alpha(theme.palette.success.main, 0.02) : 'background.paper'
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {exp.name}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={exp.reportType} size="small" color="primary" variant="outlined" />
                        <Chip label={getFrequencyLabel(exp.frequency)} size="small" />
                        <Chip label={exp.format} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exp.isActive}
                          onChange={() => toggleExport(exp._id, exp.isActive)}
                          color="success"
                        />
                      }
                      label=""
                    />
                  </Stack>

                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2, my: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Destination</Typography>
                        <Typography variant="body2" fontWeight={600}>{exp.destination}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Exécutions</Typography>
                        <Typography variant="body2" fontWeight={600}>{exp.runCount} fois</Typography>
                      </Grid>
                      {exp.lastRun && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Dernière</Typography>
                          <Typography variant="body2">{new Date(exp.lastRun).toLocaleDateString()}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Prochaine</Typography>
                        <Typography variant="body2">{new Date(exp.nextRun).toLocaleDateString()}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" color="primary">
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminScheduledExports;

