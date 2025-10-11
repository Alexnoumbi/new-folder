import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    MenuItem,
    Paper,
    Typography,
    Alert,
} from '@mui/material';
import { createKPI } from '../../services/kpiService';
import { KPIFormData } from '../../types/kpi.types';

interface CreateKPIFormProps {
    onSuccess: () => void;
}

const CreateKPIForm: React.FC<CreateKPIFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        type: 'NUMERIC' as const,
        unit: '',
        targetValue: '',
        minValue: '',
        maxValue: '',
        frequency: 'MONTHLY' as const
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const kpiData: KPIFormData = {
                ...formData,
                targetValue: Number(formData.targetValue),
                minValue: formData.minValue ? Number(formData.minValue) : null,
                maxValue: formData.maxValue ? Number(formData.maxValue) : null,
            };

            await createKPI(kpiData);
            setFormData({
                name: '',
                code: '',
                description: '',
                type: 'NUMERIC',
                unit: '',
                targetValue: '',
                minValue: '',
                maxValue: '',
                frequency: 'MONTHLY'
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la création du KPI');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Créer un nouveau KPI
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { sm: '1fr 1fr' } }}>
                    <TextField
                        required
                        fullWidth
                        label="Nom du KPI"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        fullWidth
                        label="Code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="KPI-001"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        multiline
                        rows={1}
                        sx={{ gridColumn: 'span 2' }}
                    />
                    <TextField
                        required
                        select
                        fullWidth
                        label="Type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                    >
                        <MenuItem value="NUMERIC">Numérique</MenuItem>
                        <MenuItem value="PERCENTAGE">Pourcentage</MenuItem>
                        <MenuItem value="CURRENCY">Monétaire</MenuItem>
                        <MenuItem value="BOOLEAN">Booléen</MenuItem>
                    </TextField>
                    <TextField
                        required
                        fullWidth
                        label="Unité"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        fullWidth
                        type="number"
                        label="Valeur cible"
                        name="targetValue"
                        value={formData.targetValue}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label="Valeur minimale"
                        name="minValue"
                        value={formData.minValue}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        type="number"
                        label="Valeur maximale"
                        name="maxValue"
                        value={formData.maxValue}
                        onChange={handleChange}
                    />
                    <TextField
                        required
                        select
                        fullWidth
                        label="Fréquence"
                        name="frequency"
                        value={formData.frequency}
                        onChange={handleChange}
                    >
                        <MenuItem value="MONTHLY">Mensuelle</MenuItem>
                        <MenuItem value="QUARTERLY">Trimestrielle</MenuItem>
                        <MenuItem value="SEMI_ANNUAL">Semestrielle</MenuItem>
                        <MenuItem value="ANNUAL">Annuelle</MenuItem>
                    </TextField>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? 'Création en cours...' : 'Créer le KPI'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default CreateKPIForm;
