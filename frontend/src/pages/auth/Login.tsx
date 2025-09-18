import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { login } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      const response = await login(formData);
      const { user } = response;

      if (!user) {
        throw new Error('Erreur lors de la connexion');
      }

      // Set user in auth context
      setUser(user);

      // Redirect based on user type
      switch (user.typeCompte) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'entreprise':
          navigate('/enterprise/dashboard');
          break;
        default:
          setError('Type de compte non reconnu');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <Typography className="auth-title">
          Connexion
        </Typography>
        <Typography className="auth-subtitle">
          Entrez vos identifiants pour accéder à votre compte
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <label className="auth-input-label" htmlFor="email">
            Email*
          </label>
          <TextField
            className="auth-input"
            required
            fullWidth
            id="email"
            name="email"
            autoComplete="email"
            placeholder="votre@email.com"
            autoFocus
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>

          <Button
            component={Link}
            to="/register"
            className="auth-link-button"
          >
            Créer un compte
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Login;