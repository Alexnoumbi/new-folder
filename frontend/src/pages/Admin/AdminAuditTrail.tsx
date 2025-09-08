import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Search,
  FilterList,
  Security,
  Person,
  Business,
  Assessment
} from '@mui/icons-material';
import { getAuditLogs, AuditLog } from '../../services/adminService';
import ArgonTable from '../../components/Argon/ArgonTable';
import ArgonCard from '../../components/Argon/ArgonCard';

const AdminAuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des logs d\'audit');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'timestamp', label: 'Date/Heure', minWidth: 150 },
    { id: 'user', label: 'Utilisateur', minWidth: 150 },
    { id: 'action', label: 'Action', minWidth: 200 },
    { id: 'resource', label: 'Ressource', minWidth: 150 },
    { id: 'ipAddress', label: 'Adresse IP', minWidth: 120 },
    { id: 'status', label: 'Statut', minWidth: 100 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'default';
    }
  };

  const tableData = filteredLogs.map(log => ({
    ...log,
    timestamp: new Date(log.timestamp).toLocaleString('fr-FR'),
  }));

  // Statistiques des logs
  const auditStats = [
    {
      title: 'Total Logs',
      value: logs.length,
      icon: <Assessment />,
      color: 'primary' as const,
      change: '+12'
    },
    {
      title: 'Actions Réussies',
      value: logs.filter(l => l.status === 'success').length,
      icon: <Security />,
      color: 'success' as const,
      change: '+8'
    },
    {
      title: 'Erreurs',
      value: logs.filter(l => l.status === 'error').length,
      icon: <Person />,
      color: 'error' as const,
      change: '-2'
    },
    {
      title: 'Utilisateurs Actifs',
      value: new Set(logs.map(l => l.user)).size,
      icon: <Business />,
      color: 'info' as const,
      change: '+1'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Piste d'Audit
      </Typography>

      {/* Statistiques */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {auditStats.map((stat, index) => (
          <ArgonCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
          />
        ))}
      </Box>

      {/* Barre de recherche */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Rechercher dans les logs d'audit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <FilterList />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          }}
        />
      </Box>

      {/* Tableau des logs */}
      <ArgonTable
        title="Logs d'Audit"
        columns={columns}
        data={tableData}
        loading={loading}
      />
    </Box>
  );
};

export default AdminAuditTrail;
