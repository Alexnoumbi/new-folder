import React from 'react';
import { Box, Typography } from '@mui/material';
import { getCurrentUser } from '../services/authService';

const AuthDebug: React.FC = () => {
  const user = getCurrentUser();

  const testAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Auth test result:', data);
    } catch (error) {
      console.error('Auth test error:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Auth Debug Info</Typography>
      <Typography>User: {user ? 'Logged in' : 'Not logged in'}</Typography>
      {user && (
        <>
          <Typography>Email: {user.email}</Typography>
          <Typography>Role: {user.role}</Typography>
        </>
      )}
    </Box>
  );
};

export default AuthDebug;
