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
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Schedule,
  Add,
  Refresh,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  CalendarToday,
  CloudDownload
} from '@mui/icons-material';
import axios from 'axios';
import { getTemplates } from '../../services/reportTemplateService';
import { ReportTemplate } from '../../types/reportTemplate.types';

interface ScheduledExport {
  _id: string;
  name: string;
  reportType: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  format: 'PDF' | 'EXCEL' | 'CSV';
  destination: string;
  isActive: boolean;
  lastRun?: string;
  nextRun: string;
  runCount: number;
  templateId?: string;
}

const AdminScheduledExports: React.FC = () => {
  const theme = useTheme();
  const [exports, setExports] = useState<ScheduledExport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExport, setEditingExport] = useState<ScheduledExport | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    name: '',
    reportType: 'MONTHLY',
    frequency: 'MONTHLY',
    format: 'PDF',
    destination: '',
    recipients: '',
    templateId: ''
  });

  useEffect(() => {
    fetchExports();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchExports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/enhanced-reports/scheduled', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExports(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching scheduled exports:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des exports planifiés');
      setExports([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExport = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/enhanced-reports/scheduled/${id}`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: `Export ${!isActive ? 'activé' : 'désactivé'} avec succès`, severity: 'success' });
      fetchExports();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la modification', severity: 'error' });
    }
  };

  const handleOpenDialog = (exportToEdit?: ScheduledExport) => {
    if (exportToEdit) {
      setEditingExport(exportToEdit);
      setFormData({
        name: exportToEdit.name,
        reportType: exportToEdit.reportType,
        frequency: exportToEdit.frequency,
        format: exportToEdit.format,
        destination: exportToEdit.destination,
        recipients: '',
        templateId: exportToEdit.templateId || ''
      });
    } else {
      setEditingExport(null);
      setFormData({
        name: '',
        reportType: 'MONTHLY',
        frequency: 'MONTHLY',
        format: 'PDF',
        destination: '',
        recipients: '',
        templateId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t._id === templateId);
    if (template) {
      setFormData({
        ...formData,
        templateId,
        reportType: template.type,
        format: template.format
      });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExport(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const recipients = formData.recipients ? formData.recipients.split(',').map(e => e.trim()) : [];
      
      const dataToSend = {
        ...formData,
        recipients
      };

      if (editingExport) {
        await axios.put(
          `http://localhost:5000/api/enhanced-reports/scheduled/${editingExport._id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Export modifié avec succès', severity: 'success' });
      } else {
        await axios.post(
          'http://localhost:5000/api/enhanced-reports/scheduled',
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSnackbar({ open: true, message: 'Export créé avec succès', severity: 'success' });
      }
      
      handleCloseDialog();
      fetchExports();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Erreur lors de la sauvegarde', severity: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet export planifié?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/enhanced-reports/scheduled/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Export supprimé avec succès', severity: 'success' });
      fetchExports();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const handleRun = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/enhanced-reports/scheduled/${id}/run`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Export exécuté avec succès', severity: 'success' });
      fetchExports();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de l\'exécution', severity: 'error' });
    }
  };

  const getFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      DAILY: 'Quotidien',
      WEEKLY: 'Hebdomadaire',
      MONTHLY: 'Mensuel',
      QUARTERLY: 'Trimestriel'
    };
    return labels[freq] || freq;
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
              Exports Planifiés
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configuration des exports automatiques de rapports
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchExports}
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
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              }}
            >
              Nouvel Export
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {exports.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun export planifié. Configurez votre premier export automatique!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {exports.map((exp) => (
            <Grid item xs={12} md={6} key={exp._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 1,
                  borderColor: exp.isActive ? alpha(theme.palette.success.main, 0.3) : 'divider',
                  bgcolor: exp.isActive ? alpha(theme.palette.success.main, 0.02) : 'background.paper'
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {exp.name}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip label={exp.reportType} size="small" color="primary" variant="outlined" />
                        <Chip label={getFrequencyLabel(exp.frequency)} size="small" />
                        <Chip label={exp.format} size="small" variant="outlined" />
                      </Stack>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={exp.isActive}
                          onChange={() => toggleExport(exp._id, exp.isActive)}
                          color="success"
                        />
                      }
                      label=""
                    />
                  </Stack>

                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2, my: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Destination</Typography>
                        <Typography variant="body2" fontWeight={600}>{exp.destination}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Exécutions</Typography>
                        <Typography variant="body2" fontWeight={600}>{exp.runCount} fois</Typography>
                      </Grid>
                      {exp.lastRun && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Dernière</Typography>
                          <Typography variant="body2">{new Date(exp.lastRun).toLocaleDateString()}</Typography>
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Prochaine</Typography>
                        <Typography variant="body2">{new Date(exp.nextRun).toLocaleDateString()}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Exécuter maintenant">
                      <IconButton size="small" color="success" onClick={() => handleRun(exp._id)}>
                        <PlayArrow fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(exp)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => handleDelete(exp._id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog Création/Édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingExport ? 'Modifier l\'Export Planifié' : 'Nouvel Export Planifié'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nom de l'export"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Template (optionnel)</InputLabel>
              <Select
                value={formData.templateId}
                label="Template (optionnel)"
                onChange={(e) => handleTemplateSelect(e.target.value)}
              >
                <MenuItem value="">Aucun template</MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template._id} value={template._id}>
                    {template.name} ({template.type} - {template.format})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required>
              <InputLabel>Type de rapport</InputLabel>
              <Select
                value={formData.reportType}
                label="Type de rapport"
                onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              >
                <MenuItem value="MONTHLY">Rapport Mensuel</MenuItem>
                <MenuItem value="QUARTERLY">Rapport Trimestriel</MenuItem>
                <MenuItem value="ANNUAL">Rapport Annuel</MenuItem>
                <MenuItem value="CUSTOM">Rapport Personnalisé</MenuItem>
                <MenuItem value="PORTFOLIO">Portfolio</MenuItem>
                <MenuItem value="FRAMEWORK">Cadre de Résultats</MenuItem>
                <MenuItem value="FORM_SUBMISSIONS">Soumissions de Formulaire</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Fréquence</InputLabel>
              <Select
                value={formData.frequency}
                label="Fréquence"
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <MenuItem value="DAILY">Quotidien</MenuItem>
                <MenuItem value="WEEKLY">Hebdomadaire</MenuItem>
                <MenuItem value="MONTHLY">Mensuel</MenuItem>
                <MenuItem value="QUARTERLY">Trimestriel</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Format</InputLabel>
              <Select
                value={formData.format}
                label="Format"
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="EXCEL">Excel</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Destination (Email ou Chemin)"
              fullWidth
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="email@example.com ou /chemin/vers/dossier"
              helperText="Adresse email pour l'envoi ou chemin de sauvegarde"
            />

            <TextField
              label="Destinataires supplémentaires (optionnel)"
              fullWidth
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
              helperText="Séparez les emails par des virgules"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingExport ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminScheduledExports;

