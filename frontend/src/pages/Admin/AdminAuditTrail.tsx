import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip
} from '@mui/material';
import {
  Security,
  Person,
  Search,
  Assessment,
  Business,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getAuditLogs } from '../../services/auditService';
import { AuditLog } from '../../types/audit.types';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonTable from '../../components/Argon/ArgonTable';

const AdminAuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditLogs({ searchTerm });
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors du chargement des logs d\'audit');
      console.error('Erreur lors du chargement des logs d\'audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      USER: 'Utilisateur',
      ENTERPRISE: 'Entreprise',
      KPI: 'Indicateur',
      DOCUMENT: 'Document',
      REPORT: 'Rapport'
    };
    return labels[type] || type;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression',
      LOGIN: 'Connexion',
      LOGOUT: 'Déconnexion',
      EXPORT: 'Export'
    };
    return labels[action] || action;
  };

  const columns = [
    {
      id: 'timestamp',
      label: 'Date/Heure',
      minWidth: 150,
      format: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: fr })
    },
    {
      id: 'user',
      label: 'Utilisateur',
      minWidth: 150,
      format: (value: any) => value?.name || 'Système'
    },
    {
      id: 'action',
      label: 'Action',
      minWidth: 150,
      format: (value: string) => getActionLabel(value)
    },
    {
      id: 'entityType',
      label: 'Type',
      minWidth: 150,
      format: (value: string) => getEntityTypeLabel(value)
    },
    {
      id: 'entityId',
      label: 'Identifiant',
      minWidth: 100
    },
    {
      id: 'status',
      label: 'Statut',
      minWidth: 100,
      format: (value: string) => value === 'success' ? 'Succès' :
                                value === 'error' ? 'Erreur' :
                                value === 'warning' ? 'Avertissement' : value
    }
  ];

  const tableData = filteredLogs.map(log => ({
    ...log,
    status: log.status === 'success' ? 'Succès' :
            log.status === 'error' ? 'Erreur' :
            log.status === 'warning' ? 'Avertissement' : log.status
  }));

  const auditStats = [
    {
      title: 'Total des Logs',
      value: logs.length,
      icon: <Assessment />,
      color: 'primary' as const
    },
    {
      title: 'Actions Réussies',
      value: logs.filter(l => l.status === 'success').length,
      icon: <Security />,
      color: 'success' as const
    },
    {
      title: 'Erreurs',
      value: logs.filter(l => l.status === 'error').length,
      icon: <Person />,
      color: 'error' as const
    },
    {
      title: 'Utilisateurs Uniques',
      value: new Set(logs.map(l => l.user?.name)).size,
      icon: <Business />,
      color: 'info' as const
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Journal d'Audit
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              paddingLeft: '8px'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* Tableau des logs */}
      <ArgonTable
        title="Logs d'Audit"
        columns={columns}
        data={tableData}
        loading={loading}
        emptyMessage="Aucun log d'audit trouvé"
        error={error}
        onRetry={fetchLogs}
        actions={(row: AuditLog) => (
          <IconButton size="small" onClick={() => setSelectedLog(row)}>
            <VisibilityIcon />
          </IconButton>
        )}
      />

      {/* Modal de détails */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Détails du Log
          <IconButton
            onClick={() => setSelectedLog(null)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Date/Heure</Typography>
              <Typography sx={{ mb: 2 }}>
                {format(new Date(selectedLog.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>Utilisateur</Typography>
              <Typography sx={{ mb: 2 }}>
                {selectedLog.user?.name || 'Système'}
                {selectedLog.user?.email && ` (${selectedLog.user.email})`}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>Action</Typography>
              <Typography sx={{ mb: 2 }}>{getActionLabel(selectedLog.action)}</Typography>

              <Typography variant="subtitle2" gutterBottom>Type</Typography>
              <Typography sx={{ mb: 2 }}>{getEntityTypeLabel(selectedLog.entityType)}</Typography>

              <Typography variant="subtitle2" gutterBottom>Identifiant</Typography>
              <Typography sx={{ mb: 2 }}>{selectedLog.entityId}</Typography>

              <Typography variant="subtitle2" gutterBottom>Statut</Typography>
              <Chip
                label={selectedLog.status === 'success' ? 'Succès' :
                      selectedLog.status === 'error' ? 'Erreur' :
                      selectedLog.status === 'warning' ? 'Avertissement' : selectedLog.status}
                color={selectedLog.status === 'success' ? 'success' :
                      selectedLog.status === 'error' ? 'error' :
                      selectedLog.status === 'warning' ? 'warning' : 'default'}
                sx={{ mb: 2 }}
              />

              {selectedLog.changes && (
                <>
                  <Typography variant="subtitle2" gutterBottom>Changements</Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAuditTrail;
