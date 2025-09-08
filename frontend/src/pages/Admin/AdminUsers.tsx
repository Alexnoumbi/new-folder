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
import { User } from '../../types/auth.types';

interface UserFormData {
  nom: string;
  prenom: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  typeCompte: 'admin' | 'entreprise';
  telephone?: string;
  entrepriseId?: string;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    nom: '',
    prenom: '',
    email: '',
    role: 'user',
    typeCompte: 'admin',
    telephone: '',
    entrepriseId: ''
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreateDialog = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      role: 'user',
      typeCompte: 'admin',
      telephone: '',
      entrepriseId: ''
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
      entrepriseId: user.entrepriseId || ''
    });
    setEditingUser(user);
    setFormError(null);
    setOpenDialog(true);
  };

  const validateForm = () => {
    if (!formData.nom.trim()) return 'Le nom est requis';
    if (!formData.prenom.trim()) return 'Le prénom est requis';
    if (!formData.email.trim()) return 'L\'email est requis';
    if (!formData.email.includes('@')) return 'Email invalide';
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
        await updateUser(editingUser._id, formData);
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
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {users.map((user) => (
            <Box key={user._id}>
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
                    onClick={() => handleDelete(user._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              />
              <TextField
                fullWidth
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={formData.role}
                  label="Rôle"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role']})}
                >
                  <MenuItem value="user">Utilisateur</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Type de Compte</InputLabel>
                <Select
                  value={formData.typeCompte}
                  label="Type de Compte"
                  onChange={(e) => setFormData({ ...formData, typeCompte: e.target.value as User['typeCompte']})}
                >
                  <MenuItem value="admin">Administration</MenuItem>
                  <MenuItem value="entreprise">Entreprise</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
            {formData.typeCompte === 'entreprise' && (
              <TextField
                fullWidth
                label="ID Entreprise"
                value={formData.entrepriseId}
                onChange={(e) => setFormData({ ...formData, entrepriseId: e.target.value })}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : editingUser ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!viewingUser}
        onClose={() => setViewingUser(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Détails de l'Utilisateur</DialogTitle>
        <DialogContent>
          {viewingUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="subtitle2">Nom Complet</Typography>
                <Typography>{`${viewingUser.nom} ${viewingUser.prenom}`}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Email</Typography>
                <Typography>{viewingUser.email}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Rôle</Typography>
                <Chip
                  label={viewingUser.role}
                  color={viewingUser.role === 'admin' ? 'error' : 'primary'}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2">Type de Compte</Typography>
                <Chip
                  label={viewingUser.typeCompte === 'admin' ? 'Administration' : 'Entreprise'}
                  color={viewingUser.typeCompte === 'admin' ? 'secondary' : 'info'}
                />
              </Box>
              {viewingUser.telephone && (
                <Box>
                  <Typography variant="subtitle2">Téléphone</Typography>
                  <Typography>{viewingUser.telephone}</Typography>
                </Box>
              )}
              {viewingUser.entrepriseId && (
                <Box>
                  <Typography variant="subtitle2">ID Entreprise</Typography>
                  <Typography>{viewingUser.entrepriseId}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingUser(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
