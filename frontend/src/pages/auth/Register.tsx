import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  alpha,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Business as BusinessIcon,
  ArrowForward,
  ArrowBack,
  CheckCircle
} from '@mui/icons-material';
import { register } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/user.types';

const steps = ['Informations personnelles', 'Informations du compte', 'Confirmation'];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { setUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    typeCompte: 'entreprise' as 'admin' | 'entreprise',
    telephone: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.prenom || !formData.nom) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
      }
    }
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        typeCompte: formData.typeCompte,
        telephone: formData.telephone
      });

      const user: User = {
        ...response.user,
        status: 'active'
      };

      setUser(user);

      if (user.typeCompte === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/enterprise/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
  return (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Prénom"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                placeholder="Votre prénom"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.05)
                  }
                }}
              />
              <TextField
                fullWidth
                label="Nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Votre nom"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.grey[500], 0.05)
                  }
                }}
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Type de compte</InputLabel>
              <Select
                value={formData.typeCompte}
                label="Type de compte"
                onChange={(e) => handleChange('typeCompte', e.target.value)}
                sx={{
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.05)
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <BusinessIcon color="action" />
                  </InputAdornment>
                }
              >
                <MenuItem value="entreprise">Entreprise</MenuItem>
                <MenuItem value="admin">Administrateur</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Téléphone"
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              placeholder="+237 6XX XXX XXX"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.05)
                }
              }}
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={2.5}>
          <TextField
            fullWidth
              label="Adresse email"
              type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="votre@email.com"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.05)
                }
              }}
            />

          <TextField
            fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.05)
                }
              }}
            />

          <TextField
            fullWidth
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.grey[500], 0.05)
                }
              }}
            />
          </Stack>
        );
      case 2:
        return (
          <Box>
            <Box textAlign="center" mb={4}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Vérifiez vos informations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assurez-vous que toutes les informations sont correctes
              </Typography>
            </Box>

            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.2)
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Nom complet
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.prenom} {formData.nom}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formData.email}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Type de compte
                  </Typography>
                  <Chip
                    label={formData.typeCompte === 'admin' ? 'Administrateur' : 'Entreprise'}
                    color="primary"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                {formData.telephone && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Téléphone
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {formData.telephone}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Paper>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: alpha('#fff', 0.1),
          borderRadius: '50%',
          top: '-250px',
          left: '-150px'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: alpha('#fff', 0.1),
          borderRadius: '50%',
          bottom: '-200px',
          right: '-100px'
        }
      }}
    >
      <Container maxWidth="md" sx={{ display: 'flex', alignItems: 'center', py: 4, position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            background: 'white'
          }}
        >
          {/* Logo and Header */}
          <Box textAlign="center" mb={4}>
            <Box
              component="img"
              src="/logo.svg"
              alt="TrackImpact"
              sx={{ height: 50, mb: 3 }}
            />
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{ color: 'text.primary' }}
            >
              Créer un compte
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Rejoignez TrackImpact pour suivre votre impact
            </Typography>
          </Box>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2
              }}
            >
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box mb={4}>
            {renderStepContent(activeStep)}
          </Box>

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2}>
            {activeStep > 0 && (
              <Button
                variant="outlined"
                size="large"
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Retour
              </Button>
            )}
          <Button
              variant="contained"
              size="large"
              onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
              endIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : activeStep === steps.length - 1 ? (
                  <CheckCircle />
                ) : (
                  <ArrowForward />
                )
              }
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
            >
              {loading
                ? 'Création...'
                : activeStep === steps.length - 1
                ? 'Créer mon compte'
                : 'Suivant'}
          </Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Vous avez déjà un compte ?{' '}
              <Typography
            component={Link}
            to="/login"
                variant="body2"
                color="primary"
                sx={{
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Se connecter
              </Typography>
            </Typography>
          </Box>
        </Paper>
      </Container>
        </Box>
  );
};

export { Register };
export default Register;
