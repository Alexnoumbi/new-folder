import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Divider
} from '@mui/material';
import {
  Business,
  Edit,
  LocationOn,
  Phone,
  Email,
  Web,
  People,
  Assessment,
  TrendingUp,
  CheckCircle,
  Refresh
} from '@mui/icons-material';
import { getEntreprise as getEntrepriseDetails, updateEntreprise, Entreprise } from '../../services/entrepriseService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonForm from '../../components/Argon/ArgonForm';
import ArgonChartWidget from '../../components/Argon/ArgonChartWidget';
import { FormField } from '../../types/form';
import { useAuth } from '../../hooks/useAuth';

const MonEntreprise: React.FC = () => {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const { user } = useAuth();

  // Chart data
  const performanceData = [
    { label: 'Jan', value: 85, color: '#4caf50' },
    { label: 'Fév', value: 92, color: '#2196f3' },
    { label: 'Mar', value: 78, color: '#ff9800' },
    { label: 'Avr', value: 95, color: '#9c27b0' },
    { label: 'Mai', value: 88, color: '#f44336' },
    { label: 'Jun', value: 91, color: '#00bcd4' }
  ];

  const complianceData = [
    { label: 'Conforme', value: 75, color: '#4caf50' },
    { label: 'En cours', value: 20, color: '#ff9800' },
    { label: 'Non conforme', value: 5, color: '#f44336' }
  ];

  // Form fields definition with correct type literals
  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Nom de l\'entreprise',
      type: 'text' as const,
      required: true,
      xs: 12,
      md: 6
    },
    {
      name: 'address',
      label: 'Adresse',
      type: 'textarea' as const,
      xs: 12,
      md: 6
    },
    {
      name: 'phone',
      label: 'Téléphone',
      type: 'text' as const,
      xs: 12,
      md: 6
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      xs: 12,
      md: 6
    },
    {
      name: 'website',
      label: 'Site web',
      type: 'text' as const,
      xs: 12,
      md: 6
    },
    {
      name: 'sector',
      label: 'Secteur d\'activité',
      type: 'text' as const,
      xs: 12,
      md: 6
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea' as const,
      xs: 12
    }
  ];

  useEffect(() => {
    if (user?.entreprise) {
      fetchEntrepriseDetails();
    }
  }, [user]);

  const fetchEntrepriseDetails = async () => {
    if (!user?.entreprise) return;

    try {
      setLoading(true);
      const data = await getEntrepriseDetails(user.entreprise);
      setEntreprise(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des détails de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntreprise = async (formData: Partial<Entreprise>) => {
    if (!user?.entreprise) return;

    try {
      setLoading(true);
      const updatedEntreprise = await updateEntreprise(user.entreprise, formData);
      setEntreprise(updatedEntreprise);
      setOpenEditDialog(false);
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Mon Entreprise' }
  ];

  const headerActions = [
    {
      label: 'Modifier',
      icon: <Edit />,
      onClick: () => setOpenEditDialog(true),
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchEntrepriseDetails,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];


  // Statistiques de l'entreprise with proper null checks
  const entrepriseStats = [
    {
      title: 'Score Global',
      value: `${entreprise?.kpiScore || 0}/100`,
      icon: <Assessment />,
      color: (entreprise?.kpiScore && entreprise.kpiScore >= 80 ? 'success' :
             entreprise?.kpiScore && entreprise.kpiScore >= 60 ? 'warning' : 'error') as 'success' | 'warning' | 'error',
      change: '+5%'
    },
    {
      title: 'Documents Validés',
      value: `${entreprise?.documentsSoumis || 0}/${entreprise?.documentsRequis || 0}`,
      icon: <CheckCircle />,
      color: 'primary' as const,
      change: '+2'
    },
    {
      title: 'Visites Terminées',
      value: entreprise?.visitesTerminees || 0,
      icon: <People />,
      color: 'success' as const,
      change: '+1'
    },
    {
      title: 'KPI Validés',
      value: `${entreprise?.kpiValides || 0}/${entreprise?.totalKpis || 0}`,
      icon: <TrendingUp />,
      color: 'info' as const,
      change: '+3'
    }
  ];

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Mon Entreprise"
          subtitle="Gestion de votre profil entreprise"
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
        title="Mon Entreprise"
        subtitle="Gestion de votre profil entreprise"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchEntrepriseDetails}
        loading={loading}
      />

      {/* Statistiques de l'entreprise */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {entrepriseStats.map((stat, index) => (
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

      {/* Informations générales et graphiques */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonCard
          title="Informations Générales"
          value=""
          icon={<Business />}
          color="primary"
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : entreprise ? (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    mr: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}
                >
                  {entreprise.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {entreprise.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entreprise.sector || 'Secteur non défini'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {entreprise.address || 'Adresse non renseignée'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {entreprise.phone || 'Téléphone non renseigné'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {entreprise.email || 'Email non renseigné'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Web sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {entreprise.website || 'Site web non renseigné'}
                  </Typography>
                </Box>
              </Box>

              {entreprise.description && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {entreprise.description}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography color="text.secondary">Aucune donnée disponible</Typography>
          )}
        </ArgonCard>

        <ArgonCard
          title="Statut de Conformité"
          value=""
          icon={<CheckCircle />}
          color="success"
        >
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Score Global
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                {entreprise?.kpiScore || 0}/100
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Documents
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {entreprise?.documentsSoumis || 0}/{entreprise?.documentsRequis || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Visites
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {entreprise?.visitesTerminees || 0} terminées
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                KPI
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {entreprise?.kpiValides || 0}/{entreprise?.totalKpis || 0} validés
              </Typography>
            </Box>
          </Box>
        </ArgonCard>
      </Box>

      {/* Graphiques de performance */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonChartWidget
          title="Performance Mensuelle"
          data={performanceData}
          type="bar"
          height={300}
        />
        
        <ArgonChartWidget
          title="État de Conformité"
          data={complianceData}
          type="pie"
          height={300}
        />
      </Box>

      {/* Dialog de modification */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifier les informations de l'entreprise</DialogTitle>
        <DialogContent>
          <ArgonForm
            title=""
            fields={formFields}
            onSubmit={handleUpdateEntreprise}
            onCancel={() => setOpenEditDialog(false)}
            initialData={entreprise || {}}
            submitLabel="Mettre à jour"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MonEntreprise;
