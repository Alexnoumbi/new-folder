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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Snackbar,
  Divider
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
  Download,
  PlayArrow
} from '@mui/icons-material';
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  generateFromTemplate
} from '../../services/reportTemplateService';
import { ReportTemplate, CreateTemplateData, TemplateSection } from '../../types/reportTemplate.types';

const AdminReportTemplates: React.FC = () => {
  const theme = useTheme();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    description: '',
    type: 'MONTHLY',
    format: 'PDF',
    sections: [],
    filters: {},
    layout: {},
    isDefault: false
  });

  useEffect(() => {
    fetchTemplatesData();
  }, []);

  const fetchTemplatesData = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
      setError('');
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des templates');
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template?: ReportTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description,
        type: template.type,
        format: template.format,
        sections: template.sections,
        filters: template.filters || {},
        layout: template.layout || {},
        isDefault: template.isDefault
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        type: 'MONTHLY',
        format: 'PDF',
        sections: [],
        filters: {},
        layout: {},
        isDefault: false
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTemplate(null);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate._id, formData);
        setSnackbar({ open: true, message: 'Template modifié avec succès', severity: 'success' });
      } else {
        await createTemplate(formData);
        setSnackbar({ open: true, message: 'Template créé avec succès', severity: 'success' });
      }
      handleCloseDialog();
      fetchTemplatesData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Erreur lors de la sauvegarde', severity: 'error' });
    }
  };

  const handleDelete = async (id: string, isDefault: boolean) => {
    if (isDefault) {
      setSnackbar({ open: true, message: 'Impossible de supprimer un template par défaut', severity: 'error' });
      return;
    }

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce template?')) {
      return;
    }

    try {
      await deleteTemplate(id);
      setSnackbar({ open: true, message: 'Template supprimé avec succès', severity: 'success' });
      fetchTemplatesData();
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTemplate(id);
      setSnackbar({ open: true, message: 'Template dupliqué avec succès', severity: 'success' });
      fetchTemplatesData();
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de la duplication', severity: 'error' });
    }
  };

  const handleGenerate = async (id: string) => {
    try {
      await generateFromTemplate(id);
      setSnackbar({ open: true, message: 'Rapport en cours de génération...', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erreur lors de la génération', severity: 'error' });
    }
  };

  const handlePreview = (template: ReportTemplate) => {
    setPreviewTemplate(template);
    setOpenPreviewDialog(true);
  };

  const toggleSection = (section: TemplateSection) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...(prev.sections || []), section]
    }));
  };

  const availableSections: { value: TemplateSection; label: string }[] = [
    { value: 'STATISTICS', label: 'Statistiques Générales' },
    { value: 'ENTREPRISES', label: 'Entreprises' },
    { value: 'INDICATORS', label: 'Indicateurs' },
    { value: 'KPIS', label: 'KPIs' },
    { value: 'VISITS', label: 'Visites' },
    { value: 'FRAMEWORKS', label: 'Cadres de Résultats' },
    { value: 'PORTFOLIOS', label: 'Portfolios' },
    { value: 'COMPLIANCE', label: 'Conformité' },
    { value: 'CHARTS', label: 'Graphiques' },
    { value: 'SUMMARY', label: 'Résumé' },
    { value: 'RECOMMENDATIONS', label: 'Recommandations' }
  ];

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
                onClick={fetchTemplatesData}
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
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleGenerate(template._id)}
                      sx={{ flex: 1, textTransform: 'none' }}
                    >
                      Générer
                    </Button>
                    <Tooltip title="Prévisualiser">
                      <IconButton size="small" color="primary" onClick={() => handlePreview(template)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Dupliquer">
                      <IconButton size="small" color="primary" onClick={() => handleDuplicate(template._id)}>
                        <FileCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(template)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => handleDelete(template._id, template.isDefault)}>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Modifier le Template' : 'Nouveau Template de Rapport'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nom du template"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            
            <TextField
              label="Description"
              fullWidth
              required
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Type de rapport</InputLabel>
                <Select
                  value={formData.type}
                  label="Type de rapport"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <MenuItem value="MONTHLY">Mensuel</MenuItem>
                  <MenuItem value="QUARTERLY">Trimestriel</MenuItem>
                  <MenuItem value="ANNUAL">Annuel</MenuItem>
                  <MenuItem value="PORTFOLIO">Portfolio</MenuItem>
                  <MenuItem value="PROJECT">Projet</MenuItem>
                  <MenuItem value="KPI">KPI</MenuItem>
                  <MenuItem value="COMPLIANCE">Conformité</MenuItem>
                  <MenuItem value="CUSTOM">Personnalisé</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Format</InputLabel>
                <Select
                  value={formData.format}
                  label="Format"
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                >
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="EXCEL">Excel</MenuItem>
                  <MenuItem value="WORD">Word</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Sections à inclure
              </Typography>
              <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                <FormGroup>
                  <Grid container spacing={1}>
                    {availableSections.map((section) => (
                      <Grid item xs={12} sm={6} key={section.value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formData.sections?.includes(section.value)}
                              onChange={() => toggleSection(section.value)}
                            />
                          }
                          label={section.label}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
              </Paper>
            </Box>

            <Divider />

            <FormControl fullWidth>
              <InputLabel>Période de données</InputLabel>
              <Select
                value={formData.filters?.dateRange || 'CUSTOM'}
                label="Période de données"
                onChange={(e) => setFormData({
                  ...formData,
                  filters: { ...formData.filters, dateRange: e.target.value as any }
                })}
              >
                <MenuItem value="LAST_MONTH">Dernier mois</MenuItem>
                <MenuItem value="LAST_QUARTER">Dernier trimestre</MenuItem>
                <MenuItem value="LAST_YEAR">Dernière année</MenuItem>
                <MenuItem value="CUSTOM">Personnalisée</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Orientation</InputLabel>
                <Select
                  value={formData.layout?.orientation || 'PORTRAIT'}
                  label="Orientation"
                  onChange={(e) => setFormData({
                    ...formData,
                    layout: { ...formData.layout, orientation: e.target.value as any }
                  })}
                >
                  <MenuItem value="PORTRAIT">Portrait</MenuItem>
                  <MenuItem value="LANDSCAPE">Paysage</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Taille de page</InputLabel>
                <Select
                  value={formData.layout?.pageSize || 'A4'}
                  label="Taille de page"
                  onChange={(e) => setFormData({
                    ...formData,
                    layout: { ...formData.layout, pageSize: e.target.value as any }
                  })}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="A3">A3</MenuItem>
                  <MenuItem value="LETTER">Letter</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isDefault || false}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label="Définir comme template par défaut"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingTemplate ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Prévisualisation */}
      <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Prévisualisation du Template</DialogTitle>
        <DialogContent>
          {previewTemplate && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
                <Typography variant="body1" fontWeight={600}>{previewTemplate.name}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body2">{previewTemplate.description}</Typography>
              </Box>

              <Stack direction="row" spacing={1}>
                <Chip label={getTypeLabel(previewTemplate.type)} color={getTypeColor(previewTemplate.type) as any} />
                <Chip label={previewTemplate.format} variant="outlined" />
                {previewTemplate.isDefault && <Chip label="Par Défaut" color="primary" />}
              </Stack>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Sections incluses ({previewTemplate.sections.length})
                </Typography>
                <Stack spacing={1}>
                  {previewTemplate.sections.map((section, idx) => (
                    <Paper key={idx} sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Typography variant="body2">
                        {availableSections.find(s => s.value === section)?.label || section}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Statistiques</Typography>
                <Typography variant="body2">Utilisé {previewTemplate.usageCount} fois</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>Fermer</Button>
          {previewTemplate && (
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => {
                handleGenerate(previewTemplate._id);
                setOpenPreviewDialog(false);
              }}
            >
              Générer maintenant
            </Button>
          )}
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

export default AdminReportTemplates;

