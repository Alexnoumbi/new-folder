import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  Stack,
  Paper,
  useTheme,
  alpha,
  Card,
  CardContent,
  Divider,
  Avatar,
  Fade,
  Slide
} from '@mui/material';
import {
  Description,
  Download,
  Visibility,
  Delete,
  Add,
  Scanner,
  CloudUpload,
  Close,
  InsertDriveFile,
  PictureAsPdf,
  Image as ImageIcon,
  Schedule,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { getDocuments } from '../../services/documentService';
import type { Document as DocumentType } from '../../services/documentService';
import DocumentUploader from '../../components/EntrepriseDashboard/DocumentUploader';
import OCRDocumentUploader from '../../components/Enterprise/OCRDocumentUploader';
import { useAuth } from '../../hooks/useAuth';

const Transition = React.forwardRef(function Transition(props: any, ref: any) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DocumentsPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openOCRDialog, setOpenOCRDialog] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDocuments();
      setDocuments(data);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des documents';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: { [key: string]: { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' } } = {
      VALIDATED: { 
        label: 'Validé', 
        color: 'success'
      },
      RECEIVED: { 
        label: 'Reçu', 
        color: 'info'
      },
      WAITING: { 
        label: 'En attente', 
        color: 'warning'
      },
      EXPIRED: { 
        label: 'Expiré', 
        color: 'error'
      },
      UPDATE_REQUIRED: { 
        label: 'Mise à jour requise', 
        color: 'warning'
      }
    };
    return configs[status] || { label: status, color: 'default' as const };
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <PictureAsPdf sx={{ fontSize: 40, color: '#d32f2f' }} />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <ImageIcon sx={{ fontSize: 40, color: '#1976d2' }} />;
    return <InsertDriveFile sx={{ fontSize: 40, color: theme.palette.text.secondary }} />;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (error) {
        return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            maxWidth: 500,
            textAlign: 'center',
            borderRadius: 4,
            border: 2,
            borderColor: 'error.main',
            bgcolor: alpha(theme.palette.error.main, 0.05)
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.error.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <Description sx={{ fontSize: 40, color: 'error.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom color="error.main">
            Erreur de Chargement
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={fetchDocuments}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Réessayer
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header avec gradient */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: 4,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            transform: 'translate(30%, -30%)'
          }
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h3" fontWeight={800} gutterBottom>
              Mes Documents
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
              Gérez et organisez vos documents en toute simplicité
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setOpenUploadDialog(true)}
              sx={{
                bgcolor: 'white',
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: alpha('#fff', 0.9),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${alpha('#000', 0.2)}`
                },
                transition: 'all 0.3s ease'
              }}
            >
              Importer un Document
            </Button>

            <Button
              variant="outlined"
              size="large"
              startIcon={<Scanner />}
              onClick={() => setOpenOCRDialog(true)}
              sx={{
                borderColor: 'white',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 1.5,
                borderRadius: 3,
                borderWidth: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'white',
                  borderWidth: 2,
                  bgcolor: alpha('#fff', 0.1),
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Scanner avec OCR
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Liste des documents */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: 4,
              borderColor: theme.palette.primary.main,
              borderTopColor: 'transparent',
              mx: 'auto',
              mb: 2,
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }}
          />
          <Typography variant="body1" color="text.secondary">
            Chargement des documents...
          </Typography>
        </Box>
      ) : documents.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 8, 
            textAlign: 'center',
            borderRadius: 4,
            border: 2,
            borderStyle: 'dashed',
            borderColor: theme.palette.divider,
            bgcolor: alpha(theme.palette.primary.main, 0.02)
          }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <Description sx={{ fontSize: 50, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Aucun document disponible
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Commencez par importer ou scanner votre premier document
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setOpenUploadDialog(true)}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Importer un Document
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Scanner />}
              onClick={() => setOpenOCRDialog(true)}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Scanner avec OCR
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Box>
          {/* Stats rapides */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: 1,
              borderColor: alpha(theme.palette.primary.main, 0.2),
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              mb: 3,
              maxWidth: 300
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 56, height: 56 }}>
                <Description sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight={800} color="primary">
                  {documents.length}
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  Document{documents.length > 1 ? 's' : ''} total{documents.length > 1 ? 'aux' : ''}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Grille de documents */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)'
              },
              gap: 3
            }}
          >
            {documents.map((doc, index) => {
              const statusConfig = getStatusConfig(doc.status);
              const fileName = doc.files?.[0]?.name || 'document';
              
              return (
                <Fade in={true} timeout={300 + index * 100} key={doc._id || doc.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: 1,
                      borderColor: theme.palette.divider,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {/* Icône et type */}
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {getFileIcon(fileName)}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.5
                              }}
                            >
                              {doc.name || fileName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {doc.type}
                            </Typography>
                          </Box>
                        </Stack>

                        <Divider />

                        {/* Infos */}
                        <Stack spacing={1.5}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Statut
                            </Typography>
                            <Chip
                              label={statusConfig.label}
                              color={statusConfig.color}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Stack>

                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Date
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDate(doc.uploadedAt)}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Divider />

                        {/* Actions */}
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Voir le document">
        <IconButton
          size="small"
                              sx={{
                                flex: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                                }
                              }}
                              onClick={() => console.log('Voir:', doc._id)}
        >
          <Visibility />
        </IconButton>
      </Tooltip>

      <Tooltip title="Télécharger">
        <IconButton
          size="small"
                              sx={{
                                flex: 1,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: 'success.main',
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.success.main, 0.2)
                                }
                              }}
                              onClick={() => console.log('Télécharger:', doc._id)}
        >
          <Download />
        </IconButton>
      </Tooltip>

      <Tooltip title="Supprimer">
        <IconButton
          size="small"
                              sx={{
                                flex: 1,
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                color: 'error.main',
                                borderRadius: 2,
                                '&:hover': {
                                  bgcolor: alpha(theme.palette.error.main, 0.2)
                                }
                              }}
                              onClick={() => console.log('Supprimer:', doc._id)}
        >
          <Delete />
        </IconButton>
      </Tooltip>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              );
            })}
      </Box>
      </Box>
      )}

      {/* Dialog Import */}
      <Dialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: `0 24px 48px ${alpha('#000', 0.2)}`
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <CloudUpload />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
            Importer un document
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Sélectionnez un fichier depuis votre ordinateur
                </Typography>
          </Box>
            </Stack>
            <IconButton onClick={() => setOpenUploadDialog(false)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <DocumentUploader 
            onUploadComplete={() => { 
              setOpenUploadDialog(false); 
              fetchDocuments(); 
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Dialog OCR */}
      <Dialog
        open={openOCRDialog}
        onClose={() => setOpenOCRDialog(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: `0 24px 48px ${alpha('#000', 0.2)}`
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
            <Scanner />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Scanner un document avec OCR
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Extraction automatique du texte depuis l'image
                </Typography>
          </Box>
            </Stack>
            <IconButton onClick={() => setOpenOCRDialog(false)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <OCRDocumentUploader 
            onUploadComplete={() => { 
              setOpenOCRDialog(false); 
              fetchDocuments(); 
            }} 
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
