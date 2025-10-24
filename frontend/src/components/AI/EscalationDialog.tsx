import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
  Chip
} from '@mui/material';
import {
  Warning,
  Support,
  Send,
  Cancel
} from '@mui/icons-material';
import { EscalationDialogProps } from '../../types/aiChat.types';
import { aiChatService } from '../../services/aiChatService';

const EscalationDialog: React.FC<EscalationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  conversationId,
  loading = false
}) => {
  const theme = useTheme();
  const [details, setDetails] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDetails(value);
    
    // Validation en temps réel
    const validation = aiChatService.validateEscalationDetails(value);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
    } else {
      setValidationError(null);
    }
  };

  const handleSubmit = async () => {
    const validation = aiChatService.validateEscalationDetails(details);
    if (!validation.isValid) {
      setValidationError(validation.error || null);
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(details);
      setDetails('');
      setValidationError(null);
    } catch (error) {
      console.error('Erreur lors de l\'escalade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setDetails('');
      setValidationError(null);
      onClose();
    }
  };

  const characterCount = details.length;
  const maxCharacters = 1000;
  const isNearLimit = characterCount > maxCharacters * 0.8;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.warning.main, 0.1)
            }}
          >
            <Warning sx={{ color: 'warning.main', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Escalader vers un Administrateur
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Votre demande sera transmise à un administrateur
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="body2">
            Si l'assistant IA n'a pas pu résoudre votre problème, vous pouvez escalader votre demande vers un administrateur humain. 
            Décrivez clairement votre problème pour une prise en charge optimale.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Détails de votre problème
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={details}
            onChange={handleDetailsChange}
            placeholder="Décrivez en détail le problème que vous rencontrez, les étapes que vous avez déjà essayées, et le résultat attendu..."
            variant="outlined"
            error={!!validationError}
            helperText={validationError}
            disabled={isSubmitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          
          {/* Compteur de caractères */}
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="caption" 
              color={isNearLimit ? 'warning.main' : 'text.secondary'}
            >
              {characterCount} / {maxCharacters} caractères
            </Typography>
            {isNearLimit && (
              <Chip 
                label="Limite approchée" 
                size="small" 
                color="warning" 
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Informations sur l'escalade */}
        <Box>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Que se passe-t-il ensuite ?
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" fontWeight="bold" color="primary.main">
                  1
                </Typography>
              </Box>
              <Typography variant="body2">
                Votre demande sera transmise à un administrateur
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" fontWeight="bold" color="primary.main">
                  2
                </Typography>
              </Box>
              <Typography variant="body2">
                Vous recevrez une réponse dans les 24 heures
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Typography variant="caption" fontWeight="bold" color="primary.main">
                  3
                </Typography>
              </Box>
              <Typography variant="body2">
                Vous pouvez suivre l'avancement dans votre tableau de bord
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          startIcon={<Cancel />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !!validationError || details.trim().length < 10}
          variant="contained"
          startIcon={isSubmitting ? <CircularProgress size={16} /> : <Send />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            minWidth: 140
          }}
        >
          {isSubmitting ? 'Envoi...' : 'Escalader'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EscalationDialog;
