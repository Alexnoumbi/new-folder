import React, { useEffect, useState } from 'react';
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
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  TrendingFlat
} from '@mui/icons-material';
import { getKPIs, createKPI, updateKPI, deleteKPI } from '../../services/kpiService';
import { KPI, KPIFormData } from '../../types/admin.types';

interface FormData {
  name: string;
  description: string;
  type: 'NUMERIC' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN';
  unit: string;
  targetValue: number;
  minValue?: number;
  maxValue?: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL';
  enterprise?: string;
}

const AdminKPIs: React.FC = () => {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPI | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: 'NUMERIC',
    unit: '',
    targetValue: 0,
    frequency: 'MONTHLY'
  });

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getKPIs();
      setKpis(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des KPI');
      console.error('Error loading KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const handleOpenCreateDialog = () => {
    setFormData({
      name: '',
      description: '',
      type: 'NUMERIC',
      unit: '',
      targetValue: 0,
      frequency: 'MONTHLY'
    });
    setEditingKPI(null);
    setFormError(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (kpi: KPI) => {
    setFormData({
      name: kpi.name,
      description: kpi.description || '',
      type: kpi.type,
      unit: kpi.unit,
      targetValue: kpi.targetValue,
      minValue: kpi.minValue,
      maxValue: kpi.maxValue,
      frequency: kpi.frequency,
      enterprise: kpi.enterprise
    });
    setEditingKPI(kpi);
    setFormError(null);
    setOpenDialog(true);
  };

  const validateForm = (data: typeof formData) => {
    if (!data.name.trim()) return 'Le nom est requis';
    if (!data.type) return 'Le type est requis';
    if (!data.unit.trim()) return 'L\'unité est requise';
    if (data.targetValue <= 0) return 'La valeur cible doit être supérieure à 0';
    if (data.minValue !== undefined && data.maxValue !== undefined && data.minValue >= data.maxValue) {
      return 'La valeur minimale doit être inférieure à la valeur maximale';
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      const validationError = validateForm(formData);
      if (validationError) {
        setFormError(validationError);
        return;
      }

      setFormError(null);
      setLoading(true);

      if (editingKPI) {
        await updateKPI(editingKPI._id, formData);
      } else {
        await createKPI(formData);
      }

      setOpenDialog(false);
      await fetchKPIs();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de la sauvegarde du KPI');
      console.error('Error saving KPI:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (kpiId: string) => {
    try {
      setLoading(true);
      await deleteKPI(kpiId);
      await fetchKPIs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du KPI');
      console.error('Error deleting KPI:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (currentValue: number, targetValue: number) => {
    const percentage = (currentValue / targetValue) * 100;
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getStatusIcon = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up': return <TrendingUp color="success" />;
      case 'down': return <TrendingDown color="error" />;
      default: return <TrendingFlat color="action" />;
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des KPIs</Typography>
        <Box>
          <IconButton onClick={fetchKPIs} sx={{ mr: 1 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Nouveau KPI
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchKPIs}>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {kpis.map((kpi) => (
            <Box key={kpi._id}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="h6" noWrap>{kpi.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {kpi.description || 'Aucune description'}
                      </Typography>
                    </Box>
                    <Box ml={1}>
                      {getStatusIcon(kpi.trend || 'flat' as const)}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Valeur actuelle / Cible
                    </Typography>
                    <Typography variant="h5">
                      {kpi.currentValue || 0} / {kpi.targetValue} {kpi.unit}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(((kpi.currentValue || 0) / kpi.targetValue) * 100, 100)}
                      color={getStatusColor(kpi.currentValue || 0, kpi.targetValue)}
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={kpi.frequency}
                      size="small"
                      color="primary"
                    />
                    <Box>
                      <IconButton size="small" onClick={() => handleOpenEditDialog(kpi)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(kpi._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingKPI ? 'Modifier KPI' : 'Nouveau KPI'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as KPI['type']})}
                >
                  <MenuItem value="NUMERIC">Numérique</MenuItem>
                  <MenuItem value="PERCENTAGE">Pourcentage</MenuItem>
                  <MenuItem value="CURRENCY">Monétaire</MenuItem>
                  <MenuItem value="BOOLEAN">Booléen</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Unité"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Valeur cible"
              type="number"
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Valeur minimale"
                type="number"
                value={formData.minValue}
                onChange={(e) => setFormData({ ...formData, minValue: Number(e.target.value) })}
              />
              <TextField
                fullWidth
                label="Valeur maximale"
                type="number"
                value={formData.maxValue}
                onChange={(e) => setFormData({ ...formData, maxValue: Number(e.target.value) })}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Fréquence</InputLabel>
              <Select
                value={formData.frequency}
                label="Fréquence"
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as KPI['frequency']})}
              >
                <MenuItem value="MONTHLY">Mensuel</MenuItem>
                <MenuItem value="QUARTERLY">Trimestriel</MenuItem>
                <MenuItem value="SEMI_ANNUAL">Semestriel</MenuItem>
                <MenuItem value="ANNUAL">Annuel</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : editingKPI ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminKPIs;
