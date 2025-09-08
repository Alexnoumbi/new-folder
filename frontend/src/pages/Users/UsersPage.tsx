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
  Avatar,
  Divider
} from '@mui/material';
import {
  People,
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh,
  Email,
  Phone,
  LocationOn,
  Business,
  Security,
  AdminPanelSettings,
  Person
} from '@mui/icons-material';
import { getUsers, User } from '../../services/userService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonDataTable from '../../components/Argon/ArgonDataTable';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Administration', href: '/admin' },
    { label: 'Utilisateurs' }
  ];

  const headerActions = [
    {
      label: 'Nouvel Utilisateur',
      icon: <Add />,
      onClick: () => setOpenDialog(true),
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchUsers,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  const columns = [
    { id: 'name', label: 'Nom', minWidth: 200, sortable: true },
    { id: 'email', label: 'Email', minWidth: 200, sortable: true },
    { id: 'role', label: 'Rôle', minWidth: 120, sortable: true, filterable: true },
    { id: 'status', label: 'Statut', minWidth: 120, sortable: true, filterable: true },
    { id: 'lastLogin', label: 'Dernière connexion', minWidth: 150, sortable: true },
    { id: 'createdAt', label: 'Créé le', minWidth: 150, sortable: true },
  ];

  const tableData = users.map(user => ({
    ...user,
    name: `${user.firstName || ''} ${user.lastName || ''}`,
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais',
    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non défini',
  }));

  const actions = (row: any) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        startIcon={<Visibility />}
        onClick={() => setSelectedUser(row)}
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

  // Statistiques des utilisateurs
  const userStats = [
    {
      title: 'Total Utilisateurs',
      value: users.length,
      icon: <People />,
      color: 'primary' as const,
      change: '+5'
    },
    {
      title: 'Actifs',
      value: users.filter(u => u.status === 'active').length,
      icon: <Person />,
      color: 'success' as const,
      change: '+3'
    },
    {
      title: 'Administrateurs',
      value: users.filter(u => u.role === 'admin').length,
      icon: <AdminPanelSettings />,
      color: 'warning' as const,
      change: '+1'
    },
    {
      title: 'Nouveaux (30j)',
      value: users.filter(u => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return created > thirtyDaysAgo;
      }).length,
      icon: <Security />,
      color: 'info' as const,
      change: '+2'
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'user': return 'success';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Gestion des Utilisateurs"
          subtitle="Administration des utilisateurs du système"
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
        title="Gestion des Utilisateurs"
        subtitle="Administration des utilisateurs du système"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchUsers}
        loading={loading}
      />

      {/* Statistiques des utilisateurs */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {userStats.map((stat, index) => (
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

      {/* Tableau des utilisateurs */}
      <ArgonDataTable
        title="Liste des Utilisateurs"
        columns={columns}
        data={tableData}
        loading={loading}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        actions={actions}
        onExport={() => console.log('Export utilisateurs')}
      />

      {/* Dialog de détails de l'utilisateur */}
      {selectedUser && (
        <Dialog
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedUser.firstName} {selectedUser.lastName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.email}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Informations Personnelles
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedUser.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedUser.phone || 'Non renseigné'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedUser.location || 'Non renseigné'}</Typography>
                </Box>
      </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Informations Professionnelles
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">{selectedUser.company || 'Non renseigné'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={selectedUser.role}
                    color={getRoleColor(selectedUser.role) as any}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={selectedUser.status || 'Inconnu'}
                    color={getStatusColor(selectedUser.status || '') as any}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Dernière connexion: {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedUser(null)}>
              Fermer
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => console.log('Modifier utilisateur')}
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Dialog de création d'utilisateur */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nouvel Utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Formulaire de création d'utilisateur à implémenter
          </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log('Créer utilisateur');
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

export default UsersPage;
