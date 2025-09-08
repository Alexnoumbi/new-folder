import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { generateReport } from '../../../services/reportService';
import { ReportParams } from '../../../types/admin.types';

const ReportGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ReportParams>({
    type: 'monthly',
    startDate: null,
    endDate: null,
    format: 'pdf',
    includeCharts: true
  });

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      await generateReport(formData);
      // Handle success (maybe show a success message or download the report)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Type de rapport</InputLabel>
          <Select
            value={formData.type}
            label="Type de rapport"
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ReportParams['type'] })}
          >
            <MenuItem value="monthly">Mensuel</MenuItem>
            <MenuItem value="quarterly">Trimestriel</MenuItem>
            <MenuItem value="annual">Annuel</MenuItem>
            <MenuItem value="custom">Personnalisé</MenuItem>
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
              label="Date de début"
              value={formData.startDate}
              onChange={(date) => setFormData({ ...formData, startDate: date })}
              sx={{ flex: 1 }}
            />
            <DatePicker
              label="Date de fin"
              value={formData.endDate}
              onChange={(date) => setFormData({ ...formData, endDate: date })}
              sx={{ flex: 1 }}
            />
          </Box>
        </LocalizationProvider>

        <FormControl fullWidth>
          <InputLabel>Format</InputLabel>
          <Select
            value={formData.format}
            label="Format"
            onChange={(e) => setFormData({ ...formData, format: e.target.value as ReportParams['format'] })}
          >
            <MenuItem value="pdf">PDF</MenuItem>
            <MenuItem value="excel">Excel</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading || !formData.startDate || !formData.endDate}
        >
          {loading ? <CircularProgress size={24} /> : 'Générer le rapport'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReportGenerator;
