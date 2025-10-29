import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  Stack,
  Avatar,
  useTheme,
  alpha,
  Chip,
  Divider,
  Button,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Storage as DatabaseIcon,
  Edit as EditIcon,
  Delete as TrashIcon,
  Add as PlusIcon,
  Save as SaveIcon,
  Close as XIcon
} from '@mui/icons-material';
import knowledgeBaseAdmin from '../../data/knowledgeBase.admin.json';
import knowledgeBaseEnterprise from '../../data/knowledgeBase.enterprise.json';

interface KnowledgeItem {
  id: number;
  question: string;
  answer: string;
}

interface Message {
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

interface QAAssistantProps {
  open: boolean;
  onClose: () => void;
  type: 'admin' | 'enterprise';
}

const QAAssistant: React.FC<QAAssistantProps> = ({ open, onClose, type }) => {
  const theme = useTheme();
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [showKB, setShowKB] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Charger la bonne base de connaissances selon le type
  useEffect(() => {
    if (type === 'admin') {
      setKnowledgeBase(knowledgeBaseAdmin as KnowledgeItem[]);
    } else {
      setKnowledgeBase(knowledgeBaseEnterprise as KnowledgeItem[]);
    }
    
    // Message de bienvenue
    const welcomeMsg = {
      type: 'bot' as const,
      message: type === 'admin'
        ? "Bonjour ! Je suis votre assistant IA administrateur. Je peux vous aider avec la gestion des utilisateurs, entreprises, statistiques, rapports, configuration système, sécurité et monitoring."
        : "Bonjour ! Je suis votre assistant IA pour entreprise. Je peux vous aider avec vos KPIs, indicateurs de performance, soumissions de formulaires, calendrier des visites, statut de conformité et rapports.",
      timestamp: new Date()
    };
    setChatHistory([welcomeMsg]);
  }, [type]);

  const findBestMatch = (question: string): string | null => {
    const lowerQuestion = question.toLowerCase();
    
    for (let item of knowledgeBase) {
      const lowerKBQuestion = item.question.toLowerCase();
      
      if (lowerKBQuestion.includes(lowerQuestion) || lowerQuestion.includes(lowerKBQuestion)) {
        return item.answer;
      }
      
      const questionWords = lowerQuestion.split(' ').filter(w => w.length > 3);
      const matches = questionWords.filter(word => lowerKBQuestion.includes(word));
      
      if (matches.length >= Math.min(2, questionWords.length)) {
        return item.answer;
      }
    }
    
    return null;
  };

  const handleSubmit = () => {
    if (!userQuestion.trim()) return;

    const newChat: Message = { type: 'user', message: userQuestion, timestamp: new Date() };
    setChatHistory([...chatHistory, newChat]);

    const answer = findBestMatch(userQuestion);
    
    setTimeout(() => {
      if (answer) {
        setChatHistory([...chatHistory, newChat, { type: 'bot', message: answer, timestamp: new Date() }]);
      } else {
        setChatHistory([
          ...chatHistory,
          newChat,
          {
            type: 'bot',
            message: "Désolé, je n'ai pas trouvé de réponse à votre question dans ma base de connaissances. Pourriez-vous reformuler ou contacter notre support ?",
            timestamp: new Date()
          }
        ]);
      }
    }, 500);

    setUserQuestion('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddKnowledge = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newItem: KnowledgeItem = {
      id: Math.max(...knowledgeBase.map(k => k.id), 0) + 1,
      question: newQuestion,
      answer: newAnswer
    };

    setKnowledgeBase([...knowledgeBase, newItem]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDelete = (id: number) => {
    setKnowledgeBase(knowledgeBase.filter(k => k.id !== id));
  };

  const startEdit = (item: KnowledgeItem) => {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  };

  const saveEdit = () => {
    setKnowledgeBase(
      knowledgeBase.map(k =>
        k.id === editingId ? { ...k, question: editQuestion, answer: editAnswer } : k
      )
    );
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          borderRadius: 3,
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '12px 12px 0 0'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <BotIcon sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Assistant AI Intelligent
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Posez vos questions, je suis là pour vous aider
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<DatabaseIcon />}
          onClick={() => setShowKB(!showKB)}
          sx={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
          }}
        >
          {showKB ? 'Masquer' : 'Gérer'} la base
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Messages */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: '#f8f9fa' }}>
          <Stack spacing={2}>
            {chatHistory.length === 0 ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                color="text.secondary"
              >
                <Stack alignItems="center" spacing={2}>
                  <SearchIcon sx={{ fontSize: 48, opacity: 0.5 }} />
                  <Typography>Commencez par poser une question...</Typography>
                </Stack>
              </Box>
            ) : (
              chatHistory.map((chat, idx) => (
                <Paper
                  key={idx}
                  elevation={2}
                  sx={{
                    p: 2,
                    maxWidth: '85%',
                    alignSelf: chat.type === 'user' ? 'flex-end' : 'flex-start',
                    backgroundColor: chat.type === 'user' ? theme.palette.primary.main : '#ffffff',
                    borderRadius: 3,
                    border: chat.type === 'user' ? 'none' : '1px solid #e0e0e0'
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                    <Avatar
                      sx={{
                        bgcolor: chat.type === 'user' 
                          ? 'white'
                          : alpha(theme.palette.primary.main, 0.1),
                        color: chat.type === 'user'
                          ? theme.palette.primary.main
                          : theme.palette.primary.main
                      }}
                    >
                      {chat.type === 'user' ? <PersonIcon sx={{ fontSize: 20 }} /> : <BotIcon sx={{ fontSize: 20 }} />}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-line',
                          color: chat.type === 'user' ? 'white' : 'text.primary'
                        }}
                      >
                        {chat.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          display: 'block',
                          color: chat.type === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                        }}
                      >
                        {chat.timestamp.toLocaleTimeString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        </Box>

        {/* Input */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #e9ecef',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Posez votre question ici..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              variant="outlined"
              size="small"
              sx={{
                backgroundColor: '#ffffff',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            <IconButton
              color="primary"
              onClick={handleSubmit}
              disabled={!userQuestion.trim()}
              sx={{
                mb: 0.5,
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark
                },
                '&.Mui-disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>

          {/* Stats */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center" spacing={1}>
                <DatabaseIcon />
                <Typography variant="body2" fontWeight="bold">
                  Base de connaissances : {knowledgeBase.length} questions disponibles
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>

        {/* Gestion de la base de connaissances */}
        {showKB && (
          <Box sx={{ p: 3, borderTop: '2px solid #e9ecef', backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Gestion de la base de connaissances
            </Typography>

            <Box sx={{ mb: 3, p: 2, backgroundColor: 'white', borderRadius: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PlusIcon />
                <Typography variant="subtitle2" fontWeight="bold">
                  Ajouter une nouvelle connaissance
                </Typography>
              </Stack>
              <TextField
                fullWidth
                placeholder="Question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                sx={{ mb: 1 }}
                size="small"
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Réponse..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={handleAddKnowledge}
                color="success"
              >
                Ajouter
              </Button>
            </Box>

            <Stack spacing={2}>
              {knowledgeBase.map((item) => (
                <Paper key={item.id} elevation={1} sx={{ p: 2 }}>
                  {editingId === item.id ? (
                    <Box>
                      <TextField
                        fullWidth
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        sx={{ mb: 1 }}
                        size="small"
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          startIcon={<SaveIcon />}
                          onClick={saveEdit}
                          variant="contained"
                          size="small"
                        >
                          Sauvegarder
                        </Button>
                        <Button
                          startIcon={<XIcon />}
                          onClick={cancelEdit}
                          variant="outlined"
                          size="small"
                        >
                          Annuler
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight="bold" gutterBottom>
                          {item.question}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.answer}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          onClick={() => startEdit(item)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(item.id)}
                          color="error"
                        >
                          <TrashIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QAAssistant;

