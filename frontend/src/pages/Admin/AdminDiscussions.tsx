import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Forum,
  Add,
  Search,
  Refresh,
  ChatBubble,
  Person,
  CalendarToday,
  CheckCircle,
  Warning,
  Info
} from '@mui/icons-material';
import axios from 'axios';

interface Discussion {
  _id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdBy: {
    nom: string;
    prenom: string;
  };
  commentsCount: number;
  createdAt: string;
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };
}

const AdminDiscussions: React.FC = () => {
  const theme = useTheme();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/collaboration/discussions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiscussions(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching discussions:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des discussions');
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'info';
      case 'IN_PROGRESS': return 'warning';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const filteredDiscussions = discussions.filter(d =>
    d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: discussions.length,
    open: discussions.filter(d => d.status === 'OPEN').length,
    inProgress: discussions.filter(d => d.status === 'IN_PROGRESS').length,
    resolved: discussions.filter(d => d.status === 'RESOLVED').length
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
          <Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Discussions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Forum de discussions et collaboration d'équipe
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchDiscussions}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              }}
            >
              Nouvelle Discussion
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Ouvertes</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">{stats.open}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">En Cours</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.inProgress}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Résolues</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.resolved}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Recherche */}
        <TextField
          fullWidth
          placeholder="Rechercher une discussion..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.05) }
          }}
        />
      </Box>

      {/* Liste Discussions */}
      {filteredDiscussions.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucune discussion trouvée. {searchTerm ? 'Essayez de modifier votre recherche.' : 'Créez la première discussion!'}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {filteredDiscussions.map((discussion) => (
            <Card
              key={discussion._id}
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[8],
                  borderColor: 'primary.main'
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box flex={1}>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip
                        label={discussion.status}
                        color={getStatusColor(discussion.status) as any}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        label={discussion.priority}
                        color={getPriorityColor(discussion.priority) as any}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {discussion.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {discussion.description}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                        {discussion.createdBy?.prenom?.charAt(0)}{discussion.createdBy?.nom?.charAt(0)}
                      </Avatar>
                      <Typography variant="caption">
                        {discussion.createdBy?.prenom} {discussion.createdBy?.nom}
                      </Typography>
                    </Stack>
                    <Chip
                      icon={<ChatBubble sx={{ fontSize: 16 }} />}
                      label={discussion.commentsCount || 0}
                      size="small"
                      variant="outlined"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(discussion.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Stack>

                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                  >
                    Voir Discussion
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default AdminDiscussions;

