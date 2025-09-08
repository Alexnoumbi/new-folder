import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { getReports } from '../../services/reportService';
import { Report } from '../../types/admin.types';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonDataTable from '../../components/Argon/ArgonDataTable';

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReports();
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Rapports' }
  ];

  const headerActions = [
    {
      label: 'Nouveau Rapport',
      icon: <AddIcon />,
      onClick: () => console.log('Nouveau rapport'),
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <RefreshIcon />,
      onClick: fetchReports,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  const columns = [
    { id: 'title', label: 'Titre', minWidth: 200, sortable: true },
    { id: 'type', label: 'Type', minWidth: 120, sortable: true, filterable: true },
    { id: 'status', label: 'Statut', minWidth: 120, sortable: true, filterable: true },
    { id: 'createdAt', label: 'Créé le', minWidth: 150, sortable: true },
    { id: 'author', label: 'Auteur', minWidth: 150, sortable: true },
    { id: 'progress', label: 'Progression', minWidth: 120 },
  ];

  const tableData = reports.map(report => ({
    ...report,
    createdAt: new Date(report.createdAt).toLocaleDateString('fr-FR'),
    progress: `${report.progress || 0}%`,
  }));

  const actions = (row: any) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        startIcon={<VisibilityIcon />}
        onClick={() => console.log('Voir rapport:', row.id)}
        sx={{ color: 'primary.main' }}
      >
        Voir
      </Button>
      <Button
        size="small"
        startIcon={<DownloadIcon />}
        onClick={() => console.log('Télécharger:', row.id)}
        sx={{ color: 'success.main' }}
      >
        Télécharger
      </Button>
      <Button
        size="small"
        startIcon={<EditIcon />}
        onClick={() => console.log('Modifier:', row.id)}
        sx={{ color: 'warning.main' }}
      >
        Modifier
      </Button>
      <Button
        size="small"
        startIcon={<DeleteIcon />}
        onClick={() => console.log('Supprimer:', row.id)}
        sx={{ color: 'error.main' }}
      >
        Supprimer
      </Button>
    </Box>
  );

  // Statistiques des rapports
  const reportStats = [
    {
      title: 'Total Rapports',
      value: reports.length,
      icon: <AssessmentIcon />,
      color: 'primary' as const,
      change: '+2'
    },
    {
      title: 'Terminés',
      value: reports.filter(r => r.status === 'completed').length,
      icon: <CheckCircleIcon />,
      color: 'success' as const,
      change: '+3'
    },
    {
      title: 'En Cours',
      value: reports.filter(r => r.status === 'in-progress').length,
      icon: <ScheduleIcon />,
      color: 'warning' as const,
      change: '+1'
    },
    {
      title: 'En Attente',
      value: reports.filter(r => r.status === 'pending').length,
      icon: <WarningIcon />,
      color: 'info' as const,
      change: '+1'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      case 'pending': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon />;
      case 'in-progress': return <ScheduleIcon />;
      case 'pending': return <WarningIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <WarningIcon />;
    }
  };

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Rapports"
          subtitle="Gestion des rapports et analyses"
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
        title="Rapports"
        subtitle="Gestion des rapports et analyses"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchReports}
        loading={loading}
      />

      {/* Statistiques des rapports */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {reportStats.map((stat, index) => (
          <ArgonCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            loading={loading}
          />
        ))}
      </Box>

      {/* Tableau des rapports */}
      <ArgonDataTable
        title="Liste des Rapports"
        columns={columns}
        data={tableData}
        loading={loading}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={true}
        actions={actions}
        onExport={() => console.log('Export rapports')}
      />

      {/* Cartes des rapports récents */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
        gap: 3, 
        mt: 4 
      }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ArgonCard
              key={index}
              title=""
              value=""
              loading={true}
            />
          ))
        ) : reports.slice(0, 6).map((report, index) => (
          <Card
            key={index}
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.type}
                  </Typography>
                </Box>
                <Chip
                  icon={getStatusIcon(report.status)}
                  label={report.status}
                  color={getStatusColor(report.status) as any}
                  size="small"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progression
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={report.progress || 0}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: report.progress && report.progress >= 80 ? '#4caf50' :
                                       report.progress && report.progress >= 60 ? '#ff9800' : '#f44336'
                      }
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                    {report.progress || 0}%
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Auteur
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {report.author}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Créé le
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => console.log('Voir rapport:', report.id)}
                    variant="outlined"
                    color="primary"
                  >
                    Voir
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => console.log('Télécharger:', report.id)}
                    variant="outlined"
                    color="success"
                  >
                    Télécharger
                  </Button>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  ID: {report.id}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ReportsPage;
