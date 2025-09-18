import React from 'react';
import { Container, Typography } from '@mui/material';
import OCRUploader from '../../components/Admin/OCRUploader';

const AdminOCR: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Extraction OCR
      </Typography>
      <OCRUploader />
    </Container>
  );
};

export default AdminOCR;
