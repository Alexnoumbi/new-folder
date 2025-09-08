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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await login({ email, password });
      setUser(response.user);

      const isAdmin = response.user.role === 'admin' || response.user.role === 'super_admin' || response.user.typeCompte === 'admin';
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/enterprise/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
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