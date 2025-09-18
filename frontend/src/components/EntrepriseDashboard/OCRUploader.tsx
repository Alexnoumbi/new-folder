import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';
import { ocrService } from '../../services/ocrService';

interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
}

const OCRUploader: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OCRResult | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Taille maximum: 5MB');
      return;
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError('Seuls les fichiers image sont acceptés');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ocrService.extractText(file);
      setResult(response);
    } catch (err: any) {
      console.error('Erreur OCR:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Une erreur est survenue lors du traitement de l\'image'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Extraction de texte (OCR)
      </Typography>

      <Box sx={{ my: 2 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="ocr-file-upload"
          type="file"
          onChange={handleFileUpload}
        />
        <label htmlFor="ocr-file-upload">
          <Button
            variant="contained"
            component="span"
            startIcon={<UploadIcon />}
            disabled={loading}
          >
            Télécharger une image
          </Button>
        </label>

        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          Formats acceptés: JPG, PNG, GIF - Taille maximum: 5MB
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Texte extrait (Confiance: {result.confidence.toFixed(2)}%)
            </Typography>
            <Typography
              variant="body1"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                bgcolor: 'grey.50',
                p: 2,
                borderRadius: 1,
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {result.text}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

export default OCRUploader;
