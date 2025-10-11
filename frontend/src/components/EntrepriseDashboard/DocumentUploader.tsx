import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Alert,
  LinearProgress,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Stack,
  Chip
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import documentService from '../../services/documentService';
import { useAuth } from '../../hooks/useAuth';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    // Préremplir le nom avec le nom du fichier
    setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!documentType) {
      setError('Veuillez sélectionner un type de document');
      return;
    }

    if (!documentName.trim()) {
      setError('Veuillez saisir un nom pour le document');
      return;
    }

    if (!user?.entrepriseId) {
      setError('Aucune entreprise associée à votre compte. Veuillez contacter l\'administrateur.');
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(20);

    try {
      await documentService.uploadDocument(documentType, selectedFile, documentName.trim());
      setProgress(100);
      
      // Réinitialiser le formulaire
      setSelectedFile(null);
      setDocumentName('');
      setDocumentType('');
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors du téléchargement');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
    disabled: uploading
  });

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel>Type de document *</InputLabel>
          <Select
            value={documentType}
            label="Type de document *"
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={uploading}
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
          label="Nom du document *"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          disabled={uploading}
          placeholder="Ex: Rapport financier 2024"
          helperText="Donnez un nom descriptif à votre document"
        />

        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: isDragActive ? 'action.hover' : selectedFile ? 'action.selected' : 'background.paper',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : selectedFile ? 'success.main' : 'divider',
            cursor: uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <input {...getInputProps()} />
          {selectedFile ? (
            <>
              <InsertDriveFileIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="success.main">
                Fichier sélectionné
              </Typography>
              <Chip 
                label={selectedFile.name} 
                color="success" 
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Cliquez pour changer de fichier
              </Typography>
            </>
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ?
                  'Déposez le fichier ici' :
                  'Glissez et déposez un fichier ou cliquez pour sélectionner'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formats acceptés: PDF, JPG, PNG
              </Typography>
            </>
          )}
        </Paper>

        {selectedFile && (
          <Box sx={{ textAlign: 'center' }}>
            <button
              onClick={handleUpload}
              disabled={uploading || !documentType || !documentName.trim()}
              style={{
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 600,
                backgroundColor: uploading || !documentType || !documentName.trim() ? '#ccc' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: uploading || !documentType || !documentName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {uploading ? 'Téléchargement en cours...' : 'Télécharger le document'}
            </button>
          </Box>
        )}

        {uploading && (
          <Box>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              {progress}% téléchargé
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!user?.entrepriseId && (
          <Alert severity="warning">
            Aucune entreprise n'est associée à votre compte. Veuillez contacter l'administrateur pour résoudre ce problème.
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default DocumentUploader;
