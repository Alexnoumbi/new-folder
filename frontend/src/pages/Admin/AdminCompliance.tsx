import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Chip,
    LinearProgress,
    Paper,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardContent,
    Stack,
    useTheme,
    alpha,
    IconButton,
    Tooltip,
    Snackbar,
    InputAdornment,
    Divider,
    Stepper,
    Step,
    StepLabel,
    Badge
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import { Autocomplete } from '@mui/material';
import {
    CheckCircle,
    Warning,
    Error,
    Refresh as RefreshIcon,
    Assessment as AssessmentIcon,
    Download,
    Add,
    Event,
    Business,
    Description,
    TrendingUp,
    TrendingDown,
    Schedule,
    CheckCircleOutline,
    WatchLater,
    ErrorOutline,
    Search,
    BarChart,
    Timeline as TimelineIcon,
    Edit,
    Visibility,
    Close,
    PictureAsPdf
} from '@mui/icons-material';
import {
    PieChart,
    Pie,
    Cell,
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { getComplianceStatus } from '../../services/complianceService';
import { ComplianceStatus } from '../../types/compliance.types';
import entrepriseService, { Entreprise } from '../../services/entrepriseService';
import visitService, { Visit } from '../../services/visitService';
import api from '../../services/api';

type VisitType = Visit['type'];
type VisitOutcome = NonNullable<Visit['report']>['outcome'];

const AdminCompliance: React.FC = () => {
    const theme = useTheme();
    const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState({ compliance: false, visits: false, entreprises: false });
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });

    // États pour les visites
    const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
    const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>('');
    const [visitType, setVisitType] = useState<VisitType>('REGULAR');
    const [scheduledAt, setScheduledAt] = useState<string>('');
    const [requesting, setRequesting] = useState<boolean>(false);
    const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([]);
    const [pastVisits, setPastVisits] = useState<Visit[]>([]);
    const [visitsSearch, setVisitsSearch] = useState<string>('');
    const [currentView, setCurrentView] = useState<'overview' | 'visits' | 'reports'>('overview');

    // États pour le dialogue de rapport
    const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
    const [reportVisitId, setReportVisitId] = useState<string>('');
    const [reportContent, setReportContent] = useState<string>('');
    const [reportOutcome, setReportOutcome] = useState<'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_FOLLOW_UP'>('COMPLIANT');
    const [reporterName, setReporterName] = useState<string>('');
    const [enterpriseForm, setEnterpriseForm] = useState<any>({});
    const [submittingReport, setSubmittingReport] = useState<boolean>(false);
    const [reportStep, setReportStep] = useState(0);

    const getEnterpriseLabel = (ent: Entreprise): string => {
        const anyEnt: any = ent as any;
        return anyEnt?.identification?.nomEntreprise || ent.nom || ent.name || 'Nom indisponible';
    };

    const fetchComplianceStatus = async () => {
        try {
            console.time('Fetch Compliance');
            setLoadingProgress(prev => ({ ...prev, compliance: true }));
            setError(null);
            
            const data = await getComplianceStatus();
            setCompliance(data);
            console.log('✅ Compliance status loaded:', data);
            console.timeEnd('Fetch Compliance');
        } catch (err: any) {
            console.error('❌ Compliance status loading error:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoadingProgress(prev => ({ ...prev, compliance: false }));
        }
    };

    const loadAllVisits = async () => {
        try {
            console.time('Fetch All Visits');
            setLoadingProgress(prev => ({ ...prev, visits: true }));
            
            const response = await api.get('/visites/all');
            const allVisits: Visit[] = response.data.data || response.data || [];
            
            // Une visite est "à venir" si elle n'est pas complétée (peu importe la date)
            // Une visite est "passée" seulement si elle est marquée comme COMPLETED
            const upcoming = allVisits.filter(v => v.status !== 'COMPLETED');
            const past = allVisits.filter(v => v.status === 'COMPLETED');
            
            setUpcomingVisits(upcoming);
            setPastVisits(past);
            console.log(`✅ Loaded ${allVisits.length} visits (${upcoming.length} upcoming, ${past.length} past)`);
            console.timeEnd('Fetch All Visits');
        } catch (e) {
            console.error('❌ Erreur chargement visites:', e);
            // Continuer même en cas d'erreur
        } finally {
            setLoadingProgress(prev => ({ ...prev, visits: false }));
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            console.log('🚀 Starting Compliance Page Load...');
            console.time('⏱️ Total Page Load Time');
            
            try {
                // Charger en parallèle pour optimiser les performances
                await Promise.all([
                    fetchComplianceStatus(),
                    loadAllVisits(),
                    // Charger les entreprises en mode LIGHT (seulement ID et nom)
                    (async () => {
                        console.time('Fetch Entreprises');
                        setLoadingProgress(prev => ({ ...prev, entreprises: true }));
                        try {
                            const response = await api.get('/entreprises?light=true');
                            const list = response.data.data || response.data || [];
                setEntreprises(list);
                            console.log(`✅ Loaded ${list.length} entreprises (light mode)`);
                            console.timeEnd('Fetch Entreprises');
            } catch (e) {
                            console.error('❌ Erreur chargement entreprises', e);
                        } finally {
                            setLoadingProgress(prev => ({ ...prev, entreprises: false }));
                        }
                    })()
                ]);
                
                console.timeEnd('⏱️ Total Page Load Time');
                console.log('✅ Page Compliance loaded successfully');
            } catch (error) {
                console.error('❌ Error loading page:', error);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, []);

    const reloadVisits = async (enterpriseId: string) => {
        if (!enterpriseId) return;
        try {
            const raw = await visitService.getVisitsByEnterprise(enterpriseId);
            const all: Visit[] = Array.isArray(raw) ? raw : (raw as any)?.data || (raw as any)?.visits || [];
            
            // Même logique: à venir si pas COMPLETED, passée si COMPLETED
            const upcoming = all.filter(v => v.status !== 'COMPLETED');
            const past = all.filter(v => v.status === 'COMPLETED');
            setUpcomingVisits(upcoming);
            setPastVisits(past);
        } catch (e) {
            console.error('Erreur chargement visites', e);
        }
    };

    const handleEnterpriseChange = async (id: string) => {
        setSelectedEnterpriseId(id);
        await reloadVisits(id);
    };

    const handleRequestVisit = async () => {
        if (!selectedEnterpriseId || !scheduledAt) return;
        try {
            setRequesting(true);
            await visitService.requestVisit({
                enterpriseId: selectedEnterpriseId,
                scheduledAt: new Date(scheduledAt),
                type: visitType
            });
            // Recharger toutes les visites pour mettre à jour la liste globale
            await loadAllVisits();
            await reloadVisits(selectedEnterpriseId);
            setSnackbar({ 
                open: true, 
                message: '✅ Visite planifiée avec succès ! L\'entreprise la verra sur son calendrier.', 
                severity: 'success' 
            });
            setScheduledAt('');
        } catch (e: any) {
            setSnackbar({ 
                open: true, 
                message: e?.response?.data?.message || 'Erreur lors de la planification', 
                severity: 'error' 
            });
        } finally {
            setRequesting(false);
        }
    };

    const openReportDialog = (visitId: string) => {
        const v = [...upcomingVisits, ...pastVisits].find(x => x._id === visitId);
        if (v && (v.status === 'COMPLETED' || (v.report as any)?.submittedAt)) return;
        
        setReportVisitId(visitId);
        setReportContent('');
        setReportOutcome('COMPLIANT');
        setReporterName('');
        setReportStep(0);
        
        let initial: any = {};
        const entObj = (v as any)?.enterpriseId;
        if (entObj && typeof entObj === 'object') {
            initial = entObj;
        } else if (selectedEnterpriseId) {
            const fromList = entreprises.find(e => e._id === selectedEnterpriseId);
            if (fromList) initial = fromList;
        }
        
        setEnterpriseForm({
            identification: {
                nomEntreprise: initial?.identification?.nomEntreprise || initial?.nom || '',
                raisonSociale: initial?.identification?.raisonSociale || '',
                region: initial?.identification?.region || '',
                ville: initial?.identification?.ville || '',
                dateCreation: initial?.identification?.dateCreation || '',
                secteurActivite: initial?.identification?.secteurActivite || '',
                sousSecteur: initial?.identification?.sousSecteur || '',
                filiereProduction: initial?.identification?.filiereProduction || '',
                formeJuridique: initial?.identification?.formeJuridique || '',
                numeroContribuable: initial?.identification?.numeroContribuable || ''
            },
            performanceEconomique: initial?.performanceEconomique || {},
            investissementEmploi: initial?.investissementEmploi || {},
            innovationDigitalisation: initial?.innovationDigitalisation || {},
            conventions: initial?.conventions || {},
            contact: initial?.contact || {},
            statut: initial?.statut || '',
            informationsCompletes: initial?.informationsCompletes || false,
            description: initial?.description || ''
        });
        setReportDialogOpen(true);
    };

    const submitReport = async () => {
        if (!reportVisitId) return;
        try {
            setSubmittingReport(true);
            await visitService.submitVisitReport(reportVisitId, {
                content: reportContent,
                outcome: reportOutcome,
                reporterName: reporterName,
                enterpriseData: enterpriseForm
            });
            setReportDialogOpen(false);
            await reloadVisits(selectedEnterpriseId);
            setSnackbar({ open: true, message: 'Rapport soumis avec succès', severity: 'success' });
        } catch (e: any) {
            setSnackbar({ 
                open: true, 
                message: e?.response?.data?.message || 'Erreur lors de la soumission', 
                severity: 'error' 
            });
        } finally {
            setSubmittingReport(false);
        }
    };

    const downloadVisitPdf = async (visitId: string) => {
        try {
            const blob = await visitService.downloadVisitReport(visitId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport_visite_${visitId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setSnackbar({ open: true, message: 'Téléchargement démarré', severity: 'success' });
        } catch (e) {
            setSnackbar({ open: true, message: 'Erreur lors du téléchargement', severity: 'error' });
        }
    };

    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Stack spacing={3} alignItems="center">
                    <CircularProgress size={60} />
                    <Typography variant="h6" color="text.secondary">
                        Chargement des données...
                    </Typography>
                    <Stack spacing={1} sx={{ width: 300 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                                Conformité
                            </Typography>
                            {loadingProgress.compliance ? (
                                <CircularProgress size={16} />
                            ) : (
                                <CheckCircle fontSize="small" color="success" />
                            )}
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                                Visites
                            </Typography>
                            {loadingProgress.visits ? (
                                <CircularProgress size={16} />
                            ) : (
                                <CheckCircle fontSize="small" color="success" />
                            )}
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                                Entreprises
                            </Typography>
                            {loadingProgress.entreprises ? (
                                <CircularProgress size={16} />
                            ) : (
                                <CheckCircle fontSize="small" color="success" />
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </Container>
        );
    }

    const getTypeColor = (type: VisitType) => {
        const colors: Record<VisitType, any> = {
            REGULAR: 'primary',
            FOLLOW_UP: 'info',
            EMERGENCY: 'error'
        };
        return colors[type] || 'default';
    };

    const getOutcomeColor = (outcome: string) => {
        const colors: Record<string, any> = {
            COMPLIANT: 'success',
            NON_COMPLIANT: 'error',
            NEEDS_FOLLOW_UP: 'warning',
            PARTIALLY_COMPLIANT: 'warning'
        };
        return colors[outcome] || 'default';
    };

    const visitStats = {
        total: upcomingVisits.length + pastVisits.length,
        upcoming: upcomingVisits.length,
        completed: pastVisits.filter(v => v.status === 'COMPLETED').length,
        pending: upcomingVisits.filter(v => v.status === 'SCHEDULED').length
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={3}>
                    <Box>
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            gutterBottom
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            Conformité & Visites
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Gestion de la conformité réglementaire et suivi des visites terrain
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        <Tooltip title="Actualiser">
                            <IconButton
                                onClick={fetchComplianceStatus}
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                }}
                            >
                                <RefreshIcon color="primary" />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => setSnackbar({ open: true, message: 'Export en cours...', severity: 'info' })}
                            sx={{ borderRadius: 2 }}
                        >
                            Exporter
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            size="large"
                            onClick={() => setCurrentView('visits')}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}
                        >
                            Planifier Visite
                        </Button>
                    </Stack>
                </Stack>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Navigation Tabs */}
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Button
                        variant={currentView === 'overview' ? 'contained' : 'outlined'}
                        startIcon={<AssessmentIcon />}
                        onClick={() => setCurrentView('overview')}
                        sx={{ borderRadius: 2 }}
                    >
                        Vue d'ensemble
                    </Button>
                    <Button
                        variant={currentView === 'visits' ? 'contained' : 'outlined'}
                        startIcon={<Event />}
                        onClick={() => setCurrentView('visits')}
                        sx={{ borderRadius: 2 }}
                    >
                        Visites
                    </Button>
                    <Button
                        variant={currentView === 'reports' ? 'contained' : 'outlined'}
                        startIcon={<Description />}
                        onClick={() => setCurrentView('reports')}
                        sx={{ borderRadius: 2 }}
                    >
                        Rapports
                    </Button>
                </Stack>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="start">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Visites Total
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="primary.main">
                                            {visitStats.total}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                                        }}
                                    >
                                        <Event sx={{ color: 'primary.main' }} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="start">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            À venir
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="info.main">
                                            {visitStats.upcoming}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.info.main, 0.1)
                                        }}
                                    >
                                        <Schedule sx={{ color: 'info.main' }} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="start">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            Complétées
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="success.main">
                                            {visitStats.completed}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.success.main, 0.1)
                                        }}
                                    >
                                        <CheckCircleOutline sx={{ color: 'success.main' }} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ borderRadius: 3, border: 1, borderColor: 'divider' }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="start">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            En attente
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="warning.main">
                                            {visitStats.pending}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.warning.main, 0.1)
                                        }}
                                    >
                                        <WatchLater sx={{ color: 'warning.main' }} />
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Vue Overview */}
            {currentView === 'overview' && (
                <Grid container spacing={3}>
                    {/* Graphique des visites par type */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Répartition par Type
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {
                                                    name: 'Régulières',
                                                    value: [...upcomingVisits, ...pastVisits].filter(v => v.type === 'REGULAR').length
                                                },
                                                {
                                                    name: 'Suivi',
                                                    value: [...upcomingVisits, ...pastVisits].filter(v => v.type === 'FOLLOW_UP').length
                                                },
                                                {
                                                    name: 'Urgence',
                                                    value: [...upcomingVisits, ...pastVisits].filter(v => v.type === 'EMERGENCY').length
                                                }
                                            ].filter(item => item.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {COLORS.map((color, index) => (
                                                <Cell key={`cell-${index}`} fill={color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Statut des rapports */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    Statut des Rapports
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <ReBarChart
                                        data={[
                                            {
                                                name: 'Conforme',
                                                value: pastVisits.filter(v => v.report?.outcome === 'COMPLIANT').length
                                            },
                                            {
                                                name: 'À Suivre',
                                                value: pastVisits.filter(v => v.report?.outcome === 'NEEDS_FOLLOW_UP').length
                                            },
                                            {
                                                name: 'Non Conforme',
                                                value: pastVisits.filter(v => v.report?.outcome === 'NON_COMPLIANT').length
                                            }
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Bar dataKey="value" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Prochaines visites */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight={700}>
                                        Prochaines Visites
                                    </Typography>
                                    <Button
                                        size="small"
                                        onClick={() => setCurrentView('visits')}
                                        endIcon={<TimelineIcon />}
                                    >
                                        Voir tout
                        </Button>
                                </Stack>
                                <Stack spacing={2}>
                                    {upcomingVisits.slice(0, 5).map((visit) => (
                                        <Paper
                                            key={visit._id}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                border: 1,
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    boxShadow: theme.shadows[4],
                                                    borderColor: 'primary.main'
                                                }
                                            }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                                                    <Box
                                                        sx={{
                                                            p: 1.5,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                                                        }}
                                                    >
                                                        <Event color="primary" />
                                                    </Box>
                                                    <Box flex={1}>
                                                        <Typography variant="body1" fontWeight={600}>
                                                            {(() => {
                                                                const ent = (visit as any)?.enterpriseId;
                                                                const name = ent?.identification?.nomEntreprise || ent?.nom || ent?.name;
                                                                if (name) return name;
                                                                const fromList = entreprises.find(e => e._id === (typeof ent === 'string' ? ent : ent?._id));
                                                                return fromList ? getEnterpriseLabel(fromList) : 'Entreprise';
                                                            })()}
                                                        </Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(visit.scheduledAt).toLocaleString('fr-FR')}
                                                            </Typography>
                                                            <Chip
                                                                label={visit.type}
                                                                size="small"
                                                                color={getTypeColor(visit.type)}
                                                            />
                                                            <Chip
                                                                label={visit.status}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </Stack>
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" spacing={1}>
                                                    {!(visit as any)?.report?.submittedAt && (
                                                        <Tooltip title="Ajouter rapport">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => openReportDialog(visit._id)}
                                                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    ))}
                                    {upcomingVisits.length === 0 && (
                                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                                            Aucune visite planifiée pour le moment
                </Alert>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Vue Visites */}
            {currentView === 'visits' && (
                <Stack spacing={3}>
                    {/* Formulaire de planification */}
                    <Card sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Planifier une Visite
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={entreprises}
                            getOptionLabel={(ent) => getEnterpriseLabel(ent)}
                            isOptionEqualToValue={(option, value) => option?._id === value?._id}
                            value={entreprises.find(e => e._id === selectedEnterpriseId) || null}
                            onChange={(event, value) => handleEnterpriseChange(value ? value._id : '')}
                            renderOption={(props, option) => (
                                <li {...props} key={option._id}>
                                    {getEnterpriseLabel(option)}
                                </li>
                            )}
                            renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Entreprise"
                                                placeholder="Rechercher..."
                                                InputProps={{
                                                    ...params.InputProps,
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <Business />
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                                        <InputLabel>Type de visite</InputLabel>
                            <Select
                                value={visitType}
                                            label="Type de visite"
                                onChange={(e) => setVisitType(e.target.value as VisitType)}
                            >
                                <MenuItem value="REGULAR">Régulière</MenuItem>
                                <MenuItem value="FOLLOW_UP">Suivi</MenuItem>
                                <MenuItem value="EMERGENCY">Urgence</MenuItem>
                            </Select>
                        </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                        <TextField
                                        fullWidth
                            type="datetime-local"
                            label="Date et heure"
                            InputLabelProps={{ shrink: true }}
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleRequestVisit}
                                        disabled={!selectedEnterpriseId || !scheduledAt || requesting}
                                        sx={{ height: '56px', borderRadius: 2 }}
                                    >
                                        {requesting ? 'En cours...' : 'Planifier'}
                            </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Recherche */}
                    <TextField
                        fullWidth
                        placeholder="Rechercher dans les visites..."
                        value={visitsSearch}
                        onChange={(e) => setVisitsSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.05) }
                        }}
                    />

                    {/* Liste des visites */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>
                                        Visites à Venir ({upcomingVisits.length})
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack spacing={2}>
                                        {upcomingVisits
                              .filter(v => {
                                                if (!visitsSearch) return true;
                                  const q = visitsSearch.toLowerCase();
                                  return (
                                      new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                      v.type.toLowerCase().includes(q) ||
                                                    v.status.toLowerCase().includes(q)
                                                );
                                            })
                                            .map((visit) => (
                                                <Paper
                                                    key={visit._id}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            boxShadow: theme.shadows[4],
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}
                                                >
                                                    <Stack spacing={1}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                                                            <Typography variant="body2" fontWeight={600}>
                                            {(() => {
                                                                    const ent = (visit as any)?.enterpriseId;
                                                const name = ent?.identification?.nomEntreprise || ent?.nom || ent?.name;
                                                if (name) return name;
                                                const fromList = entreprises.find(e => e._id === (typeof ent === 'string' ? ent : ent?._id));
                                                                    return fromList ? getEnterpriseLabel(fromList) : 'Entreprise';
                                            })()}
                                        </Typography>
                                                            <Chip
                                                                label={visit.type}
                                                                size="small"
                                                                color={getTypeColor(visit.type)}
                                                            />
                                                        </Stack>
                                                        <Typography variant="caption" color="text.secondary">
                                                            📅 {new Date(visit.scheduledAt).toLocaleString('fr-FR')}
                                                        </Typography>
                                                        <Chip
                                                            label={visit.status}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ width: 'fit-content' }}
                                                        />
                                                        <Stack direction="row" spacing={1} mt={1}>
                                                            {!(visit as any)?.report?.submittedAt && (
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    startIcon={<Edit />}
                                                                    onClick={() => openReportDialog(visit._id)}
                                                                >
                                                                    Renseigner Rapport
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<CheckCircle />}
                                                                onClick={async () => {
                                                                    try {
                                                                        await visitService.updateVisitStatus(
                                                                            visit._id,
                                                                            'COMPLETED',
                                                                            'Marquée comme terminée'
                                                                        );
                                                                        await loadAllVisits();
                                                                        setSnackbar({ 
                                                                            open: true, 
                                                                            message: 'Visite marquée comme terminée', 
                                                                            severity: 'success' 
                                                                        });
                                                                    } catch (e) {
                                                                        setSnackbar({ 
                                                                            open: true, 
                                                                            message: 'Erreur lors de la mise à jour', 
                                                                            severity: 'error' 
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                Marquer Terminée
                                                            </Button>
                                                        </Stack>
                                                    </Stack>
                    </Paper>
                                            ))}
                                        {upcomingVisits.filter(v => {
                                            if (!visitsSearch) return true;
                            const q = visitsSearch.toLowerCase();
                            return (
                                new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                                v.type.toLowerCase().includes(q)
                                            );
                                        }).length === 0 && (
                                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                Aucune visite à venir
                                            </Alert>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>
                                        Visites Passées ({pastVisits.length})
                                    </Typography>
                                    <Divider sx={{ my: 2 }} />
                                    <Stack spacing={2}>
                                        {pastVisits
                              .filter(v => {
                                                if (!visitsSearch) return true;
                                  const q = visitsSearch.toLowerCase();
                                  return (
                                      new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                      v.type.toLowerCase().includes(q) ||
                                      (v.report?.outcome || '').toLowerCase().includes(q)
                                  );
                              })
                                            .map((visit) => (
                                                <Paper
                                                    key={visit._id}
                                                    sx={{
                                                        p: 2,
                                                        borderRadius: 2,
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        transition: 'all 0.2s',
                                                        '&:hover': {
                                                            boxShadow: theme.shadows[4],
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}
                                                >
                                                    <Stack spacing={1}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {(() => {
                                                                    const ent = (visit as any)?.enterpriseId;
                                                                    const name = ent?.identification?.nomEntreprise || ent?.nom || ent?.name;
                                                                    if (name) return name;
                                                                    const fromList = entreprises.find(e => e._id === (typeof ent === 'string' ? ent : ent?._id));
                                                                    return fromList ? getEnterpriseLabel(fromList) : 'Entreprise';
                                                                })()}
                                        </Typography>
                                                            {visit.report?.outcome && (
                                                                <Chip
                                                                    label={visit.report.outcome}
                                                                    size="small"
                                                                    color={getOutcomeColor(visit.report.outcome)}
                                                                />
                                                            )}
                                                        </Stack>
                                        <Typography variant="caption" color="text.secondary">
                                                            📅 {new Date(visit.scheduledAt).toLocaleString('fr-FR')}
                                                        </Typography>
                                                        <Chip
                                                            label={visit.type}
                                                            size="small"
                                                            color={getTypeColor(visit.type)}
                                                            sx={{ width: 'fit-content' }}
                                                        />
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<PictureAsPdf />}
                                                            onClick={() => downloadVisitPdf(visit._id)}
                                                            sx={{ mt: 1 }}
                                                        >
                                                            Télécharger PDF
                                                        </Button>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        {pastVisits.filter(v => {
                                            if (!visitsSearch) return true;
                                            const q = visitsSearch.toLowerCase();
                                            return (
                                                new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                                v.type.toLowerCase().includes(q)
                                            );
                                        }).length === 0 && (
                                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                                Aucune visite passée
                                            </Alert>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Stack>
            )}

            {/* Vue Rapports */}
            {currentView === 'reports' && (
                <Card sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Rapports de Visite
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2}>
                            {pastVisits
                                .filter(v => v.report?.content)
                                .map((visit) => (
                                    <Paper
                                        key={visit._id}
                                        sx={{
                                            p: 3,
                                            borderRadius: 2,
                                            border: 1,
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={8}>
                                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                            {(() => {
                                                        const ent = (visit as any)?.enterpriseId;
                                                const name = ent?.identification?.nomEntreprise || ent?.nom || ent?.name;
                                                if (name) return name;
                                                const fromList = entreprises.find(e => e._id === (typeof ent === 'string' ? ent : ent?._id));
                                                        return fromList ? getEnterpriseLabel(fromList) : 'Entreprise';
                                            })()}
                                        </Typography>
                                                <Typography variant="body2" color="text.secondary" paragraph>
                                                    {visit.report?.content}
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    <Chip
                                                        label={new Date(visit.scheduledAt).toLocaleDateString('fr-FR')}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={visit.type}
                                                        size="small"
                                                        color={getTypeColor(visit.type)}
                                                    />
                                                    {visit.report?.outcome && (
                                                        <Chip
                                                            label={visit.report.outcome}
                                                            size="small"
                                                            color={getOutcomeColor(visit.report.outcome)}
                                                        />
                                                    )}
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Stack spacing={2}>
                                                    {(visit.report as any)?.reporterName && (
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Rapporteur
                                                            </Typography>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {(visit.report as any).reporterName}
                                                            </Typography>
                                    </Box>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<PictureAsPdf />}
                                                        onClick={() => downloadVisitPdf(visit._id)}
                                                        fullWidth
                                                    >
                                            Télécharger PDF
                                        </Button>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                    </Paper>
                                ))}
                            {pastVisits.filter(v => v.report?.content).length === 0 && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Aucun rapport disponible pour le moment
                                </Alert>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            )}

            {/* Dialog Rapport de Visite - Modernisé avec Stepper */}
            <Dialog
                open={reportDialogOpen}
                onClose={() => setReportDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                            Rapport de Visite
                        </Typography>
                        <IconButton onClick={() => setReportDialogOpen(false)} size="small">
                            <Close />
                        </IconButton>
                    </Stack>
                </DialogTitle>
                <Stepper activeStep={reportStep} sx={{ px: 3, pt: 2 }}>
                    <Step>
                        <StepLabel>Informations Générales</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Données Entreprise</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Validation</StepLabel>
                    </Step>
                </Stepper>
                <DialogContent>
                    {reportStep === 0 && (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                                fullWidth
                        label="Nom du rapporteur"
                        placeholder="Nom et prénom"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Résultat de la visite</InputLabel>
                                <Select
                                    value={reportOutcome}
                                    label="Résultat de la visite"
                                    onChange={(e) => setReportOutcome(e.target.value as any)}
                                >
                                    <MenuItem value="COMPLIANT">Conforme</MenuItem>
                                    <MenuItem value="NEEDS_FOLLOW_UP">Nécessite un Suivi</MenuItem>
                                    <MenuItem value="NON_COMPLIANT">Non Conforme</MenuItem>
                                </Select>
                            </FormControl>
                    <TextField
                                fullWidth
                        label="Contenu du rapport"
                        placeholder="Observations, constats, recommandations..."
                        value={reportContent}
                        onChange={(e) => setReportContent(e.target.value)}
                        multiline
                                minRows={6}
                            />
                        </Stack>
                    )}

                    {reportStep === 1 && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Identification
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Nom de l'entreprise"
                            value={enterpriseForm?.identification?.nomEntreprise || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, nomEntreprise: e.target.value }
                            }))}
                        />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Raison sociale"
                            value={enterpriseForm?.identification?.raisonSociale || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, raisonSociale: e.target.value }
                            }))}
                        />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Région"
                            value={enterpriseForm?.identification?.region || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, region: e.target.value }
                            }))}
                        />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Ville"
                            value={enterpriseForm?.identification?.ville || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, ville: e.target.value }
                            }))}
                        />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Secteur d'activité"
                            value={enterpriseForm?.identification?.secteurActivite || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, secteurActivite: e.target.value }
                            }))}
                        />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Forme juridique"
                            value={enterpriseForm?.identification?.formeJuridique || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, formeJuridique: e.target.value }
                            }))}
                        />
                                </Grid>
                            </Grid>

                            <Divider />

                            <Typography variant="subtitle1" fontWeight={600}>
                                Performance & Emploi
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Effectifs employés"
                                        type="number"
                                        value={enterpriseForm?.investissementEmploi?.effectifsEmployes || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                            investissementEmploi: {
                                                ...prev.investissementEmploi,
                                                effectifsEmployes: Number(e.target.value)
                                }
                            }))}
                        />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Nouveaux emplois"
                                        type="number"
                                        value={enterpriseForm?.investissementEmploi?.nouveauxEmploisCrees || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                            investissementEmploi: {
                                                ...prev.investissementEmploi,
                                                nouveauxEmploisCrees: Number(e.target.value)
                                }
                            }))}
                        />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="CA (montant)"
                                        type="number"
                                        value={enterpriseForm?.performanceEconomique?.chiffreAffaires?.montant || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                performanceEconomique: {
                                    ...prev.performanceEconomique,
                                    chiffreAffaires: {
                                        ...(prev.performanceEconomique?.chiffreAffaires || {}),
                                        montant: Number(e.target.value)
                                    }
                                }
                            }))}
                        />
                                </Grid>
                            </Grid>
                        </Stack>
                    )}

                    {reportStep === 2 && (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                Vérifiez les informations avant de soumettre le rapport
                            </Alert>
                            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Résumé
                                </Typography>
                                <Stack spacing={1}>
                                    <Typography variant="body2">
                                        <strong>Rapporteur:</strong> {reporterName || 'Non renseigné'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Résultat:</strong> {reportOutcome}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Entreprise:</strong> {enterpriseForm?.identification?.nomEntreprise || 'Non renseigné'}
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportDialogOpen(false)}>
                        Annuler
                    </Button>
                    {reportStep > 0 && (
                        <Button onClick={() => setReportStep(reportStep - 1)}>
                            Précédent
                        </Button>
                    )}
                    {reportStep < 2 ? (
                        <Button
                            variant="contained"
                            onClick={() => setReportStep(reportStep + 1)}
                            disabled={reportStep === 0 && (!reporterName || !reportContent)}
                        >
                            Suivant
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={submitReport}
                            disabled={submittingReport}
                        >
                            {submittingReport ? 'Envoi...' : 'Soumettre'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%', borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminCompliance;
