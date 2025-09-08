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
  DialogActions
} from '@mui/material';
import {
  Business,
  Edit,
  LocationOn,
  Phone,
  Email,
  Web,
  Description,
  People,
  Assessment,
  TrendingUp
} from '@mui/icons-material';
import { getEntrepriseDetails, Entreprise } from '../../services/entrepriseService';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonForm from '../../components/Argon/ArgonForm';
import ArgonChartWidget from '../../components/Argon/ArgonChartWidget';

const EntrepriseOverview: React.FC = () => {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    fetchEntrepriseDetails();
  }, []);

  const fetchEntrepriseDetails = async () => {
    try {
      setLoading(true);
      const data = await getEntrepriseDetails();
      setEntreprise(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des détails de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEntreprise = async (formData: any) => {
    try {
      // Logique de mise à jour
      console.log('Mise à jour entreprise:', formData);
      setOpenEditDialog(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const formFields = [
    { name: 'name', label: 'Nom de l\'entreprise', required: true, xs: 12, md: 6 },
    { name: 'address', label: 'Adresse', type: 'textarea' as const, xs: 12, md: 6 },
    { name: 'phone', label: 'Téléphone', type: 'text' as const, xs: 12, md: 6 },
    { name: 'email', label: 'Email', type: 'email' as const, xs: 12, md: 6 },
    { name: 'website', label: 'Site web', type: 'text' as const, xs: 12, md: 6 },
    { name: 'sector', label: 'Secteur d\'activité', type: 'text' as const, xs: 12, md: 6 },
    { name: 'description', label: 'Description', type: 'textarea' as const, xs: 12 },
  ];

  // Données de démonstration pour les graphiques
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

  if (error) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Aperçu de l'Entreprise
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Aperçu de l'Entreprise
        </Typography>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => setOpenEditDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          Modifier
        </Button>
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
