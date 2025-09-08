import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer: React.FC<AuthInitializerProps> = ({ children }) => {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Créer un utilisateur par défaut sans authentification
    const defaultUser = {
      _id: '1',
      nom: 'Admin',
      prenom: 'Utilisateur',
      email: 'admin@demo.com',
      typeCompte: 'admin',
      role: 'admin'
    };
    
    setUser(defaultUser);
    setIsLoading(false);
  }, [setUser]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
