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
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import documentService from '../../services/documentService';

interface DocumentUploaderProps {
  onUploadComplete?: () => void;
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!documentType) {
      setError('Veuillez sélectionner un type de document');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await documentService.uploadDocument(documentType, file);
      setProgress(100);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du téléchargement');
    } finally {
      setUploading(false);
    }
  }, [documentType, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false
  });

  return (
    <Box sx={{ p: 2 }}>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Type de document</InputLabel>
        <Select
          value={documentType}
          label="Type de document"
          onChange={(e) => setDocumentType(e.target.value)}
        >
          <MenuItem value="BUSINESS_PLAN">Business Plan</MenuItem>
          <MenuItem value="FINANCIAL_STATEMENT">État Financier</MenuItem>
          <MenuItem value="TAX_CERTIFICATE">Attestation Fiscale</MenuItem>
          <MenuItem value="SOCIAL_SECURITY">Sécurité Sociale</MenuItem>
          <MenuItem value="TRADE_REGISTER">Registre du Commerce</MenuItem>
        </Select>
      </FormControl>

      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: 'center',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
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
      </Paper>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {progress}% téléchargé
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default DocumentUploader;
