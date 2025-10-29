import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Stack,
  useTheme,
  alpha,
  Chip,
  Paper,
  Tooltip,
  IconButton,
  LinearProgress,
  Divider
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  People,
  AttachMoney,
  AccountBalance,
  CheckCircle,
  Refresh,
  Download,
  TrendingUp,
  TrendingDown,
  CalendarToday,
  Lightbulb,
  Timeline as TimelineIcon,
  Assessment
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import VisitsCalendar from '../../components/EntrepriseDashboard/VisitsCalendar';
import PersonnelEvolutionChart from '../../components/EntrepriseDashboard/PersonnelEvolutionChart';
import BudgetEvolutionChart from '../../components/EntrepriseDashboard/BudgetEvolutionChart';
import FinancementPieChart from '../../components/EntrepriseDashboard/FinancementPieChart';
import InnovationRadarChart from '../../components/EntrepriseDashboard/InnovationRadarChart';
import RevisionsTimeline from '../../components/EntrepriseDashboard/RevisionsTimeline';
import ActivityFeed from '../../components/EntrepriseDashboard/ActivityFeed';
import { 
  getEntreprise,
  getEntrepriseEvolutionData,
  getEntrepriseSnapshots,
  getEntrepriseActivityLog
} from '../../services/entrepriseService';
import AssistantFloatingButton from '../../components/Assistant/AssistantFloatingButton';
import AssistantWrapper from '../../components/Assistant/AssistantWrapper';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'primary',
  subtitle
}) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp fontSize="small" />;
    if (trend === 'down') return <TrendingDown fontSize="small" />;
    return null;
  };
  
  const getTrendColor = () => {
    if (trend === 'up') return theme.palette.success.main;
    if (trend === 'down') return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  const getColorMain = () => {
    switch (color) {
      case 'primary': return theme.palette.primary.main;
      case 'success': return theme.palette.success.main;
      case 'warning': return theme.palette.warning.main;
      case 'info': return theme.palette.info.main;
      case 'error': return theme.palette.error.main;
      default: return theme.palette.primary.main;
    }
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(getColorMain(), 0.1)} 0%, ${alpha(getColorMain(), 0.05)} 100%)`,
        border: 1,
        borderColor: alpha(getColorMain(), 0.2),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(getColorMain(), 0.2)}`
        }
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={getColorMain()}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(getColorMain(), 0.15),
              color: getColorMain()
            }}
          >
            {icon}
          </Box>
        </Stack>
        
        {change !== undefined && (
          <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
            <Box 
              sx={{ 
                color: getTrendColor(), 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: alpha(getTrendColor(), 0.1),
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}
            >
              {getTrendIcon()}
              <Typography variant="body2" fontWeight={600} ml={0.5}>
                {change > 0 ? '+' : ''}{change}%
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              vs dernière révision
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const EnterpriseDashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const [entreprise, setEntreprise] = useState<any>(null);
  const [evolution, setEvolution] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.entrepriseId) return;
      
      try {
        setLoading(true);
        
        // Charger toutes les données en parallèle
        const [entData, evolData, snapshotsData, activitiesData] = await Promise.all([
          getEntreprise(user.entrepriseId),
          getEntrepriseEvolutionData(user.entrepriseId),
          getEntrepriseSnapshots(user.entrepriseId),
          getEntrepriseActivityLog(user.entrepriseId, 10)
        ]);

        // Nettoyer les données pour éviter les objets React invalides
        const cleanObjectData = (obj: any): any => {
          if (obj === null || obj === undefined) return obj;
          if (Array.isArray(obj)) return obj.map(item => cleanObjectData(item));
          
          if (typeof obj === 'object' && obj.constructor === Object) {
            const cleaned: any = {};
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                
                // Traitement spécial pour conformite
                if (key === 'conformite') {
                  if (typeof value === 'object' && value !== null) {
                    cleaned[key] = value.conformite || 'Non vérifié';
                  } else if (typeof value === 'string') {
                    cleaned[key] = value;
                  } else {
                    cleaned[key] = 'Non vérifié';
                  }
                  continue;
                }
                
                // Traitement spécial pour commentaireConformite
                if (key === 'commentaireConformite') {
                  if (typeof value === 'object' && value !== null) {
                    cleaned[key] = value.commentaireConformite || '';
                  } else if (typeof value === 'string') {
                    cleaned[key] = value;
                  } else {
                    cleaned[key] = '';
                  }
                  continue;
                }
                
                cleaned[key] = cleanObjectData(value);
              }
            }
            return cleaned;
          }
          
          return obj;
        };

        setEntreprise(cleanObjectData(entData));
        setEvolution(cleanObjectData(evolData));
        setSnapshots(snapshotsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user]);

  if (!user || user.typeCompte !== 'entreprise') {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              RÉESSAYER
            </Button>
          }
          sx={{ 
            borderRadius: 3,
            border: 1,
            borderColor: 'error.main'
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!entreprise || !evolution) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Aucune donnée disponible. Veuillez contacter l'administrateur.
        </Alert>
      </Container>
    );
  }

  // Calculer les tendances
  const personnelTrend = evolution.personnel.length >= 2
    ? ((evolution.personnel[evolution.personnel.length - 1].effectifs - 
        evolution.personnel[evolution.personnel.length - 2].effectifs) / 
        (evolution.personnel[evolution.personnel.length - 2].effectifs || 1)) * 100
    : 0;

  const caTrend = evolution.financier.length >= 2
    ? ((evolution.financier[evolution.financier.length - 1].ca - 
        evolution.financier[evolution.financier.length - 2].ca) / 
        (evolution.financier[evolution.financier.length - 2].ca || 1)) * 100
    : 0;

  const getTresorerieColor = (tresorerie: string) => {
    if (tresorerie === 'Aisée') return 'success';
    if (tresorerie === 'Normale') return 'info';
    if (tresorerie === 'Difficile') return 'error';
    return 'default';
  };

  const getConformiteColor = (conformite: string) => {
    if (conformite === 'Conforme') return 'success';
    if (conformite === 'Non conforme') return 'error';
    if (conformite === 'En cours de vérification') return 'warning';
    return 'default';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
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
              Tableau de Bord
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {entreprise.identification?.nomEntreprise || 'Entreprise'}
            </Typography>
          </Box>
        
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={typeof evolution.currentData.conformite === 'string' ? evolution.currentData.conformite : 'Non vérifié'}
              color={getConformiteColor(typeof evolution.currentData.conformite === 'string' ? evolution.currentData.conformite : 'Non vérifié') as any}
              icon={<CheckCircle />}
              sx={{ fontWeight: 600, fontSize: '0.9rem', px: 1 }}
            />
            
            <Tooltip title="Actualiser">
              <IconButton
                onClick={() => window.location.reload()}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Calendrier des Visites - EN PREMIER */}
      <Card sx={{ borderRadius: 3, mb: 4, boxShadow: theme.shadows[4] }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.main, 0.1)
              }}
            >
              <CalendarToday sx={{ color: 'warning.main', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Calendrier des Visites
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visites planifiées par l'administrateur
              </Typography>
            </Box>
          </Stack>
          <VisitsCalendar />
        </CardContent>
      </Card>

      {/* Indicateurs Clés */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Effectifs Actuels"
            value={evolution.currentData.effectifs}
            change={Math.round(personnelTrend)}
            trend={personnelTrend > 0 ? 'up' : personnelTrend < 0 ? 'down' : 'neutral'}
            icon={<People sx={{ fontSize: 32 }} />}
            color="primary"
            subtitle="Employés"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Chiffre d'Affaires"
            value={`${(evolution.currentData.ca / 1000000).toFixed(1)}M`}
            change={Math.round(caTrend)}
            trend={caTrend > 0 ? 'up' : caTrend < 0 ? 'down' : 'neutral'}
            icon={<AttachMoney sx={{ fontSize: 32 }} />}
            color="success"
            subtitle={evolution.financier[evolution.financier.length - 1]?.devise || 'FCFA'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Trésorerie"
            value={evolution.currentData.tresorerie}
            icon={<AccountBalance sx={{ fontSize: 32 }} />}
            color={
              evolution.currentData.tresorerie === 'Aisée' ? 'success' :
              evolution.currentData.tresorerie === 'Normale' ? 'info' : 'warning'
            }
            subtitle="Situation actuelle"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Conformité"
            value={typeof evolution.currentData.conformite === 'string' ? evolution.currentData.conformite : 'Non vérifié'}
            icon={<CheckCircle sx={{ fontSize: 32 }} />}
            color={
              (typeof evolution.currentData.conformite === 'string' ? evolution.currentData.conformite : 'Non vérifié') === 'Conforme' ? 'success' :
              (typeof evolution.currentData.conformite === 'string' ? evolution.currentData.conformite : 'Non vérifié') === 'Non conforme' ? 'error' : 'warning'
            }
            subtitle="Statut administratif"
          />
        </Grid>
      </Grid>

      {/* Évolutions Graphiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <People sx={{ color: 'primary.main', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Évolution du Personnel
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Historique des effectifs et créations d'emplois
                  </Typography>
                </Box>
              </Stack>
              <PersonnelEvolutionChart data={evolution.personnel} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1)
                  }}
                >
                  <AttachMoney sx={{ color: 'success.main', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Évolution Financière
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    CA et coûts de production dans le temps
                  </Typography>
                </Box>
              </Stack>
              <BudgetEvolutionChart data={evolution.financier} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Innovation & Financement */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.1)
                  }}
                >
                  <AccountBalance sx={{ color: 'info.main', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Sources de Financement
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Répartition de vos sources de financement
                  </Typography>
                </Box>
              </Stack>
              <FinancementPieChart data={entreprise.performanceEconomique?.sourcesFinancement || {}} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1)
                  }}
                >
                  <Lightbulb sx={{ color: 'warning.main', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Innovation & Digitalisation
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Niveaux d'intégration technologique
                  </Typography>
                </Box>
              </Stack>
              <InnovationRadarChart data={entreprise.innovationDigitalisation || {}} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance des Conventions */}
      <Card sx={{ borderRadius: 3, mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" mb={3}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}
            >
              <Assessment sx={{ color: 'primary.main', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Performance des Conventions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Atteinte des objectifs contractuels
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Cibles Investissement
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {entreprise.conventions?.atteinteCiblesInvestissement || 0}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={entreprise.conventions?.atteinteCiblesInvestissement || 0}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: theme.palette.primary.main
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Cibles Emploi
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    {entreprise.conventions?.atteinteCiblesEmploi || 0}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={entreprise.conventions?.atteinteCiblesEmploi || 0}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: theme.palette.success.main
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Respect Délais Reporting
                  </Typography>
                  <Chip
                    label={entreprise.conventions?.respectDelaisReporting?.conforme ? 'Conforme' : `${entreprise.conventions?.respectDelaisReporting?.joursRetard || 0}j retard`}
                    size="small"
                    color={entreprise.conventions?.respectDelaisReporting?.conforme ? 'success' : 'error'}
                  />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={entreprise.conventions?.respectDelaisReporting?.conforme ? 100 : 0}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: entreprise.conventions?.respectDelaisReporting?.conforme 
                        ? theme.palette.success.main 
                        : theme.palette.error.main
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Historique des Révisions & Activités */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1)
                  }}
                >
                  <TimelineIcon sx={{ color: 'secondary.main', fontSize: 28 }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">
                    Historique des Révisions
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Snapshots enregistrés lors des visites
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <RevisionsTimeline snapshots={snapshots} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.1)
                  }}
                >
                  <TimelineIcon sx={{ color: 'info.main', fontSize: 28 }} />
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">
                    Activités Récentes
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dernières actions sur votre compte
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <ActivityFeed activities={activities} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Assistant Floating Button */}
      <AssistantFloatingButton
        type="entreprise"
        onClick={() => setShowAssistant(true)}
        hasUnreadMessages={false}
        badgeCount={0}
      />

      {/* Assistant Modal */}
      <AssistantWrapper
        open={showAssistant}
        onClose={() => setShowAssistant(false)}
        showAdvancedFeatures={false}
      />
    </Container>
  );
};

export default EnterpriseDashboard;
