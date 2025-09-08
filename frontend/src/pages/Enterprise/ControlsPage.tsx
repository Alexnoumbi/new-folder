import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  Assessment,
  Timeline,
  TrendingUp,
  TrendingDown,
  Schedule,
  PlayArrow,
  Pause,
  Stop
} from '@mui/icons-material';
import { getControls, Control } from '../../services/entrepriseService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';

const ControlsPage: React.FC = () => {
  const [controls, setControls] = useState<Control[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    fetchControls();
  }, []);

  const fetchControls = async () => {
    try {
      setLoading(true);
      // Données mockées temporairement
      const data: Control[] = [];
      setControls(data);
    } catch (err: any) {
      setError('Erreur lors du chargement des contrôles');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Contrôles' }
  ];

  const headerActions = [
    {
      label: 'Nouveau Contrôle',
      icon: <Security />,
      onClick: () => console.log('Nouveau contrôle'),
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchControls,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  // Statistiques des contrôles
  const controlStats = [
    {
      title: 'Total Contrôles',
      value: controls.length,
      icon: <Security />,
      color: 'primary' as const,
      change: '+2'
    },
    {
      title: 'Conformes',
      value: controls.filter(c => c.status === 'compliant').length,
      icon: <CheckCircle />,
      color: 'success' as const,
      change: '+3'
    },
    {
      title: 'Non Conformes',
      value: controls.filter(c => c.status === 'non-compliant').length,
      icon: <Error />,
      color: 'error' as const,
      change: '-1'
    },
    {
      title: 'En Cours',
      value: controls.filter(c => c.status === 'in-progress').length,
      icon: <Schedule />,
      color: 'warning' as const,
      change: '+1'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'non-compliant': return 'error';
      case 'in-progress': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle />;
      case 'non-compliant': return <Error />;
      case 'in-progress': return <Schedule />;
      case 'pending': return <Warning />;
      default: return <Warning />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const steps = [
    'Identification du risque',
    'Évaluation de l\'impact',
    'Mise en place du contrôle',
    'Test et validation',
    'Surveillance continue'
  ];

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Contrôles de Conformité"
          subtitle="Gestion des contrôles et de la conformité"
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ArgonPageHeader
        title="Contrôles de Conformité"
        subtitle="Gestion des contrôles et de la conformité"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchControls}
        loading={loading}
      />

      {/* Statistiques des contrôles */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {controlStats.map((stat, index) => (
          <ArgonCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            loading={loading}
          />
        ))}
      </Box>

      {/* Processus de contrôle */}
      <Box sx={{ mb: 4 }}>
        <ArgonCard
          title="Processus de Contrôle"
          value=""
          icon={<Timeline />}
          color="info"
        />
        <Box sx={{ mt: 2, p: 3 }}>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>

      {/* Liste des contrôles */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
        gap: 3 
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ArgonCard
              key={index}
              title=""
              value=""
              loading={true}
            />
          ))
        ) : controls.length > 0 ? (
          controls.map((control, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {control.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {control.category}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      icon={getStatusIcon(control.status)}
                      label={control.status}
                      color={getStatusColor(control.status) as any}
                      size="small"
                    />
                    <Chip
                      label={control.priority}
                      color={getPriorityColor(control.priority) as any}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progression
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={control.progress || 0}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: control.progress && control.progress >= 80 ? '#4caf50' :
                                         control.progress && control.progress >= 60 ? '#ff9800' : '#f44336'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                      {control.progress || 0}%
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Échéance
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {control.dueDate ? new Date(control.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Responsable
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {control.responsible || 'Non assigné'}
                    </Typography>
                  </Box>
                </Box>

                {control.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {control.description.length > 100 
                      ? `${control.description.substring(0, 100)}...`
                      : control.description
                    }
                  </Typography>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => console.log('Démarrer contrôle:', control.id)}
                      variant="outlined"
                      color="primary"
                    >
                      Démarrer
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Pause />}
                      onClick={() => console.log('Pause contrôle:', control.id)}
                      variant="outlined"
                      color="warning"
                    >
                      Pause
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Stop />}
                      onClick={() => console.log('Arrêter contrôle:', control.id)}
                      variant="outlined"
                      color="error"
                    >
                      Arrêter
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    ID: {control.id}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            py: 8 
          }}>
            <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun contrôle trouvé
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Commencez par créer votre premier contrôle de conformité
            </Typography>
            <Button
              variant="contained"
              startIcon={<Security />}
              onClick={() => console.log('Créer premier contrôle')}
            >
              Créer un Contrôle
            </Button>
          </Box>
        )}
      </Box>

      {/* Résumé des contrôles par catégorie */}
      <Box sx={{ mt: 4 }}>
        <ArgonCard
          title="Résumé par Catégorie"
          value=""
          icon={<Assessment />}
          color="info"
        />
        <Box sx={{ mt: 2, p: 3 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
            gap: 3 
          }}>
            {['Sécurité', 'Qualité', 'Environnement', 'RH', 'Financier', 'Technique'].map((category, index) => {
              const categoryControls = controls.filter(c => c.category === category);
              const compliantCount = categoryControls.filter(c => c.status === 'compliant').length;
              const totalCount = categoryControls.length;
              const complianceRate = totalCount > 0 ? Math.round((compliantCount / totalCount) * 100) : 0;

              return (
                <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {category}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Conformité
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {complianceRate}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={complianceRate}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      mb: 1,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: complianceRate >= 80 ? '#4caf50' :
                                       complianceRate >= 60 ? '#ff9800' : '#f44336'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {compliantCount}/{totalCount} contrôles conformes
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ControlsPage;

