import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as auditService from '../../services/auditService';
import { AuditLog } from '../../types/audit.types';
import { GridItem } from '../../components/common/GridItem';

const AdminAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        searchTerm
      };
      const data = await auditService.getAuditLogs(filters);
      setLogs(data);
    } catch (err) {
      setError('Error loading audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const handleExport = async () => {
    try {
      const filters = {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        searchTerm
      };
      const blob = await auditService.exportAuditLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error exporting audit logs');
      console.error(err);
    }
  };

  const handleSearch = () => {
    loadAuditLogs();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  if (loading && logs.length === 0) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Audit Logs</Typography>
        <Stack direction="row" spacing={2}>
          <IconButton onClick={loadAuditLogs}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleExport}>
            <DownloadIcon />
          </IconButton>
        </Stack>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadAuditLogs}>
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 2, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(date) => setStartDate(date)}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(date) => setEndDate(date)}
          />
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
          >
            Search
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date/Heure</TableCell>
              <TableCell>Utilisateur</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Identifiant</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  <TableCell>{log.user?.name || 'Système'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getActionLabel(log.action)}
                      color={
                        log.action.includes('CREATE') ? 'success' :
                        log.action.includes('UPDATE') ? 'info' :
                        log.action.includes('DELETE') ? 'error' :
                        'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getEntityTypeLabel(log.entityType)}</TableCell>
                  <TableCell>{log.entityId}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => setSelectedLog(log)}>
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>

      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="md"
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
        <DialogContent>
          {selectedLog && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Date/Heure</Typography>
              <Typography sx={{ mb: 2 }}>
                {format(new Date(selectedLog.timestamp), 'dd/MM/yyyy HH:mm:ss')}
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
    </Container>
  );
};

export default AdminAudit;
