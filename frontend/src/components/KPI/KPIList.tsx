import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material';
import { getKPIs } from '../../services/kpiService';
import { KPI } from '../../types/kpi.types';

const KPIList = () => {
    const [kpis, setKpis] = useState<KPI[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadKPIs = async () => {
            try {
                setLoading(true);
                const data = await getKPIs();
                setKpis(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setError('Erreur lors du chargement des KPIs');
                console.error('Erreur:', err);
            } finally {
                setLoading(false);
            }
        };

        loadKPIs();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (kpis.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Aucun KPI disponible</Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Liste des KPIs</Typography>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                    md: '1fr 1fr 1fr'
                },
                gap: 3
            }}>
                {kpis.map((kpi) => (
                    <Paper
                        key={kpi._id}
                        sx={{ p: 2 }}
                    >
                        <Typography variant="h6">{kpi.name}</Typography>
                        <Typography color="textSecondary" gutterBottom>
                            {kpi.description || 'Aucune description'}
                        </Typography>
                        <Box mt={2}>
                            <Typography variant="body2" color="textSecondary">
                                Valeur actuelle / Cible
                            </Typography>
                            <Typography variant="h6">
                                {kpi.currentValue || 0} / {kpi.targetValue} {kpi.unit}
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                            Fréquence: {kpi.frequency}
                        </Typography>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
};

export default KPIList;
