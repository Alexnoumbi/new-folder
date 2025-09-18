import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import type { User, UserCreateData, UserUpdateData } from '../../types/user.types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [typeCompteFilter, setTypeCompteFilter] = useState<string>('');
  const [formData, setFormData] = useState<UserCreateData>({
    nom: '',
    prenom: '',
    email: '',
    role: 'user',
    typeCompte: 'admin',
    telephone: '',
    entreprise: '',
    status: 'active'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers(searchTerm, roleFilter, typeCompteFilter);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
      console.error('Error loading users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, typeCompteFilter]);

  const handleOpenCreateDialog = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      role: 'user',
      typeCompte: 'admin',
      telephone: '',
      entreprise: '',
      status: 'active'
    });
    setEditingUser(null);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: User) => {
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
      typeCompte: user.typeCompte,
      telephone: user.telephone || '',
      entreprise: user.entreprise || '',
      status: user.status
    });
    setEditingUser(user);
    setFormError(null);
    setOpenDialog(true);
  };

  const validateForm = () => {
    if (!formData.nom?.trim()) return 'Le nom est requis';
    if (!formData.prenom?.trim()) return 'Le prénom est requis';
    if (!formData.email?.trim()) return 'L\'email est requis';
    if (!formData.email?.includes('@')) return 'Email invalide';
    if (!formData.role) return 'Le rôle est requis';
    if (!formData.typeCompte) return 'Le type de compte est requis';
    return null;
  };

  const handleSubmit = async () => {
    try {
      const validationError = validateForm();
      if (validationError) {
        setFormError(validationError);
        return;
      }

      setFormError(null);
      setLoading(true);

      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await createUser(formData);
      }

      setOpenDialog(false);
      await fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de la sauvegarde de l\'utilisateur');
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setLoading(true);
      await deleteUser(userId);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur');
      console.error('Error deleting user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des Utilisateurs</Typography>
        <Box>
          <IconButton onClick={fetchUsers} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nouvel Utilisateur
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchUsers}>
              Réessayer
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {loading && users.length === 0 ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : users.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {users.map((user) => (
            <Box key={user.id}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {user.nom.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6">{`${user.nom} ${user.prenom}`}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={user.role}
                    color={user.role === 'admin' ? 'error' : 'primary'}
                    size="small"
                  />
                </Box>
                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <IconButton size="small" onClick={() => setViewingUser(user)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleOpenEditDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(user.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          Aucun utilisateur trouvé. Ajustez vos filtres ou créez un nouvel utilisateur.
        </Alert>
      )}

      {viewingUser && (
        <Dialog
          open={!!viewingUser}
          onClose={() => setViewingUser(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {viewingUser.nom.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6">{`${viewingUser.nom} ${viewingUser.prenom}`}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {viewingUser.email}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Email"
                    value={viewingUser.email}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Téléphone"
                    value={viewingUser.telephone || 'Non renseigné'}
                    disabled
                    fullWidth
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Informations Professionnelles
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Entreprise"
                    value={viewingUser.entreprise || 'Non renseigné'}
                    disabled
                    fullWidth
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={viewingUser.role}
                      color={viewingUser.role === 'admin' ? 'error' : 'primary'}
                      size="small"
                    />
                    <Chip
                      label={viewingUser.status}
                      color={viewingUser.status === 'active' ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewingUser(null)}>Fermer</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export { AdminUsers };
export default AdminUsers;
