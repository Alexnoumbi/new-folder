import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Stack
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  CloudUpload as CloudUploadIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import ocrService from '../../services/ocrService';
import documentService from '../../services/documentService';
import { useAuth } from '../../hooks/useAuth';

interface OCRDocumentUploaderProps {
  onUploadComplete: () => void;
}

interface OCRResult {
  text: string;
  confidence: number;
  filePath?: string;
}

const OCRDocumentUploader: React.FC<OCRDocumentUploaderProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [validationOpen, setValidationOpen] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    if (!user?.entrepriseId) {
      setError('Aucune entreprise associée à votre compte. Veuillez contacter l\'administrateur.');
      return;
    }

    setFile(selectedFile);
    // Préremplir le nom du document avec le nom du fichier
    setDocumentName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setUploading(true);
    setError(null);
    setProcessing(true);

    try {
      // Extract text using OCR
      const result = await ocrService.extractText(selectedFile);
      
      setOcrResult(result);
      setEditedText(result.text || '');
      setValidationOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'extraction du texte');
      console.error('OCR Error:', err);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'],
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: uploading
  });

  const handleValidateAndSave = async () => {
    if (!documentType) {
      setError('Veuillez sélectionner un type de document');
      return;
    }

    if (!documentName.trim()) {
      setError('Veuillez saisir un nom pour le document');
      return;
    }

    if (!file) {
      setError('Aucun fichier à sauvegarder');
      return;
    }

    if (!user?.entrepriseId) {
      setError('Aucune entreprise associée à votre compte');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      // Upload document with OCR data
      await documentService.uploadDocument(
        documentType, 
        file, 
        documentName.trim(),
        editedText,
        ocrResult?.confidence
      );
      
      // Reset state
      setValidationOpen(false);
      setOcrResult(null);
      setEditedText('');
      setDocumentType('');
      setDocumentName('');
      setFile(null);
      
      onUploadComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde du document');
      console.error('Save Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    setValidationOpen(false);
    setOcrResult(null);
    setEditedText('');
    setDocumentType('');
    setDocumentName('');
    setFile(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {!user?.entrepriseId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aucune entreprise n'est associée à votre compte. Veuillez contacter l'administrateur pour résoudre ce problème.
        </Alert>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          cursor: uploading || !user?.entrepriseId ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover'
          }
        }}
      >
        <input {...getInputProps()} disabled={!user?.entrepriseId} />
        <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive
            ? 'Déposez le fichier scanné ici'
            : 'Scanner un document avec OCR'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Glissez-déposez une image ou un PDF, ou cliquez pour sélectionner
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Formats acceptés: PNG, JPG, JPEG, GIF, BMP, TIFF, PDF
        </Typography>
      </Paper>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {processing ? 'Extraction du texte en cours...' : 'Téléchargement...'}
          </Typography>
        </Box>
      )}

      {error && !validationOpen && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Validation Dialog */}
      <Dialog
        open={validationOpen}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <FileIcon color="primary" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  Valider le texte extrait
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Vérifiez et modifiez les informations avant d'enregistrer
                </Typography>
              </Box>
            </Stack>
            {ocrResult && (
              <Chip
                label={`Confiance: ${Math.round(ocrResult.confidence)}%`}
                color={getConfidenceColor(ocrResult.confidence)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Alert severity="info">
              <Typography variant="body2">
                Vérifiez et modifiez le texte extrait si nécessaire. Assurez-vous que toutes les informations sont correctes avant de l'enregistrer.
              </Typography>
            </Alert>

            <TextField
              fullWidth
              label="Nom du document *"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              disabled={processing}
              placeholder="Ex: Rapport financier 2024"
              helperText="Donnez un nom descriptif à votre document"
            />

            <FormControl fullWidth>
              <InputLabel>Type de document *</InputLabel>
              <Select
                value={documentType}
                label="Type de document *"
                onChange={(e) => setDocumentType(e.target.value)}
                disabled={processing}
              >
                <MenuItem value="BUSINESS_PLAN">Business Plan</MenuItem>
                <MenuItem value="FINANCIAL_STATEMENT">État Financier</MenuItem>
                <MenuItem value="TAX_CERTIFICATE">Attestation Fiscale</MenuItem>
                <MenuItem value="SOCIAL_SECURITY">Sécurité Sociale</MenuItem>
                <MenuItem value="TRADE_REGISTER">Registre du Commerce</MenuItem>
                <MenuItem value="OTHER">Autre document</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={12}
              label="Texte extrait (éditable)"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              disabled={processing}
              placeholder="Le texte extrait apparaîtra ici..."
              InputProps={{
                startAdornment: <EditIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {editedText.length} caractères extraits
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCancel}
            disabled={processing}
            startIcon={<CloseIcon />}
            size="large"
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleValidateAndSave}
            disabled={processing || !documentType || !documentName.trim()}
            startIcon={processing ? <CircularProgress size={20} /> : <CheckIcon />}
            size="large"
          >
            {processing ? 'Enregistrement...' : 'Valider et Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OCRDocumentUploader;
