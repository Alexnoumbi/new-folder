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
  Avatar,
  Paper,
  Tooltip,
  IconButton,
  LinearProgress
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Business,
  Assessment,
  Description,
  CalendarToday,
  TrendingUp,
  CheckCircle,
  Warning,
  ArrowUpward,
  Refresh,
  Download,
  FilterList,
  TrendingDown,
  Timeline,
  Speed
} from '@mui/icons-material';
import { getEntrepriseStats, EntrepriseStats } from '../../services/entrepriseService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { loadEnterpriseDashboard } from '../../services/authService';
import ComplianceTrafficLight from '../../components/EntrepriseDashboard/ComplianceTrafficLight';
import VisitsCalendar from '../../components/EntrepriseDashboard/VisitsCalendar';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
  progress?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color = 'primary',
  subtitle,
  progress 
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
        
        {progress !== undefined && (
          <Box mb={1}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Progression
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: alpha(getColorMain(), 0.1),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getColorMain()
                }
              }} 
            />
          </Box>
        )}
        
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
              vs mois dernier
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

const EnterpriseDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<EntrepriseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const storedDashboard = localStorage.getItem('enterpriseDashboard');
        if (storedDashboard) {
          setStats(JSON.parse(storedDashboard));
          setLoading(false);
          return;
        }
        if (user && user.typeCompte === 'entreprise') {
          const data = await loadEnterpriseDashboard(user);
          if (data?.dashboard) {
            setStats(data.dashboard);
          }
        }
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

  if (!stats) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Aucune donnée disponible. Veuillez contacter l'administrateur.
        </Alert>
      </Container>
    );
  }

  const documentProgress = (stats.documentsRequis || 0) > 0 
    ? Math.round(((stats.documentsSoumis || 0) / (stats.documentsRequis || 1)) * 100) 
    : 0;

  const kpiProgress = (stats.totalKpis || 0) > 0 
    ? Math.round(((stats.kpiValides || 0) / (stats.totalKpis || 1)) * 100) 
    : 0;

  const metrics = [
    {
      title: 'Score Global',
      value: `${stats.scoreGlobal || 0}/100`,
      progress: stats.scoreGlobal || 0,
      icon: <Speed sx={{ fontSize: 32 }} />,
      color: 'primary',
      subtitle: 'Performance globale'
    },
    {
      title: 'KPI Validés',
      value: `${stats.kpiValides}/${stats.totalKpis}`,
      progress: kpiProgress,
      icon: <Assessment sx={{ fontSize: 32 }} />,
      color: 'success',
      subtitle: 'Indicateurs approuvés'
    },
    {
      title: 'Documents',
      value: `${stats.documentsSoumis}/${stats.documentsRequis}`,
      progress: documentProgress,
      icon: <Description sx={{ fontSize: 32 }} />,
      color: 'info',
      subtitle: 'Documents soumis'
    },
    {
      title: 'Visites',
      value: `${stats.visitesTerminees}/${stats.visitesPlanifiees}`,
      progress: (stats.visitesPlanifiees || 0) > 0 
        ? Math.round(((stats.visitesTerminees || 0) / (stats.visitesPlanifiees || 1)) * 100) 
        : 0,
      icon: <CalendarToday sx={{ fontSize: 32 }} />,
      color: 'warning',
      subtitle: 'Visites effectuées'
    }
  ];

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
                Tableau de Bord Entreprise
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Vue d'ensemble de vos indicateurs, documents et visites
              </Typography>
            </Box>
          
          <Stack direction="row" spacing={2} alignItems="center">
          <ComplianceTrafficLight 
              status={stats.statutConformite || 'yellow'} 
            details={{
                requiredDocuments: stats.documentsRequis || 0,
                submittedDocuments: stats.documentsSoumis || 0,
                validDocuments: stats.documentsSoumis || 0,
              lastUpdated: new Date().toISOString()
            }}
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
            <Tooltip title="Télécharger">
              <IconButton
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Download color="primary" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Métriques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Section Statut de Conformité */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1)
                  }}
                >
                  <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Statut de Conformité
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    État actuel de votre conformité
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha(
                      stats.statutConformite === 'green' 
                        ? theme.palette.success.main 
                        : stats.statutConformite === 'yellow' 
                        ? theme.palette.warning.main 
                        : theme.palette.error.main,
                      0.1
                    ),
                    border: 1,
                    borderColor: alpha(
                      stats.statutConformite === 'green' 
                        ? theme.palette.success.main 
                        : stats.statutConformite === 'yellow' 
                        ? theme.palette.warning.main 
                        : theme.palette.error.main,
                      0.3
                    )
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {stats.statutConformite === 'green' 
                      ? '✓ Conforme' 
                      : stats.statutConformite === 'yellow' 
                      ? '⚠ En cours' 
                      : '✕ Non conforme'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Documents soumis: {stats.documentsSoumis}/{stats.documentsRequis}
                  </Typography>
                </Paper>

                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Progression globale
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={documentProgress} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" mt={0.5}>
                    {documentProgress}% complété
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <Timeline sx={{ color: 'primary.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Activités Récentes
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Dernières actions sur votre compte
                  </Typography>
      </Box>
              </Stack>

              <Stack spacing={1.5}>
                {[1, 2, 3].map((_, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: alpha(theme.palette.grey[500], 0.02),
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <Description fontSize="small" />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          Document soumis
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Il y a {index + 1} jour{index > 0 ? 's' : ''}
                        </Typography>
      </Box>
                      <Chip label="Validé" size="small" color="success" />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Calendrier des Visites */}
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
              <CalendarToday sx={{ color: 'warning.main', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Calendrier des Visites
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Planification et suivi de vos visites
              </Typography>
            </Box>
          </Stack>
          <VisitsCalendar />
        </CardContent>
      </Card>
    </Container>
  );
};

export default EnterpriseDashboard;
