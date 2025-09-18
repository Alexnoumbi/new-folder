import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { register } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import type { User } from '../../types/user.types';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    typeCompte: 'entreprise' as 'admin' | 'entreprise',
    telephone: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        typeCompte: formData.typeCompte,
        telephone: formData.telephone
      });

      // Map auth response to User type
      const user: User = {
        ...response.user,
        status: 'active' // New users are active by default
      };

      setUser(user);

      if (user.typeCompte === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/enterprise/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <Typography className="auth-title">
          Créer un compte
        </Typography>
        <Typography className="auth-subtitle">
          Remplissez le formulaire pour créer votre compte
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth className="auth-input">
            <InputLabel id="type-compte-label">Type de compte</InputLabel>
            <Select
              labelId="type-compte-label"
              id="typeCompte"
              value={formData.typeCompte}
              label="Type de compte"
              onChange={(e) => handleChange('typeCompte', e.target.value)}
            >
              <MenuItem value="entreprise">Entreprise</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <div>
              <label className="auth-input-label" htmlFor="prenom">
                Prénom*
              </label>
              <TextField
                className="auth-input"
                required
                fullWidth
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                placeholder="Votre prénom"
              />
            </div>

            <div>
              <label className="auth-input-label" htmlFor="nom">
                Nom*
              </label>
              <TextField
                className="auth-input"
                required
                fullWidth
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Votre nom"
              />
            </div>
          </Box>

          <label className="auth-input-label" htmlFor="email">
            Email*
          </label>
          <TextField
            className="auth-input"
            required
            fullWidth
            id="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="votre@email.com"
          />

          <label className="auth-input-label" htmlFor="telephone">
            Téléphone
          </label>
          <TextField
            className="auth-input"
            fullWidth
            id="telephone"
            name="telephone"
            value={formData.telephone}
            onChange={(e) => handleChange('telephone', e.target.value)}
            placeholder="Votre numéro de téléphone"
          />

          <label className="auth-input-label" htmlFor="password">
            Mot de passe*
          </label>
          <TextField
            className="auth-input"
            required
            fullWidth
            name="password"
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Votre mot de passe"
          />

          <label className="auth-input-label" htmlFor="confirmPassword">
            Confirmer le mot de passe*
          </label>
          <TextField
            className="auth-input"
            required
            fullWidth
            name="confirmPassword"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Confirmez votre mot de passe"
          />

          <Button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? <CircularProgress size={24} /> : 'Créer le compte'}
          </Button>

          <Button
            component={Link}
            to="/login"
            className="auth-link-button"
          >
            Déjà un compte ? Se connecter
          </Button>
        </Box>
      </div>
    </div>
  );
};

export { Register };
export default Register;