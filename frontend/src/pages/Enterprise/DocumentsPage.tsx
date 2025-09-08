import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Description,
  Upload,
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
import { getDocuments, Document } from '../../services/documentService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonDataTable from '../../components/Argon/ArgonDataTable';
import ArgonForm from '../../components/Argon/ArgonForm';

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

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
      label: 'Nouveau Document',
      icon: <Add />,
      onClick: () => {
        setEditingDocument(null);
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
    { id: 'name', label: 'Nom du document', minWidth: 200, sortable: true },
    { id: 'type', label: 'Type', minWidth: 120, sortable: true, filterable: true },
    { id: 'status', label: 'Statut', minWidth: 120, sortable: true, filterable: true },
    { id: 'uploadedAt', label: 'Date d\'upload', minWidth: 150, sortable: true },
    { id: 'fileSize', label: 'Taille', minWidth: 100 },
    { id: 'version', label: 'Version', minWidth: 80 },
  ];

  const formFields = [
    { name: 'name', label: 'Nom du document', required: true, xs: 12, md: 6 },
    { name: 'type', label: 'Type de document', type: 'select' as const, required: true, xs: 12, md: 6, options: [
      { value: 'contract', label: 'Contrat' },
      { value: 'invoice', label: 'Facture' },
      { value: 'report', label: 'Rapport' },
      { value: 'certificate', label: 'Certificat' },
      { value: 'other', label: 'Autre' }
    ]},
    { name: 'description', label: 'Description', type: 'textarea' as const, xs: 12 },
  ];

  const filters = {
    type: {
      type: 'select' as const,
      options: [
        { value: 'contract', label: 'Contrat' },
        { value: 'invoice', label: 'Facture' },
        { value: 'report', label: 'Rapport' },
        { value: 'certificate', label: 'Certificat' },
        { value: 'other', label: 'Autre' }
      ]
    },
    status: {
      type: 'select' as const,
      options: [
        { value: 'RECEIVED', label: 'Reçu' },
        { value: 'WAITING', label: 'En attente' },
        { value: 'EXPIRED', label: 'Expiré' },
        { value: 'UPDATE_REQUIRED', label: 'Mise à jour requise' }
      ]
    }
  };

  const tableData = documents.map(doc => ({
    ...doc,
    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('fr-FR') : 'N/A',
    fileSize: 'N/A',
  }));

  const actions = (row: any) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        size="small"
        startIcon={<Visibility />}
        onClick={() => console.log('Voir document:', row.id)}
        sx={{ color: 'primary.main' }}
      >
        Voir
      </Button>
      <Button
        size="small"
        startIcon={<Download />}
        onClick={() => console.log('Télécharger:', row.id)}
        sx={{ color: 'success.main' }}
      >
        Télécharger
      </Button>
      <Button
        size="small"
        startIcon={<Edit />}
        onClick={() => {
          setEditingDocument(row);
          setOpenDialog(true);
        }}
        sx={{ color: 'warning.main' }}
      >
        Modifier
      </Button>
      <Button
        size="small"
        startIcon={<Delete />}
        onClick={() => console.log('Supprimer:', row.id)}
        sx={{ color: 'error.main' }}
      >
        Supprimer
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
      change: '+3'
    },
    {
      title: 'Reçus',
      value: documents.filter(d => d.status === 'RECEIVED').length,
      icon: <CheckCircle />,
      color: 'success' as const,
      change: '+2'
    },
    {
      title: 'En Attente',
      value: documents.filter(d => d.status === 'WAITING').length,
      icon: <Warning />,
      color: 'warning' as const,
      change: '+1'
    },
    {
      title: 'Expirés',
      value: documents.filter(d => d.status === 'EXPIRED').length,
      icon: <Error />,
      color: 'error' as const,
      change: '0'
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
        filterable={true}
        sortable={true}
        pagination={true}
        actions={actions}
        filters={filters}
        onExport={() => console.log('Export documents')}
      />

      {/* Dialog de création/édition */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDocument ? 'Modifier le document' : 'Nouveau document'}
        </DialogTitle>
        <DialogContent>
          <ArgonForm
            title=""
            fields={formFields}
            onSubmit={(data) => {
              console.log('Sauvegarder document:', data);
              setOpenDialog(false);
            }}
            onCancel={() => setOpenDialog(false)}
            initialData={editingDocument || {}}
            submitLabel={editingDocument ? 'Mettre à jour' : 'Créer'}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
