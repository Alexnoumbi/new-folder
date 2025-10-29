/**
 * AssistantWrapper - Composant wrapper pour les assistants avancés
 * Sélection automatique du bon assistant selon le rôle utilisateur
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Typography
} from '@mui/material';

import QAAssistant from './QAAssistant';
import { useAuth } from '../../hooks/useAuth';

interface AssistantWrapperProps {
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
  showAdvancedFeatures?: boolean;
}

const AssistantWrapper: React.FC<AssistantWrapperProps> = ({
  open,
  onClose,
  initialMessage,
  showAdvancedFeatures = false
}) => {
  const { user } = useAuth();
  const [assistantType, setAssistantType] = useState<'admin' | 'enterprise' | 'optimized'>('optimized');
  const [isLoading, setIsLoading] = useState(true);

  // Détermination du type d'assistant selon le rôle
  useEffect(() => {
    const determineAssistantType = async () => {
      setIsLoading(true);

      try {
        console.log('🔍 AssistantWrapper: Détermination du type d\'assistant');
        console.log('👤 Utilisateur:', user);

        if (!user) {
          console.log('⚠️ Pas d\'utilisateur connecté, utilisation de l\'assistant optimisé');
          setAssistantType('optimized');
          setIsLoading(false);
          return;
        }

        console.log('📊 Type de compte:', user.typeCompte);

        // Sélection directe selon le rôle
        if (user.typeCompte === 'admin') {
          console.log('✅ Assistant admin sélectionné');
          setAssistantType('admin');
        } else if (user.typeCompte === 'entreprise') {
          console.log('✅ Assistant entreprise sélectionné');
          setAssistantType('enterprise');
        } else {
          console.log('✅ Assistant optimisé sélectionné (rôle non reconnu)');
          setAssistantType('optimized');
        }

        setIsLoading(false);
      } catch (error) {
        console.error('❌ Erreur détermination type assistant:', error);
        setAssistantType('optimized');
        setIsLoading(false);
      }
    };

    if (open) {
      determineAssistantType();
    }
  }, [open, user]);


  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          gap: 2
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" color="text.secondary">
          Initialisation de l'assistant...
        </Typography>
      </Box>
    );
  }

  return (
    <QAAssistant
      open={open}
      onClose={onClose}
      type={assistantType === 'admin' ? 'admin' : 'enterprise'}
    />
  );
};

export default AssistantWrapper;
