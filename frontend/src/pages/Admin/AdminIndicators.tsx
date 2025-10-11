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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Autocomplete
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
  Warning,
  Edit,
  Delete,
  Visibility,
  Link as LinkIcon,
  LinkOff,
  AddCircle
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
import indicatorService, { Indicator } from '../../services/indicatorService';
import axios from 'axios';

interface KPI {
  _id: string;
  nom: string;
  code: string;
  valeurCible?: number;
  valeurActuelle?: number;
  unite?: string;
}

interface Entreprise {
  _id: string;
  nom?: string;
  name?: string;
  identification?: {
    nomEntreprise?: string;
  };
}

interface Framework {
  _id: string;
  name: string;
  description?: string;
}

const AdminIndicators: React.FC = () => {
  const theme = useTheme();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'OUTPUT' as Indicator['type'],
    entreprise: '',
    framework: '',
    unit: '',
    baseline: 0,
    target: 0,
    frequency: 'MONTHLY' as Indicator['frequency'],
    dataSource: '',
    responsible: '',
    linkedKPIs: [] as string[]
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchIndicators(),
      fetchKPIs(),
      fetchEntreprises(),
      fetchFrameworks()
    ]);
  };

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const data = await indicatorService.getAll();
      setIndicators(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching indicators:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des indicateurs');
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/kpis');
      setKPIs(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    }
  };

  const fetchEntreprises = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/entreprises');
      setEntreprises(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching entreprises:', err);
    }
  };

  const fetchFrameworks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/results-framework');
      setFrameworks(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching frameworks:', err);
    }
  };

  const handleCreate = async () => {
    try {
      console.log('Creating indicator with form data:', formData);
      const result = await indicatorService.create(formData);
      console.log('Indicator created successfully:', result);
      fetchIndicators();
      setCreateDialog(false);
      resetForm();
      setSnackbar({ open: true, message: 'Indicateur créé avec succès', severity: 'success' });
    } catch (err: any) {
      console.error('Error creating indicator:', err);
      console.error('Error response:', err.response?.data);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la création',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet indicateur?')) return;

    try {
      await indicatorService.delete(id);
      fetchIndicators();
      setSnackbar({ open: true, message: 'Indicateur supprimé', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const handleAddValue = async (indicatorId: string) => {
    const value = prompt('Entrez la nouvelle valeur:');
    if (!value) return;

    const comment = prompt('Commentaire (optionnel):');

    try {
      await indicatorService.addValue(indicatorId, parseFloat(value), comment || undefined);
      fetchIndicators();
      setSnackbar({ open: true, message: 'Valeur ajoutée avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'ajout', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'OUTPUT',
      entreprise: '',
      framework: '',
      unit: '',
      baseline: 0,
      target: 0,
      frequency: 'MONTHLY',
      dataSource: '',
      responsible: '',
      linkedKPIs: []
    });
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

  const getEntrepriseNom = (entreprise: any) => {
    if (!entreprise) return 'N/A';
    if (typeof entreprise === 'string') return 'N/A';
    return entreprise.identification?.nomEntreprise || entreprise.nom || entreprise.name || 'N/A';
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
              Indicateurs de performance des cadres logiques et projets
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
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={() => setCreateDialog(true)}
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
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
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
          Aucun indicateur trouvé. {searchTerm ? 'Essayez de modifier votre recherche.' : 'Créez votre premier indicateur!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredIndicators.map((indicator) => (
            <Grid item xs={12} md={6} lg={4} key={indicator._id}>
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
                      <Stack direction="row" spacing={1} flexWrap="wrap">
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

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Entreprise: {getEntrepriseNom(indicator.entreprise)}
                  </Typography>

                  {/* KPIs liés */}
                  {indicator.linkedKPIs && indicator.linkedKPIs.length > 0 && (
                    <Stack direction="row" spacing={0.5} mb={2} flexWrap="wrap">
                      {indicator.linkedKPIs.map((kpi: any, idx) => (
                        <Chip
                          key={idx}
                          label={`KPI: ${typeof kpi === 'object' ? kpi.code : kpi}`}
                          size="small"
                          color="secondary"
                          icon={<LinkIcon />}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))}
                    </Stack>
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

                  <Stack direction="row" spacing={1} mt={2}>
                    <Tooltip title="Voir détails">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedIndicator(indicator);
                          setViewDialog(true);
                        }}
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ajouter valeur">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleAddValue(indicator._id)}
                        sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                      >
                        <AddCircle />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(indicator._id)}
                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" mt={1} display="block">
                    Fréquence: {indicator.frequency || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogue de Création */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Créer un Nouvel Indicateur
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'indicateur *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="IND-001"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type *</InputLabel>
                <Select
                  value={formData.type}
                  label="Type *"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Indicator['type'] })}
                >
                  <MenuItem value="IMPACT">Impact</MenuItem>
                  <MenuItem value="OUTCOME">Outcome</MenuItem>
                  <MenuItem value="OUTPUT">Output</MenuItem>
                  <MenuItem value="ACTIVITY">Activité</MenuItem>
                  <MenuItem value="QUANTITATIVE">Quantitatif</MenuItem>
                  <MenuItem value="QUALITATIVE">Qualitatif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Entreprise *</InputLabel>
                <Select
                  value={formData.entreprise}
                  label="Entreprise *"
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                >
                  {entreprises.map((e) => (
                    <MenuItem key={e._id} value={e._id}>
                      {getEntrepriseNom(e)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cadre de Résultats</InputLabel>
                <Select
                  value={formData.framework}
                  label="Cadre de Résultats"
                  onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                >
                  <MenuItem value="">Aucun</MenuItem>
                  {frameworks.map((f) => (
                    <MenuItem key={f._id} value={f._id}>
                      {f.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unité *"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="ex: %, nombre, personnes"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Valeur de base"
                type="number"
                value={formData.baseline}
                onChange={(e) => setFormData({ ...formData, baseline: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cible *"
                type="number"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Fréquence</InputLabel>
                <Select
                  value={formData.frequency}
                  label="Fréquence"
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Indicator['frequency'] })}
                >
                  <MenuItem value="DAILY">Quotidien</MenuItem>
                  <MenuItem value="WEEKLY">Hebdomadaire</MenuItem>
                  <MenuItem value="MONTHLY">Mensuel</MenuItem>
                  <MenuItem value="QUARTERLY">Trimestriel</MenuItem>
                  <MenuItem value="ANNUAL">Annuel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Source de données"
                value={formData.dataSource}
                onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Responsable"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={kpis}
                getOptionLabel={(option) => `${option.code} - ${option.nom}`}
                value={kpis.filter(k => formData.linkedKPIs.includes(k._id))}
                onChange={(e, newValue) => setFormData({ ...formData, linkedKPIs: newValue.map(k => k._id) })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Lier à des KPIs (optionnel)"
                    placeholder="Sélectionner des KPIs..."
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialog(false); resetForm(); }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!formData.name || !formData.code || !formData.entreprise || !formData.unit || !formData.target}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de Visualisation */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedIndicator && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedIndicator.name}
                </Typography>
                <Chip label={selectedIndicator.code} color="primary" />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* Info générale */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Type</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getTypeLabel(selectedIndicator.type)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Statut</Typography>
                      <Chip
                        label={selectedIndicator.status}
                        color={selectedIndicator.status === 'ON_TRACK' ? 'success' : selectedIndicator.status === 'AT_RISK' ? 'warning' : 'error'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Entreprise</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {getEntrepriseNom(selectedIndicator.entreprise)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Progression */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Progression
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      Base: {selectedIndicator.baseline} {selectedIndicator.unit}
                    </Typography>
                    <Typography variant="body2">
                      Actuel: {selectedIndicator.current} {selectedIndicator.unit}
                    </Typography>
                    <Typography variant="body2">
                      Cible: {selectedIndicator.target} {selectedIndicator.unit}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((selectedIndicator.current / selectedIndicator.target) * 100, 100)}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Paper>

                {/* KPIs liés */}
                {selectedIndicator.linkedKPIs && selectedIndicator.linkedKPIs.length > 0 && (
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      KPIs Liés ({selectedIndicator.linkedKPIs.length})
                    </Typography>
                    <Stack spacing={1}>
                      {selectedIndicator.linkedKPIs.map((kpi: any, idx) => (
                        <Box key={idx}>
                          <Typography variant="body2" fontWeight={600}>
                            {typeof kpi === 'object' ? `${kpi.code} - ${kpi.nom}` : kpi}
                          </Typography>
                          {typeof kpi === 'object' && kpi.valeurCible && (
                            <Typography variant="caption" color="text.secondary">
                              Cible KPI: {kpi.valeurActuelle || 0} / {kpi.valeurCible} {kpi.unite}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                )}

                {/* Historique */}
                {selectedIndicator.history && selectedIndicator.history.length > 0 && (
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Évolution
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={selectedIndicator.history.map(h => ({
                        date: new Date(h.date).toLocaleDateString(),
                        value: h.value
                      }))}>
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
                          dot={{ fill: theme.palette.primary.main, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                )}

                {/* Infos complémentaires */}
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Fréquence: {selectedIndicator.frequency}
                  </Typography>
                  {selectedIndicator.dataSource && (
                    <Typography variant="caption" color="text.secondary">
                      Source: {selectedIndicator.dataSource}
                    </Typography>
                  )}
                  {selectedIndicator.responsible && (
                    <Typography variant="caption" color="text.secondary">
                      Responsable: {selectedIndicator.responsible}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Fermer</Button>
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => {
                  setViewDialog(false);
                  handleAddValue(selectedIndicator._id);
                }}
              >
                Ajouter Valeur
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminIndicators;
