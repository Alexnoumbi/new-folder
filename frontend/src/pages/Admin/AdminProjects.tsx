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
  Alert
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
  CalendarToday,
  LocationOn,
  FilterList,
  Download,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';

interface Entreprise {
  _id: string;
  identification?: {
    nomEntreprise?: string;
  };
  nom?: string;
  name?: string;
  statut?: string;
  status?: string;
  kpis?: any[];
  documents?: any[];
}

interface Project {
  _id: string;
  nom: string;
  entreprise: {
    _id: string;
    nom: string;
  };
  statut: string;
  budget: number;
  progression: number;
  dateDebut: string;
  dateFin: string;
  equipe: number;
  region: string;
}

const AdminProjects: React.FC = () => {
  const theme = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Récupérer les entreprises agréées (avec statut AGREE ou VALIDE)
      const response = await axios.get('http://localhost:5000/api/entreprises', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let entreprises = response.data.data || response.data || [];
      
      // Filtrer uniquement les entreprises agréées (Actif seulement)
      entreprises = entreprises.filter((e: Entreprise) => {
        const statut = (e.statut || e.status || '').toLowerCase();
        return statut === 'actif' || statut === 'active' || statut === 'agree' || statut === 'valide';
      });
      
      // Transformer en format Project pour affichage
      const projectsData = entreprises.map((e: Entreprise) => ({
        ...e,
        nom: e.identification?.nomEntreprise || e.nom || e.name || 'Sans nom',
        entreprise: {
          _id: e._id,
          nom: e.identification?.nomEntreprise || e.nom || e.name || 'Sans nom'
        },
        statut: e.statut || e.status || 'ACTIF',
        budget: 0, // À récupérer depuis les projets réels
        progression: e.kpis ? Math.min((e.kpis.length / 10) * 100, 100) : 0,
        dateDebut: new Date().toISOString(),
        dateFin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        equipe: 0,
        region: 'À définir'
      }));
      
      setProjects(projectsData);
      setError('');
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des projets');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut?: string) => {
    switch (statut) {
      case 'ACTIF': 
      case 'Actif': return 'success';
      case 'EN_COURS': return 'info';
      case 'TERMINE': return 'default';
      case 'SUSPENDU': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (statut?: string) => {
    switch (statut) {
      case 'ACTIF': 
      case 'Actif': return 'Actif';
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'SUSPENDU': return 'Suspendu';
      default: return statut || 'Inconnu';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || project.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: projects.length,
    actifs: projects.filter(p => p.statut === 'ACTIF' || p.statut === 'ACTIVE' || p.statut === 'AGREE').length,
    termines: projects.filter(p => p.statut === 'TERMINE').length,
    budgetTotal: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    progressionMoyenne: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.progression || 0), 0) / projects.length)
      : 0
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
              Gestion des Projets
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue d'ensemble des projets et entreprises partenaires
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchProjects}
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
              Nouveau Projet
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
              <Typography variant="caption" color="text.secondary">Total Projets</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Projets Actifs</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.actifs}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Terminés</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">{stats.termines}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Budget Total</Typography>
              <Typography variant="h6" fontWeight={700} color="warning.main">
                {(stats.budgetTotal / 1000000).toFixed(0)}M FCFA
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Progression Moy.</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">{stats.progressionMoyenne}%</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            placeholder="Rechercher un projet ou une entreprise..."
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
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ minWidth: 120, borderRadius: 2 }}
          >
            Filtres
          </Button>
        </Stack>
      </Box>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun projet trouvé. {searchTerm ? 'Essayez de modifier votre recherche.' : 'Aucune entreprise agréée dans la base de données.'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project) => (
            <Grid item xs={12} md={6} lg={4} key={project._id}>
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
                      {project.nom}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: 'primary.main',
                          fontSize: 12
                        }}
                      >
                        <Business fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {project.entreprise.nom}
                      </Typography>
                    </Stack>
                  </Box>
                  <Chip
                    label={getStatusLabel(project.statut)}
                    color={getStatusColor(project.statut) as any}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>

                {/* Progression */}
                <Box mb={2}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Progression
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {project.progression}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={project.progression}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      }
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Info Grid */}
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <AttachMoney fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Budget
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {((project.budget || 0) / 1000000).toFixed(1)}M
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <People fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Équipe
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {project.equipe} membres
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarToday fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Début
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(project.dateDebut || Date.now()).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationOn fontSize="small" color="action" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Région
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {project.region}
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
                      setSelectedProject(project);
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

      {/* Project Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedProject && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedProject.nom}
                </Typography>
                <Chip
                  label={getStatusLabel(selectedProject.statut)}
                  color={getStatusColor(selectedProject.statut) as any}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Entreprise Partenaire
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Business />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedProject.entreprise.nom}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {selectedProject.entreprise._id}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Progression: {selectedProject.progression}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={selectedProject.progression}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 6,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      }
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Budget Total</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {((selectedProject.budget || 0) / 1000000).toFixed(1)}M FCFA
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Taille Équipe</Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {selectedProject.equipe} membres
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Date Début</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(selectedProject.dateDebut || Date.now()).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="caption" color="text.secondary">Date Fin</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(selectedProject.dateFin || Date.now()).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
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

export default AdminProjects;

