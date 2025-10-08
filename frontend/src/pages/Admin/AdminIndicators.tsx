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
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  Paper,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Assessment,
  Search,
  Add,
  TrendingUp,
  TrendingDown,
  Refresh,
  Download,
  Timeline,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

interface Indicator {
  _id: string;
  name: string;
  code: string;
  type: string;
  unit: string;
  target: number;
  current: number;
  frequency: string;
  status: string;
  entreprise?: {
    _id: string;
    nom: string;
  };
  history?: Array<{
    date: string;
    value: number;
  }>;
}

const AdminIndicators: React.FC = () => {
  const theme = useTheme();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchIndicators();
  }, []);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/indicators', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIndicators(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching indicators:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des indicateurs');
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      OUTCOME: 'Outcome',
      OUTPUT: 'Output',
      ACTIVITY: 'Activité',
      IMPACT: 'Impact',
      QUANTITATIVE: 'Quantitatif',
      QUALITATIVE: 'Qualitatif'
    };
    return labels[type] || type;
  };

  const getStatusColor = (indicator: Indicator) => {
    if (!indicator.current || !indicator.target) return 'default';
    const percentage = (indicator.current / indicator.target) * 100;
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const filteredIndicators = indicators.filter(ind => {
    const matchesSearch =
      ind.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      tabValue === 0 ||
      (tabValue === 1 && ind.type === 'OUTCOME') ||
      (tabValue === 2 && ind.type === 'OUTPUT') ||
      (tabValue === 3 && ind.type === 'ACTIVITY');

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: indicators.length,
    outcomes: indicators.filter(i => i.type === 'OUTCOME').length,
    outputs: indicators.filter(i => i.type === 'OUTPUT').length,
    activities: indicators.filter(i => i.type === 'ACTIVITY').length,
    onTrack: indicators.filter(i => i.current && i.target && (i.current / i.target) >= 0.75).length
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
      {/* Header */}
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
              Gestion des Indicateurs
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue d'ensemble de tous les indicateurs du système
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchIndicators}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter">
              <IconButton
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                }}
              >
                <Download color="success" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Nouvel Indicateur
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats rapides */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Outcomes</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.outcomes}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Outputs</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">{stats.outputs}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Activités</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.activities}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Sur la Bonne Voie</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">{stats.onTrack}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs et recherche */}
        <Stack spacing={2}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Tous" />
            <Tab label="Outcomes" />
            <Tab label="Outputs" />
            <Tab label="Activités" />
          </Tabs>

          <TextField
            fullWidth
            placeholder="Rechercher un indicateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.05) }
            }}
          />
        </Stack>
      </Box>

      {/* Liste Indicateurs */}
      {filteredIndicators.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun indicateur trouvé. {searchTerm ? 'Essayez de modifier votre recherche.' : 'Aucun indicateur dans la base de données.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredIndicators.map((indicator) => (
            <Grid item xs={12} md={6} key={indicator._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[12],
                    borderColor: 'primary.main'
                  }
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {indicator.name}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={getTypeLabel(indicator.type)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={indicator.code}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    <Chip
                      label={indicator.current && indicator.target ? `${Math.round((indicator.current / indicator.target) * 100)}%` : 'N/A'}
                      color={getStatusColor(indicator) as any}
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>

                  {indicator.entreprise && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Entreprise: {indicator.entreprise.nom}
                    </Typography>
                  )}

                  {indicator.current !== undefined && indicator.target !== undefined && (
                    <Box mb={2}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Progression
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {indicator.current} / {indicator.target} {indicator.unit}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((indicator.current / indicator.target) * 100, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor:
                              indicator.current >= indicator.target
                                ? theme.palette.success.main
                                : indicator.current >= indicator.target * 0.75
                                ? theme.palette.info.main
                                : theme.palette.warning.main
                          }
                        }}
                      />
                    </Box>
                  )}

                  {indicator.history && indicator.history.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Évolution
                      </Typography>
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={indicator.history}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis
                            dataKey="date"
                            stroke={theme.palette.text.secondary}
                            tick={{ fontSize: 11 }}
                          />
                          <YAxis stroke={theme.palette.text.secondary} tick={{ fontSize: 11 }} />
                          <RechartsTooltip />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={theme.palette.primary.main}
                            strokeWidth={2}
                            dot={{ fill: theme.palette.primary.main, r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  )}

                  <Stack direction="row" spacing={1} mt={2}>
                    <Typography variant="caption" color="text.secondary">
                      Fréquence: {indicator.frequency || 'N/A'}
                    </Typography>
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

export default AdminIndicators;

