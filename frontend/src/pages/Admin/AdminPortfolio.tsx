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
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  Avatar,
  AvatarGroup,
  ToggleButtonGroup,
  ToggleButton
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
  FolderOpen,
  AttachMoney,
  People,
  Flag,
  CalendarToday,
  BarChart,
  PieChart,
  ShowChart,
  MoreVert,
  Group,
  Description,
  AccountTree,
  CorporateFare,
  Public,
  LocalOffer,
  ErrorOutline,
  LightbulbOutlined,
  TableChart,
  ViewModule,
  ViewList,
  FilterList,
  AddCircle,
  KeyboardArrowRight,
  TrendingFlat
} from '@mui/icons-material';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import portfolioService, { Portfolio, Risk, LessonLearned } from '../../services/portfolioService';
import axios from 'axios';

interface Entreprise {
  _id: string;
  identification?: {
    nomEntreprise?: string;
  };
  nom?: string;
  name?: string;
  statut?: string;
}

const AdminPortfolio: React.FC = () => {
  const theme = useTheme();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'stats'>('card');
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [riskDialog, setRiskDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuPortfolio, setMenuPortfolio] = useState<Portfolio | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    portfolioType: 'PROGRAM' as Portfolio['portfolioType'],
    status: 'PLANNING' as Portfolio['status'],
    visibility: 'INTERNAL' as Portfolio['visibility'],
    projects: [] as string[],
    startDate: '',
    endDate: '',
    fiscalYear: '',
    totalBudget: 0,
    currency: 'FCFA' as 'FCFA' | 'USD' | 'EUR',
    tags: [] as string[]
  });

  // Risk form
  const [riskForm, setRiskForm] = useState({
    description: '',
    category: 'OPERATIONAL' as Risk['category'],
    probability: 'MEDIUM' as Risk['probability'],
    impact: 'MEDIUM' as Risk['impact'],
    mitigationPlan: '',
    affectedProjects: [] as string[]
  });

  // Lesson form
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    category: '',
    recommendations: [] as string[]
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchPortfolios(),
      fetchEntreprises(),
      fetchGlobalStats()
    ]);
  };

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const data = await portfolioService.getAll();
      setPortfolios(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching portfolios:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des portfolios');
      setPortfolios([]);
    } finally {
      setLoading(false);
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

  const fetchGlobalStats = async () => {
    try {
      const stats = await portfolioService.getGlobalStats();
      setGlobalStats(stats);
    } catch (err) {
      console.error('Error fetching global stats:', err);
    }
  };

  const handleCreate = async () => {
    try {
      const dataToSubmit = {
        name: formData.name,
        description: formData.description,
        code: formData.code,
        portfolioType: formData.portfolioType,
        status: formData.status,
        visibility: formData.visibility,
        projects: formData.projects,
        period: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          fiscalYear: formData.fiscalYear
        },
        budget: {
          totalBudget: {
            amount: formData.totalBudget,
            currency: formData.currency
          },
          allocated: 0,
          spent: 0,
          committed: 0,
          available: formData.totalBudget,
          breakdown: []
        },
        tags: formData.tags,
        objectives: [],
        aggregatedIndicators: [],
        donors: [],
        partners: [],
        geographicCoverage: [],
        beneficiaries: {
          direct: { target: 0, reached: 0, breakdown: [] },
          indirect: { target: 0, estimated: 0 }
        },
        risks: [],
        lessonsLearned: [],
        reportingSchedule: [],
        performance: {
          overallScore: 0,
          dimensions: []
        },
        team: []
      };

      await portfolioService.create(dataToSubmit);
      fetchPortfolios();
      setCreateDialog(false);
      resetForm();
      setSnackbar({ open: true, message: 'Portfolio créé avec succès', severity: 'success' });
    } catch (err: any) {
      console.error('Error creating portfolio:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Erreur lors de la création',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce portfolio?')) return;

    try {
      await portfolioService.delete(id);
      fetchPortfolios();
      setSnackbar({ open: true, message: 'Portfolio supprimé', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const handleAddRisk = async () => {
    if (!selectedPortfolio) return;

    try {
      await portfolioService.addRisk(selectedPortfolio._id, riskForm);
      fetchPortfolios();
      setRiskDialog(false);
      setRiskForm({
        description: '',
        category: 'OPERATIONAL',
        probability: 'MEDIUM',
        impact: 'MEDIUM',
        mitigationPlan: '',
        affectedProjects: []
      });
      setSnackbar({ open: true, message: 'Risque ajouté avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'ajout du risque', severity: 'error' });
    }
  };

  const handleAddLesson = async () => {
    if (!selectedPortfolio) return;

    try {
      await portfolioService.addLessonLearned(selectedPortfolio._id, lessonForm);
      fetchPortfolios();
      setLessonDialog(false);
      setLessonForm({ title: '', description: '', category: '', recommendations: [] });
      setSnackbar({ open: true, message: 'Leçon ajoutée avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'ajout de la leçon', severity: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      code: '',
      portfolioType: 'PROGRAM',
      status: 'PLANNING',
      visibility: 'INTERNAL',
      projects: [],
      startDate: '',
      endDate: '',
      fiscalYear: '',
      totalBudget: 0,
      currency: 'FCFA',
      tags: []
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PLANNING: 'info',
      ACTIVE: 'success',
      CLOSING: 'warning',
      CLOSED: 'default',
      ON_HOLD: 'error'
    };
    return colors[status] || 'default';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      PROGRAM: AccountTree,
      THEME: LocalOffer,
      REGION: Public,
      DONOR: CorporateFare,
      CUSTOM: FolderOpen
    };
    const Icon = icons[type] || FolderOpen;
    return <Icon />;
  };

  const getRiskLevel = (probability: string, impact: string) => {
    const levels: Record<string, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    const score = levels[probability] + levels[impact];
    if (score >= 7) return { level: 'Critique', color: 'error' };
    if (score >= 5) return { level: 'Élevé', color: 'warning' };
    if (score >= 3) return { level: 'Moyen', color: 'info' };
    return { level: 'Faible', color: 'success' };
  };

  const getEntrepriseNom = (entreprise: any) => {
    if (!entreprise) return 'N/A';
    if (typeof entreprise === 'string') return 'N/A';
    return entreprise.identification?.nomEntreprise || entreprise.nom || entreprise.name || 'N/A';
  };

  const filteredPortfolios = portfolios.filter(p => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      tabValue === 0 ||
      (tabValue === 1 && p.status === 'ACTIVE') ||
      (tabValue === 2 && p.status === 'PLANNING') ||
      (tabValue === 3 && p.status === 'CLOSING');

    return matchesSearch && matchesTab;
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (loading && portfolios.length === 0) {
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
              Gestion de Portfolio
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue consolidée et gestion stratégique de vos projets
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchAll}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => setSnackbar({ open: true, message: 'Export en cours...', severity: 'info' })}
              sx={{ borderRadius: 2 }}
            >
              Exporter
          </Button>
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
              Nouveau Portfolio
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
        {error}
      </Alert>
        )}

        {/* Stats globales */}
        {globalStats && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <FolderOpen color="primary" />
                  <Typography variant="caption" color="text.secondary">Total Portfolios</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {globalStats.totalPortfolios || 0}
      </Typography>
                <Typography variant="caption" color="success.main">
                  {globalStats.activePortfolios || 0} actifs
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <AccountTree color="success" />
                  <Typography variant="caption" color="text.secondary">Total Projets</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {globalStats.totalProjects || 0}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <AttachMoney color="warning" />
                  <Typography variant="caption" color="text.secondary">Budget Total</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {(globalStats.totalBudget || 0).toLocaleString()} FCFA
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round((globalStats.spentBudget / globalStats.totalBudget) * 100 || 0)}% dépensé
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Assessment color="info" />
                  <Typography variant="caption" color="text.secondary">Performance Moy.</Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {globalStats.avgPerformanceScore || 0}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <ErrorOutline color="error" />
                  <Typography variant="caption" color="text.secondary">Types</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                  {globalStats.byType && Object.entries(globalStats.byType).map(([type, count]: any) => (
                    <Chip key={type} label={`${type}: ${count}`} size="small" />
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tabs et contrôles */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={2}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Tous" />
            <Tab label="Actifs" />
            <Tab label="En Planification" />
            <Tab label="En Clôture" />
          </Tabs>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="card">
              <ViewModule fontSize="small" />
            </ToggleButton>
            <ToggleButton value="table">
              <ViewList fontSize="small" />
            </ToggleButton>
            <ToggleButton value="stats">
              <BarChart fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <TextField
          fullWidth
          placeholder="Rechercher un portfolio..."
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
      </Box>

      {/* Vue en Cartes */}
      {viewMode === 'card' && (
        <>
          {filteredPortfolios.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Aucun portfolio trouvé. {searchTerm ? 'Essayez de modifier votre recherche.' : 'Créez votre premier portfolio!'}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredPortfolios.map((portfolio) => (
                <Grid item xs={12} md={6} lg={4} key={portfolio._id}>
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
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                        <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1)
                            }}
                          >
                            {getTypeIcon(portfolio.portfolioType)}
                          </Box>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight={700} noWrap>
                              {portfolio.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {portfolio.code}
                </Typography>
              </Box>
                        </Stack>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setMenuPortfolio(portfolio);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Stack>

                      {/* Statut et Type */}
                      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                        <Chip
                          label={portfolio.status}
                          size="small"
                          color={getStatusColor(portfolio.status) as any}
                        />
                        <Chip
                          label={portfolio.portfolioType}
                          size="small"
                          variant="outlined"
                        />
                        {portfolio.tags?.slice(0, 2).map((tag, idx) => (
                          <Chip
                            key={idx}
                            label={tag}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Stack>

                      {/* Description */}
                      {portfolio.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={2}
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {portfolio.description}
                        </Typography>
                      )}

                      {/* Métriques clés */}
                      <Grid container spacing={2} mb={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AccountTree fontSize="small" color="info" />
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  {portfolio.projects?.length || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Projets
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <AttachMoney fontSize="small" color="warning" />
                              <Box>
                                <Typography variant="h6" fontWeight={700} noWrap>
                                  {((portfolio.budget?.totalBudget?.amount || 0) / 1000000).toFixed(1)}M
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {portfolio.budget?.totalBudget?.currency}
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Progress Budget */}
                      <Box mb={2}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Exécution Budget
                          </Typography>
                          <Typography variant="caption" fontWeight={600}>
                            {portfolio.budgetExecutionRate || 0}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={portfolio.budgetExecutionRate || 0}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.grey[500], 0.1)
                          }}
                        />
                      </Box>

                      {/* Performance Score */}
                      {portfolio.performance?.overallScore !== undefined && (
                        <Box mb={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              Score Performance
                            </Typography>
                            <Chip
                              label={`${portfolio.performance.overallScore}%`}
                              size="small"
                              color={
                                portfolio.performance.overallScore >= 75 ? 'success' :
                                portfolio.performance.overallScore >= 50 ? 'warning' : 'error'
                              }
                              sx={{ fontWeight: 700 }}
                            />
                          </Stack>
                        </Box>
                      )}

                      {/* Risques et Équipe */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        {portfolio.risks && portfolio.risks.length > 0 && (
                          <Tooltip title="Risques">
                            <Chip
                              icon={<ErrorOutline />}
                              label={portfolio.risks.length}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                        {portfolio.team && portfolio.team.length > 0 && (
                          <AvatarGroup max={3} sx={{ ml: 'auto' }}>
                            {portfolio.team.map((member, idx) => (
                              <Avatar key={idx} sx={{ width: 28, height: 28 }}>
                                {member.role?.charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        )}
                      </Stack>

                      {/* Actions */}
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<Visibility />}
                          size="small"
                          onClick={() => {
                            setSelectedPortfolio(portfolio);
                            setViewDialog(true);
                          }}
                        >
                          Détails
                        </Button>
                        <Tooltip title="Ajouter risque">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedPortfolio(portfolio);
                              setRiskDialog(true);
                            }}
                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                          >
                            <ErrorOutline />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ajouter leçon">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => {
                              setSelectedPortfolio(portfolio);
                              setLessonDialog(true);
                            }}
                            sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                          >
                            <LightbulbOutlined />
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

      {/* Vue en Tableau */}
      {viewMode === 'table' && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell>Portfolio</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Projets</TableCell>
                <TableCell align="right">Budget</TableCell>
                <TableCell align="right">Performance</TableCell>
                <TableCell align="right">Risques</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPortfolios.map((portfolio) => (
                <TableRow
                  key={portfolio._id}
                  sx={{
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedPortfolio(portfolio);
                    setViewDialog(true);
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {getTypeIcon(portfolio.portfolioType)}
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {portfolio.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {portfolio.code}
                </Typography>
              </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={portfolio.portfolioType} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={portfolio.status}
                      size="small"
                      color={getStatusColor(portfolio.status) as any}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {portfolio.projects?.length || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {((portfolio.budget?.totalBudget?.amount || 0) / 1000000).toFixed(1)}M
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {portfolio.budget?.totalBudget?.currency}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${portfolio.performance?.overallScore || 0}%`}
                      size="small"
                      color={
                        (portfolio.performance?.overallScore || 0) >= 75 ? 'success' :
                        (portfolio.performance?.overallScore || 0) >= 50 ? 'warning' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Badge badgeContent={portfolio.risks?.length || 0} color="error">
                      <ErrorOutline color="action" />
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Voir détails">
                        <IconButton size="small" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(portfolio._id);
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Vue Statistiques */}
      {viewMode === 'stats' && globalStats && (
        <Grid container spacing={3}>
          {/* Distribution par type */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Distribution par Type
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={Object.entries(globalStats.byType || {}).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(globalStats.byType || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RePieChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
          </Grid>

          {/* Performance par portfolio */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Performance par Portfolio
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart
                    data={portfolios.slice(0, 5).map(p => ({
                      name: p.code,
                      performance: p.performance?.overallScore || 0,
                      budget: p.budgetExecutionRate || 0
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="performance" fill={theme.palette.primary.main} name="Performance %" />
                    <Bar dataKey="budget" fill={theme.palette.warning.main} name="Budget %" />
                  </ReBarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>
          </Grid>

          {/* Évolution temporelle */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Tendances et Indicateurs Clés
                </Typography>
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 48, color: theme.palette.success.main }} />
                      <Typography variant="h5" fontWeight={700} mt={1}>
                        +{Math.round(Math.random() * 20)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Croissance Projets
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                      <AttachMoney sx={{ fontSize: 48, color: theme.palette.warning.main }} />
                      <Typography variant="h5" fontWeight={700} mt={1}>
                        {Math.round((globalStats.spentBudget / globalStats.totalBudget) * 100 || 0)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Taux d'Exécution
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                      <Group sx={{ fontSize: 48, color: theme.palette.info.main }} />
                      <Typography variant="h5" fontWeight={700} mt={1}>
                        {portfolios.reduce((sum, p) => sum + (p.team?.length || 0), 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Membres d'Équipe
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                      <ErrorOutline sx={{ fontSize: 48, color: theme.palette.error.main }} />
                      <Typography variant="h5" fontWeight={700} mt={1}>
                        {portfolios.reduce((sum, p) => sum + (p.risks?.filter(r => r.probability === 'CRITICAL').length || 0), 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Risques Critiques
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            if (menuPortfolio) {
              setSelectedPortfolio(menuPortfolio);
              setViewDialog(true);
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>Voir détails</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPortfolio) {
              setSelectedPortfolio(menuPortfolio);
              setRiskDialog(true);
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon><ErrorOutline fontSize="small" /></ListItemIcon>
          <ListItemText>Ajouter risque</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPortfolio) {
              setSelectedPortfolio(menuPortfolio);
              setLessonDialog(true);
            }
            setAnchorEl(null);
          }}
        >
          <ListItemIcon><LightbulbOutlined fontSize="small" /></ListItemIcon>
          <ListItemText>Ajouter leçon</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (menuPortfolio) {
              handleDelete(menuPortfolio._id);
            }
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

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
            Créer un Nouveau Portfolio
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Nom du Portfolio *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Code *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="PF-001"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type *</InputLabel>
                <Select
                  value={formData.portfolioType}
                  label="Type *"
                  onChange={(e) => setFormData({ ...formData, portfolioType: e.target.value as any })}
                >
                  <MenuItem value="PROGRAM">Programme</MenuItem>
                  <MenuItem value="THEME">Thématique</MenuItem>
                  <MenuItem value="REGION">Régional</MenuItem>
                  <MenuItem value="DONOR">Bailleur</MenuItem>
                  <MenuItem value="CUSTOM">Personnalisé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Statut *</InputLabel>
                <Select
                  value={formData.status}
                  label="Statut *"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="PLANNING">Planification</MenuItem>
                  <MenuItem value="ACTIVE">Actif</MenuItem>
                  <MenuItem value="CLOSING">En Clôture</MenuItem>
                  <MenuItem value="CLOSED">Fermé</MenuItem>
                  <MenuItem value="ON_HOLD">En Pause</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de Début"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de Fin"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Budget Total"
                type="number"
                value={formData.totalBudget}
                onChange={(e) => setFormData({ ...formData, totalBudget: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Devise</InputLabel>
                <Select
                  value={formData.currency}
                  label="Devise"
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                >
                  <MenuItem value="FCFA">FCFA</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={entreprises}
                getOptionLabel={(option) => getEntrepriseNom(option)}
                value={entreprises.filter(e => formData.projects.includes(e._id))}
                onChange={(e, newValue) => setFormData({ ...formData, projects: newValue.map(e => e._id) })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Projets à inclure (optionnel)"
                    placeholder="Sélectionner des projets..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.tags}
                onChange={(e, newValue) => setFormData({ ...formData, tags: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags (optionnel)"
                    placeholder="Ajouter des tags..."
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
            disabled={!formData.name || !formData.code || !formData.startDate || !formData.endDate}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de Visualisation Détaillée */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
      >
        {selectedPortfolio && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedPortfolio.name}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip label={selectedPortfolio.code} color="primary" size="small" />
                    <Chip
                      label={selectedPortfolio.status}
                      color={getStatusColor(selectedPortfolio.status) as any}
                      size="small"
                    />
                    <Chip label={selectedPortfolio.portfolioType} size="small" variant="outlined" />
                  </Stack>
      </Box>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Vue d'ensemble */}
                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Vue d'Ensemble
                  </Typography>
                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Période</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedPortfolio.period?.startDate ? new Date(selectedPortfolio.period.startDate).toLocaleDateString() : 'N/A'}
                        {' - '}
                        {selectedPortfolio.period?.endDate ? new Date(selectedPortfolio.period.endDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Projets</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedPortfolio.projects?.length || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Budget Total</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {(selectedPortfolio.budget?.totalBudget?.amount || 0).toLocaleString()} {selectedPortfolio.budget?.totalBudget?.currency}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="caption" color="text.secondary">Performance</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedPortfolio.performance?.overallScore || 0}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Risques */}
                {selectedPortfolio.risks && selectedPortfolio.risks.length > 0 && (
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Risques ({selectedPortfolio.risks.length})
                    </Typography>
                    <Stack spacing={1} mt={2}>
                      {selectedPortfolio.risks.slice(0, 5).map((risk, idx) => {
                        const riskLevel = getRiskLevel(risk.probability, risk.impact);
                        return (
                          <Paper
                            key={idx}
                            sx={{
                              p: 1.5,
                              borderRadius: 1,
                              border: 1,
                              borderColor: `${riskLevel.color}.main`,
                              bgcolor: alpha(theme.palette[riskLevel.color as 'error'].main, 0.05)
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="start">
                              <Box flex={1}>
                                <Typography variant="body2" fontWeight={600}>
                                  {risk.description}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Catégorie: {risk.category} | Probabilité: {risk.probability} | Impact: {risk.impact}
                                </Typography>
    </Box>
                              <Chip
                                label={riskLevel.level}
                                size="small"
                                color={riskLevel.color as any}
                              />
                            </Stack>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Paper>
                )}

                {/* Leçons apprises */}
                {selectedPortfolio.lessonsLearned && selectedPortfolio.lessonsLearned.length > 0 && (
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Leçons Apprises ({selectedPortfolio.lessonsLearned.length})
                    </Typography>
                    <Stack spacing={1} mt={2}>
                      {selectedPortfolio.lessonsLearned.slice(0, 3).map((lesson, idx) => (
                        <Paper
                          key={idx}
                          sx={{ p: 1.5, borderRadius: 1, border: 1, borderColor: 'divider' }}
                        >
                          <Stack direction="row" spacing={1} alignItems="start">
                            <LightbulbOutlined color="primary" />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {lesson.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {lesson.description}
                              </Typography>
                              {lesson.recommendations && lesson.recommendations.length > 0 && (
                                <Box mt={0.5}>
                                  <Typography variant="caption" fontWeight={600}>Recommandations:</Typography>
                                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {lesson.recommendations.slice(0, 2).map((rec, i) => (
                                      <li key={i}>
                                        <Typography variant="caption">{rec}</Typography>
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}
                            </Box>
                            <Chip label={lesson.status} size="small" />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </Paper>
                )}

                {/* Équipe */}
                {selectedPortfolio.team && selectedPortfolio.team.length > 0 && (
                  <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Équipe ({selectedPortfolio.team.length})
                    </Typography>
                    <Grid container spacing={1} mt={1}>
                      {selectedPortfolio.team.map((member, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Paper sx={{ p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                {member.role?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {member.role}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {member.projects?.length || 0} projets
                                </Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Fermer</Button>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={() => setSnackbar({ open: true, message: 'Rapport en cours de génération...', severity: 'info' })}
              >
                Générer Rapport
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialogue d'Ajout de Risque */}
      <Dialog
        open={riskDialog}
        onClose={() => setRiskDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Ajouter un Risque
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Description du risque *"
              multiline
              rows={3}
              value={riskForm.description}
              onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Catégorie *</InputLabel>
              <Select
                value={riskForm.category}
                label="Catégorie *"
                onChange={(e) => setRiskForm({ ...riskForm, category: e.target.value as any })}
              >
                <MenuItem value="FINANCIAL">Financier</MenuItem>
                <MenuItem value="OPERATIONAL">Opérationnel</MenuItem>
                <MenuItem value="STRATEGIC">Stratégique</MenuItem>
                <MenuItem value="REPUTATIONAL">Réputationnel</MenuItem>
                <MenuItem value="COMPLIANCE">Conformité</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Probabilité *</InputLabel>
                  <Select
                    value={riskForm.probability}
                    label="Probabilité *"
                    onChange={(e) => setRiskForm({ ...riskForm, probability: e.target.value as any })}
                  >
                    <MenuItem value="LOW">Faible</MenuItem>
                    <MenuItem value="MEDIUM">Moyenne</MenuItem>
                    <MenuItem value="HIGH">Élevée</MenuItem>
                    <MenuItem value="CRITICAL">Critique</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Impact *</InputLabel>
                  <Select
                    value={riskForm.impact}
                    label="Impact *"
                    onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value as any })}
                  >
                    <MenuItem value="LOW">Faible</MenuItem>
                    <MenuItem value="MEDIUM">Moyen</MenuItem>
                    <MenuItem value="HIGH">Élevé</MenuItem>
                    <MenuItem value="CRITICAL">Critique</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Plan de Mitigation"
              multiline
              rows={2}
              value={riskForm.mitigationPlan}
              onChange={(e) => setRiskForm({ ...riskForm, mitigationPlan: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRiskDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleAddRisk}
            disabled={!riskForm.description}
          >
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'Ajout de Leçon */}
      <Dialog
        open={lessonDialog}
        onClose={() => setLessonDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Ajouter une Leçon Apprise
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Titre *"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description *"
              multiline
              rows={3}
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Catégorie"
              value={lessonForm.category}
              onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={lessonForm.recommendations}
              onChange={(e, newValue) => setLessonForm({ ...lessonForm, recommendations: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Recommandations"
                  placeholder="Ajouter une recommandation..."
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleAddLesson}
            disabled={!lessonForm.title || !lessonForm.description}
          >
            Ajouter
          </Button>
        </DialogActions>
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

export default AdminPortfolio;
