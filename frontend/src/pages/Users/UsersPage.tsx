import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Avatar,
    Chip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon,
    Person,
    Email,
    Phone,
    LocationOn,
    Business,
} from '@mui/icons-material';
import { getUsers } from '../../services/userService';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import ArgonDataTable from '../../components/Argon/ArgonDataTable';
import type { User } from '../../types/user.types';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const breadcrumbs = [
        { label: 'Administration', href: '/admin' },
        { label: 'Utilisateurs' }
    ];

    const headerActions = [
        {
            label: 'Nouvel Utilisateur',
            icon: <AddIcon />,
            onClick: () => setOpenDialog(true),
            variant: 'contained' as const,
            color: 'primary' as const
        },
        {
            label: 'Actualiser',
            icon: <RefreshIcon />,
            onClick: fetchUsers,
            variant: 'outlined' as const,
            color: 'primary' as const
        }
    ];

    const columns = [
        { id: 'name', label: 'Nom', minWidth: 200, sortable: true },
        { id: 'email', label: 'Email', minWidth: 200, sortable: true },
        { id: 'role', label: 'Rôle', minWidth: 120, sortable: true, filterable: true },
        { id: 'status', label: 'Statut', minWidth: 120, sortable: true, filterable: true },
        { id: 'createdAt', label: 'Créé le', minWidth: 150, sortable: true },
    ];

    const tableData = users.map(user => ({
        id: user.id,
        name: `${user.prenom || ''} ${user.nom || ''}`,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non défini',
        original: user
    }));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'error';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'error';
            case 'manager': return 'warning';
            case 'user': return 'success';
            default: return 'default';
        }
    };

    const actions = (row: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
                size="small"
                onClick={() => setSelectedUser(row.original)}
                color="info"
            >
                <VisibilityIcon />
            </IconButton>
            <IconButton
                size="small"
                onClick={() => console.log('Modifier:', row.id)}
                color="primary"
            >
                <Edit />
            </IconButton>
            <IconButton
                size="small"
                onClick={() => console.log('Supprimer:', row.id)}
                color="error"
            >
                <DeleteIcon />
            </IconButton>
        </Box>
    );

    return (
        <Box p={3}>
            <ArgonPageHeader
                title="Gestion des Utilisateurs"
                subtitle="Administration des utilisateurs du système"
                breadcrumbs={breadcrumbs}
                actions={headerActions}
                onRefresh={fetchUsers}
                loading={loading}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <ArgonDataTable
                data={tableData}
                columns={columns}
                loading={loading}
                actions={actions}
                searchable
                sortable
                enableExport
                exportFilename="users-export"
            />

            {selectedUser && (
                <Dialog
                    open={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {selectedUser.prenom?.charAt(0)}{selectedUser.nom?.charAt(0)}
                            </Avatar>
                            <Box>
                                <Typography variant="h6">
                                    {selectedUser.prenom} {selectedUser.nom}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedUser.email}
                                </Typography>
                            </Box>
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Informations Personnelles
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Email sx={{ mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2">{selectedUser.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Phone sx={{ mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2">{selectedUser.telephone || 'Non renseigné'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2">{selectedUser.entreprise || 'Non renseigné'}</Typography>
                                </Box>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Informations Professionnelles
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Business sx={{ mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2">{selectedUser.entreprise || 'Non renseigné'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                                    <Chip
                                        label={selectedUser.role}
                                        color={getRoleColor(selectedUser.role) as any}
                                        size="small"
                                    />
                                    <Chip
                                        label={selectedUser.status}
                                        color={getStatusColor(selectedUser.status) as any}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Créé le: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('fr-FR') : 'Non défini'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedUser(null)}>Fermer</Button>
                        <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => console.log('Modifier utilisateur', selectedUser.id)}
                        >
                            Modifier
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default UsersPage;
