import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    CircularProgress,
    Alert,
    Avatar,
    FormControlLabel,
    Switch,
    MenuItem,
    Button,
    Paper,
    Stack,
    Divider,
    Chip,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    Tabs,
    Tab,
    Card,
    CardContent,
    InputAdornment
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
    Edit,
    Save,
    Cancel,
    Business,
    LocationOn,
    AttachMoney,
    People,
    TrendingUp,
    Lightbulb,
    Phone,
    Email,
    Language as WebIcon,
    CheckCircle,
    Info
} from '@mui/icons-material';
import { getUserById, updateUser } from '../../services/userService';
import { getEntreprise, updateEntreprise } from '../../services/entrepriseService';
import { useAuth } from '../../hooks/useAuth';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

const ProfilePage: React.FC = () => {
    const theme = useTheme();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<any | null>(null);
    const [entreprise, setEntreprise] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const fetchData = useCallback(async () => {
        if (!currentUser?.id) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const userData = await getUserById(currentUser.id);
            setProfile(userData);
            
            if (userData.entrepriseId || currentUser.entrepriseId) {
                const entId = userData.entrepriseId || currentUser.entrepriseId;
                if (entId) {
                    const entData = await getEntreprise(entId);
                    setEntreprise(entData);
                }
            }
        } catch (err: any) {
            console.error('Error loading data:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        if (!entreprise?._id) {
            setError('Aucune entreprise à mettre à jour');
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            console.log('Saving entreprise data:', entreprise);

            // Préparer les données à envoyer
            const dataToSend = {
                identification: entreprise.identification,
                performanceEconomique: entreprise.performanceEconomique,
                investissementEmploi: entreprise.investissementEmploi,
                innovationDigitalisation: entreprise.innovationDigitalisation,
                conventions: entreprise.conventions,
                contact: entreprise.contact,
                description: entreprise.description,
                statut: entreprise.statut,
                informationsCompletes: entreprise.informationsCompletes
            };

            console.log('Data being sent to API:', dataToSend);

            const updatedEnt = await updateEntreprise(entreprise._id, dataToSend);
            
            console.log('Updated entreprise received:', updatedEnt);
            
            setEntreprise(updatedEnt);
            setEditing(false);
            setSuccess('✅ Informations mises à jour avec succès !');
            
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            console.error('Error saving entreprise:', err);
            console.error('Error response:', err.response);
            
            const errorMsg = err.response?.data?.message 
                || err.response?.data?.error
                || err.message 
                || 'Erreur lors de la sauvegarde des informations';
            
            setError(errorMsg);
            
            // Afficher les détails des erreurs de validation s'il y en a
            if (err.response?.data?.errors) {
                console.error('Validation errors:', err.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        fetchData();
        setError(null);
        setSuccess(null);
    };

    const updateField = (path: string, value: any) => {
        setEntreprise((prev: any) => {
            if (!prev) return prev;
            
            const keys = path.split('.');
            const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
            let current: any = newData;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            
            console.log(`Updated ${path} to:`, value);
            console.log('New entreprise state:', newData);
            
            return newData;
        });
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stack spacing={2} alignItems="center">
                    <CircularProgress size={60} />
                    <Typography variant="body1" color="text.secondary">
                        Chargement de votre profil...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    if (error && !entreprise) {
        return (
            <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                <Paper elevation={0} sx={{ p: 6, maxWidth: 500, textAlign: 'center', borderRadius: 4, border: 2, borderColor: 'error.main' }}>
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                    <Button variant="contained" onClick={fetchData}>
                        Réessayer
                    </Button>
                </Paper>
            </Box>
        );
    }

    const companyName = entreprise?.identification?.nomEntreprise || 'Mon Entreprise';

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header avec profil */}
            <Paper
                elevation={0}
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    borderRadius: 4,
                    p: 4,
                    mb: 4,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            bgcolor: 'white',
                            color: theme.palette.primary.main,
                            fontSize: '2.5rem',
                            fontWeight: 800,
                            boxShadow: `0 8px 24px ${alpha('#000', 0.3)}`
                        }}
                    >
                        {companyName.charAt(0)}
                    </Avatar>

                    <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                        <Typography variant="h3" fontWeight={800} gutterBottom>
                            {companyName}
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap" sx={{ mb: 2 }}>
                            <Chip
                                label={entreprise?.identification?.secteurActivite || 'Non défini'}
                                sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 600 }}
                            />
                            <Chip
                                label={entreprise?.identification?.region || 'Non définie'}
                                icon={<LocationOn sx={{ color: 'white !important' }} />}
                                sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', fontWeight: 600 }}
                            />
                        </Stack>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {profile?.email || 'email@example.com'}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        {!editing ? (
                            <Button
                                variant="contained"
                                startIcon={<Edit />}
                                onClick={() => setEditing(true)}
                                size="large"
                                sx={{
                                    bgcolor: 'white',
                                    color: theme.palette.primary.main,
                                    fontWeight: 700,
                                    px: 4,
                                    borderRadius: 3,
                                    '&:hover': {
                                        bgcolor: alpha('#fff', 0.9)
                                    }
                                }}
                            >
                                Modifier
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<Cancel />}
                                    onClick={handleCancel}
                                    size="large"
                                    disabled={saving}
                                    sx={{
                                        borderColor: 'white',
                                        color: 'white',
                                        fontWeight: 700,
                                        borderWidth: 2,
                                        borderRadius: 3,
                                        '&:hover': {
                                            borderColor: 'white',
                                            borderWidth: 2,
                                            bgcolor: alpha('#fff', 0.1)
                                        }
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                                    onClick={handleSave}
                                    size="large"
                                    disabled={saving}
                                    sx={{
                                        bgcolor: theme.palette.success.main,
                                        color: 'white',
                                        fontWeight: 700,
                                        px: 4,
                                        borderRadius: 3,
                                        '&:hover': {
                                            bgcolor: theme.palette.success.dark
                                        }
                                    }}
                                >
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                            </>
                        )}
                    </Stack>
                </Stack>
            </Paper>

            {/* Messages */}
            {editing && (
                <Alert
                    severity="info"
                    sx={{ 
                        mb: 3, 
                        borderRadius: 3,
                        border: 2,
                        borderColor: theme.palette.info.main,
                        bgcolor: alpha(theme.palette.info.main, 0.05)
                    }}
                >
                    <Typography variant="body2" fontWeight={600}>
                        Mode édition activé
                    </Typography>
                    <Typography variant="caption">
                        Modifiez les informations puis cliquez sur "Enregistrer" pour sauvegarder vos changements.
                    </Typography>
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    onClose={() => setSuccess(null)}
                    sx={{ 
                        mb: 3, 
                        borderRadius: 3,
                        border: 2,
                        borderColor: theme.palette.success.main,
                        bgcolor: alpha(theme.palette.success.main, 0.05)
                    }}
                >
                    <Typography variant="body2" fontWeight={600}>
                        {success}
                    </Typography>
                </Alert>
            )}

            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ 
                        mb: 3, 
                        borderRadius: 3,
                        border: 2,
                        borderColor: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.05)
                    }}
                >
                    <Typography variant="body2" fontWeight={600}>
                        {error}
                    </Typography>
                </Alert>
            )}

            {/* Tabs */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: 1, borderColor: 'divider' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.grey[500], 0.02) }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, newValue) => setTabValue(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '1rem',
                                minHeight: 64,
                                px: 3
                            }
                        }}
                    >
                        <Tab icon={<Business />} iconPosition="start" label="Identification" />
                        <Tab icon={<AttachMoney />} iconPosition="start" label="Performance Économique" />
                        <Tab icon={<People />} iconPosition="start" label="Emploi & Investissement" />
                        <Tab icon={<Lightbulb />} iconPosition="start" label="Innovation" />
                        <Tab icon={<Info />} iconPosition="start" label="Contact" />
                    </Tabs>
                </Box>

                {/* Identification */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Informations d'Identification
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Renseignez les informations de base de votre entreprise. Les champs marqués d'un * sont obligatoires.
                                </Typography>
                            </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nom de l'entreprise *"
                                    value={entreprise?.identification?.nomEntreprise || ''}
                                    onChange={(e) => updateField('identification.nomEntreprise', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Business color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Raison sociale"
                                    value={entreprise?.identification?.raisonSociale || ''}
                                    onChange={(e) => updateField('identification.raisonSociale', e.target.value)}
                                    disabled={!editing}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Région *"
                                    value={entreprise?.identification?.region || ''}
                                    onChange={(e) => updateField('identification.region', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                >
                                    {['Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'].map(region => (
                                        <MenuItem key={region} value={region}>{region}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Ville *"
                                    value={entreprise?.identification?.ville || ''}
                                    onChange={(e) => updateField('identification.ville', e.target.value)}
                                    disabled={!editing}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Secteur d'activité *"
                                    value={entreprise?.identification?.secteurActivite || ''}
                                    onChange={(e) => updateField('identification.secteurActivite', e.target.value)}
                                    disabled={!editing}
                                >
                                    {['Primaire', 'Secondaire', 'Tertiaire'].map(secteur => (
                                        <MenuItem key={secteur} value={secteur}>{secteur}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Sous-secteur *"
                                    value={entreprise?.identification?.sousSecteur || ''}
                                    onChange={(e) => updateField('identification.sousSecteur', e.target.value)}
                                    disabled={!editing}
                                >
                                    {['Agro-industriel', 'Forêt-Bois', 'Mines', 'Pétrole-Gaz', 'Industrie manufacturière', 'BTP', 'Énergie', 'Eau', 'Commerce', 'Transport', 'Télécommunications', 'Banque-Assurance', 'Tourisme', 'Santé', 'Éducation', 'Autres'].map(sous => (
                                        <MenuItem key={sous} value={sous}>{sous}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Forme juridique *"
                                    value={entreprise?.identification?.formeJuridique || ''}
                                    onChange={(e) => updateField('identification.formeJuridique', e.target.value)}
                                    disabled={!editing}
                                >
                                    {['SARL', 'SA', 'EI', 'SUARL', 'SARLU', 'SNC', 'SCS', 'SAS', 'Autres'].map(forme => (
                                        <MenuItem key={forme} value={forme}>{forme}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Numéro de contribuable *"
                                    value={entreprise?.identification?.numeroContribuable || ''}
                                    onChange={(e) => updateField('identification.numeroContribuable', e.target.value)}
                                    disabled={!editing}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Description de l'entreprise"
                                    value={entreprise?.description || ''}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    disabled={!editing}
                                    placeholder="Décrivez votre entreprise, ses activités principales..."
                                />
                            </Grid>
                        </Grid>
                        </Stack>
                    </Box>
                </TabPanel>

                {/* Performance Économique */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Performance Économique et Financière
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Renseignez vos indicateurs financiers : chiffre d'affaires, évolution, trésorerie et sources de financement.
                                </Typography>
                            </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                                    Chiffre d'Affaires
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Montant"
                                    value={entreprise?.performanceEconomique?.chiffreAffaires?.montant || ''}
                                    onChange={(e) => updateField('performanceEconomique.chiffreAffaires.montant', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AttachMoney color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Devise"
                                    value={entreprise?.performanceEconomique?.chiffreAffaires?.devise || 'FCFA'}
                                    onChange={(e) => updateField('performanceEconomique.chiffreAffaires.devise', e.target.value)}
                                    disabled={!editing}
                                >
                                    <MenuItem value="FCFA">FCFA</MenuItem>
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Période"
                                    value={entreprise?.performanceEconomique?.chiffreAffaires?.periode || ''}
                                    onChange={(e) => updateField('performanceEconomique.chiffreAffaires.periode', e.target.value)}
                                    disabled={!editing}
                                >
                                    <MenuItem value="Trimestre 1">Trimestre 1</MenuItem>
                                    <MenuItem value="Trimestre 2">Trimestre 2</MenuItem>
                                    <MenuItem value="Trimestre 3">Trimestre 3</MenuItem>
                                    <MenuItem value="Trimestre 4">Trimestre 4</MenuItem>
                                    <MenuItem value="Année complète">Année complète</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Évolution du CA"
                                    value={entreprise?.performanceEconomique?.evolutionCA || ''}
                                    onChange={(e) => updateField('performanceEconomique.evolutionCA', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <TrendingUp color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                >
                                    <MenuItem value="Hausse">Hausse</MenuItem>
                                    <MenuItem value="Baisse">Baisse</MenuItem>
                                    <MenuItem value="Stabilité">Stabilité</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Situation de trésorerie"
                                    value={entreprise?.performanceEconomique?.situationTresorerie || ''}
                                    onChange={(e) => updateField('performanceEconomique.situationTresorerie', e.target.value)}
                                    disabled={!editing}
                                >
                                    <MenuItem value="Difficile">Difficile</MenuItem>
                                    <MenuItem value="Normale">Normale</MenuItem>
                                    <MenuItem value="Aisée">Aisée</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                                    Sources de Financement
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.ressourcesPropres}
                                            onChange={(e) => updateField('performanceEconomique.sourcesFinancement.ressourcesPropres', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Ressources Propres"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.subventions}
                                            onChange={(e) => updateField('performanceEconomique.sourcesFinancement.subventions', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Subventions"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.concoursBancaires}
                                            onChange={(e) => updateField('performanceEconomique.sourcesFinancement.concoursBancaires', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Concours Bancaires"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.creditsFournisseur}
                                            onChange={(e) => updateField('performanceEconomique.sourcesFinancement.creditsFournisseur', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Crédits Fournisseur"
                                />
                            </Grid>
                        </Grid>
                        </Stack>
                    </Box>
                </TabPanel>

                {/* Emploi & Investissement */}
                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Emploi et Investissement
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Informations sur vos effectifs, créations d'emplois et types d'investissements réalisés.
                                </Typography>
                            </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Effectifs Employés *"
                                    value={entreprise?.investissementEmploi?.effectifsEmployes || ''}
                                    onChange={(e) => updateField('investissementEmploi.effectifsEmployes', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <People color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Nouveaux Emplois Créés"
                                    value={entreprise?.investissementEmploi?.nouveauxEmploisCrees || ''}
                                    onChange={(e) => updateField('investissementEmploi.nouveauxEmploisCrees', e.target.value)}
                                    disabled={!editing}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.investissementEmploi?.nouveauxInvestissementsRealises}
                                            onChange={(e) => updateField('investissementEmploi.nouveauxInvestissementsRealises', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Nouveaux Investissements Réalisés"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                                    Types d'Investissements
                                </Typography>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.investissementEmploi?.typesInvestissements?.immobiliers}
                                            onChange={(e) => updateField('investissementEmploi.typesInvestissements.immobiliers', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Immobiliers"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.investissementEmploi?.typesInvestissements?.mobiliers}
                                            onChange={(e) => updateField('investissementEmploi.typesInvestissements.mobiliers', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Mobiliers"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.investissementEmploi?.typesInvestissements?.incorporels}
                                            onChange={(e) => updateField('investissementEmploi.typesInvestissements.incorporels', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Incorporels"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.investissementEmploi?.typesInvestissements?.financiers}
                                            onChange={(e) => updateField('investissementEmploi.typesInvestissements.financiers', e.target.checked)}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Financiers"
                                />
                            </Grid>
                        </Grid>
                        </Stack>
                    </Box>
                </TabPanel>

                {/* Innovation */}
                <TabPanel value={tabValue} index={3}>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Innovation et Digitalisation
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Évaluez le niveau d'intégration de l'innovation, de l'économie numérique et de l'IA dans votre entreprise (1: Faible, 2: Moyenne, 3: Élevée).
                                </Typography>
                            </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Intégration de l'Innovation"
                                    value={entreprise?.innovationDigitalisation?.integrationInnovation || 1}
                                    onChange={(e) => updateField('innovationDigitalisation.integrationInnovation', Number(e.target.value))}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lightbulb color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                >
                                    <MenuItem value={1}>1 - Faible</MenuItem>
                                    <MenuItem value={2}>2 - Moyenne</MenuItem>
                                    <MenuItem value={3}>3 - Élevée</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Économie Numérique"
                                    value={entreprise?.innovationDigitalisation?.integrationEconomieNumerique || 1}
                                    onChange={(e) => updateField('innovationDigitalisation.integrationEconomieNumerique', Number(e.target.value))}
                                    disabled={!editing}
                                >
                                    <MenuItem value={1}>1 - Faible</MenuItem>
                                    <MenuItem value={2}>2 - Moyenne</MenuItem>
                                    <MenuItem value={3}>3 - Élevée</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Utilisation de l'IA"
                                    value={entreprise?.innovationDigitalisation?.utilisationIA || 1}
                                    onChange={(e) => updateField('innovationDigitalisation.utilisationIA', Number(e.target.value))}
                                    disabled={!editing}
                                >
                                    <MenuItem value={1}>1 - Faible</MenuItem>
                                    <MenuItem value={2}>2 - Moyenne</MenuItem>
                                    <MenuItem value={3}>3 - Élevée</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                        </Stack>
                    </Box>
                </TabPanel>

                {/* Contact */}
                <TabPanel value={tabValue} index={4}>
                    <Box sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>
                                    Informations de Contact
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Coordonnées de contact de votre entreprise : email, téléphone, site web et adresse complète.
                                </Typography>
                            </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Email *"
                                    value={entreprise?.contact?.email || ''}
                                    onChange={(e) => updateField('contact.email', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Email color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Téléphone"
                                    value={entreprise?.contact?.telephone || ''}
                                    onChange={(e) => updateField('contact.telephone', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Phone color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Site Web"
                                    value={entreprise?.contact?.siteWeb || ''}
                                    onChange={(e) => updateField('contact.siteWeb', e.target.value)}
                                    disabled={!editing}
                                    placeholder="https://www.example.com"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <WebIcon color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                                    Adresse
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Rue"
                                    value={entreprise?.contact?.adresse?.rue || ''}
                                    onChange={(e) => updateField('contact.adresse.rue', e.target.value)}
                                    disabled={!editing}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn color="action" />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Ville"
                                    value={entreprise?.contact?.adresse?.ville || ''}
                                    onChange={(e) => updateField('contact.adresse.ville', e.target.value)}
                                    disabled={!editing}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Code Postal"
                                    value={entreprise?.contact?.adresse?.codePostal || ''}
                                    onChange={(e) => updateField('contact.adresse.codePostal', e.target.value)}
                                    disabled={!editing}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Pays"
                                    value={entreprise?.contact?.adresse?.pays || 'Cameroun'}
                                    onChange={(e) => updateField('contact.adresse.pays', e.target.value)}
                                    disabled={!editing}
                                />
                            </Grid>
                        </Grid>
                        </Stack>
                    </Box>
                </TabPanel>
            </Paper>

            {/* Sticky Save Button en mode édition */}
            {editing && (
                <Paper
                    elevation={4}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        p: 2,
                        borderRadius: 4,
                        zIndex: 1000,
                        border: 2,
                        borderColor: theme.palette.success.main,
                        bgcolor: 'white'
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                            Modifications non enregistrées
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleCancel}
                            disabled={saving}
                            startIcon={<Cancel />}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="success"
                            onClick={handleSave}
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                            sx={{ fontWeight: 700 }}
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
};

export default ProfilePage;
