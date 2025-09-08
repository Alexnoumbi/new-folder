import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createUser, updateUser } from '../../store/slices/userSlice';
import { AppDispatch } from '../../store/store';
import { User } from '../../types/auth.types';

interface UserFormProps {
  user?: Partial<User>;
  onClose?: () => void;
}

type UserCreateData = {
  nom: string;
  prenom: string;
  email: string;
  typeCompte: 'admin' | 'entreprise';
  role: 'user' | 'admin' | 'super_admin';
  telephone?: string;
  password: string;
  entrepriseId?: string;
};

type UserUpdateData = Partial<Omit<UserCreateData, 'password'>>;

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<UserCreateData>({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    typeCompte: user?.typeCompte || 'entreprise',
    role: user?.role || 'user',
    telephone: user?.telephone || '',
    password: '',
    entrepriseId: user?.entrepriseId || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?._id) {
      const updateData: UserUpdateData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        typeCompte: formData.typeCompte,
        telephone: formData.telephone,
        entrepriseId: formData.entrepriseId
      };
      await dispatch(updateUser({ id: user._id, userData: updateData }));
    } else {
      await dispatch(createUser(formData));
    }
    if (onClose) onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      typeCompte: e.target.value as 'admin' | 'entreprise'
    }));
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          required
          name="nom"
          label="Nom"
          value={formData.nom}
          onChange={handleInputChange}
        />
        <TextField
          required
          name="prenom"
          label="Prénom"
          value={formData.prenom}
          onChange={handleInputChange}
        />
        <TextField
          required
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        {!user?._id && (
          <TextField
            required
            name="password"
            label="Mot de passe"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        )}
        <FormControl>
          <InputLabel>Type de Compte</InputLabel>
          <Select
            name="typeCompte"
            value={formData.typeCompte}
            label="Type de Compte"
            onChange={handleSelectChange}
          >
            <MenuItem value="entreprise">Entreprise</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <InputLabel>Rôle</InputLabel>
          <Select
            name="role"
            value={formData.role}
            label="Rôle"
            onChange={(e) => setFormData(prev => ({
              ...prev,
              role: e.target.value as 'user' | 'admin' | 'super_admin'
            }))}
          >
            <MenuItem value="user">Utilisateur</MenuItem>
            <MenuItem value="admin">Administrateur</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
          </Select>
        </FormControl>
        <TextField
          name="telephone"
          label="Téléphone"
          value={formData.telephone}
          onChange={handleInputChange}
        />
        <TextField
          name="entrepriseId"
          label="ID d'Entreprise"
          value={formData.entrepriseId}
          onChange={handleInputChange}
        />
        <Button type="submit" variant="contained" color="primary">
          {user?._id ? 'Modifier' : 'Créer'}
        </Button>
      </Box>
    </Paper>
  );
};

export default UserForm;
