import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Divider
} from '@mui/material';
import {
  Business,
  Add,
  Search,
  FilterList,
  Refresh,
  Edit,
  Delete,
  Visibility,
  TrendingUp,
  People,
  Assessment,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';
import { getEntreprises, Entreprise } from '../../services/entrepriseService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonDataTable from '../../components/Argon/ArgonDataTable';

const EntreprisesPage: React.FC = () => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntreprise, setSelectedEntreprise] = useState<Entreprise | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const data = await getEntreprises();
      setEntreprises(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des entreprises');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Gestion des Entreprises' }
  ];

  const headerActions = [
    {
      label: 'Nouvelle Entreprise',
      icon: <Add />,
      onClick: () => setOpenDialog(true),
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchEntreprises,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  const columns = [
    { id: 'name', label: 'Nom', minWidth: 200, sortable: true },
    { id: 'sector', label: 'Secteur', minWidth: 150, sortable: true },
    { id: 'employees', label: 'Employés', minWidth: 100, sortable: true },
    { id: 'status', label: 'Statut', minWidth: 120, sortable: true },
    { id: 'location', label: 'Localisation', minWidth: 150, sortable: true },
    { id: 'kpiScore', label: 'Score KPI', minWidth: 120, sortable: true },
  ];

  const filteredEntreprises = entreprises.filter(entreprise =>
    entreprise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entreprise.sector || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entreprise.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableData = filteredEntreprises.map(entreprise => ({
    ...entreprise,
    employees: `${entreprise.employees || 0} employés`,
    kpiScore: `${entreprise.kpiScore || 0}/100`,
  }));

  const actions = (row: any) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        startIcon={<Visibility />}
        onClick={() => setSelectedEntreprise(row)}
        variant="outlined"
        color="primary"
      >
        Voir
      </Button>
      <Button
        size="small"
        startIcon={<Edit />}
        onClick={() => console.log('Modifier:', row.id)}
        variant="outlined"
        color="secondary"
      >
        Modifier
      </Button>
      <Button
        size="small"
        startIcon={<Delete />}
        onClick={() => console.log('Supprimer:', row.id)}
        variant="outlined"
        color="error"
      >
        Supprimer
      </Button>
    </Box>
  );

  // Statistiques des entreprises
  const entrepriseStats = [
    {
      title: 'Total Entreprises',
      value: entreprises.length,
      icon: <Business />,
      color: 'primary' as const,
      change: '+3'
    },
    {
      title: 'Actives',
      value: entreprises.filter(e => e.status === 'active').length,
      icon: <TrendingUp />,
      color: 'success' as const,
      change: '+2'
    },
    {
      title: 'Employés Total',
      value: entreprises.reduce((acc, e) => acc + (e.employees || 0), 0),
      icon: <People />,
      color: 'info' as const,
      change: '+15'
    },
    {
      title: 'Score Moyen KPI',
      value: `${Math.round(entreprises.reduce((acc, e) => acc + (e.kpiScore || 0), 0) / entreprises.length) || 0}/100`,
      icon: <Assessment />,
      color: 'warning' as const,
      change: '+5%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Gestion des Entreprises"
          subtitle="Administration des entreprises partenaires"
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
        title="Gestion des Entreprises"
        subtitle="Administration des entreprises partenaires"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchEntreprises}
        loading={loading}
      />

      {/* Statistiques des entreprises */}
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

      {/* Tableau des entreprises */}
      <ArgonDataTable
        title="Liste des Entreprises"
        columns={columns}
        data={tableData}
        loading={loading}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        actions={actions}
        onRowClick={setSelectedEntreprise}
        onExport={() => console.log('Export entreprises')}
      />

      {/* Dialog de détails de l'entreprise */}
      {selectedEntreprise && (
        <Dialog
          open={!!selectedEntreprise}
          onClose={() => setSelectedEntreprise(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <Business />
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedEntreprise.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEntreprise.sector}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Informations Générales
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedEntreprise.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedEntreprise.employees} employés</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Assessment sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">Score KPI: {selectedEntreprise.kpiScore}/100</Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Contact
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedEntreprise.phone || 'Non renseigné'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedEntreprise.email || 'Non renseigné'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={selectedEntreprise.status || 'active'}
                    color={getStatusColor(selectedEntreprise.status || 'active') as any}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
            
            {selectedEntreprise.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2">
                  {selectedEntreprise.description}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedEntreprise(null)}>
              Fermer
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => console.log('Modifier entreprise')}
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog de création d'entreprise */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nouvelle Entreprise</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nom de l'entreprise"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Secteur d'activité"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Localisation"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Nombre d'employés"
              type="number"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Téléphone"
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log('Créer entreprise');
              setOpenDialog(false);
            }}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntreprisesPage;
