import React from 'react';
import { Container, Typography } from '@mui/material';
import OCRUploader from '../../components/EntrepriseDashboard/OCRUploader';

const OCRPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Extraction de documents
      </Typography>
      <OCRUploader />
    </Container>
  );
};

export default OCRPage;
