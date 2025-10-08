import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  DynamicForm,
  Refresh,
  CheckCircle,
  Schedule,
  Block,
  Description,
  Assessment,
  ThumbUp,
  ThumbDown,
  Share,
  ContentCopy
} from '@mui/icons-material';
import axios from 'axios';

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface Form {
  _id: string;
  name: string;
  description?: string;
  sections?: Array<{
    fields: FormField[];
  }>;
  status: string;
  createdAt: string;
  stats?: {
    totalSubmissions?: number;
    pendingSubmissions?: number;
    approvedSubmissions?: number;
    rejectedSubmissions?: number;
  };
}

interface Submission {
  _id: string;
  form: string;
  data: any;
  status: string;
  submittedAt: string;
  submitterEmail?: string;
  submitterName?: string;
  approvedBy?: any;
  approvedAt?: string;
  rejectionReason?: string;
}

const AdminFormBuilder: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [forms, setForms] = useState<Form[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [viewingSubmissions, setViewingSubmissions] = useState(false);
  const [selectedFormForView, setSelectedFormForView] = useState<Form | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [viewSubmissionDialog, setViewSubmissionDialog] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/form-builder');
      
      setForms(response.data.data || response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Error fetching forms:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des formulaires');
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (formId?: string) => {
    try {
      const url = formId 
        ? `http://localhost:5000/api/form-builder/${formId}/submissions`
        : 'http://localhost:5000/api/form-builder/submissions';
      
      const response = await axios.get(url);
      setSubmissions(response.data.data || response.data || []);
    } catch (err: any) {
      console.error('Error fetching submissions:', err);
      setSubmissions([]);
    }
  };

  const handleCreateForm = () => {
    setSelectedForm(null);
    setFormName('');
    setFormDescription('');
    setFormFields([]);
    setOpenDialog(true);
  };

  const handleEditForm = (form: Form) => {
    setSelectedForm(form);
    setFormName(form.name);
    setFormDescription(form.description || '');
    
    // Extraire les champs des sections
    const fields = form.sections && form.sections.length > 0
      ? form.sections[0].fields || []
      : [];
    setFormFields(fields);
    setOpenDialog(true);
  };

  const handleSaveForm = async () => {
    try {
      const formData = {
        name: formName,
        description: formDescription,
        formType: 'DATA_COLLECTION',
        sections: [{
          sectionId: 'section_1',
          title: 'Section principale',
          order: 0,
          fields: formFields.map((field, index) => ({
            fieldId: field.id,
            label: field.label,
            fieldType: field.type.toUpperCase(),
            required: field.required,
            order: index,
            options: field.options?.map(opt => ({ value: opt, label: opt })) || []
          }))
        }],
        status: 'ACTIVE',
        createdBy: '000000000000000000000000' // ID factice pour l'instant
      };

      if (selectedForm) {
        await axios.put(`http://localhost:5000/api/form-builder/${selectedForm._id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/form-builder', formData);
      }

      setOpenDialog(false);
      fetchForms();
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/form-builder/${id}`);
      fetchForms();
    } catch (err: any) {
      console.error('Error deleting form:', err);
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleViewSubmissions = (form: Form) => {
    setSelectedFormForView(form);
    fetchSubmissions(form._id);
    setViewingSubmissions(true);
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      await axios.put(`http://localhost:5000/api/form-builder/submissions/${submissionId}/approve`, {
        comment: 'Approuvé'
      });
      if (selectedFormForView) {
        fetchSubmissions(selectedFormForView._id);
      }
    } catch (err: any) {
      console.error('Error approving submission:', err);
    }
  };

  const handleRejectSubmission = async (submissionId: string) => {
    const reason = prompt('Raison du rejet:');
    if (!reason) return;
    
    try {
      await axios.put(`http://localhost:5000/api/form-builder/submissions/${submissionId}/reject`, {
        reason
      });
      if (selectedFormForView) {
        fetchSubmissions(selectedFormForView._id);
      }
    } catch (err: any) {
      console.error('Error rejecting submission:', err);
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], [key]: value };
    setFormFields(updatedFields);
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE': return 'success';
      case 'DRAFT': return 'warning';
      case 'ARCHIVED':
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE': return <CheckCircle />;
      case 'DRAFT': return <Schedule />;
      case 'ARCHIVED':
      case 'CLOSED': return <Block />;
      default: return <DynamicForm />;
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'info';
      case 'PENDING_APPROVAL': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const copyShareLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    alert(`Lien copié !\n${link}`);
  };

  const handleViewSubmissionDetails = (submission: Submission) => {
    setSelectedSubmission(submission);
    setViewSubmissionDialog(true);
  };

  const getFieldLabel = (fieldId: string, formId: string) => {
    const form = forms.find(f => f._id === formId);
    if (!form || !form.sections) return fieldId;
    
    for (const section of form.sections) {
      const field = section.fields.find(f => f.id === fieldId || f.id === fieldId.replace('field_', ''));
      if (field) return field.label;
    }
    return fieldId;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
          <Box>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Générateur de Formulaires
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Créez et gérez des formulaires dynamiques pour collecter des données
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Tooltip title="Actualiser">
              <IconButton
                onClick={fetchForms}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={handleCreateForm}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              Nouveau Formulaire
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={forms.length} color="primary">
                Formulaires
              </Badge>
            } 
            icon={<DynamicForm />} 
            iconPosition="start" 
          />
          <Tab 
            label={
              <Badge badgeContent={submissions.length} color="secondary">
                Soumissions
              </Badge>
            } 
            icon={<Description />} 
            iconPosition="start"
            onClick={() => fetchSubmissions()}
          />
          <Tab label="Statistiques" icon={<Assessment />} iconPosition="start" />
        </Tabs>

        {/* Stats rapides */}
        {currentTab === 0 && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Total Formulaires</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.main">{forms.length}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Actifs</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {forms.filter(f => f.status?.toUpperCase() === 'ACTIVE').length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Brouillons</Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {forms.filter(f => f.status?.toUpperCase() === 'DRAFT').length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="caption" color="text.secondary">Total Soumissions</Typography>
                <Typography variant="h4" fontWeight={700} color="info.main">
                  {forms.reduce((sum, f) => sum + (f.stats?.totalSubmissions || 0), 0)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Tab 0: Forms List */}
      {currentTab === 0 && (
        <>
          {forms.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Aucun formulaire créé. Cliquez sur "Nouveau Formulaire" pour commencer.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {forms.map((form) => (
                <Grid item xs={12} md={6} lg={4} key={form._id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: 1,
                      borderColor: 'divider',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[12],
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={700} gutterBottom>
                            {form.name}
                          </Typography>
                          {form.description && (
                            <Typography variant="body2" color="text.secondary" mb={1}>
                              {form.description}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={form.status}
                          color={getStatusColor(form.status) as any}
                          icon={getStatusIcon(form.status)}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Stack>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Champs
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {form.sections?.[0]?.fields?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Soumissions
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {form.stats?.totalSubmissions || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Créé le
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {new Date(form.createdAt).toLocaleDateString()}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Stack spacing={1} mt={2}>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewSubmissions(form)}
                            sx={{ textTransform: 'none', flex: 1 }}
                          >
                            Soumissions ({form.stats?.totalSubmissions || 0})
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => handleEditForm(form)}
                            sx={{ textTransform: 'none' }}
                          >
                            Éditer
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteForm(form._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          startIcon={<Share />}
                          onClick={() => copyShareLink(form._id)}
                          sx={{ 
                            textTransform: 'none',
                            bgcolor: alpha(theme.palette.success.main, 0.9),
                            '&:hover': { bgcolor: 'success.main' }
                          }}
                        >
                          Copier le lien de partage
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Tab 1: Submissions List */}
      {currentTab === 1 && (
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Formulaire</strong></TableCell>
                <TableCell><strong>Soumis par</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" py={4}>
                      Aucune soumission trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission._id} hover>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{forms.find(f => f._id === submission.form)?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {submission.submitterName || submission.submitterEmail || 'Anonyme'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={getSubmissionStatusColor(submission.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {submission.status === 'PENDING_APPROVAL' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApproveSubmission(submission._id)}
                            >
                              <ThumbUp />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRejectSubmission(submission._id)}
                            >
                              <ThumbDown />
                            </IconButton>
                          </>
                        )}
                        <IconButton 
                          size="small"
                          onClick={() => handleViewSubmissionDetails(submission)}
                        >
                          <Visibility />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Tab 2: Statistics */}
      {currentTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Statistiques Globales
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Total Soumissions</Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {forms.reduce((sum, f) => sum + (f.stats?.totalSubmissions || 0), 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">En Attente</Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {forms.reduce((sum, f) => sum + (f.stats?.pendingSubmissions || 0), 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Approuvées</Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {forms.reduce((sum, f) => sum + (f.stats?.approvedSubmissions || 0), 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="caption" color="text.secondary">Rejetées</Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {forms.reduce((sum, f) => sum + (f.stats?.rejectedSubmissions || 0), 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            {selectedForm ? 'Modifier le Formulaire' : 'Nouveau Formulaire'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Titre du formulaire"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              multiline
              rows={2}
            />

            <Divider />

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Champs du formulaire
                </Typography>
                <Button startIcon={<Add />} onClick={addField} size="small">
                  Ajouter un champ
                </Button>
              </Stack>

              <List>
                {formFields.map((field, index) => (
                  <ListItem key={field.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, mb: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Label"
                          value={field.label}
                          onChange={(e) => updateField(index, 'label', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={field.type}
                            label="Type"
                            onChange={(e) => updateField(index, 'type', e.target.value)}
                          >
                            <MenuItem value="text">Texte</MenuItem>
                            <MenuItem value="number">Nombre</MenuItem>
                            <MenuItem value="email">Email</MenuItem>
                            <MenuItem value="date">Date</MenuItem>
                            <MenuItem value="select">Liste déroulante</MenuItem>
                            <MenuItem value="textarea">Zone de texte</MenuItem>
                            <MenuItem value="checkbox">Case à cocher</MenuItem>
                            <MenuItem value="file">Fichier</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Requis</InputLabel>
                          <Select
                            value={field.required ? 'yes' : 'no'}
                            label="Requis"
                            onChange={(e) => updateField(index, 'required', e.target.value === 'yes')}
                          >
                            <MenuItem value="yes">Oui</MenuItem>
                            <MenuItem value="no">Non</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={1}>
                        <IconButton color="error" onClick={() => removeField(index)} size="small">
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>

              {formFields.length === 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Aucun champ ajouté. Cliquez sur "Ajouter un champ" pour commencer.
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveForm}
            disabled={!formName || formFields.length === 0}
          >
            {selectedForm ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog
        open={viewingSubmissions}
        onClose={() => setViewingSubmissions(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={700}>
            Soumissions - {selectedFormForView?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Soumis par</strong></TableCell>
                  <TableCell><strong>Statut</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        Aucune soumission pour ce formulaire
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((submission) => (
                    <TableRow key={submission._id} hover>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {submission.submitterName || submission.submitterEmail || 'Anonyme'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={submission.status}
                          color={getSubmissionStatusColor(submission.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          {submission.status === 'PENDING_APPROVAL' && (
                            <>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleApproveSubmission(submission._id)}
                              >
                                <ThumbUp />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRejectSubmission(submission._id)}
                              >
                                <ThumbDown />
                              </IconButton>
                            </>
                          )}
                          <IconButton 
                            size="small"
                            onClick={() => handleViewSubmissionDetails(submission)}
                          >
                            <Visibility />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingSubmissions(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Submission Details Dialog */}
      <Dialog
        open={viewSubmissionDialog}
        onClose={() => setViewSubmissionDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        {selectedSubmission && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight={700}>
                  Détails de la Soumission
                </Typography>
                <Chip
                  label={selectedSubmission.status}
                  color={getSubmissionStatusColor(selectedSubmission.status) as any}
                  size="small"
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 1 }}>
                {/* Informations du soumetteur */}
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Informations du Soumetteur
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Nom</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedSubmission.submitterName || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {selectedSubmission.submitterEmail || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Date de soumission</Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {new Date(selectedSubmission.submittedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Données soumises */}
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Données du Formulaire
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={2}>
                    {Object.entries(selectedSubmission.data || {}).map(([fieldId, value]) => (
                      <Box key={fieldId}>
                        <Typography variant="caption" color="text.secondary">
                          {getFieldLabel(fieldId, selectedSubmission.form)}
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>

                {/* Statut et approbation */}
                {selectedSubmission.status === 'APPROVED' && selectedSubmission.approvedAt && (
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="success.main">
                      ✅ Approuvé
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Le {new Date(selectedSubmission.approvedAt).toLocaleString()}
                    </Typography>
                  </Paper>
                )}

                {selectedSubmission.status === 'REJECTED' && selectedSubmission.rejectionReason && (
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="error.main">
                      ❌ Rejeté
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Raison: {selectedSubmission.rejectionReason}
                    </Typography>
                  </Paper>
                )}

                {/* Actions si en attente */}
                {selectedSubmission.status === 'PENDING_APPROVAL' && (
                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<ThumbUp />}
                      onClick={() => {
                        handleApproveSubmission(selectedSubmission._id);
                        setViewSubmissionDialog(false);
                      }}
                    >
                      Approuver
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      startIcon={<ThumbDown />}
                      onClick={() => {
                        handleRejectSubmission(selectedSubmission._id);
                        setViewSubmissionDialog(false);
                      }}
                    >
                      Rejeter
                    </Button>
                  </Stack>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewSubmissionDialog(false)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminFormBuilder;

