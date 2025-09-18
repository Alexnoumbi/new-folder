import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Business,
  Edit,
  LocationOn,
  Phone,
  Email,
  Web,
  Description,
  Assessment
} from '@mui/icons-material';
import { getEntreprise as getEntrepriseDetails, updateEntreprise, Entreprise } from '../../services/entrepriseService';
import { FormField } from '../../types/form';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonForm from '../../components/Argon/ArgonForm';
import ArgonChartWidget from '../../components/Argon/ArgonChartWidget';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const EntrepriseOverview: React.FC = () => {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form fields definition with correct types
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
    },
    {
      name: 'employees',
      label: 'Nombre d\'employés',
      type: 'number' as const,
      xs: 12,
      md: 6
    }
  ];

  // Performance data
  const performanceData = [
    { label: 'Jan', value: 85, color: '#4caf50' },
    { label: 'Fév', value: 92, color: '#2196f3' },
    { label: 'Mar', value: 78, color: '#ff9800' },
    { label: 'Avr', value: 95, color: '#9c27b0' },
    { label: 'Mai', value: 88, color: '#f44336' },
    { label: 'Jun', value: 91, color: '#00bcd4' }
  ];

  // Compliance data
  const complianceData = [
    { label: 'Conforme', value: 75, color: '#4caf50' },
    { label: 'En cours', value: 20, color: '#ff9800' },
    { label: 'Non conforme', value: 5, color: '#f44336' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.typeCompte !== 'entreprise') {
      navigate('/login', { replace: true });
      return;
    }

    // Check if user has an associated enterprise
    if (!user.entrepriseId) {
      setError('Aucune entreprise associée à votre compte. Veuillez contacter l\'administrateur.');
      setLoading(false);
      return;
    }

    const fetchEntrepriseDetails = async () => {
      try {
        const data = await getEntrepriseDetails(user.entrepriseId!);
        setEntreprise(data);
        setError(null);
      } catch (err: any) {
        console.error('Erreur lors du chargement des détails:', err);
        if (err.response?.status === 404) {
          setError('Entreprise non trouvée. Veuillez contacter l\'administrateur.');
        } else {
          setError(err.response?.data?.message || 'Erreur lors du chargement des détails de l\'entreprise');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEntrepriseDetails();
  }, [user, navigate]);

  const handleUpdateEntreprise = async (formData: Partial<Entreprise>) => {
    if (!user?.entrepriseId) return;

    try {
      setLoading(true);
      const updatedEntreprise = await updateEntreprise(user.entrepriseId, formData);
      setEntreprise(updatedEntreprise);
      setOpenEditDialog(false);
      // Show success message
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Aperçu de l'Entreprise
        </Typography>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/') }>
              Retour à l'accueil
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Aperçu de l'Entreprise
        </Typography>
      </Box>

      {/* Informations générales */}
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
        />
        <Box sx={{ mt: 2, p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : entreprise ? (
            <Box>
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
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Description sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {entreprise.description || 'Description non renseignée'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography color="text.secondary">Aucune donnée disponible</Typography>
          )}
        </Box>

        <ArgonCard
          title="Statistiques Rapides"
          value=""
          icon={<Assessment />}
          color="info"
        />
        <Box sx={{ mt: 2, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Employés
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {entreprise?.employees || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Secteur
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {entreprise?.sector || 'Non défini'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Créée le
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {entreprise?.createdAt ? new Date(entreprise.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
            </Typography>
          </Box>
        </Box>
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

export default EntrepriseOverview;
