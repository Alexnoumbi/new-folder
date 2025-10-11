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
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Badge,
  Snackbar,
  Tabs,
  Tab,
  InputAdornment
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  AccountTree,
  Add,
  Refresh,
  Edit,
  Visibility,
  CheckCircle,
  Timeline,
  PlayArrow,
  Pause,
  Delete,
  Assignment,
  TrendingUp,
  Pending,
  Done,
  Close,
  MoreVert,
  CheckCircleOutline,
  ErrorOutline,
  WatchLater,
  Person,
  Flag,
  Search,
  FilterList
} from '@mui/icons-material';
import workflowService, { Workflow, WorkflowStep, WorkflowStats, PendingTask } from '../../services/workflowService';

const AdminWorkflows: React.FC = () => {
  const theme = useTheme();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [currentView, setCurrentView] = useState<'workflows' | 'tasks' | 'templates'>('workflows');
  
  // Dialogues
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'CUSTOM' as Workflow['type'],
    priority: 'MEDIUM' as Workflow['priority'],
    isTemplate: false,
    steps: [] as Array<{
      name: string;
      description: string;
      order: number;
      requiredAction: string;
      assignedRole: string;
    }>,
    settings: {
      requireSequential: true,
      sendNotifications: true,
      autoAssign: false
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workflowsData, statsData, tasksData] = await Promise.all([
        workflowService.getAll(),
        workflowService.getStats(),
        workflowService.getMyPendingTasks().catch(() => [])
      ]);
      
      setWorkflows(workflowsData);
      setStats(statsData);
      setPendingTasks(tasksData);
    } catch (err: any) {
      console.error('Error loading workflows:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        steps: formData.steps.map((step, index) => ({
          ...step,
          order: index + 1,
          status: 'PENDING' as WorkflowStep['status'],
          assignedRole: step.assignedRole as WorkflowStep['assignedRole'],
          requiredAction: step.requiredAction as WorkflowStep['requiredAction']
        }))
      };
      
      await workflowService.create(dataToSubmit as Partial<Workflow>);
      setCreateDialog(false);
      resetForm();
      loadData();
      setSnackbar({ open: true, message: 'Workflow créé avec succès', severity: 'success' });
    } catch (err: any) {
      console.error('Error creating workflow:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de la création',
        severity: 'error'
      });
    }
  };

  const handleStart = async (id: string) => {
    try {
      await workflowService.start(id);
      loadData();
      setSnackbar({ open: true, message: 'Workflow démarré', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Erreur', severity: 'error' });
    }
  };

  const handleCompleteStep = async (workflowId: string, stepIndex: number) => {
    try {
      await workflowService.completeStep(workflowId, stepIndex);
      loadData();
      setSnackbar({ open: true, message: 'Étape complétée', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce workflow?')) return;
    
    try {
      await workflowService.delete(id);
      loadData();
      setSnackbar({ open: true, message: 'Workflow supprimé', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          name: '',
          description: '',
          order: formData.steps.length + 1,
          requiredAction: 'APPROVE',
          assignedRole: 'admin'
        }
      ]
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    });
  };

  const updateStep = (index: number, field: string, value: any) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'CUSTOM',
      priority: 'MEDIUM',
      isTemplate: false,
      steps: [],
      settings: {
        requireSequential: true,
        sendNotifications: true,
        autoAssign: false
      }
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      DRAFT: 'default',
      ACTIVE: 'success',
      PAUSED: 'warning',
      COMPLETED: 'info',
      ARCHIVED: 'default'
    };
    return colors[status] || 'default';
  };

  const getStepStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      PENDING: 'default',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      REJECTED: 'error',
      SKIPPED: 'warning'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, any> = {
      LOW: 'default',
      MEDIUM: 'info',
      HIGH: 'warning',
      URGENT: 'error'
    };
    return colors[priority] || 'default';
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         w.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || w.status === filterStatus;
    const matchesType = filterType === 'ALL' || w.type === filterType;
    const matchesView = currentView === 'templates' ? w.isTemplate : !w.isTemplate;
    
    return matchesSearch && matchesStatus && matchesType && (currentView === 'workflows' ? !w.isTemplate : matchesView);
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
              Workflows & Approbations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion des flux d'approbation et processus automatisés
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={loadData}
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
              Nouveau Workflow
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Total</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Actifs</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">{stats.active}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Complétés</Typography>
                <Typography variant="h4" fontWeight={700} color="info.main">{stats.completed}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Brouillons</Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">{stats.draft}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Mes Tâches</Typography>
                <Badge badgeContent={pendingTasks.length} color="error">
                  <Typography variant="h4" fontWeight={700} color="error.main">{pendingTasks.length}</Typography>
                </Badge>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Tabs value={currentView} onChange={(e, v) => setCurrentView(v)} sx={{ mb: 2 }}>
          <Tab label="Workflows Actifs" value="workflows" />
          <Tab
            label={
              <Badge badgeContent={pendingTasks.length} color="error">
                <span>Mes Tâches</span>
              </Badge>
            }
            value="tasks"
          />
          <Tab label="Templates" value="templates" />
        </Tabs>

        {/* Filtres */}
        {currentView === 'workflows' && (
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder="Rechercher un workflow..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterStatus}
                label="Statut"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="ALL">Tous</MenuItem>
                <MenuItem value="DRAFT">Brouillon</MenuItem>
                <MenuItem value="ACTIVE">Actif</MenuItem>
                <MenuItem value="PAUSED">En Pause</MenuItem>
                <MenuItem value="COMPLETED">Complété</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="ALL">Tous</MenuItem>
                <MenuItem value="DOCUMENT_APPROVAL">Documents</MenuItem>
                <MenuItem value="ENTERPRISE_VALIDATION">Entreprises</MenuItem>
                <MenuItem value="REPORT_REVIEW">Rapports</MenuItem>
                <MenuItem value="CONVENTION_APPROVAL">Conventions</MenuItem>
                <MenuItem value="CUSTOM">Personnalisé</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        )}
      </Box>

      {/* Vue Workflows */}
      {currentView === 'workflows' && (
        <>
          {filteredWorkflows.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Aucun workflow trouvé. {searchTerm ? 'Essayez de modifier votre recherche.' : 'Créez votre premier workflow!'}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredWorkflows.map((workflow) => (
                <Grid item xs={12} md={6} lg={4} key={workflow._id}>
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
                      },
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            {workflow.name}
                          </Typography>
                          <Stack direction="row" spacing={1} mb={1}>
                            <Chip
                              label={workflow.status}
                              color={getStatusColor(workflow.status)}
                              size="small"
                            />
                            <Chip
                              label={workflow.priority}
                              color={getPriorityColor(workflow.priority)}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      </Stack>

                      {workflow.description && (
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {workflow.description}
                        </Typography>
                      )}

                      {/* Progression */}
                      <Box mb={2}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Progression
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {workflow.metrics?.progressPercentage || 0}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={workflow.metrics?.progressPercentage || 0}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.grey[500], 0.1)
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" mt={0.5}>
                          Étape {workflow.metrics?.currentStep || 1} sur {workflow.steps?.length || 0}
                        </Typography>
                      </Box>

                      {/* Steps preview */}
                      <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.03), borderRadius: 2, mb: 2 }}>
                        <Stack spacing={0.5}>
                          {workflow.steps?.slice(0, 3).map((step, idx) => (
                            <Stack key={idx} direction="row" spacing={1} alignItems="center">
                              {step.status === 'COMPLETED' ? (
                                <CheckCircle fontSize="small" color="success" />
                              ) : step.status === 'IN_PROGRESS' ? (
                                <WatchLater fontSize="small" color="info" />
                              ) : (
                                <Pending fontSize="small" color="action" />
                              )}
                              <Typography variant="caption">
                                {step.name}
                              </Typography>
                            </Stack>
                          ))}
                          {workflow.steps && workflow.steps.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{workflow.steps.length - 3} autres étapes
                            </Typography>
                          )}
                        </Stack>
                      </Paper>

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            setViewDialog(true);
                          }}
                          sx={{ textTransform: 'none', flex: 1 }}
                        >
                          Voir
                        </Button>
                        {workflow.status === 'DRAFT' && (
                          <Tooltip title="Démarrer">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStart(workflow._id)}
                              sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(workflow._id)}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Vue Mes Tâches */}
      {currentView === 'tasks' && (
        <Grid container spacing={3}>
          {pendingTasks.length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Aucune tâche en attente. Vous êtes à jour ! 🎉
              </Alert>
            </Grid>
          ) : (
            pendingTasks.map((task, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {task.stepName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Workflow: {task.workflowName}
                        </Typography>
                      </Box>
                      <Chip
                        label={task.priority}
                        color={getPriorityColor(task.priority)}
                        size="small"
                      />
                    </Stack>
                    
                    {task.dueDate && (
                      <Typography variant="caption" color="warning.main">
                        Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}
                      </Typography>
                    )}
                    
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        onClick={() => handleCompleteStep(task.workflowId, task.stepIndex)}
                        sx={{ flex: 1 }}
                      >
                        Compléter
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedWorkflow(workflows.find(w => w._id === task.workflowId) || null);
                          setViewDialog(true);
                        }}
                      >
                        Détails
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Vue Templates */}
      {currentView === 'templates' && (
        <Grid container spacing={3}>
          {workflows.filter(w => w.isTemplate).length === 0 ? (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Aucun template de workflow. Créez des templates pour réutiliser vos processus !
              </Alert>
            </Grid>
          ) : (
            workflows.filter(w => w.isTemplate).map((workflow) => (
              <Grid item xs={12} md={6} key={workflow._id}>
                <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {workflow.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {workflow.steps?.length || 0} étapes • {workflow.type}
                    </Typography>
                    <Button variant="outlined" size="small" fullWidth>
                      Utiliser ce Template
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
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
            Créer un Nouveau Workflow
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {/* Informations de base */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Nom du Workflow *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Priorité</InputLabel>
                  <Select
                    value={formData.priority}
                    label="Priorité"
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <MenuItem value="LOW">Basse</MenuItem>
                    <MenuItem value="MEDIUM">Moyenne</MenuItem>
                    <MenuItem value="HIGH">Haute</MenuItem>
                    <MenuItem value="URGENT">Urgente</MenuItem>
                  </Select>
                </FormControl>
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
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <MenuItem value="DOCUMENT_APPROVAL">Approbation Document</MenuItem>
                    <MenuItem value="ENTERPRISE_VALIDATION">Validation Entreprise</MenuItem>
                    <MenuItem value="REPORT_REVIEW">Révision Rapport</MenuItem>
                    <MenuItem value="CONVENTION_APPROVAL">Approbation Convention</MenuItem>
                    <MenuItem value="VISIT_APPROVAL">Approbation Visite</MenuItem>
                    <MenuItem value="CUSTOM">Personnalisé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Étapes */}
            <Divider />
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Étapes du Workflow
                </Typography>
                <Button
                  size="small"
                  startIcon={<Add />}
                  onClick={addStep}
                  variant="outlined"
                >
                  Ajouter Étape
                </Button>
              </Stack>

              {formData.steps.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  Ajoutez des étapes à votre workflow
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {formData.steps.map((step, index) => (
                    <Paper key={index} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Étape {index + 1}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => removeStep(index)}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Nom de l'étape"
                            value={step.name}
                            onChange={(e) => updateStep(index, 'name', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Action Requise</InputLabel>
                            <Select
                              value={step.requiredAction}
                              label="Action Requise"
                              onChange={(e) => updateStep(index, 'requiredAction', e.target.value)}
                            >
                              <MenuItem value="APPROVE">Approuver</MenuItem>
                              <MenuItem value="REVIEW">Réviser</MenuItem>
                              <MenuItem value="VALIDATE">Valider</MenuItem>
                              <MenuItem value="COMMENT">Commenter</MenuItem>
                              <MenuItem value="UPLOAD">Télécharger</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Description"
                            value={step.description}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Assigné à</InputLabel>
                            <Select
                              value={step.assignedRole}
                              label="Assigné à"
                              onChange={(e) => updateStep(index, 'assignedRole', e.target.value)}
                            >
                              <MenuItem value="admin">Admin</MenuItem>
                              <MenuItem value="manager">Manager</MenuItem>
                              <MenuItem value="validator">Validateur</MenuItem>
                              <MenuItem value="reviewer">Réviseur</MenuItem>
                              <MenuItem value="approver">Approbateur</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialog(false); resetForm(); }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!formData.name || formData.steps.length === 0}
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
        {selectedWorkflow && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedWorkflow.name}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={selectedWorkflow.status} color={getStatusColor(selectedWorkflow.status)} />
                  <Chip label={selectedWorkflow.priority} color={getPriorityColor(selectedWorkflow.priority)} />
                </Stack>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                {selectedWorkflow.description && (
                  <Typography variant="body1" color="text.secondary">
                    {selectedWorkflow.description}
                  </Typography>
                )}

                {/* Progression */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Progression du Workflow
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedWorkflow.metrics?.progressPercentage || 0}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {selectedWorkflow.metrics?.progressPercentage || 0}% complété • 
                    Étape {selectedWorkflow.metrics?.currentStep || 1} sur {selectedWorkflow.steps?.length || 0}
                  </Typography>
                </Paper>

                {/* Étapes avec Stepper */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Étapes
                  </Typography>
                  <Stepper orientation="vertical" activeStep={selectedWorkflow.metrics?.currentStep || 0}>
                    {selectedWorkflow.steps?.map((step, index) => (
                      <Step key={index} completed={step.status === 'COMPLETED'}>
                        <StepLabel
                          error={step.status === 'REJECTED'}
                          icon={
                            step.status === 'COMPLETED' ? (
                              <CheckCircle color="success" />
                            ) : step.status === 'REJECTED' ? (
                              <ErrorOutline color="error" />
                            ) : step.status === 'IN_PROGRESS' ? (
                              <WatchLater color="info" />
                            ) : (
                              <Pending color="action" />
                            )
                          }
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {step.name}
                          </Typography>
                          {step.description && (
                            <Typography variant="caption" color="text.secondary">
                              {step.description}
                            </Typography>
                          )}
                        </StepLabel>
                        <StepContent>
                          <Stack spacing={1} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Action: {step.requiredAction}
                            </Typography>
                            {step.comment && (
                              <Alert severity="info" sx={{ borderRadius: 1 }}>
                                {step.comment}
                              </Alert>
                            )}
                            {step.status === 'IN_PROGRESS' && selectedWorkflow.status === 'ACTIVE' && (
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleCompleteStep(selectedWorkflow._id, index)}
                                >
                                  Compléter
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                >
                                  Rejeter
                                </Button>
                              </Stack>
                            )}
                          </Stack>
                        </StepContent>
                      </Step>
                    ))}
                  </Stepper>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Fermer</Button>
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

export default AdminWorkflows;
