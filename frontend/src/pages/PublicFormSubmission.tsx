import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Send,
  CheckCircle,
  DynamicForm
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormField {
  fieldId: string;
  label: string;
  fieldType: string;
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  placeholder?: string;
}

interface FormData {
  _id: string;
  name: string;
  description?: string;
  sections: Array<{
    sectionId: string;
    title: string;
    description?: string;
    fields: FormField[];
  }>;
  status: string;
}

const PublicFormSubmission: React.FC = () => {
  const theme = useTheme();
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [submitterName, setSubmitterName] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/form-builder/${formId}`);
      
      if (response.data.success) {
        setForm(response.data.data);
        
        // Vérifier si le formulaire est actif
        if (response.data.data.status !== 'ACTIVE') {
          setError('Ce formulaire n\'est plus actif');
        }
      } else {
        setError('Formulaire non trouvé');
      }
    } catch (err: any) {
      console.error('Error fetching form:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement du formulaire');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = () => {
    if (!form) return false;

    // Vérifier les champs requis
    for (const section of form.sections) {
      for (const field of section.fields) {
        if (field.required && !formData[field.fieldId]) {
          setError(`Le champ "${field.label}" est requis`);
          return false;
        }
      }
    }

    // Vérifier email et nom
    if (!submitterEmail || !submitterName) {
      setError('Veuillez renseigner votre nom et email');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError('');

      const submitData: any = {
        data: formData,
        email: submitterEmail,
        name: submitterName
      };

      // Ne pas inclure location si pas de coordonnées
      // La géolocalisation sera ajoutée plus tard si nécessaire

      const response = await axios.post(`http://localhost:5000/api/form-builder/${formId}/submit-public`, submitData);

      if (response.data.success) {
        setSuccess(true);
        setFormData({});
        setSubmitterName('');
        setSubmitterEmail('');
      } else {
        setError(response.data.message || 'Erreur lors de la soumission');
      }
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const fieldTypeUpper = field.fieldType?.toUpperCase();

    switch (fieldTypeUpper) {
      case 'TEXT':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.fieldId] || ''}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            helperText={field.description}
          />
        );

      case 'TEXTAREA':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.fieldId] || ''}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            helperText={field.description}
          />
        );

      case 'NUMBER':
        return (
          <TextField
            fullWidth
            type="number"
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.fieldId] || ''}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            helperText={field.description}
          />
        );

      case 'EMAIL':
        return (
          <TextField
            fullWidth
            type="email"
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.fieldId] || ''}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            helperText={field.description}
          />
        );

      case 'DATE':
        return (
          <TextField
            fullWidth
            type="date"
            label={field.label}
            required={field.required}
            value={formData[field.fieldId] || ''}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={field.description}
          />
        );

      case 'SELECT':
        return (
          <FormControl fullWidth required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formData[field.fieldId] || ''}
              label={field.label}
              onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            >
              {field.options?.map((option, idx) => (
                <MenuItem key={idx} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'CHECKBOX':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[field.fieldId] || false}
                onChange={(e) => handleFieldChange(field.fieldId, e.target.checked)}
              />
            }
            label={field.label}
          />
        );

      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            value={formData[field.fieldId] || ''}
            onChange={(e) => handleFieldChange(field.fieldId, e.target.value)}
            helperText={field.description}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: alpha(theme.palette.grey[500], 0.02)
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        bgcolor: alpha(theme.palette.grey[500], 0.02)
      }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircle 
                sx={{ 
                  fontSize: 80, 
                  color: 'success.main', 
                  mb: 2 
                }} 
              />
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Merci !
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                Votre formulaire a été soumis avec succès. Nous vous contacterons si nécessaire.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSuccess(false);
                  fetchForm();
                }}
              >
                Soumettre un autre formulaire
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: alpha(theme.palette.grey[500], 0.02),
      py: 6
    }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper 
          sx={{ 
            p: 4, 
            mb: 4, 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
            border: 1,
            borderColor: alpha(theme.palette.primary.main, 0.2)
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.1)
              }}
            >
              <DynamicForm sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {form?.name || 'Formulaire'}
              </Typography>
              {form?.description && (
                <Typography variant="body1" color="text.secondary">
                  {form.description}
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Form Content */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              {/* Informations du soumetteur */}
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Vos informations
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Votre nom"
                      required
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="email"
                      label="Votre email"
                      required
                      value={submitterEmail}
                      onChange={(e) => setSubmitterEmail(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Sections du formulaire */}
              {form?.sections.map((section, sectionIndex) => (
                <Box key={section.sectionId}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {section.title}
                  </Typography>
                  {section.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {section.description}
                    </Typography>
                  )}
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    {section.fields.map((field) => (
                      <Box key={field.fieldId}>
                        {renderField(field)}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              ))}

              {/* Submit Button */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                  onClick={handleSubmit}
                  disabled={submitting}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                >
                  {submitting ? 'Envoi en cours...' : 'Soumettre'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Propulsé par TrackImpact - Plateforme de Gestion des Entreprises
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PublicFormSubmission;

