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
  Avatar,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Tooltip,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Business,
  Search,
  Add,
  Edit,
  Visibility,
  TrendingUp,
  TrendingDown,
  People,
  AttachMoney,
  LocationOn,
  FilterList,
  Download,
  Refresh,
  CheckCircle,
  Warning,
  Cancel,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Assessment,
  Timeline,
  SwapHoriz,
  Description,
  CalendarToday
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  getEntreprises, 
  getGlobalStats,
  updateEntrepriseStatut,
  updateEntrepriseConformite,
  getEntrepriseComplete,
  Entreprise, 
  EntrepriseStats 
} from '../../services/entrepriseService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminEntreprises: React.FC = () => {
  const theme = useTheme();
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('ALL');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [filterSecteur, setFilterSecteur] = useState('ALL');
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [detailTab, setDetailTab] = useState(0);
  const [completeData, setCompleteData] = useState<any>(null);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [statusChangeDialog, setStatusChangeDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [editingEntreprise, setEditingEntreprise] = useState<Entreprise | null>(null);
  const [conformiteDialog, setConformiteDialog] = useState(false);
  const [newConformite, setNewConformite] = useState('');
  const [commentaireConformite, setCommentaireConformite] = useState('');

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const data = await getEntreprises();
      setEntreprises(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching entreprises:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des entreprises');
      setEntreprises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (entrepriseId: string, nouveauStatut: string) => {
    try {
      await updateEntrepriseStatut(entrepriseId, nouveauStatut);
      
      // Mettre à jour localement
      setEntreprises(prev => prev.map(ent => 
        ent._id === entrepriseId ? { ...ent, statut: nouveauStatut } : ent
      ));
      
      setSnackbar({ 
        open: true, 
        message: `Statut changé en "${nouveauStatut}" avec succès`, 
        severity: 'success' 
      });
    } catch (err: any) {
      console.error('Error updating statut:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Erreur lors du changement de statut', 
        severity: 'error' 
      });
    }
  };

  const openStatusDialog = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setNewStatus(entreprise.statut || 'Actif');
    setStatusChangeDialog(true);
  };

  const confirmStatusChange = async () => {
    if (selectedEntreprise && newStatus) {
      await handleStatusChange(selectedEntreprise._id, newStatus);
      setStatusChangeDialog(false);
    }
  };

  const handleEdit = (entreprise: Entreprise) => {
    setEditingEntreprise(entreprise);
    setEditDialog(true);
  };

  const handleEditFromDialog = () => {
    if (selectedEntreprise) {
      setOpenDialog(false);
      handleEdit(selectedEntreprise);
    }
  };

  const handleViewDetails = async (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setOpenDialog(true);
    setDetailTab(0);
    
    // Load complete data
    setLoadingComplete(true);
    try {
      const data = await getEntrepriseComplete(entreprise._id);
      setCompleteData(data);
    } catch (error) {
      console.error('Error loading complete data:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des données complètes',
        severity: 'error'
      });
    } finally {
      setLoadingComplete(false);
    }
  };

  const openConformiteDialog = (entreprise: Entreprise) => {
    setSelectedEntreprise(entreprise);
    setNewConformite(entreprise.conformite || 'Non vérifié');
    setCommentaireConformite(entreprise.commentaireConformite || '');
    setConformiteDialog(true);
  };

  const confirmConformiteChange = async () => {
    if (selectedEntreprise && newConformite) {
      try {
        await updateEntrepriseConformite(selectedEntreprise._id, newConformite, commentaireConformite);
        
        // Mettre à jour localement
        setEntreprises(prev => prev.map(ent => 
          ent._id === selectedEntreprise._id 
            ? { ...ent, conformite: newConformite, commentaireConformite } 
            : ent
        ));
        
        setSnackbar({ 
          open: true, 
          message: `Conformité changée en "${newConformite}" avec succès`, 
          severity: 'success' 
        });
        setConformiteDialog(false);
      } catch (err: any) {
        console.error('Error updating conformite:', err);
        setSnackbar({ 
          open: true, 
          message: err.response?.data?.message || 'Erreur lors du changement de conformité', 
          severity: 'error' 
        });
      }
    }
  };

  const getStatusColor = (statut?: string) => {
    switch (statut) {
      case 'Actif': return 'success';
      case 'En attente': return 'warning';
      case 'Suspendu': return 'error';
      case 'Inactif': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (statut?: string) => {
    switch (statut) {
      case 'Actif': return <CheckCircle />;
      case 'En attente': return <Warning />;
      case 'Suspendu': return <Cancel />;
      default: return <Business />;
    }
  };

  const getConformiteColor = (conformite?: string) => {
    switch (conformite) {
      case 'Conforme': return 'success';
      case 'Non conforme': return 'error';
      case 'En cours de vérification': return 'warning';
      case 'Non vérifié': return 'default';
      default: return 'default';
    }
  };

  // Filtrage
  const filteredEntreprises = entreprises.filter(ent => {
    const matchesSearch = 
      ent.identification?.nomEntreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ent.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = filterStatut === 'ALL' || ent.statut === filterStatut;
    const matchesRegion = filterRegion === 'ALL' || ent.identification?.region === filterRegion;
    const matchesSecteur = filterSecteur === 'ALL' || ent.identification?.secteurActivite === filterSecteur;
    return matchesSearch && matchesStatut && matchesRegion && matchesSecteur;
  });

  // Statistiques
  const stats = {
    total: entreprises.length,
    actives: entreprises.filter(e => e.statut === 'Actif').length,
    enAttente: entreprises.filter(e => e.statut === 'En attente').length,
    suspendues: entreprises.filter(e => e.statut === 'Suspendu').length,
    completes: entreprises.filter(e => e.informationsCompletes).length,
    employes: entreprises.reduce((sum, e) => sum + (e.investissementEmploi?.effectifsEmployes || 0), 0)
  };

  // Données pour graphiques
  const statutData = [
    { name: 'Actif', value: stats.actives, color: theme.palette.success.main },
    { name: 'En attente', value: stats.enAttente, color: theme.palette.warning.main },
    { name: 'Suspendu', value: stats.suspendues, color: theme.palette.error.main },
    { name: 'Inactif', value: stats.total - stats.actives - stats.enAttente - stats.suspendues, color: theme.palette.grey[400] }
  ].filter(item => item.value > 0);

  const regionData = Array.from(
    entreprises.reduce((acc, e) => {
      const region = e.identification?.region || 'Non spécifié';
      acc.set(region, (acc.get(region) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }))
   .sort((a, b) => b.value - a.value)
   .slice(0, 5);

  const secteurData = Array.from(
    entreprises.reduce((acc, e) => {
      const secteur = e.identification?.secteurActivite || 'Non spécifié';
      acc.set(secteur, (acc.get(secteur) || 0) + 1);
      return acc;
    }, new Map<string, number>())
  ).map(([name, value]) => ({ name, value }));

  // Évolution temporelle (par mois de création)
  const evolutionData = Array.from(
    entreprises.reduce((acc, e) => {
      if (e.createdAt) {
        const date = new Date(e.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc.set(key, (acc.get(key) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>())
  )
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  const regions = Array.from(new Set(entreprises.map(e => e.identification?.region).filter(Boolean)));
  const secteurs = Array.from(new Set(entreprises.map(e => e.identification?.secteurActivite).filter(Boolean)));

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
              Gestion des Entreprises
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue d'ensemble et analyse des entreprises partenaires
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchEntreprises}
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
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Download color="primary" />
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
              Nouvelle Entreprise
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Actives</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.actives}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">En Attente</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.enAttente}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Suspendues</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">{stats.suspendues}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Complètes</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">{stats.completes}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Employés</Typography>
              <Typography variant="h4" fontWeight={700} color="secondary.main">{stats.employes}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs pour différentes vues */}
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Vue Liste" icon={<Business />} iconPosition="start" />
          <Tab label="Visualisations" icon={<BarChartIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <>
          {/* Search and Filters */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.05)
                }
              }}
            />
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterStatut}
                label="Statut"
                onChange={(e) => setFilterStatut(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">Tous</MenuItem>
                <MenuItem value="Actif">Actif</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Suspendu">Suspendu</MenuItem>
                <MenuItem value="Inactif">Inactif</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Région</InputLabel>
              <Select
                value={filterRegion}
                label="Région"
                onChange={(e) => setFilterRegion(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">Toutes</MenuItem>
                {regions.map(region => (
                  <MenuItem key={region} value={region}>{region}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Secteur</InputLabel>
              <Select
                value={filterSecteur}
                label="Secteur"
                onChange={(e) => setFilterSecteur(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="ALL">Tous</MenuItem>
                {secteurs.map(secteur => (
                  <MenuItem key={secteur} value={secteur}>{secteur}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Entreprises List */}
          {filteredEntreprises.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Aucune entreprise trouvée. {searchTerm ? 'Essayez de modifier votre recherche.' : ''}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredEntreprises.map((entreprise) => (
                <Grid item xs={12} md={6} lg={4} key={entreprise._id}>
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
                      {/* Header */}
                      <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            {entreprise.identification?.nomEntreprise || 'Sans nom'}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <LocationOn fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {entreprise.identification?.ville || 'N/A'}, {entreprise.identification?.region || 'N/A'}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack spacing={0.5}>
                          <Chip
                            label={entreprise.statut || 'N/A'}
                            color={getStatusColor(entreprise.statut) as any}
                            icon={getStatusIcon(entreprise.statut)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Tooltip title="Changer le statut">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openStatusDialog(entreprise);
                              }}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                height: 24,
                                width: 24
                              }}
                            >
                              <SwapHoriz fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Chip
                            label={entreprise.conformite || 'Non vérifié'}
                            color={getConformiteColor(entreprise.conformite) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Tooltip title="Gérer la conformité">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                openConformiteDialog(entreprise);
                              }}
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) },
                                height: 24,
                                width: 24
                              }}
                            >
                              <Assessment fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      {/* Info Grid */}
                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Secteur
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {entreprise.identification?.secteurActivite || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Forme Juridique
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {entreprise.identification?.formeJuridique || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <People fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Employés
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {entreprise.investissementEmploi?.effectifsEmployes || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid item xs={6}>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <CheckCircle fontSize="small" color="action" />
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Profil
                              </Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {entreprise.informationsCompletes ? 'Complet' : 'Incomplet'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>

                      {/* Actions */}
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewDetails(entreprise)}
                          sx={{ textTransform: 'none', flex: 1 }}
                        >
                          Voir
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
                          onClick={() => handleEdit(entreprise)}
                          sx={{ textTransform: 'none', flex: 1 }}
                        >
                          Éditer
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {currentTab === 1 && (
        <Grid container spacing={3}>
          {/* Répartition par Statut */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    <PieChartIcon sx={{ color: 'primary.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Répartition par Statut
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Distribution des entreprises
                    </Typography>
                  </Box>
                </Stack>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>

                <Stack spacing={1} mt={2}>
                  {statutData.map((item, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Stack>
                      <Typography variant="body2" fontWeight="bold">
                        {item.value} ({Math.round((item.value / stats.total) * 100)}%)
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Top 5 Régions */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.1)
                    }}
                  >
                    <LocationOn sx={{ color: 'success.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Top 5 Régions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Répartition géographique
                    </Typography>
                  </Box>
                </Stack>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={regionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill={theme.palette.success.main} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Répartition par Secteur */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.1)
                    }}
                  >
                    <Business sx={{ color: 'info.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Répartition par Secteur
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Secteurs d'activité
                    </Typography>
                  </Box>
                </Stack>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={secteurData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis type="number" stroke={theme.palette.text.secondary} />
                    <YAxis type="category" dataKey="name" stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill={theme.palette.info.main} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Évolution Temporelle */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.warning.main, 0.1)
                    }}
                  >
                    <Timeline sx={{ color: 'warning.main' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      Évolution (6 derniers mois)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nouvelles inscriptions
                    </Typography>
                  </Box>
                </Stack>
                
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis stroke={theme.palette.text.secondary} />
                    <RechartsTooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      stroke={theme.palette.warning.main} 
                      fill={alpha(theme.palette.warning.main, 0.3)} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Status Change Dialog */}
      <Dialog
        open={statusChangeDialog}
        onClose={() => setStatusChangeDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Changer le Statut
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Entreprise: <strong>{selectedEntreprise?.identification?.nomEntreprise}</strong>
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Nouveau Statut</InputLabel>
              <Select
                value={newStatus}
                label="Nouveau Statut"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <MenuItem value="Actif">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle color="success" fontSize="small" />
                    <span>Actif</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="En attente">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Warning color="warning" fontSize="small" />
                    <span>En attente</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="Suspendu">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Cancel color="error" fontSize="small" />
                    <span>Suspendu</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="Inactif">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business color="action" fontSize="small" />
                    <span>Inactif</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
            {newStatus !== selectedEntreprise?.statut && (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Le statut sera changé de <strong>{selectedEntreprise?.statut}</strong> à <strong>{newStatus}</strong>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusChangeDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmStatusChange}
            disabled={newStatus === selectedEntreprise?.statut}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedEntreprise && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedEntreprise.identification?.nomEntreprise}
                </Typography>
                <Chip
                  label={selectedEntreprise.statut}
                  color={getStatusColor(selectedEntreprise.statut) as any}
                  icon={getStatusIcon(selectedEntreprise.statut)}
                />
              </Stack>
              
              {/* Tabs */}
              <Tabs value={detailTab} onChange={(_, v) => setDetailTab(v)} sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="Informations" />
                <Tab label={`Documents (${completeData?.documents?.length || 0})`} />
                <Tab label={`Rapports (${completeData?.reports?.length || 0})`} />
                <Tab label={`KPIs (${completeData?.kpis?.length || 0})`} />
                <Tab label={`Messages (${completeData?.messages?.length || 0})`} />
                <Tab label={`Visites (${completeData?.visits?.length || 0})`} />
              </Tabs>
            </DialogTitle>
            <DialogContent>
              {loadingComplete && (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              )}
              
              {/* Tab 0: Informations Générales */}
              {detailTab === 0 && (
                <Stack spacing={3}>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Informations Générales
                    </Typography>
                    <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Région</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedEntreprise.identification?.region}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Ville</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedEntreprise.identification?.ville}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Secteur</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedEntreprise.identification?.secteurActivite}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Sous-secteur</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedEntreprise.identification?.sousSecteur || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Performance & Emploi
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Effectifs</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedEntreprise.investissementEmploi?.effectifsEmployes || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Nouveaux emplois</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedEntreprise.investissementEmploi?.nouveauxEmploisCrees || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Chiffre d'affaires</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedEntreprise.performanceEconomique?.chiffreAffaires?.montant 
                          ? `${selectedEntreprise.performanceEconomique.chiffreAffaires.montant.toLocaleString()} ${selectedEntreprise.performanceEconomique.chiffreAffaires.devise || 'FCFA'}`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Contact
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body1">
                        {selectedEntreprise.contact?.email || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Téléphone</Typography>
                      <Typography variant="body1">
                        {selectedEntreprise.contact?.telephone || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Stack>
              )}
              
              {/* Tab 1: Documents */}
              {detailTab === 1 && completeData && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Documents ({completeData.documents?.length || 0})</Typography>
                  {completeData.documents && completeData.documents.length > 0 ? (
                    <List>
                      {completeData.documents.slice(0, 20).map((doc: any, idx: number) => (
                        <ListItem key={idx} divider>
                          <ListItemAvatar>
                            <Avatar><Description /></Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={doc.type || 'Document'}
                            secondary={`Status: ${doc.status} - ${doc.createdAt ? format(new Date(doc.createdAt), 'PPP', {locale: fr}) : 'N/A'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">Aucun document disponible</Alert>
                  )}
                </Box>
              )}
              
              {/* Tab 2: Rapports */}
              {detailTab === 2 && completeData && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Rapports ({completeData.reports?.length || 0})</Typography>
                  {completeData.reports && completeData.reports.length > 0 ? (
                    <List>
                      {completeData.reports.slice(0, 20).map((report: any, idx: number) => (
                        <ListItem key={idx} divider>
                          <ListItemAvatar>
                            <Avatar><Assessment /></Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={report.title || 'Rapport'}
                            secondary={`Status: ${report.status} - ${report.createdAt ? format(new Date(report.createdAt), 'PPP', {locale: fr}) : 'N/A'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">Aucun rapport disponible</Alert>
                  )}
                </Box>
              )}
              
              {/* Tab 3: KPIs */}
              {detailTab === 3 && completeData && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>KPIs ({completeData.kpis?.length || 0})</Typography>
                  {completeData.stats?.kpis && (
                    <Paper sx={{ p: 2, mb: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                      <Typography variant="subtitle2">Score moyen: {completeData.stats.kpis.averageScore || 0}</Typography>
                    </Paper>
                  )}
                  {completeData.kpis && completeData.kpis.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {completeData.kpis.slice(0, 20).map((kpi: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell>{kpi.name || 'KPI'}</TableCell>
                            <TableCell>{kpi.score || 0}</TableCell>
                            <TableCell>{kpi.date ? format(new Date(kpi.date), 'PP', {locale: fr}) : 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Alert severity="info">Aucun KPI disponible</Alert>
                  )}
                </Box>
              )}
              
              {/* Tab 4: Messages */}
              {detailTab === 4 && completeData && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Messages ({completeData.messages?.length || 0})</Typography>
                  {completeData.messages && completeData.messages.length > 0 ? (
                    <List>
                      {completeData.messages.slice(0, 20).map((msg: any, idx: number) => (
                        <ListItem key={idx} divider>
                          <ListItemAvatar>
                            <Avatar>{msg.sender?.nom?.[0]}</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={`De: ${msg.sender?.prenom} ${msg.sender?.nom}`}
                            secondary={`${msg.content?.substring(0, 100)}... - ${msg.createdAt ? format(new Date(msg.createdAt), 'PPp', {locale: fr}) : ''}`}
                          />
                          {!msg.read && <Chip label="Non lu" size="small" color="error" />}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">Aucun message disponible</Alert>
                  )}
                </Box>
              )}
              
              {/* Tab 5: Visites */}
              {detailTab === 5 && completeData && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Visites ({completeData.visits?.length || 0})</Typography>
                  {completeData.visits && completeData.visits.length > 0 ? (
                    <List>
                      {completeData.visits.slice(0, 20).map((visit: any, idx: number) => (
                        <ListItem key={idx} divider>
                          <ListItemAvatar>
                            <Avatar><CalendarToday /></Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={`Type: ${visit.type || 'Visite'}`}
                            secondary={`Status: ${visit.status} - ${visit.scheduledAt ? format(new Date(visit.scheduledAt), 'PPP', {locale: fr}) : 'N/A'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Alert severity="info">Aucune visite disponible</Alert>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
              <Button variant="contained" onClick={handleEditFromDialog}>Modifier</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {editingEntreprise && (
          <>
            <DialogTitle>
              <Typography variant="h6" fontWeight={700}>
                Modifier l'entreprise
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mb: 3, mt: 2, borderRadius: 2 }}>
                Pour modifier les détails complets de l'entreprise, veuillez utiliser l'interface entreprise dédiée.
                <br/>
                Utilisez le lien: <strong>/enterprise/profile</strong>
              </Alert>
              
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Nom de l'entreprise"
                  value={editingEntreprise.identification?.nomEntreprise || ''}
                  disabled
                  helperText="Pour modifier, contactez l'administrateur système"
                />
                
                <FormControl fullWidth>
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={editingEntreprise.statut || 'En attente'}
                    label="Statut"
                    onChange={(e) => setEditingEntreprise({
                      ...editingEntreprise,
                      statut: e.target.value
                    })}
                  >
                    <MenuItem value="Actif">Actif</MenuItem>
                    <MenuItem value="En attente">En attente</MenuItem>
                    <MenuItem value="Suspendu">Suspendu</MenuItem>
                    <MenuItem value="Inactif">Inactif</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Email de contact"
                  type="email"
                  value={editingEntreprise.contact?.email || ''}
                  disabled
                  helperText="Modification via le profil entreprise"
                />

                <TextField
                  fullWidth
                  label="Téléphone"
                  value={editingEntreprise.contact?.telephone || ''}
                  disabled
                  helperText="Modification via le profil entreprise"
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialog(false)}>
                Annuler
              </Button>
              <Button 
                variant="contained"
                onClick={async () => {
                  if (editingEntreprise) {
                    await handleStatusChange(editingEntreprise._id, editingEntreprise.statut || 'En attente');
                    setEditDialog(false);
                  }
                }}
              >
                Enregistrer le statut
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Conformite Change Dialog */}
      <Dialog
        open={conformiteDialog}
        onClose={() => setConformiteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Gérer la Conformité
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Définir manuellement le statut de conformité de l'entreprise
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              En tant qu'administrateur, vous définissez manuellement si cette entreprise est conforme ou non.
            </Alert>
            
            <Typography variant="body2" color="text.secondary">
              Entreprise: <strong>{selectedEntreprise?.identification?.nomEntreprise}</strong>
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Statut de Conformité</InputLabel>
              <Select
                value={newConformite}
                label="Statut de Conformité"
                onChange={(e) => setNewConformite(e.target.value)}
              >
                <MenuItem value="Conforme">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle color="success" fontSize="small" />
                    <span>Conforme</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="Non conforme">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Cancel color="error" fontSize="small" />
                    <span>Non conforme</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="En cours de vérification">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Warning color="warning" fontSize="small" />
                    <span>En cours de vérification</span>
                  </Stack>
                </MenuItem>
                <MenuItem value="Non vérifié">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Business color="action" fontSize="small" />
                    <span>Non vérifié</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Commentaire (optionnel)"
              value={commentaireConformite}
              onChange={(e) => setCommentaireConformite(e.target.value)}
              placeholder="Ajoutez un commentaire expliquant votre décision..."
              helperText={`${commentaireConformite.length}/500 caractères`}
              inputProps={{ maxLength: 500 }}
            />

            {newConformite && (
              <Alert 
                severity={
                  newConformite === 'Conforme' ? 'success' :
                  newConformite === 'Non conforme' ? 'error' :
                  newConformite === 'En cours de vérification' ? 'warning' : 'info'
                } 
                sx={{ borderRadius: 2 }}
              >
                La conformité sera définie comme <strong>{newConformite}</strong>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setConformiteDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={confirmConformiteChange}
            disabled={!newConformite}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default AdminEntreprises;

