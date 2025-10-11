import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  TrendingUp,
  TrendingDown,
  Visibility,
  Link as LinkIcon,
  Assessment,
  AddCircle
} from '@mui/icons-material';
import { getKPIs } from '../../services/kpiService';
import { KPI } from '../../types/kpi.types';
import indicatorService, { Indicator } from '../../services/indicatorService';

const KPIList = () => {
  const theme = useTheme();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);
  const [linkedIndicators, setLinkedIndicators] = useState<Indicator[]>([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [loadingIndicators, setLoadingIndicators] = useState(false);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      setLoading(true);
      const data = await getKPIs();
      setKpis(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError('Erreur lors du chargement des KPIs');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLinkedIndicators = async (kpiId: string) => {
    try {
      setLoadingIndicators(true);
      const indicators = await indicatorService.getLinkedToKPI(kpiId);
      setLinkedIndicators(indicators);
    } catch (err) {
      console.error('Error loading linked indicators:', err);
      setLinkedIndicators([]);
    } finally {
      setLoadingIndicators(false);
    }
  };

  const handleViewKPI = async (kpi: KPI) => {
    setSelectedKPI(kpi);
    setViewDialog(true);
    await loadLinkedIndicators(kpi._id);
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return theme.palette.success.main;
    if (percentage >= 75) return theme.palette.info.main;
    if (percentage >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (kpis.length === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Aucun KPI disponible. Créez votre premier KPI dans l'onglet "Créer un KPI"!
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {kpis.map((kpi) => {
          const progress = kpi.targetValue ? ((kpi.currentValue || 0) / kpi.targetValue) * 100 : 0;
          const isOnTrack = progress >= 75;

          return (
            <Grid item xs={12} sm={6} md={4} key={kpi._id}>
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
                    <Typography variant="h6" fontWeight={700} flex={1}>
                      {kpi.name}
                    </Typography>
                    {isOnTrack ? (
                      <TrendingUp color="success" />
                    ) : (
                      <TrendingDown color="error" />
                    )}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" mb={2} noWrap>
                    {kpi.description || 'Aucune description'}
                  </Typography>

                  <Stack direction="row" spacing={0.5} mb={2}>
                    <Chip
                      label={kpi.code || 'N/A'}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={kpi.frequency}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>

                  <Box mb={2}>
                    <Stack direction="row" justifyContent="space-between" mb={1}>
                      <Typography variant="caption" color="text.secondary">
                        Progression
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {Math.round(progress)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: getProgressColor(kpi.currentValue || 0, kpi.targetValue)
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                      {kpi.currentValue || 0} / {kpi.targetValue} {kpi.unit}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => handleViewKPI(kpi)}
                    sx={{ textTransform: 'none' }}
                  >
                    Voir Détails & Indicateurs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* View KPI Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedKPI && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedKPI.name}
                </Typography>
                <Chip label={selectedKPI.code} color="primary" />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                {/* Description */}
                <Typography variant="body1" color="text.secondary">
                  {selectedKPI.description || 'Aucune description'}
                </Typography>

                {/* Stats KPI */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Valeur Actuelle</Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {selectedKPI.currentValue || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{selectedKPI.unit}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Cible</Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {selectedKPI.targetValue}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{selectedKPI.unit}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Progression</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(((selectedKPI.currentValue || 0) / selectedKPI.targetValue) * 100, 100)}
                        sx={{ height: 10, borderRadius: 5, mt: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                        {Math.round(((selectedKPI.currentValue || 0) / selectedKPI.targetValue) * 100)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Indicateurs Liés */}
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Indicateurs Liés ({linkedIndicators.length})
                  </Typography>
                  {loadingIndicators ? (
                    <Box display="flex" justifyContent="center" py={2}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : linkedIndicators.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Aucun indicateur lié à ce KPI. Créez un indicateur et liez-le dans la page "Indicateurs".
                    </Alert>
                  ) : (
                    <Stack spacing={1}>
                      {linkedIndicators.map((indicator) => (
                        <Paper key={indicator._id} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="start">
                            <Box flex={1}>
                              <Typography variant="body1" fontWeight={600}>
                                {indicator.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Code: {indicator.code} • Type: {indicator.type}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${Math.round((indicator.current / indicator.target) * 100)}%`}
                              size="small"
                              color={indicator.current >= indicator.target * 0.75 ? 'success' : 'warning'}
                            />
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min((indicator.current / indicator.target) * 100, 100)}
                            sx={{ height: 6, borderRadius: 3, mt: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                            {indicator.current} / {indicator.target} {indicator.unit}
                          </Typography>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>

                {/* Infos complémentaires */}
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Fréquence de collecte: {selectedKPI.frequency}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Créé le: {new Date(selectedKPI.createdAt).toLocaleDateString('fr-FR')}
                  </Typography>
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default KPIList;
