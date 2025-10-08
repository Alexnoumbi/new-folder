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
  Description,
  Add,
  Refresh,
  Edit,
  Delete,
  Visibility,
  FileCopy,
  Download
} from '@mui/icons-material';
import axios from 'axios';

interface ReportTemplate {
  _id: string;
  name: string;
  description: string;
  type: 'PORTFOLIO' | 'PROJECT' | 'KPI' | 'COMPLIANCE' | 'CUSTOM';
  format: 'PDF' | 'EXCEL' | 'WORD';
  sections: string[];
  isDefault: boolean;
  usageCount: number;
  createdAt: string;
}

const AdminReportTemplates: React.FC = () => {
  const theme = useTheme();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/enhanced-reports/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PORTFOLIO: 'Portfolio',
      PROJECT: 'Projet',
      KPI: 'KPI',
      COMPLIANCE: 'Conformité',
      CUSTOM: 'Personnalisé'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PORTFOLIO': return 'primary';
      case 'PROJECT': return 'success';
      case 'KPI': return 'info';
      case 'COMPLIANCE': return 'warning';
      case 'CUSTOM': return 'error';
      default: return 'default';
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
              Templates de Rapports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Bibliothèque de templates réutilisables pour vos rapports
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchTemplates}
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
              Nouveau Template
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {templates.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun template configuré. Créez votre premier template de rapport!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} md={6} lg={4} key={template._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: 1,
                  borderColor: template.isDefault ? 'primary.main' : 'divider',
                  bgcolor: template.isDefault ? alpha(theme.palette.primary.main, 0.02) : 'background.paper',
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
                      <Stack direction="row" spacing={1} mb={1}>
                        <Chip
                          label={getTypeLabel(template.type)}
                          color={getTypeColor(template.type) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip
                          label={template.format}
                          size="small"
                          variant="outlined"
                        />
                        {template.isDefault && (
                          <Chip
                            label="Par Défaut"
                            color="primary"
                            size="small"
                          />
                        )}
                      </Stack>
                      <Typography variant="h6" fontWeight={700}>
                        {template.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Paper sx={{ p: 1.5, bgcolor: alpha(theme.palette.grey[500], 0.05), borderRadius: 2, my: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Sections incluses:
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {template.sections?.slice(0, 4).map((section, idx) => (
                        <Chip
                          key={idx}
                          label={section}
                          size="small"
                          sx={{ fontSize: 10, height: 20 }}
                        />
                      ))}
                      {template.sections?.length > 4 && (
                        <Chip
                          label={`+${template.sections.length - 4}`}
                          size="small"
                          sx={{ fontSize: 10, height: 20 }}
                        />
                      )}
                    </Stack>
                  </Paper>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Utilisé {template.usageCount || 0} fois
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      sx={{ flex: 1, textTransform: 'none' }}
                    >
                      Prévisualiser
                    </Button>
                    <Tooltip title="Dupliquer">
                      <IconButton size="small" color="primary">
                        <FileCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error">
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
    </Container>
  );
};

export default AdminReportTemplates;

