import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Error,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { getComplianceStatus } from '../../services/adminService';
import { ComplianceStatus, ComplianceCategory } from '../../types/admin.types';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';

const AdminCompliance: React.FC = () => {
  const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getComplianceStatus();
      setCompliance(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du statut de conformité');
      console.error('Compliance status loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceStatus();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle color="success" />;
    if (score >= 70) return <Warning color="warning" />;
    return <Error color="error" />;
  };

  const breadcrumbs = [
    { label: 'Administration', href: '/admin' },
    { label: 'Conformité' }
  ];

  const headerActions = [
    {
      label: 'Actualiser',
      icon: <RefreshIcon />,
      onClick: fetchComplianceStatus,
      variant: 'outlined' as const,
      color: 'primary' as const
    },
    {
      label: 'Rapport',
      icon: <AssessmentIcon />,
      onClick: () => console.log('Générer rapport conformité'),
      variant: 'contained' as const,
      color: 'primary' as const
    }
  ];

  return (
    <Box p={3}>
      <ArgonPageHeader
        title="Conformité"
        subtitle="Gestion de la conformité réglementaire"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchComplianceStatus}
        loading={loading}
      />

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchComplianceStatus}>
              Réessayer
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {compliance && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: '0 1 calc(33.333% - 16px)' }, minWidth: 0 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Score Global</Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h3" color={`${getStatusColor(compliance.overallScore)}.main`}>
                    {compliance.overallScore}%
                  </Typography>
                  {getStatusIcon(compliance.overallScore)}
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={compliance.overallScore}
                  color={getStatusColor(compliance.overallScore)}
                  sx={{ mt: 2 }}
                />
              </Paper>
            </Box>

            <Box sx={{ flex: { xs: '1 1 100%', md: '0 1 calc(66.666% - 16px)' }, minWidth: 0 }}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Résumé des Contrôles</Typography>
                <Box sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                  '& > *': { flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' } }
                }}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success.main">
                      {compliance.passedControls}
                    </Typography>
                    <Typography variant="body2">Validés</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning.main">
                      {compliance.pendingControls}
                    </Typography>
                    <Typography variant="body2">En attente</Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h4" color="error.main">
                      {compliance.failedControls}
                    </Typography>
                    <Typography variant="body2">Échoués</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>

          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Contrôles Validés</TableCell>
                    <TableCell>Contrôles Totaux</TableCell>
                    <TableCell>Dernière Évaluation</TableCell>
                    <TableCell>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {compliance.categories.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" mr={1}>
                            {category.score}%
                          </Typography>
                          {getStatusIcon(category.score)}
                        </Box>
                      </TableCell>
                      <TableCell>{category.passedControls}</TableCell>
                      <TableCell>{category.totalControls}</TableCell>
                      <TableCell>
                        {category.lastAssessment ? new Date(category.lastAssessment).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.score >= 90 ? 'Conforme' : category.score >= 70 ? 'À améliorer' : 'Non conforme'}
                          color={getStatusColor(category.score)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AdminCompliance;
