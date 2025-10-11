import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Stack,
  Alert,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Person,
  Security,
  Notifications,
  Palette,
  Language,
  Storage,
  Email,
  Save,
  Refresh,
  Build,
  Shield,
  Warning,
  CheckCircle,
  Delete,
  Upload
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { updateUser } from '../../services/userService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminSettings: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [saving, setSaving] = useState(false);

  // Profil
  const [profileData, setProfileData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    avatar: user?.avatar || ''
  });
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');

  // Paramètres généraux
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'TrackImpact',
    timezone: 'Africa/Douala',
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'FCFA'
  });

  // Notifications
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserRegistration: true,
    newEnterprise: true,
    systemAlerts: true,
    weeklyReport: true,
    monthlyReport: true
  });

  // Sécurité
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiration: 90,
    loginAttempts: 5,
    requireStrongPassword: true
  });

  // Apparence
  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    compactMode: false,
    sidebarCollapsed: false,
    primaryColor: '#1976d2'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || '');
    }

    // Charger les paramètres depuis localStorage
    const savedGeneral = localStorage.getItem('generalSettings');
    if (savedGeneral) {
      setGeneralSettings(JSON.parse(savedGeneral));
    }

    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }

    const savedSecurity = localStorage.getItem('securitySettings');
    if (savedSecurity) {
      setSecuritySettings(JSON.parse(savedSecurity));
    }

    const savedAppearance = localStorage.getItem('appearanceSettings');
    if (savedAppearance) {
      setAppearanceSettings(JSON.parse(savedAppearance));
    }
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setSnackbar({ open: true, message: 'L\'image ne doit pas dépasser 2 MB', severity: 'error' });
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        setSnackbar({ open: true, message: 'Le fichier doit être une image', severity: 'error' });
        return;
      }

      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        setProfileData({ ...profileData, avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setProfileData({ ...profileData, avatar: '' });
  };

  const generateDefaultAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials;
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    try {
      setSaving(true);
      await updateUser(user.id, profileData);
      setSnackbar({ open: true, message: 'Profil mis à jour avec succès', severity: 'success' });
      // Recharger pour mettre à jour le header
      window.location.reload();
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Erreur lors de la sauvegarde', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = () => {
    localStorage.setItem('generalSettings', JSON.stringify(generalSettings));
    setSnackbar({ open: true, message: 'Paramètres généraux sauvegardés', severity: 'success' });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    setSnackbar({ open: true, message: 'Préférences de notifications sauvegardées', severity: 'success' });
  };

  const handleSaveSecurity = () => {
    localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
    setSnackbar({ open: true, message: 'Paramètres de sécurité sauvegardés', severity: 'success' });
  };

  const handleSaveAppearance = () => {
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
    setSnackbar({ open: true, message: 'Préférences d\'apparence sauvegardées', severity: 'success' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography 
            variant="h3" 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Paramètres
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            Configuration de l'application et préférences administrateur
          </Typography>
        </Box>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <Tab icon={<Person />} label="Mon Profil" iconPosition="start" />
          <Tab icon={<Build />} label="Général" iconPosition="start" />
          <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
          <Tab icon={<Security />} label="Sécurité" iconPosition="start" />
          <Tab icon={<Palette />} label="Apparence" iconPosition="start" />
          <Tab icon={<Storage />} label="Maintenance" iconPosition="start" />
        </Tabs>

        {/* Tab Panel 0: Profil */}
        <TabPanel value={currentTab} index={0}>
          <Box sx={{ px: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: theme.palette.primary.main,
                      fontSize: '2.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {!avatarPreview && generateDefaultAvatar(`${user?.prenom} ${user?.nom}`)}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        border: 2,
                        borderColor: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'white'
                        }
                      }}
                      size="small"
                    >
                      <Upload fontSize="small" />
                    </IconButton>
                  </label>
                  {avatarPreview && (
                    <IconButton
                      onClick={handleRemoveAvatar}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        border: 2,
                        borderColor: 'error.main',
                        '&:hover': {
                          bgcolor: 'error.main',
                          color: 'white'
                        }
                      }}
                      size="small"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {user?.prenom} {user?.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip 
                    label={user?.role} 
                    color="primary" 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Cliquez sur l'icône pour changer votre avatar (max 2MB)
                  </Typography>
                </Box>
              </Box>

              <Divider />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={profileData.prenom}
                    onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    value={profileData.nom}
                    onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={profileData.telephone}
                    onChange={(e) => setProfileData({ ...profileData, telephone: e.target.value })}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    if (user) {
                      setProfileData({
                        nom: user.nom || '',
                        prenom: user.prenom || '',
                        email: user.email || '',
                        telephone: user.telephone || '',
                        avatar: user.avatar || ''
                      });
                      setAvatarPreview(user.avatar || '');
                    }
                  }}
                >
                  Réinitialiser
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* Tab Panel 1: Général */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ px: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight="bold">
                Configuration générale de l'application
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom de l'application"
                    value={generalSettings.appName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fuseau horaire</InputLabel>
                    <Select
                      value={generalSettings.timezone}
                      label="Fuseau horaire"
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    >
                      <MenuItem value="Africa/Douala">Afrique/Douala (GMT+1)</MenuItem>
                      <MenuItem value="Europe/Paris">Europe/Paris (GMT+1)</MenuItem>
                      <MenuItem value="America/New_York">Amérique/New York (GMT-5)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Langue</InputLabel>
                    <Select
                      value={generalSettings.language}
                      label="Langue"
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                    >
                      <MenuItem value="fr">Français</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Format de date</InputLabel>
                    <Select
                      value={generalSettings.dateFormat}
                      label="Format de date"
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Devise</InputLabel>
                    <Select
                      value={generalSettings.currency}
                      label="Devise"
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                    >
                      <MenuItem value="FCFA">FCFA</MenuItem>
                      <MenuItem value="EUR">EUR (€)</MenuItem>
                      <MenuItem value="USD">USD ($)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveGeneral}
                >
                  Enregistrer
                </Button>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* Tab Panel 2: Notifications */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ px: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight="bold">
                Préférences de notifications
              </Typography>

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Notifications par email
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Recevoir des notifications par email
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <Divider />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.newUserRegistration}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newUserRegistration: e.target.checked })}
                        />
                      }
                      label="Nouvelle inscription utilisateur"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.newEnterprise}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newEnterprise: e.target.checked })}
                        />
                      }
                      label="Nouvelle entreprise"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.systemAlerts}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked })}
                        />
                      }
                      label="Alertes système"
                    />

                    <Divider />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.weeklyReport}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
                        />
                      }
                      label="Rapport hebdomadaire"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.monthlyReport}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, monthlyReport: e.target.checked })}
                        />
                      }
                      label="Rapport mensuel"
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveNotifications}
                >
                  Enregistrer
                </Button>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* Tab Panel 3: Sécurité */}
        <TabPanel value={currentTab} index={3}>
          <Box sx={{ px: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight="bold">
                Paramètres de sécurité
              </Typography>

              <Alert severity="warning" icon={<Shield />} sx={{ borderRadius: 2 }}>
                Ces paramètres affectent la sécurité de toute l'application. Modifier avec précaution.
              </Alert>

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Authentification à deux facteurs (2FA)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Exiger une vérification en deux étapes
                          </Typography>
                        </Box>
                      }
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Délai d'expiration de session (min)"
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                          InputProps={{ inputProps: { min: 5, max: 120 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Expiration mot de passe (jours)"
                          type="number"
                          value={securitySettings.passwordExpiration}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiration: parseInt(e.target.value) })}
                          InputProps={{ inputProps: { min: 30, max: 365 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Tentatives de connexion autorisées"
                          type="number"
                          value={securitySettings.loginAttempts}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, loginAttempts: parseInt(e.target.value) })}
                          InputProps={{ inputProps: { min: 3, max: 10 } }}
                        />
                      </Grid>
                    </Grid>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.requireStrongPassword}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, requireStrongPassword: e.target.checked })}
                        />
                      }
                      label="Exiger des mots de passe forts"
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSecurity}
                >
                  Enregistrer
                </Button>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* Tab Panel 4: Apparence */}
        <TabPanel value={currentTab} index={4}>
          <Box sx={{ px: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight="bold">
                Préférences d'apparence
              </Typography>

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appearanceSettings.darkMode}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, darkMode: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Mode sombre
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Activer le thème sombre
                          </Typography>
                        </Box>
                      }
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={appearanceSettings.compactMode}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                        />
                      }
                      label="Mode compact"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={appearanceSettings.sidebarCollapsed}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, sidebarCollapsed: e.target.checked })}
                        />
                      }
                      label="Sidebar réduite par défaut"
                    />

                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Couleur principale
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        {['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'].map((color) => (
                          <Box
                            key={color}
                            onClick={() => setAppearanceSettings({ ...appearanceSettings, primaryColor: color })}
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: 2,
                              bgcolor: color,
                              cursor: 'pointer',
                              border: appearanceSettings.primaryColor === color ? 3 : 0,
                              borderColor: 'primary.main',
                              transition: 'all 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveAppearance}
                >
                  Enregistrer
                </Button>
              </Box>
            </Stack>
          </Box>
        </TabPanel>

        {/* Tab Panel 5: Maintenance */}
        <TabPanel value={currentTab} index={5}>
          <Box sx={{ px: 3, maxWidth: 800, mx: 'auto' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight="bold">
                Maintenance et outils système
              </Typography>

              <Alert severity="info" icon={<Warning />} sx={{ borderRadius: 2 }}>
                Ces actions peuvent affecter les performances de l'application. Utiliser avec précaution.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Storage sx={{ fontSize: 48, color: 'primary.main' }} />
                        <Typography variant="h6">Vider le cache</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supprimer les fichiers temporaires et le cache de l'application
                        </Typography>
                        <Button variant="outlined" fullWidth>
                          Vider le cache
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Delete sx={{ fontSize: 48, color: 'warning.main' }} />
                        <Typography variant="h6">Nettoyer les logs</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supprimer les anciens logs système (&gt; 90 jours)
                        </Typography>
                        <Button variant="outlined" color="warning" fullWidth>
                          Nettoyer
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Upload sx={{ fontSize: 48, color: 'success.main' }} />
                        <Typography variant="h6">Exporter les données</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Créer une sauvegarde complète de la base de données
                        </Typography>
                        <Button variant="outlined" color="success" fullWidth>
                          Exporter
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Stack spacing={2} alignItems="center" textAlign="center">
                        <Refresh sx={{ fontSize: 48, color: 'info.main' }} />
                        <Typography variant="h6">Redémarrer les services</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Redémarrer les services backend de l'application
                        </Typography>
                        <Button variant="outlined" color="info" fullWidth>
                          Redémarrer
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Alert severity="success" icon={<CheckCircle />} sx={{ borderRadius: 2 }}>
                Système opérationnel • Dernière maintenance: Il y a 2 jours
              </Alert>
            </Stack>
          </Box>
        </TabPanel>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminSettings;
