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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardMedia,
  Snackbar
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  CloudUpload,
  Search,
  Refresh,
  Download,
  DocumentScanner,
  Business,
  Visibility,
  CalendarToday,
  Edit,
  Delete,
  ContentCopy,
  Save,
  Cancel,
  CheckCircle,
  Image as ImageIcon,
  Assessment
} from '@mui/icons-material';
import axios from 'axios';

interface OCRResult {
  _id: string;
  fileName: string;
  textContent: string;
  confidence: number;
  wordsCount?: number;
  entreprise?: {
    _id: string;
    nom: string;
  };
  createdAt: string;
  status?: string;
}

interface Entreprise {
  _id: string;
  identification?: {
    nomEntreprise?: string;
  };
  nom?: string;
  name?: string;
}

const AdminOCR: React.FC = () => {
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedEntreprise, setSelectedEntreprise] = useState('');
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntreprise, setFilterEntreprise] = useState('');
  const [selectedResult, setSelectedResult] = useState<OCRResult | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchEntreprises();
    fetchResults();
  }, []);

  const fetchEntreprises = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/entreprises');
      setEntreprises(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching entreprises:', err);
    }
  };

  const fetchResults = async () => {
    try {
      setLoadingResults(true);
      const response = await axios.get('http://localhost:5000/api/ocr/results');
      setResults(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching OCR results:', err);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!selectedEntreprise) {
      setError('Veuillez sélectionner une entreprise');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entrepriseId', selectedEntreprise);

      const response = await axios.post('http://localhost:5000/api/ocr/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        }
      });

      fetchResults();
      setSelectedFile(null);
      setImagePreview('');
      setSelectedEntreprise('');
      setUploadProgress(0);
      setSnackbar({ 
        open: true, 
        message: `Document traité avec succès! Confiance: ${Math.round(response.data.confidence)}%`, 
        severity: 'success' 
      });
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.message || 'Erreur lors du traitement du document');
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Erreur lors du traitement', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (result: OCRResult) => {
    setSelectedResult(result);
    setViewDialog(true);
  };

  const handleEdit = (result: OCRResult) => {
    setSelectedResult(result);
    setEditedText(result.textContent);
    setEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedResult) return;

    try {
      await axios.put(`http://localhost:5000/api/ocr/results/${selectedResult._id}`, {
        textContent: editedText
      });

      fetchResults();
      setEditDialog(false);
      setSnackbar({ open: true, message: 'Texte modifié avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Erreur lors de la modification', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce résultat OCR?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/ocr/results/${id}`);
      fetchResults();
      setSnackbar({ open: true, message: 'Résultat supprimé avec succès', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Erreur lors de la suppression', 
        severity: 'error' 
      });
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Texte copié dans le presse-papier', severity: 'success' });
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Fichier', 'Entreprise', 'Confiance', 'Mots', 'Date', 'Texte'],
      ...filteredResults.map(r => [
        r.fileName,
        r.entreprise?.nom || 'N/A',
        `${Math.round(r.confidence)}%`,
        r.wordsCount || 0,
        new Date(r.createdAt).toLocaleDateString(),
        `"${r.textContent.replace(/"/g, '""')}"`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ocr_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setSnackbar({ open: true, message: 'Export CSV réussi', severity: 'success' });
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.textContent?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntreprise = !filterEntreprise || result.entreprise?._id === filterEntreprise;
    return matchesSearch && matchesEntreprise;
  });

  const getEntrepriseNom = (entreprise?: { nom?: string; identification?: { nomEntreprise?: string } }) => {
    if (!entreprise) return 'Sans entreprise';
    return entreprise.identification?.nomEntreprise || entreprise.nom || 'Sans nom';
  };

  const stats = {
    total: results.length,
    avgConfidence: results.length > 0 
      ? Math.round(results.reduce((acc, r) => acc + r.confidence, 0) / results.length) 
      : 0,
    totalWords: results.reduce((acc, r) => acc + (r.wordsCount || 0), 0),
    highConfidence: results.filter(r => r.confidence >= 90).length
  };

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
              Scanner OCR Intelligent
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Extraction de texte depuis documents scannés avec IA
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchResults}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter CSV">
              <IconButton
                onClick={handleExportCSV}
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

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total Documents</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Confiance Moyenne</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.avgConfidence}%</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Total Mots</Typography>
              <Typography variant="h4" fontWeight={700} color="info.main">{stats.totalWords.toLocaleString()}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="caption" color="text.secondary">Haute Confiance (≥90%)</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.highConfidence}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Upload Section */}
        <Card sx={{ mb: 4, borderRadius: 3, boxShadow: theme.shadows[4] }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <DocumentScanner sx={{ color: 'primary.main', fontSize: 32 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Scanner un Nouveau Document
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Formats acceptés: JPEG, PNG, GIF, BMP, TIFF, PDF (max 10MB)
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              {/* Prévisualisation */}
              {imagePreview && (
                <Grid item xs={12}>
                  <Card sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imagePreview}
                      alt="Prévisualisation"
                      sx={{ objectFit: 'contain' }}
                    />
                  </Card>
                </Grid>
              )}

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Entreprise *</InputLabel>
                  <Select
                    value={selectedEntreprise}
                    label="Entreprise *"
                    onChange={(e) => setSelectedEntreprise(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">Sélectionner une entreprise...</MenuItem>
                    {entreprises.map((e) => (
                      <MenuItem key={e._id} value={e._id}>
                        {getEntrepriseNom(e)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUpload />}
                  sx={{
                    height: '56px',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontSize: 16
                  }}
                >
                  {selectedFile ? selectedFile.name : 'Choisir un fichier'}
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={handleFileSelect}
                  />
                </Button>
              </Grid>

              <Grid item xs={12}>
                {loading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 2 }} />}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleUpload}
                  disabled={loading || !selectedFile || !selectedEntreprise}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DocumentScanner />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                  }}
                >
                  {loading ? `Traitement en cours... ${uploadProgress}%` : 'Scanner le Document'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Filtres Résultats */}
        <Stack direction="row" spacing={2} mb={3}>
          <TextField
            fullWidth
            placeholder="Rechercher dans les résultats..."
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
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>Filtrer par entreprise</InputLabel>
            <Select
              value={filterEntreprise}
              label="Filtrer par entreprise"
              onChange={(e) => setFilterEntreprise(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">Toutes les entreprises</MenuItem>
              {entreprises.map((e) => (
                <MenuItem key={e._id} value={e._id}>
                  {getEntrepriseNom(e)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Résultats OCR */}
      <Typography variant="h5" fontWeight={700} gutterBottom mb={3}>
        Résultats OCR ({filteredResults.length})
      </Typography>

      {loadingResults ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredResults.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Aucun résultat trouvé. {searchTerm || filterEntreprise ? 'Essayez de modifier les filtres.' : 'Scannez votre premier document!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredResults.map((result) => (
            <Grid item xs={12} md={6} lg={4} key={result._id}>
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
                    <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1, mr: 1 }}>
                      {result.fileName}
                    </Typography>
                    <Chip
                      label={`${Math.round(result.confidence)}%`}
                      color={result.confidence >= 90 ? 'success' : result.confidence >= 70 ? 'warning' : 'error'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>

                  {result.entreprise && (
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <Business fontSize="small" color="primary" />
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {result.entreprise.nom}
                      </Typography>
                    </Stack>
                  )}

                  {result.status && (
                    <Chip
                      label={result.status === 'EDITED' ? 'Édité' : 'Traité'}
                      size="small"
                      color={result.status === 'EDITED' ? 'secondary' : 'default'}
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      maxHeight: 150,
                      overflow: 'auto',
                      mb: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                      {result.textContent.substring(0, 200)}
                      {result.textContent.length > 200 && '...'}
                    </Typography>
                  </Paper>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center">
                      <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                      {new Date(result.createdAt).toLocaleDateString('fr-FR')}
                    </Typography>
                    {result.wordsCount && (
                      <Typography variant="caption" color="text.secondary">
                        {result.wordsCount} mots
                      </Typography>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Voir complet">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleView(result)}
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Éditer">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleEdit(result)}
                        sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copier">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleCopyText(result.textContent)}
                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                      >
                        <ContentCopy />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(result._id)}
                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialogue de Visualisation */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedResult && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  {selectedResult.fileName}
                </Typography>
                <Chip
                  label={`Confiance: ${Math.round(selectedResult.confidence)}%`}
                  color={selectedResult.confidence >= 90 ? 'success' : 'warning'}
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {selectedResult.entreprise && (
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Business color="primary" />
                      <Typography variant="body1" fontWeight={600}>
                        {selectedResult.entreprise.nom}
                      </Typography>
                    </Stack>
                  </Paper>
                )}

                <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedResult.textContent}
                  </Typography>
                </Paper>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    {selectedResult.wordsCount} mots • {new Date(selectedResult.createdAt).toLocaleString('fr-FR')}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopy />}
                    onClick={() => handleCopyText(selectedResult.textContent)}
                  >
                    Copier
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>Fermer</Button>
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => {
                  setViewDialog(false);
                  handleEdit(selectedResult);
                }}
              >
                Éditer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialogue d'Édition */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedResult && (
          <>
            <DialogTitle>
              <Typography variant="h5" fontWeight={700}>
                Éditer le Texte Extrait
              </Typography>
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                multiline
                rows={15}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<Cancel />}
                onClick={() => setEditDialog(false)}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<Save />}
                onClick={handleSaveEdit}
              >
                Sauvegarder
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar pour notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminOCR;
