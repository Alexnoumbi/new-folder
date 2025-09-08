import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Avatar,
  Divider,
  TextField,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Email,
  Phone,
  LocationOn,
  Business,
  Security,
  Notifications,
  Language,
  Palette,
  Refresh
} from '@mui/icons-material';
import { getUserProfile, updateUserProfile, UserProfile } from '../../services/userService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
      setFormData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateUserProfile(undefined, formData);
      setProfile(formData as UserProfile);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setEditing(false);
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Profil' }
  ];

  const headerActions = [
    {
      label: editing ? 'Annuler' : 'Modifier',
      icon: editing ? <Cancel /> : <Edit />,
      onClick: editing ? handleCancel : () => setEditing(true),
      variant: editing ? 'outlined' as const : 'contained' as const,
      color: editing ? 'error' as const : 'primary' as const
    },
    ...(editing ? [{
      label: 'Sauvegarder',
      icon: <Save />,
      onClick: handleSave,
      variant: 'contained' as const,
      color: 'success' as const,
      loading: saving
    }] : [{
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchProfile,
      variant: 'outlined' as const,
      color: 'primary' as const
    }])
  ];

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Mon Profil"
          subtitle="Gestion de votre profil utilisateur"
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
        title="Mon Profil"
        subtitle="Gestion de votre profil utilisateur"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchProfile}
        loading={loading}
      />

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, 
        gap: 4 
      }}>
        {/* Informations personnelles */}
        <ArgonCard
          title="Informations Personnelles"
          value=""
          icon={<Person />}
          color="primary"
        >
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mr: 3,
                  fontSize: '2rem'
                }}
              >
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {profile?.firstName} {profile?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile?.role}
                </Typography>
                <Chip
                  label={profile?.status || 'Actif'}
                  color="success"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Prénom"
                value={formData.firstName || ''}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Nom"
                value={formData.lastName || ''}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                label="Téléphone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                label="Localisation"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Box>
          </Box>
        </ArgonCard>

        {/* Informations professionnelles */}
        <ArgonCard
          title="Informations Professionnelles"
          value=""
          icon={<Business />}
          color="info"
        >
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Entreprise"
                value={formData.company || ''}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: <Business sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <TextField
                label="Poste"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Département"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Manager"
                value={formData.manager || ''}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Box>
        </ArgonCard>

        {/* Préférences */}
        <ArgonCard
          title="Préférences"
          value=""
          icon={<Palette />}
          color="info"
        >
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.emailNotifications || false}
                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    disabled={!editing}
                  />
                }
                label="Notifications par email"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.smsNotifications || false}
                    onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
                    disabled={!editing}
                  />
                }
                label="Notifications SMS"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.darkMode || false}
                    onChange={(e) => setFormData({ ...formData, darkMode: e.target.checked })}
                    disabled={!editing}
                  />
                }
                label="Mode sombre"
              />
              <TextField
                label="Langue"
                value={formData.language || 'fr'}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                disabled={!editing}
                fullWidth
                variant="outlined"
                select
                SelectProps={{
                  native: true
                }}
                InputProps={{
                  startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </TextField>
            </Box>
          </Box>
        </ArgonCard>

        {/* Sécurité */}
        <ArgonCard
          title="Sécurité"
          value=""
          icon={<Security />}
          color="warning"
        >
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => console.log('Changer mot de passe')}
                disabled={!editing}
              >
                Changer le mot de passe
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => console.log('Activer 2FA')}
                disabled={!editing}
              >
                Activer l'authentification à deux facteurs
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => console.log('Sessions actives')}
                disabled={!editing}
              >
                Gérer les sessions actives
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Dernière connexion
              </Typography>
              <Typography variant="body2">
                {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString('fr-FR') : 'Jamais'}
              </Typography>
            </Box>
          </Box>
        </ArgonCard>
      </Box>
    </Box>
  );
};

export default ProfilePage;
