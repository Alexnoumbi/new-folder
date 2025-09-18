import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Description,
  Download,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Warning,
  Error,
  Refresh,
  Add
} from '@mui/icons-material';
import { getDocuments } from '../../services/documentService';
import type { Document as DocumentType } from '../../services/documentService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonDataTable from '../../components/Argon/ArgonDataTable';
import DocumentUploader from '../../components/EntrepriseDashboard/DocumentUploader';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbs = [
    { label: 'Entreprise', href: '/enterprise' },
    { label: 'Documents' }
  ];

  const headerActions = [
    {
      label: 'Importer un document',
      icon: <Add />,
      onClick: () => {
        setOpenDialog(true);
      },
      variant: 'contained' as const,
      color: 'primary' as const
    },
    {
      label: 'Actualiser',
      icon: <Refresh />,
      onClick: fetchDocuments,
      variant: 'outlined' as const,
      color: 'primary' as const
    }
  ];

  const columns = [
    { id: 'type', label: 'Type', minWidth: 160, sortable: true, filterable: true },
    { id: 'status', label: 'Statut', minWidth: 120, sortable: true, filterable: true },
    { id: 'uploadedAt', label: 'Date d\'upload', minWidth: 150, sortable: true },
  ];

  const filters = {
    type: {
      type: 'select' as const,
      options: [
        { value: 'BUSINESS_PLAN', label: 'Business Plan' },
        { value: 'FINANCIAL_STATEMENT', label: 'État Financier' },
        { value: 'TAX_CERTIFICATE', label: 'Attestation Fiscale' },
        { value: 'SOCIAL_SECURITY', label: 'Sécurité Sociale' },
        { value: 'TRADE_REGISTER', label: 'Registre du Commerce' }
      ]
    },
    status: {
      type: 'select' as const,
      options: [
        { value: 'RECEIVED', label: 'Reçu' },
        { value: 'WAITING', label: 'En attente' },
        { value: 'EXPIRED', label: 'Expiré' },
        { value: 'UPDATE_REQUIRED', label: 'Mise à jour requise' },
        { value: 'VALIDATED', label: 'Validé' }
      ]
    }
  };

  const tableData = documents.map(doc => ({
    ...doc,
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : 'N/A',
  }));

  const actions = (row: any) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        startIcon={<Visibility />}
        onClick={() => console.log('Voir document:', row._id || row.id)}
        sx={{ color: 'primary.main' }}
      >
        Voir
      </Button>
      <Button
        size="small"
        startIcon={<Download />}
        onClick={() => console.log('Télécharger:', row._id || row.id)}
        sx={{ color: 'success.main' }}
      >
        Télécharger
      </Button>
    </Box>
  );

  // Statistiques des documents
  const documentStats = [
    {
      title: 'Total Documents',
      value: documents.length,
      icon: <Description />,
      color: 'primary' as const,
      change: ''
    },
    {
      title: 'Reçus',
      value: documents.filter(d => d.status === 'RECEIVED').length,
      icon: <CheckCircle />,
      color: 'success' as const,
      change: ''
    },
    {
      title: 'En Attente',
      value: documents.filter(d => d.status === 'WAITING').length,
      icon: <Warning />,
      color: 'warning' as const,
      change: ''
    },
    {
      title: 'Expirés',
      value: documents.filter(d => d.status === 'EXPIRED').length,
      icon: <Error />,
      color: 'error' as const,
      change: ''
    }
  ];

  if (error) {
    return (
      <Box>
        <ArgonPageHeader
          title="Documents"
          subtitle="Gestion des documents de l'entreprise"
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
        title="Documents"
        subtitle="Gestion des documents de l'entreprise"
        breadcrumbs={breadcrumbs}
        actions={headerActions}
        onRefresh={fetchDocuments}
        loading={loading}
      />

      {/* Statistiques des documents */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 3, 
        mb: 4 
      }}>
        {documentStats.map((stat, index) => (
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

      {/* Tableau des documents */}
      <ArgonDataTable
        title="Liste des Documents"
        columns={columns}
        data={tableData}
        loading={loading}
        searchable={true}
        sortable={true}
        pagination={true}
        actions={actions}
        filters={filters}
        onExport={() => console.log('Export documents')}
      />

      {/* Dialog d'import */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Importer un document
        </DialogTitle>
        <DialogContent>
          <DocumentUploader onUploadComplete={() => { setOpenDialog(false); fetchDocuments(); }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
