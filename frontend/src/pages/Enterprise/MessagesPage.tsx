import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Divider,
  IconButton
} from '@mui/material';
import {
  Message,
  Send,
  Search,
  FilterList,
  Refresh,
  Reply,
  Forward,
  Delete,
  MarkAsUnread, // Remplacer MarkAsRead par MarkAsUnread
  Star,
  StarBorder,
  AttachFile,
  MoreVert
} from '@mui/icons-material';
import { getMessages, Message as MessageType } from '../../services/messageService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonTable from '../../components/Argon/ArgonTable';

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      setMessages(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Messages' }
  ];

  const headerActions = [
    {
      label: 'Nouveau Message',
      icon: <Send />,
      onClick: () => console.log('Nouveau message'),
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchMessages,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  const columns = [
    { id: 'sender', label: 'Expéditeur', minWidth: 150 },
    { id: 'subject', label: 'Sujet', minWidth: 200 },
    { id: 'date', label: 'Date', minWidth: 150 },
    { id: 'status', label: 'Statut', minWidth: 100 },
    { id: 'priority', label: 'Priorité', minWidth: 100 },
  ];

  const filteredMessages = messages.filter(message =>
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableData = filteredMessages.map(message => ({
    ...message,
    date: new Date(message.date).toLocaleString('fr-FR'),
  }));

  const actions = (row: any) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <IconButton
        size="small"
        onClick={() => setSelectedMessage(row)}
        sx={{ color: 'primary.main' }}
      >
        <Message />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => console.log('Répondre:', row.id)}
        sx={{ color: 'success.main' }}
      >
        <Reply />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => console.log('Transférer:', row.id)}
        sx={{ color: 'info.main' }}
      >
        <Forward />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => console.log('Supprimer:', row.id)}
        sx={{ color: 'error.main' }}
      >
        <Delete />
      </IconButton>
    </Box>
  );

  // Statistiques des messages
  const messageStats = [
    {
      title: 'Total Messages',
      value: messages.length,
      icon: <Message />,
      color: 'primary' as const,
      change: '+5'
    },
    {
      title: 'Non Lus',
      value: messages.filter(m => !m.read).length,
      icon: <MarkAsUnread />, // Utiliser MarkAsUnread ici aussi
      color: 'warning' as const,
      change: '+2'
    },
    {
      title: 'Importants',
      value: messages.filter(m => m.priority === 'high').length,
      icon: <Star />,
      color: 'error' as const,
      change: '+1'
    },
    {
      title: 'Répondus',
      value: messages.filter(m => m.replied).length,
      icon: <Reply />,
      color: 'success' as const,
      change: '+3'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'warning';
      case 'read': return 'success';
      case 'replied': return 'info';
      default: return 'default';
    }
  };

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Messages"
          subtitle="Gestion des communications"
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ArgonPageHeader
        title="Messages"
        subtitle="Gestion des communications"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchMessages}
        loading={loading}
      />

      {/* Statistiques des messages */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {messageStats.map((stat, index) => (
          <ArgonCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            loading={loading}
          />
        ))}
      </Box>

      {/* Barre de recherche */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher dans les messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <FilterList />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          }}
        />
      </Box>

      {/* Tableau des messages */}
      <ArgonTable
        title="Liste des Messages"
        columns={columns}
        data={tableData}
        loading={loading}
        actions={actions}
        onRowClick={setSelectedMessage}
      />

      {/* Dialog de visualisation du message */}
      {selectedMessage && (
        <Box sx={{ mt: 3 }}>
          <ArgonCard
            title="Détails du Message"
            value=""
            icon={<Message />}
            color="primary"
          >
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>
                  {selectedMessage.sender?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {selectedMessage.sender}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedMessage.date).toLocaleString('fr-FR')}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip
                    label={selectedMessage.priority}
                    size="small"
                    color={getPriorityColor(selectedMessage.priority) as any}
                  />
                  <Chip
                    label={selectedMessage.status}
                    size="small"
                    color={getStatusColor(selectedMessage.status) as any}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                {selectedMessage.subject}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                {selectedMessage.content}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Reply />}
                  onClick={() => console.log('Répondre')}
                >
                  Répondre
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Forward />}
                  onClick={() => console.log('Transférer')}
                >
                  Transférer
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Delete />}
                  onClick={() => console.log('Supprimer')}
                  sx={{ color: 'error.main' }}
                >
                  Supprimer
                </Button>
              </Box>
            </Box>
          </ArgonCard>
        </Box>
      )}
    </Box>
  );
};

export default MessagesPage;

