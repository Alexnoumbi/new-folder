import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useDropzone } from 'react-dropzone';
import documentService, { Document as DocType } from '../../services/documentService';

interface Document {
  id: string;
  type: string;
  required: boolean;
  dueDate: string;
  status: 'RECEIVED' | 'WAITING' | 'EXPIRED' | 'UPDATE_REQUIRED';
  files: Array<{ name: string; url: string }>;
  uploadedAt?: string;
  validatedBy?: string;
}

const statusColors = {
  RECEIVED: 'success',
  WAITING: 'warning',
  EXPIRED: 'error',
  UPDATE_REQUIRED: 'error'
};

const statusLabels = {
  RECEIVED: 'Reçu',
  WAITING: 'En attente',
  EXPIRED: 'Expiré',
  UPDATE_REQUIRED: 'Mise à jour requise'
};

const DocumentsGallery: React.FC = () => {
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const data = await documentService.getDocuments();
        setDocuments(data);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      console.log(acceptedFiles);
    }
  });

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
        {documents.map((doc) => (
          <Box key={(doc as any)._id || (doc as any).id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{doc.type}</Typography>
                <Chip
                  label={statusLabels[doc.status as keyof typeof statusLabels]}
                  color={statusColors[doc.status as keyof typeof statusColors] as any}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => {
                    setSelectedDoc(doc as any);
                    setUploadDialogOpen(true);
                  }}
                >
                  Upload
                </Button>
                {doc.files?.length > 0 && (
                  <IconButton
                    onClick={() => {/* Handle view */}}
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
              </Box>

              {doc.dueDate && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Date limite: {new Date(doc.dueDate).toLocaleDateString()}
                </Typography>
              )}
            </Paper>
          </Box>
        ))}
      </Box>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Document: {selectedDoc?.type}
        </DialogTitle>
        <DialogContent>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main'
              }
            }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography>Déposez les fichiers ici...</Typography>
            ) : (
              <Typography>
                Glissez-déposez des fichiers ici, ou cliquez pour sélectionner
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentsGallery;
