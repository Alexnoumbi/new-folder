import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
  Chip,
  Paper,
  Avatar,
  useTheme,
  alpha,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Dashboard,
  CheckCircle,
  ArrowForward,
  BarChart,
  Timeline,
  Speed,
  Security,
  Group,
  Menu as MenuIcon,
  Insights,
  Analytics,
  Send
} from '@mui/icons-material';
import axios from 'axios';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // States pour le formulaire de demande
  const [requestForm, setRequestForm] = useState({
    entreprise: '',
    email: '',
    telephone: '',
    projet: '',
    description: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError('');

    try {
      await axios.post('http://localhost:5000/api/public/submission-requests', requestForm);
      setRequestSuccess(true);
      setRequestForm({
        entreprise: '',
        email: '',
        telephone: '',
        projet: '',
        description: ''
      });
      setTimeout(() => setRequestSuccess(false), 5000);
    } catch (err: any) {
      setRequestError(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setRequestLoading(false);
    }
  };

  const features = [
    {
      icon: <BarChart sx={{ fontSize: 40 }} />,
      title: 'Collecte de Données',
      description: 'Collectez des données en temps réel avec notre générateur de formulaires natif, ou activez les imports automatiques depuis Excel, KoboToolbox et Google Drive.'
    },
    {
      icon: <Dashboard sx={{ fontSize: 40 }} />,
      title: 'Gestion des Données',
      description: 'Gestion complète de bout en bout des données d\'impact. Collectez, importez, organisez et analysez les ensembles de données provenant de sources multiples.'
    },
    {
      icon: <Timeline sx={{ fontSize: 40 }} />,
      title: 'Cadre de Résultats & Indicateurs',
      description: 'Connectez vos cadres logiques aux indicateurs pour surveiller les résultats sans effort, en gardant vos objectifs clairement en vue.'
    },
    {
      icon: <Insights sx={{ fontSize: 40 }} />,
      title: 'Tableaux de Bord',
      description: 'Dashboards configurables pour explorer les dernières informations de vos projets et les partager avec vos partenaires en temps réel.'
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: 'Collaboration',
      description: 'Gérez les workflows d\'équipe avec la gestion des activités et des approbations, permettez des retours plus rapides et assignez des tâches.'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Conformité & Sécurité',
      description: 'Suivi de la conformité réglementaire, gestion des conventions et audits de sécurité intégrés pour une transparence totale.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Utilisateurs' },
    { value: '150+', label: 'Projets' },
    { value: '2000+', label: 'Indicateurs' },
    { value: '10+', label: 'Régions' }
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Directrice de Projet, MINEPAT',
      avatar: 'M',
      comment: 'TrackImpact a transformé notre façon de suivre et d\'évaluer nos projets de développement. Un outil indispensable!'
    },
    {
      name: 'Jean Kamga',
      role: 'Responsable M&E, GIZ Cameroun',
      avatar: 'J',
      comment: 'La plateforme facilite énormément le suivi multi-projets et la génération de rapports pour nos bailleurs.'
    },
    {
      name: 'Sophie Martin',
      role: 'Coordinatrice, AFD',
      avatar: 'S',
      comment: 'Excellente solution pour le monitoring de nos entreprises partenaires. Interface intuitive et fonctionnalités complètes.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ 
        bgcolor: 'white', 
        borderBottom: 1, 
        borderColor: 'divider',
        color: 'text.primary' 
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img src="/logo.svg" alt="TrackImpact" style={{ height: 40, marginRight: 16 }} />
          </Box>
          <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit">Fonctionnalités</Button>
            <Button color="inherit">Tarifs</Button>
            <Button color="inherit">À propos</Button>
            <Button variant="outlined" onClick={() => navigate('/login')}>Connexion</Button>
            <Button variant="contained" onClick={() => navigate('/register')}>Essai Gratuit</Button>
          </Stack>
          <IconButton sx={{ display: { xs: 'flex', md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        py: { xs: 8, md: 15 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip 
                label="✨ Nouvelle Version 2.0" 
                sx={{ mb: 3, bgcolor: alpha('#fff', 0.2), color: 'white' }}
              />
              <Typography variant="h2" gutterBottom sx={{ 
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}>
                Simplifiez le suivi et l'évaluation de votre impact !
              </Typography>
              <Typography variant="h5" paragraph sx={{ 
                opacity: 0.95,
                mb: 4,
                fontWeight: 300
              }}>
                Une plateforme digitale pour suivre, gérer et visualiser vos résultats de développement
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                    py: 1.5,
                    px: 4
                  }}
                  endIcon={<ArrowForward />}
                >
                  Commencer Gratuitement
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  sx={{ 
                    borderColor: 'white', 
                    color: 'white',
                    '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) },
                    py: 1.5,
                    px: 4
                  }}
                >
                  Voir la Démo
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                position: 'relative',
                display: { xs: 'none', md: 'block' }
              }}>
                <Paper 
                  elevation={24}
                  sx={{ 
                    p: 3,
                    borderRadius: 4,
                    transform: 'perspective(1000px) rotateY(-15deg)',
                    background: 'white'
                  }}
                >
                  <Analytics sx={{ fontSize: 200, color: 'primary.main', opacity: 0.2 }} />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="overline" color="primary" fontWeight="bold" fontSize={14}>
            FONCTIONNALITÉS
          </Typography>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            De la Donnée à l'Insight. De l'Insight à l'Action.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            TrackImpact simplifie le suivi et la gestion de projets pour que vous puissiez suivre, 
            réviser et rapporter toutes vos activités sur une plateforme complète.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[12]
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      color: 'primary.main',
                      mb: 2,
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Use Cases */}
      <Box sx={{ bgcolor: 'grey.50', py: 12 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom fontWeight="bold">
                Simple à Grande Échelle
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary" fontSize={18}>
                Que vous gériez un projet ou un portfolio entier, TrackImpact s'adapte à vos besoins.
              </Typography>
              <Stack spacing={3} mt={4}>
                {[
                  'Monitoring multi-projets et multi-régions',
                  'Agrégation automatique des indicateurs',
                  'Rapports personnalisables et exports multiples',
                  'Gestion des workflows et approbations'
                ].map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle color="primary" />
                    <Typography variant="body1">{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
                <Speed sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Pour les Projets & Portfolios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transformez vos données en intelligence d'impact. Partenariat avec des experts 
                  pour construire des systèmes MEAL qui alimentent l'apprentissage continu et l'impact.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Ils Nous Font Confiance
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Rejoignez des organisations leaders du développement international
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={2} mb={3}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography variant="body1" color="text.secondary" fontStyle="italic">
                    "{testimonial.comment}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 10
      }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Prêt à Transformer Votre Impact ?
            </Typography>
            <Typography variant="h6" paragraph sx={{ opacity: 0.9, mb: 4 }}>
              Commencez votre essai gratuit aujourd'hui. Aucune carte de crédit requise.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/register')}
                sx={{ 
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  py: 1.5,
                  px: 5
                }}
              >
                Essai Gratuit 30 Jours
              </Button>
              <Button 
                variant="outlined"
                size="large"
                sx={{ 
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: alpha('#fff', 0.1) },
                  py: 1.5,
                  px: 5
                }}
              >
                Contactez-nous
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Section Demande de Soumission */}
      <Box sx={{ py: 12, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="md">
          <Box textAlign="center" mb={6}>
            <Chip 
              label="✨ Nouveau" 
              color="primary" 
              sx={{ mb: 2, fontWeight: 600 }} 
            />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Demande de Soumission de Projet
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Vous avez un projet? Soumettez votre demande et notre équipe vous contactera rapidement!
            </Typography>
          </Box>

          {requestSuccess && (
            <Alert 
              severity="success" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setRequestSuccess(false)}
            >
              Votre demande a été envoyée avec succès! Nous vous contacterons bientôt.
            </Alert>
          )}

          {requestError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setRequestError('')}
            >
              {requestError}
            </Alert>
          )}

          <Card sx={{ p: 4, borderRadius: 3, boxShadow: theme.shadows[12] }}>
            <Box component="form" onSubmit={handleRequestSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Nom de l'entreprise"
                  fullWidth
                  required
                  value={requestForm.entreprise}
                  onChange={(e) => setRequestForm({ ...requestForm, entreprise: e.target.value })}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    value={requestForm.email}
                    onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                  <TextField
                    label="Téléphone"
                    fullWidth
                    value={requestForm.telephone}
                    onChange={(e) => setRequestForm({ ...requestForm, telephone: e.target.value })}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Stack>
                <TextField
                  label="Nom du projet"
                  fullWidth
                  required
                  value={requestForm.projet}
                  onChange={(e) => setRequestForm({ ...requestForm, projet: e.target.value })}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <TextField
                  label="Décrivez votre projet et vos objectifs"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={requestLoading}
                  endIcon={requestLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: 16,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.4)}`
                    }
                  }}
                >
                  {requestLoading ? 'Envoi en cours...' : 'Envoyer la Demande'}
                </Button>
              </Stack>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <img src="/logo.svg" alt="TrackImpact" style={{ height: 40, marginBottom: 16, filter: 'brightness(0) invert(1)' }} />
              <Typography variant="body2" color="grey.400">
                La solution digitale de référence pour le suivi et l'évaluation d'impact.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom>Produit</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400">Fonctionnalités</Typography>
                <Typography variant="body2" color="grey.400">Tarifs</Typography>
                <Typography variant="body2" color="grey.400">Démo</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom>Entreprise</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400">À propos</Typography>
                <Typography variant="body2" color="grey.400">Carrières</Typography>
                <Typography variant="body2" color="grey.400">Contact</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom>Ressources</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400">Documentation</Typography>
                <Typography variant="body2" color="grey.400">Blog</Typography>
                <Typography variant="body2" color="grey.400">Support</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="h6" gutterBottom>Légal</Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="grey.400">Confidentialité</Typography>
                <Typography variant="body2" color="grey.400">Conditions</Typography>
                <Typography variant="body2" color="grey.400">Sécurité</Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'grey.800', mt: 6, pt: 4 }}>
            <Typography variant="body2" color="grey.500" textAlign="center">
              © 2025 TrackImpact. Tous droits réservés.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;

