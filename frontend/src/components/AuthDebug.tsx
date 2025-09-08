import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStoredToken } from '../services/authService';
import { Box, Typography, Paper, Button } from '@mui/material';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const token = getStoredToken();

  const handleTestAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Auth test response:', data);
    } catch (error) {
      console.error('Auth test error:', error);
    }
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        Debug Authentication
      </Typography>
      <Box>
        <Typography>Token: {token ? 'Present' : 'Missing'}</Typography>
        <Typography>User: {user ? `${user.prenom} ${user.nom}` : 'Not logged in'}</Typography>
        <Typography>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Typography>
        <Typography>User Type: {user?.typeCompte || 'N/A'}</Typography>
        <Button onClick={handleTestAuth} variant="outlined" sx={{ mt: 1 }}>
          Test Auth API
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthDebug; 