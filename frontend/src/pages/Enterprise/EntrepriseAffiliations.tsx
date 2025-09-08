import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Business,
  People,
  Assessment,
  TrendingUp,
  Refresh,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Warning,
  Schedule
} from '@mui/icons-material';
import { getAffiliations, Affiliation } from '../../services/entrepriseService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';

const EntrepriseAffiliationsPage: React.FC = () => {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliations();
  }, []);

  const fetchAffiliations = async () => {
    try {
      setLoading(true);
      const data = await getAffiliations();
      setAffiliations(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des affiliations');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Affiliations' }
  ];

  const headerActions = [
    {
      label: 'Nouvelle Affiliation',
      icon: <Add />,
      onClick: () => console.log('Nouvelle affiliation'),
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchAffiliations,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  // Statistiques des affiliations
  const affiliationStats = [
    {
      title: 'Total Affiliations',
      value: affiliations.length,
      icon: <Business />,
      color: 'primary' as const,
      change: '+2'
    },
    {
      title: 'Actives',
      value: affiliations.filter(a => a.status === 'active').length,
      icon: <CheckCircle />,
      color: 'success' as const,
      change: '+1'
    },
    {
      title: 'En Attente',
      value: affiliations.filter(a => a.status === 'pending').length,
      icon: <Schedule />,
      color: 'warning' as const,
      change: '+1'
    },
    {
      title: 'Score Moyen',
      value: `${Math.round(affiliations.reduce((acc, a) => acc + (a.score || 0), 0) / affiliations.length) || 0}/100`,
      icon: <Assessment />,
      color: 'info' as const,
      change: '+5%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'inactive': return <Warning />;
      default: return <Warning />;
    }
  };

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Affiliations d'Entreprise"
          subtitle="Gestion des partenariats et affiliations"
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
        title="Affiliations d'Entreprise"
        subtitle="Gestion des partenariats et affiliations"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchAffiliations}
        loading={loading}
      />

      {/* Statistiques des affiliations */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {affiliationStats.map((stat, index) => (
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

      {/* Liste des affiliations */}
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
        ) : affiliations.length > 0 ? (
          affiliations.map((affiliation, index) => (
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
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      mr: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Business />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {affiliation.partnerName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {affiliation.type}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(affiliation.status)}
                    label={affiliation.status}
                    color={getStatusColor(affiliation.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Score de Performance
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={affiliation.score || 0}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: affiliation.score && affiliation.score >= 80 ? '#4caf50' :
                                         affiliation.score && affiliation.score >= 60 ? '#ff9800' : '#f44336'
                        }
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                      {affiliation.score || 0}/100
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Début
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(affiliation.startDate).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Fin
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {affiliation.endDate ? new Date(affiliation.endDate).toLocaleDateString('fr-FR') : 'Indéfinie'}
                    </Typography>
                  </Box>
                </Box>

                {affiliation.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {affiliation.description.length > 100 
                      ? `${affiliation.description.substring(0, 100)}...`
                      : affiliation.description
                    }
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => console.log('Modifier affiliation:', affiliation.id)}
                      variant="outlined"
                      color="primary"
                    >
                      Modifier
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => console.log('Supprimer affiliation:', affiliation.id)}
                      variant="outlined"
                      color="error"
                    >
                      Supprimer
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    ID: {affiliation.id}
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
            <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucune affiliation trouvée
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Commencez par créer votre première affiliation d'entreprise
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => console.log('Créer première affiliation')}
            >
              Créer une Affiliation
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EntrepriseAffiliationsPage;

