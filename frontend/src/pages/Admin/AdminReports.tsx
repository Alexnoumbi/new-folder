import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Paper,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { getReports, generateReport, downloadReport, deleteReport } from '../../services/reportService';
import { Report, ReportParams } from '../../types/reports.types';

const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReportParams>({
    type: 'monthly',
    startDate: null,
    endDate: null,
    format: 'pdf',
    includeCharts: true
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReports();
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des rapports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenGenerateDialog = () => {
    setFormData({
      type: 'monthly',
      startDate: new Date(),
      endDate: new Date(),
      format: 'pdf',
      includeCharts: true
    });
    setFormError(null);
    setOpenDialog(true);
  };

  const validateForm = () => {
    if (!formData.type) return 'Le type de rapport est requis';
    if (!formData.startDate) return 'La date de début est requise';
    if (!formData.endDate) return 'La date de fin est requise';
    if (formData.endDate < formData.startDate) return 'La date de fin doit être après la date de début';
    return null;
  };

  const handleGenerateReport = async () => {
    try {
      const validationError = validateForm();
      if (validationError) {
        setFormError(validationError);
        return;
      }

      setFormError(null);
      setGenerating(true);

      // Vérification des dates avant l'envoi
      if (!formData.startDate || !formData.endDate) {
        setFormError('Les dates sont requises');
        return;
      }

      const report = await generateReport({
        ...formData,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      // Ajout du nouveau rapport à la liste et fermeture du dialog
      setReports(prevReports => [report, ...prevReports]);
      setOpenDialog(false);

      // Rafraîchir la liste après un court délai pour voir les mises à jour
      setTimeout(() => {
        fetchReports();
      }, 1000);

    } catch (err: any) {
      console.error('Erreur lors de la génération:', err);
      setFormError(
        err.response?.data?.message ||
        'Erreur lors de la génération du rapport. Veuillez réessayer.'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (reportId: string | undefined) => {
    try {
      if (!reportId) {
        setError('ID du rapport invalide');
        return;
      }
      const blob = await downloadReport(reportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Erreur lors du téléchargement du rapport');
      console.error('Error downloading report:', err);
    }
  };

  const handleDelete = async (reportId: string | undefined) => {
    try {
      if (!reportId) {
        setError('ID du rapport invalide');
        return;
      }
      await deleteReport(reportId);
      await fetchReports();
    } catch (err: any) {
      setError('Erreur lors de la suppression du rapport');
      console.error('Error deleting report:', err);
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des Rapports</Typography>
        <Box>
          <IconButton onClick={fetchReports} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenGenerateDialog}
          >
            Nouveau Rapport
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchReports}>
              Réessayer
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {reports.map((report) => (
            <Paper sx={{ p: 2 }} key={report._id}>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6">{report.type}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={report.status}
                    color={
                      report.status === 'completed' ? 'success' :
                      report.status === 'failed' ? 'error' :
                      'warning'
                    }
                  />
                </Box>

                <Box>
                  <Typography variant="body2">
                    Période: {report.startDate ? new Date(report.startDate).toLocaleDateString() : 'N/A'} - {report.endDate ? new Date(report.endDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Format: {report.format?.toUpperCase() || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(report._id || report.id)}
                    disabled={report.status !== 'completed'}
                  >
                    Télécharger
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(report._id || report.id)}
                    disabled={report.status === 'in-progress'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Générer un Rapport</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Type de Rapport</InputLabel>
              <Select
                value={formData.type}
                label="Type de Rapport"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ReportParams['type'] })}
              >
                <MenuItem value="monthly">Rapport Mensuel</MenuItem>
                <MenuItem value="quarterly">Rapport Trimestriel</MenuItem>
                <MenuItem value="annual">Rapport Annuel</MenuItem>
                <MenuItem value="custom">Rapport Personnalisé</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <DatePicker
                label="Date de début"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !formData.startDate && formError !== null
                  }
                }}
              />
              <DatePicker
                label="Date de fin"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
                format="dd/MM/yyyy"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !formData.endDate && formError !== null
                  }
                }}
                minDate={formData.startDate || undefined}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                value={formData.format}
                label="Format"
                onChange={(e) => setFormData({ ...formData, format: e.target.value as 'pdf' | 'excel' })}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : null}
          >
            {generating ? 'Génération...' : 'Générer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReports;
