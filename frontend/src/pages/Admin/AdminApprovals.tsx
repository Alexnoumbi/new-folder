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
  CircularProgress,
  Alert,
  Avatar,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  CheckCircle,
  Cancel,
  Refresh,
  Visibility,
  Person,
  CalendarToday,
  AccessTime
} from '@mui/icons-material';
import axios from 'axios';

interface Approval {
  _id: string;
  itemType: string;
  itemName: string;
  requestedBy: {
    nom: string;
    prenom: string;
  };
  workflow: {
    name: string;
    currentStep: string;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const AdminApprovals: React.FC = () => {
  const theme = useTheme();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/collaboration/approvals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApprovals(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching approvals:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des approbations');
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/collaboration/approvals/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApprovals();
    } catch (err) {
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/collaboration/approvals/${id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchApprovals();
    } catch (err) {
      alert('Erreur lors du rejet');
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

  const pending = approvals.filter(a => a.status === 'PENDING');

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
              Approbations en Attente
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Items nécessitant votre approbation ({pending.length} en attente)
            </Typography>
          </Box>

          <Tooltip title="Actualiser">
            <IconButton
              onClick={fetchApprovals}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <Refresh color="primary" />
            </IconButton>
          </Tooltip>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">En Attente</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {pending.length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Approuvés</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {approvals.filter(a => a.status === 'APPROVED').length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Rejetés</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {approvals.filter(a => a.status === 'REJECTED').length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {pending.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          ✅ Aucune approbation en attente. Tout est à jour!
        </Alert>
      ) : (
        <Stack spacing={2}>
          {pending.map((approval) => (
            <Card
              key={approval._id}
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: alpha(theme.palette.warning.main, 0.3),
                bgcolor: alpha(theme.palette.warning.main, 0.02)
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box flex={1}>
                    <Stack direction="row" spacing={1} mb={1}>
                      <Chip
                        label={approval.itemType}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={approval.priority}
                        color={getPriorityColor(approval.priority) as any}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="h6" fontWeight={700}>
                      {approval.itemName}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={1} mb={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Demandé par: {approval.requestedBy?.prenom} {approval.requestedBy?.nom}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTime fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Échéance: {new Date(approval.dueDate).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Créé: {new Date(approval.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Visibility />}
                    sx={{ flex: 1, textTransform: 'none' }}
                  >
                    Voir Détails
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircle />}
                    onClick={() => handleApprove(approval._id)}
                    sx={{ flex: 1, textTransform: 'none' }}
                  >
                    Approuver
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => handleReject(approval._id)}
                    sx={{ flex: 1, textTransform: 'none' }}
                  >
                    Rejeter
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

export default AdminApprovals;

