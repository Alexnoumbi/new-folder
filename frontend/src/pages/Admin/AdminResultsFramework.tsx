import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
  alpha,
  Divider,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Tooltip
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Add,
  MoreVert,
  TrendingUp,
  Assignment,
  Timeline,
  AccountTree,
  Warning,
  CheckCircle,
  Edit,
  Delete,
  Visibility,
  Business,
  Refresh,
  Download,
  ArrowForward,
  ArrowBack
} from '@mui/icons-material';
import resultsFrameworkService, { ResultsFramework } from '../../services/resultsFrameworkService';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Entreprise {
  _id: string;
  nom?: string;
  name?: string;
  identification?: {
    nomEntreprise?: string;
  };
}

const AdminResultsFramework: React.FC = () => {
  const theme = useTheme();
  const [frameworks, setFrameworks] = useState<ResultsFramework[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ResultsFramework | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frameworkType: 'LOGFRAME' as ResultsFramework['frameworkType'],
    project: '',
    startDate: '',
    endDate: '',
    outcomes: [] as Array<{ description: string; level: number }>,
    outputs: [] as Array<{ description: string }>,
    activities: [] as Array<{ description: string; progressPercentage: number }>
  });

  const [tempOutcome, setTempOutcome] = useState('');
  const [tempOutput, setTempOutput] = useState('');
  const [tempActivity, setTempActivity] = useState('');

  const steps = ['Informations de base', 'Outcomes', 'Outputs', 'Activités'];

  useEffect(() => {
    loadFrameworks();
    loadEntreprises();
  }, []);

  const loadEntreprises = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/entreprises');
      setEntreprises(response.data.data || response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    }
  };

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      const data = await resultsFrameworkService.getAll();
      setFrameworks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des cadres:', error);
      setSnackbar({ open: true, message: 'Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFramework = async () => {
    try {
      await resultsFrameworkService.createFramework({
        name: formData.name,
        description: formData.description,
        frameworkType: formData.frameworkType,
        project: formData.project,
        projectPeriod: {
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          phases: []
        },
        outcomes: formData.outcomes.map(o => ({
          ...o,
          indicators: [],
          verificationMeans: [],
          assumptions: [],
          status: 'NOT_STARTED' as const
        })),
        outputs: formData.outputs.map(o => ({
          ...o,
          indicators: [],
          verificationMeans: [],
          assumptions: [],
          status: 'NOT_STARTED' as const
        })),
        activities: formData.activities.map(a => ({
          ...a,
          inputs: [],
          status: 'NOT_STARTED' as const
        })),
        status: 'ACTIVE',
        risks: [],
        stakeholders: []
      });

      loadFrameworks();
      setOpenDialog(false);
      resetForm();
      setSnackbar({ open: true, message: 'Cadre créé avec succès', severity: 'success' });
    } catch (error: any) {
      console.error('Error creating framework:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Erreur lors de la création', 
        severity: 'error' 
      });
    }
  };

  const handleDeleteFramework = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce cadre?')) return;

    try {
      await resultsFrameworkService.deleteFramework(id);
      loadFrameworks();
      setSnackbar({ open: true, message: 'Cadre supprimé', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frameworkType: 'LOGFRAME',
      project: '',
      startDate: '',
      endDate: '',
      outcomes: [],
      outputs: [],
      activities: []
    });
    setActiveStep(0);
  };

  const addOutcome = () => {
    if (!tempOutcome.trim()) return;
    setFormData({
      ...formData,
      outcomes: [...formData.outcomes, { description: tempOutcome, level: formData.outcomes.length + 1 }]
    });
    setTempOutcome('');
  };

  const addOutput = () => {
    if (!tempOutput.trim()) return;
    setFormData({
      ...formData,
      outputs: [...formData.outputs, { description: tempOutput }]
    });
    setTempOutput('');
  };

  const addActivity = () => {
    if (!tempActivity.trim()) return;
    setFormData({
      ...formData,
      activities: [...formData.activities, { description: tempActivity, progressPercentage: 0 }]
    });
    setTempActivity('');
  };

  const removeOutcome = (index: number) => {
    setFormData({
      ...formData,
      outcomes: formData.outcomes.filter((_, i) => i !== index)
    });
  };

  const removeOutput = (index: number) => {
    setFormData({
      ...formData,
      outputs: formData.outputs.filter((_, i) => i !== index)
    });
  };

  const removeActivity = (index: number) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter((_, i) => i !== index)
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Brouillon',
      ACTIVE: 'Actif',
      COMPLETED: 'Terminé',
      ARCHIVED: 'Archivé'
    };
    return labels[status] || status;
  };

  const getEntrepriseNom = (entreprise: any) => {
    if (!entreprise) return 'N/A';
    if (typeof entreprise === 'string') return 'N/A';
    return entreprise.identification?.nomEntreprise || entreprise.nom || entreprise.name || 'N/A';
  };

  const getFrameworkTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LOGFRAME: 'Cadre Logique',
      THEORY_OF_CHANGE: 'Théorie du Changement',
      RESULTS_CHAIN: 'Chaîne de Résultats',
      OUTCOME_MAPPING: 'Cartographie des Résultats'
    };
    return labels[type] || type;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.name || !formData.project) {
        setSnackbar({ open: true, message: 'Veuillez remplir tous les champs requis', severity: 'error' });
        return;
      }
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const filteredFrameworks = frameworks.filter(f => {
    if (tabValue === 0) return true;
    if (tabValue === 1) return f.status === 'ACTIVE';
    if (tabValue === 2) return f.status === 'DRAFT';
    if (tabValue === 3) return f.status === 'COMPLETED';
    return true;
  });

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
              Cadres de Résultats
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cadres logiques et théories du changement pour vos projets
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={loadFrameworks}
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
              onClick={() => setOpenDialog(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Nouveau Cadre
            </Button>
          </Stack>
        </Stack>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total Cadres</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">{frameworks.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Cadres Actifs</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {frameworks.filter(f => f.status === 'ACTIVE').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Outcomes Totaux</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {frameworks.reduce((sum, f) => sum + f.outcomes.length, 0)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Activités En Cours</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {frameworks.reduce((sum, f) => 
                  sum + f.activities.filter(a => a.status === 'IN_PROGRESS').length, 0
                )}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Frameworks List */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label={`Tous (${frameworks.length})`} />
            <Tab label={`Actifs (${frameworks.filter(f => f.status === 'ACTIVE').length})`} />
            <Tab label={`Brouillons (${frameworks.filter(f => f.status === 'DRAFT').length})`} />
            <Tab label={`Terminés (${frameworks.filter(f => f.status === 'COMPLETED').length})`} />
          </Tabs>

          <TabPanel value={tabValue} index={tabValue}>
            {filteredFrameworks.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Aucun cadre de résultats. Créez-en un pour commencer !
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {filteredFrameworks.map((framework) => (
                  <Grid item xs={12} md={6} lg={4} key={framework._id}>
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
                              {framework.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {framework.description || 'Pas de description'}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={getStatusLabel(framework.status)}
                              color={getStatusColor(framework.status) as any}
                              size="small"
                            />
                          </Stack>
                        </Stack>

                        <Chip
                          label={getFrameworkTypeLabel(framework.frameworkType)}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ mb: 2 }}
                        />

                        {framework.entreprise && (
                          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                            <Business fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {getEntrepriseNom(framework.entreprise)}
                            </Typography>
                          </Stack>
                        )}

                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Progression</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {framework.overallProgress || 0}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={framework.overallProgress || 0}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Outcomes
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {framework.outcomes.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Outputs
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {framework.outputs.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Activités
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {framework.activities.length}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => setSelectedFramework(framework)}
                            sx={{ flex: 1, textTransform: 'none' }}
                          >
                            Voir
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFramework(framework._id)}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Create Framework Dialog avec Stepper */}
      <Dialog 
        open={openDialog} 
        onClose={() => { setOpenDialog(false); resetForm(); }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Créer un Nouveau Cadre de Résultats
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Étape 1: Informations de base */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <TextField
                label="Nom du Cadre *"
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <FormControl fullWidth required>
                <InputLabel>Type de Cadre</InputLabel>
                <Select
                  value={formData.frameworkType}
                  label="Type de Cadre"
                  onChange={(e) => setFormData({ ...formData, frameworkType: e.target.value as any })}
                >
                  <MenuItem value="LOGFRAME">Cadre Logique</MenuItem>
                  <MenuItem value="THEORY_OF_CHANGE">Théorie du Changement</MenuItem>
                  <MenuItem value="RESULTS_CHAIN">Chaîne de Résultats</MenuItem>
                  <MenuItem value="OUTCOME_MAPPING">Cartographie des Résultats</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Entreprise/Projet</InputLabel>
                <Select
                  value={formData.project}
                  label="Entreprise/Projet"
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                >
                  {entreprises.map((e) => (
                    <MenuItem key={e._id} value={e._id}>
                      {getEntrepriseNom(e)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Date de Début"
                    type="date"
                    fullWidth
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Date de Fin"
                    type="date"
                    fullWidth
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* Étape 2: Outcomes */}
          {activeStep === 1 && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Définir les Outcomes (Résultats)
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  label="Description de l'outcome"
                  value={tempOutcome}
                  onChange={(e) => setTempOutcome(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOutcome()}
                />
                <Button variant="contained" onClick={addOutcome} startIcon={<Add />}>
                  Ajouter
                </Button>
              </Stack>
              <List>
                {formData.outcomes.map((outcome, index) => (
                  <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                    <ListItemText
                      primary={`Outcome ${outcome.level}`}
                      secondary={outcome.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeOutcome(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {formData.outcomes.length === 0 && (
                <Alert severity="info">Ajoutez au moins un outcome</Alert>
              )}
            </Stack>
          )}

          {/* Étape 3: Outputs */}
          {activeStep === 2 && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Définir les Outputs (Produits/Livrables)
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  label="Description de l'output"
                  value={tempOutput}
                  onChange={(e) => setTempOutput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOutput()}
                />
                <Button variant="contained" onClick={addOutput} startIcon={<Add />}>
                  Ajouter
                </Button>
              </Stack>
              <List>
                {formData.outputs.map((output, index) => (
                  <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                    <ListItemText secondary={output.description} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeOutput(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {formData.outputs.length === 0 && (
                <Alert severity="info">Ajoutez au moins un output</Alert>
              )}
            </Stack>
          )}

          {/* Étape 4: Activities */}
          {activeStep === 3 && (
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                Définir les Activités
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  label="Description de l'activité"
                  value={tempActivity}
                  onChange={(e) => setTempActivity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addActivity()}
                />
                <Button variant="contained" onClick={addActivity} startIcon={<Add />}>
                  Ajouter
                </Button>
              </Stack>
              <List>
                {formData.activities.map((activity, index) => (
                  <ListItem key={index} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                    <ListItemText secondary={activity.description} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => removeActivity(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              {formData.activities.length === 0 && (
                <Alert severity="info">Ajoutez au moins une activité</Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenDialog(false); resetForm(); }}>
            Annuler
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} startIcon={<ArrowBack />}>
              Retour
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>
              Suivant
            </Button>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={handleCreateFramework}
              startIcon={<CheckCircle />}
            >
              Créer le Cadre
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* View Framework Dialog */}
      <Dialog
        open={!!selectedFramework}
        onClose={() => setSelectedFramework(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedFramework && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedFramework.name}
                </Typography>
                <Chip
                  label={getStatusLabel(selectedFramework.status)}
                  color={getStatusColor(selectedFramework.status) as any}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                {selectedFramework.description && (
                  <Typography variant="body1" color="text.secondary">
                    {selectedFramework.description}
                  </Typography>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                      <Typography variant="caption" color="text.secondary">Outcomes</Typography>
                      <Typography variant="h4" fontWeight={700} color="success.main">
                        {selectedFramework.outcomes.length}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                      <Typography variant="caption" color="text.secondary">Outputs</Typography>
                      <Typography variant="h4" fontWeight={700} color="info.main">
                        {selectedFramework.outputs.length}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                      <Typography variant="caption" color="text.secondary">Activités</Typography>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {selectedFramework.activities.length}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Outcomes List */}
                {selectedFramework.outcomes.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Outcomes
                    </Typography>
                    {selectedFramework.outcomes.map((outcome, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Outcome {outcome.level}: {outcome.description}
                        </Typography>
                        <Chip
                          label={outcome.status}
                          size="small"
                          color={outcome.status === 'ACHIEVED' ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Outputs List */}
                {selectedFramework.outputs.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Outputs
                    </Typography>
                    {selectedFramework.outputs.map((output, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                        <Typography variant="body2">{output.description}</Typography>
                      </Paper>
                    ))}
                  </Box>
                )}

                {/* Activities List */}
                {selectedFramework.activities.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Activités
                    </Typography>
                    {selectedFramework.activities.map((activity, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={1}>
                          <Typography variant="body2" flex={1}>{activity.description}</Typography>
                          <Chip label={activity.status} size="small" />
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={activity.progressPercentage}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                          {activity.progressPercentage}% complété
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedFramework(null)}>Fermer</Button>
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

export default AdminResultsFramework;
