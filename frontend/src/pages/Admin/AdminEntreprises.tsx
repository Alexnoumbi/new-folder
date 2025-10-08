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
  Tabs
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
  Timeline
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
  Entreprise, 
  EntrepriseStats 
} from '../../services/entrepriseService';

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
                        <Chip
                          label={entreprise.statut || 'N/A'}
                          color={getStatusColor(entreprise.statut) as any}
                          icon={getStatusIcon(entreprise.statut)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
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
                          onClick={() => {
                            setSelectedEntreprise(entreprise);
                            setOpenDialog(true);
                          }}
                          sx={{ textTransform: 'none', flex: 1 }}
                        >
                          Voir
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit />}
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
            </DialogTitle>
            <DialogContent>
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
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
              <Button variant="contained">Modifier</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminEntreprises;

