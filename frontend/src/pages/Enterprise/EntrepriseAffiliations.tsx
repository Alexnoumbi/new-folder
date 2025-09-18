import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Chip,
  Card,
  CardContent,
  Avatar,
  Divider,
  LinearProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Business,
  Assessment,
  Refresh,
  Add,
  Edit,
  Delete,
  CheckCircle,
  Warning,
  Schedule,
  Search
} from '@mui/icons-material';
import { getEntrepriseAffiliations as getAffiliations, Affiliation } from '../../services/entrepriseService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import { useAuth } from '../../hooks/useAuth';

const EntrepriseAffiliationsPage: React.FC = () => {
  const [affiliations, setAffiliations] = useState<Affiliation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.entrepriseId) {
      fetchAffiliations();
    } else {
      setLoading(false);
      setError('Aucune entreprise associée à l\'utilisateur');
    }
  }, [user]);

  const fetchAffiliations = async () => {
    const entrepriseId = user?.entrepriseId;
    if (!entrepriseId) {
      setError('Aucune entreprise associée à l\'utilisateur');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getAffiliations(entrepriseId);
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
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchAffiliations,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  // Statistiques des affiliations
  const filtered = affiliations.filter(a =>
    a.partnerName?.toLowerCase().includes(search.toLowerCase()) ||
    a.type?.toLowerCase().includes(search.toLowerCase())
  );

  const affiliationStats = [
    {
      title: 'Total Affiliations',
      value: filtered.length,
      icon: <Business />,
      color: 'primary' as const,
      change: ''
    },
    {
      title: 'Actives',
      value: filtered.filter(a => a.status === 'active').length,
      icon: <CheckCircle />,
      color: 'success' as const,
      change: ''
    },
    {
      title: 'En Attente',
      value: filtered.filter(a => a.status === 'pending').length,
      icon: <Schedule />,
      color: 'warning' as const,
      change: ''
    },
    {
      title: 'Score Moyen',
      value: `${Math.round(filtered.reduce((acc, a) => acc + (a.score || 0), 0) / (filtered.length || 1))}/100`,
      icon: <Assessment />,
      color: 'info' as const,
      change: ''
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

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par nom ou type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Box>

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
        ) : filtered.length > 0 ? (
          filtered.map((affiliation, index) => (
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

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                  <Typography variant="body2" color="text.secondary">
                    {affiliation.description.length > 100 
                      ? `${affiliation.description.substring(0, 100)}...`
                      : affiliation.description
                    }
                  </Typography>
                )}
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
            <Typography variant="body2" color="text.secondary">
              Ajustez votre recherche pour affiner les résultats
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EntrepriseAffiliationsPage;
