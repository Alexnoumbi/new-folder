import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Upload as UploadIcon } from '@mui/icons-material';

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

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/ocr/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors du traitement de l\'image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Extraction de texte (OCR)
        </Typography>

        <Box sx={{ my: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="ocr-file-upload"
            type="file"
            onChange={handleFileUpload}
            disabled={loading}
          />
          <label htmlFor="ocr-file-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={loading}
            >
              Sélectionner une image
            </Button>
          </label>
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
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Résultat (Confiance: {result.confidence.toFixed(2)}%)
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                  {result.text}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OCRUploader;
