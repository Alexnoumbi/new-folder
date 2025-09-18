import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Chip
} from '@mui/material';
import {
  Memory,
  Security as SecurityIcon
} from '@mui/icons-material';
import { getSystemInfo } from '../../services/adminService';
import { SystemInfo } from '../../types/system.types';

import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';

const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} jour${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(' ') || '0m';
};

const formatLastUpdate = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  return 'À l\'instant';
};

const AdminSystem: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const data = await getSystemInfo();
      setSystemInfo(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des informations système');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Administration', href: '/admin' },
    { label: 'Système' }
  ];

  const headerActions = [
    {
      label: 'Actualiser',
      // icon: <RefreshIcon />,
      onClick: fetchSystemInfo,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="État du Système"
          subtitle="Surveillance et maintenance du système"
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <ArgonPageHeader
        title="État du Système"
        subtitle="Surveillance et maintenance du système"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchSystemInfo}
        loading={loading}
      />

      {/* Cartes de statut système */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        <ArgonCard
          title="CPU"
          value={`${systemInfo?.system.cpu || 0}%`}
          // icon={getStatusIcon(systemInfo?.system.cpu || 0, 80)}
          // color={getStatusColor(systemInfo?.system.cpu || 0, 80)}
          // change={`${((systemInfo?.requests.perMinute || 0) - (systemInfo?.requests.total || 0)) / (systemInfo?.requests.total || 1)}%`}
          loading={loading}
          // gradient={systemInfo?.system.cpu ? systemInfo.system.cpu > 80 : undefined}
        />
        <ArgonCard
          title="Mémoire"
          value={systemInfo ? `${Math.round((systemInfo.system.memory.used / systemInfo.system.memory.total) * 100)}%` : '0%'}
          // icon={getStatusIcon(systemInfo ? (systemInfo.system.memory.used / systemInfo.system.memory.total) * 100 : 0, 85)}
          // color={getStatusColor(systemInfo ? (systemInfo.system.memory.used / systemInfo.system.memory.total) * 100 : 0, 85)}
          // change={`${systemInfo?.system.memory.free} MB libres`}
          loading={loading}
          // gradient={systemInfo ? (systemInfo.system.memory.used / systemInfo.system.memory.total) * 100 > 85 : undefined}
        />
        <ArgonCard
          title="Stockage"
          value={systemInfo ? `${Math.round((systemInfo.system.disk.used / systemInfo.system.disk.total) * 100)}%` : '0%'}
          // icon={getStatusIcon(systemInfo ? (systemInfo.system.disk.used / systemInfo.system.disk.total) * 100 : 0, 90)}
          // color={getStatusColor(systemInfo ? (systemInfo.system.disk.used / systemInfo.system.disk.total) * 100 : 0, 90)}
          // change={`${Math.round(systemInfo?.system.disk.free || 0)} GB libres`}
          loading={loading}
          // gradient={systemInfo ? (systemInfo.system.disk.used / systemInfo.system.disk.total) * 100 > 90 : undefined}
        />
        <ArgonCard
          title="Requêtes"
          value={`${systemInfo?.requests.perMinute || 0}/min`}
          // icon={getStatusIcon(systemInfo?.requests.perMinute || 0, 1000)}
          // color={getStatusColor(systemInfo?.requests.perMinute || 0, 1000)}
          // change={`Total: ${systemInfo?.requests.total || 0}`}
          loading={loading}
          // gradient={systemInfo?.requests.perMinute ? systemInfo.requests.perMinute > 1000 : undefined}
        />
      </Box>

      {/* Informations détaillées */}
      {systemInfo && !loading && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3 
        }}>
          <ArgonCard
            title="Informations Système"
            value=""
            icon={<Memory />}
            color="info"
          />
          <Box sx={{ mt: 2, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Version OS
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {systemInfo.system.osInfo?.version || 'Non disponible'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Architecture
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {systemInfo.system.osInfo?.architecture || 'Non disponible'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Uptime
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {systemInfo.process?.uptime || formatUptime(Math.floor((Date.now() - systemInfo.startTime) / 1000))}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Dernière mise à jour
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatLastUpdate(systemInfo.startTime)}
              </Typography>
            </Box>
          </Box>

          <ArgonCard
            title="Services"
            value=""
            icon={<SecurityIcon />}
            color="success"
          />
          <Box sx={{ mt: 2, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Base de données
              </Typography>
              <Chip
                label="Actif"
                size="small"
                sx={{ backgroundColor: '#4caf50', color: '#ffffff' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                API Server
              </Typography>
              <Chip
                label="Actif"
                size="small"
                sx={{ backgroundColor: '#4caf50', color: '#ffffff' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Cache Redis
              </Typography>
              <Chip
                label="Actif"
                size="small"
                sx={{ backgroundColor: '#4caf50', color: '#ffffff' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                File d'attente
              </Typography>
              <Chip
                label="Actif"
                size="small"
                sx={{ backgroundColor: '#4caf50', color: '#ffffff' }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminSystem;
