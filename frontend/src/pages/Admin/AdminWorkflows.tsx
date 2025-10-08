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
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  AccountTree,
  Add,
  Refresh,
  Edit,
  Visibility,
  CheckCircle,
  Timeline
} from '@mui/icons-material';
import axios from 'axios';

interface Workflow {
  _id: string;
  name: string;
  description: string;
  steps: Array<{
    order: number;
    name: string;
    approvers: string[];
    slaHours: number;
  }>;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  usageCount: number;
}

const AdminWorkflows: React.FC = () => {
  const theme = useTheme();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/collaboration/workflows', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkflows(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching workflows:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des workflows');
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
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
              Workflows d'Approbation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configuration des flux d'approbation et processus
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchWorkflows}
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
              Nouveau Workflow
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {workflows.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun workflow configuré. Créez votre premier workflow d'approbation!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {workflows.map((workflow) => (
            <Grid item xs={12} md={6} key={workflow._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[12]
                  }
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {workflow.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {workflow.description}
                      </Typography>
                    </Box>
                    <Chip
                      label={workflow.status}
                      color={workflow.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </Stack>

                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2, my: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Timeline fontSize="small" color="action" />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {workflow.steps?.length || 0} Étape(s)
                      </Typography>
                    </Stack>
                    {workflow.steps?.slice(0, 3).map((step, idx) => (
                      <Typography key={idx} variant="caption" color="text.secondary" display="block">
                        {step.order}. {step.name}
                      </Typography>
                    ))}
                  </Paper>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Utilisé {workflow.usageCount || 0} fois
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<Visibility />} sx={{ textTransform: 'none' }}>
                        Voir
                      </Button>
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdminWorkflows;

