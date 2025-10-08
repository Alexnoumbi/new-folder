import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Avatar,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Search,
  FilterList,
  Download,
  Refresh,
  Edit,
  CalendarToday,
  Business,
  Person
} from '@mui/icons-material';
import axios from 'axios';

interface Submission {
  _id: string;
  form: string | {
    _id: string;
    name: string;
  };
  submittedBy?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  submitterName?: string;
  submitterEmail?: string;
  entreprise?: {
    _id: string;
    nom: string;
  };
  status: 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  submittedAt: string;
  approvedAt?: string;
  rejectionReason?: string;
  data: any;
}

const AdminSubmissions: React.FC = () => {
  const theme = useTheme();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/form-builder/submissions');
      setSubmissions(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des soumissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/form-builder/submissions/${id}/approve`,
        { comment: 'Approuvé depuis AdminSubmissions' }
      );
      fetchSubmissions();
    } catch (err: any) {
      console.error('Error approving submission:', err);
      alert('Erreur lors de l\'approbation');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;
    
    try {
      await axios.put(
        `http://localhost:5000/api/form-builder/submissions/${id}/reject`,
        { reason }
      );
      fetchSubmissions();
    } catch (err: any) {
      console.error('Error rejecting submission:', err);
      alert('Erreur lors du rejet');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING_APPROVAL': return 'warning';
      case 'SUBMITTED': return 'info';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Approuvé';
      case 'REJECTED': return 'Rejeté';
      case 'PENDING_APPROVAL': return 'En attente';
      case 'SUBMITTED': return 'Soumis';
      case 'DRAFT': return 'Brouillon';
      default: return status;
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const formName = typeof sub.form === 'object' ? sub.form?.name : '';
    const submitterName = sub.submitterName || `${sub.submittedBy?.prenom || ''} ${sub.submittedBy?.nom || ''}`;
    const matchesSearch = 
      formName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submitterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.submitterEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.entreprise?.nom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter || 
                         (statusFilter === 'PENDING' && (sub.status === 'PENDING_APPROVAL' || sub.status === 'SUBMITTED'));
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'PENDING_APPROVAL' || s.status === 'SUBMITTED').length,
    approved: submissions.filter(s => s.status === 'APPROVED').length,
    rejected: submissions.filter(s => s.status === 'REJECTED').length
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
              Soumissions de Formulaires
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion des soumissions et approbations
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchSubmissions}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter">
              <IconButton
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                }}
              >
                <Download color="success" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Stats rapides */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">En Attente</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.pending}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Approuvés</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.approved}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Rejetés</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">{stats.rejected}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filtres */}
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            placeholder="Rechercher par formulaire, utilisateur ou entreprise..."
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
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={statusFilter}
              label="Statut"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="ALL">Tous</MenuItem>
              <MenuItem value="PENDING">En attente</MenuItem>
              <MenuItem value="PENDING_APPROVAL">En attente d'approbation</MenuItem>
              <MenuItem value="SUBMITTED">Soumis</MenuItem>
              <MenuItem value="APPROVED">Approuvés</MenuItem>
              <MenuItem value="REJECTED">Rejetés</MenuItem>
              <MenuItem value="DRAFT">Brouillons</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Liste Submissions */}
      {filteredSubmissions.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucune soumission trouvée. {searchTerm || statusFilter !== 'ALL' ? 'Essayez de modifier les filtres.' : ''}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredSubmissions.map((sub) => (
            <Grid item xs={12} md={6} lg={4} key={sub._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 1,
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[12],
                    borderColor: 'primary.main'
                  }
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" fontWeight={700}>
                      {typeof sub.form === 'object' ? sub.form?.name : 'Sans titre'}
                    </Typography>
                    <Chip
                      label={getStatusLabel(sub.status)}
                      color={getStatusColor(sub.status) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  {sub.entreprise && (
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {sub.entreprise.nom}
                      </Typography>
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {sub.submitterName || `${sub.submittedBy?.prenom || ''} ${sub.submittedBy?.nom || ''}`.trim() || sub.submitterEmail || 'Anonyme'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(sub.submittedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setDialogOpen(true);
                      }}
                      sx={{ flex: 1, textTransform: 'none' }}
                    >
                      Voir
                    </Button>
                    {(sub.status === 'PENDING_APPROVAL' || sub.status === 'SUBMITTED') && (
                      <>
                        <Tooltip title="Approuver">
                          <IconButton
                            color="success"
                            onClick={() => handleApprove(sub._id)}
                            sx={{
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Rejeter">
                          <IconButton
                            color="error"
                            onClick={() => handleReject(sub._id)}
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                            }}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Détails */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedSubmission && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  Détails de la Soumission
                </Typography>
                <Chip
                  label={getStatusLabel(selectedSubmission.status)}
                  color={getStatusColor(selectedSubmission.status) as any}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                {/* Info Formulaire */}
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Formulaire
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {typeof selectedSubmission.form === 'object' ? selectedSubmission.form?.name : 'Sans titre'}
                  </Typography>
                </Paper>

                {/* Info Soumetteur */}
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Soumis par
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      {selectedSubmission.submitterName?.charAt(0) || 
                       selectedSubmission.submittedBy?.prenom?.charAt(0) || 
                       selectedSubmission.submitterEmail?.charAt(0) || 'A'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedSubmission.submitterName || 
                         `${selectedSubmission.submittedBy?.prenom || ''} ${selectedSubmission.submittedBy?.nom || ''}`.trim() || 
                         'Anonyme'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedSubmission.submitterEmail || selectedSubmission.submittedBy?.email || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>

                {/* Entreprise */}
                {selectedSubmission.entreprise && (
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Entreprise
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <Business />
                      </Avatar>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedSubmission.entreprise.nom}
                      </Typography>
                    </Stack>
                  </Paper>
                )}

                {/* Données */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Données Soumises
                  </Typography>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Stack spacing={1}>
                      {selectedSubmission.data && Object.entries(selectedSubmission.data).map(([key, value]) => (
                        <Box key={key}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {key}:
                          </Typography>
                          <Typography variant="body2">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </Typography>
                          <Divider sx={{ mt: 0.5 }} />
                        </Box>
                      ))}
                    </Stack>
                  </Paper>
                </Box>

                {/* Dates et statut */}
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    Soumis le {new Date(selectedSubmission.submittedAt).toLocaleString('fr-FR')}
                  </Typography>
                  {selectedSubmission.approvedAt && (
                    <Typography variant="caption" color="success.main">
                      Approuvé le {new Date(selectedSubmission.approvedAt).toLocaleString('fr-FR')}
                    </Typography>
                  )}
                  {selectedSubmission.rejectionReason && (
                    <Typography variant="caption" color="error.main">
                      Raison du rejet: {selectedSubmission.rejectionReason}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Fermer</Button>
              {(selectedSubmission.status === 'PENDING_APPROVAL' || 
                selectedSubmission.status === 'SUBMITTED') && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => {
                      handleApprove(selectedSubmission._id);
                      setDialogOpen(false);
                    }}
                  >
                    Approuver
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => {
                      handleReject(selectedSubmission._id);
                      setDialogOpen(false);
                    }}
                  >
                    Rejeter
                  </Button>
                </>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminSubmissions;

