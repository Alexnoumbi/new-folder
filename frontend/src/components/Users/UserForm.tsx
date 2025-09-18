import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useAppDispatch } from '../../store/hooks';
import * as userActions from '../../store/slices/userSlice';
import type { User, UserCreateData, UserUpdateData } from '../../types/user.types';

interface UserFormProps {
    user?: User;
    open: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, open, onClose, onSuccess }) => {
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState<UserCreateData & UserUpdateData>({
        nom: '',
        prenom: '',
        email: '',
        role: 'user',
        typeCompte: 'entreprise',
        status: 'active',
        telephone: '',
        entreprise: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role,
                typeCompte: user.typeCompte,
                status: user.status,
                telephone: user.telephone || '',
                entreprise: user.entreprise || ''
            });
        }
    }, [user]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (user?.id) {
                await dispatch(userActions.updateUser({
                    id: user.id,
                    userData: formData
                })).unwrap();
            } else {
                await dispatch(userActions.createUser({
                    ...formData,
                    status: 'active'
                })).unwrap();
            }
            onSuccess?.();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Nom"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Prénom"
                            value={formData.prenom}
                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        />
                    </Box>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Rôle</InputLabel>
                            <Select
                                value={formData.role}
                                label="Rôle"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                            >
                                <MenuItem value="user">Utilisateur</MenuItem>
                                <MenuItem value="admin">Administrateur</MenuItem>
                                <MenuItem value="super_admin">Super Admin</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Type de Compte</InputLabel>
                            <Select
                                value={formData.typeCompte}
                                label="Type de Compte"
                                onChange={(e) => setFormData({ ...formData, typeCompte: e.target.value as User['typeCompte'] })}
                            >
                                <MenuItem value="admin">Administration</MenuItem>
                                <MenuItem value="entreprise">Entreprise</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <TextField
                        fullWidth
                        label="Téléphone"
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    />
                    {formData.typeCompte === 'entreprise' && (
                        <TextField
                            fullWidth
                            label="Entreprise"
                            value={formData.entreprise}
                            onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Annuler</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : user ? 'Mettre à jour' : 'Créer'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserForm;
