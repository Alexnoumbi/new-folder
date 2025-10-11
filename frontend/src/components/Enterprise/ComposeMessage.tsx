import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Typography
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { getAdminUsers } from '../../services/userService';
import { sendMessage, SendMessageData } from '../../services/messageService';
import type { User } from '../../types/user.types';

interface ComposeMessageProps {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
  entrepriseId: string;
  replyTo?: any;
}

const ComposeMessage: React.FC<ComposeMessageProps> = ({
  open,
  onClose,
  onSent,
  entrepriseId,
  replyTo
}) => {
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  useEffect(() => {
    if (open) {
      fetchAdminUsers();
      
      // If replying, pre-fill recipient and subject
      if (replyTo) {
        setFormData(prev => ({
          ...prev,
          recipientId: replyTo.sender?._id || replyTo.sender?.id || '',
          subject: `Re: ${replyTo.subject || 'Message'}`,
          content: `\n\n---\nMessage original:\n${replyTo.content || ''}`
        }));
      }
    }
  }, [open, replyTo]);

  const fetchAdminUsers = async () => {
    try {
      setLoadingAdmins(true);
      const users = await getAdminUsers();
      setAdminUsers(users);
    } catch (err: any) {
      setError('Erreur lors du chargement des administrateurs');
      console.error(err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.recipientId) {
      setError('Veuillez sélectionner un destinataire');
      return;
    }
    if (!formData.subject.trim()) {
      setError('Le sujet est requis');
      return;
    }
    if (!formData.content.trim()) {
      setError('Le message ne peut pas être vide');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const messageData: SendMessageData = {
        recipientId: formData.recipientId,
        entrepriseId,
        content: formData.content,
        subject: formData.subject,
        priority: formData.priority
      };

      await sendMessage(messageData);
      
      // Reset form
      setFormData({
        recipientId: '',
        subject: '',
        content: '',
        priority: 'medium'
      });
      
      onSent();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        recipientId: '',
        subject: '',
        content: '',
        priority: 'medium'
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {replyTo ? 'Répondre au message' : 'Nouveau message'}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loadingAdmins ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Destinataire (Administrateur)</InputLabel>
              <Select
                value={formData.recipientId}
                label="Destinataire (Administrateur)"
                onChange={(e) => setFormData({ ...formData, recipientId: e.target.value })}
                disabled={loading || !!replyTo}
              >
                {adminUsers.map((admin) => (
                  <MenuItem key={admin.id} value={admin.id}>
                    {admin.nom} {admin.prenom} - {admin.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priorité</InputLabel>
              <Select
                value={formData.priority}
                label="Priorité"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                disabled={loading}
              >
                <MenuItem value="low">
                  <Chip label="Basse" color="success" size="small" />
                </MenuItem>
                <MenuItem value="medium">
                  <Chip label="Moyenne" color="warning" size="small" />
                </MenuItem>
                <MenuItem value="high">
                  <Chip label="Haute" color="error" size="small" />
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Sujet"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              disabled={loading}
              required
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              disabled={loading}
              required
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || loadingAdmins}
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
        >
          Envoyer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ComposeMessage;

