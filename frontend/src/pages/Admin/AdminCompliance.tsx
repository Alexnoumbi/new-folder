import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button,
    Chip,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import {
    CheckCircle,
    Warning,
    Error,
    Refresh as RefreshIcon,
    Assessment as AssessmentIcon
} from '@mui/icons-material';
import { getComplianceStatus } from '../../services/complianceService';
import { ComplianceStatus } from '../../types/compliance.types';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import entrepriseService, { Entreprise } from '../../services/entrepriseService';
import visitService, { Visit } from '../../services/visitService';

type VisitType = Visit['type'];
type VisitOutcome = NonNullable<Visit['report']>['outcome'];

const AdminCompliance: React.FC = () => {
    const [compliance, setCompliance] = useState<ComplianceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Etat gestion visites/entreprises
    const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
    const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<string>('');
    // const [enterpriseSearch, setEnterpriseSearch] = useState<string>('');
    const [visitType, setVisitType] = useState<VisitType>('REGULAR');
    const [scheduledAt, setScheduledAt] = useState<string>('');
    const [requesting, setRequesting] = useState<boolean>(false);
    const [upcomingVisits, setUpcomingVisits] = useState<Visit[]>([]);
    const [pastVisits, setPastVisits] = useState<Visit[]>([]);
    const [visitsSearch, setVisitsSearch] = useState<string>('');

    const getEnterpriseLabel = (ent: Entreprise): string => {
        const anyEnt: any = ent as any;
        const label = anyEnt?.identification?.nomEntreprise || ent.nom || ent.name || 'Nom indisponible';
        return String(label).trim();
    };

    // Etat rapport
    const [reportDialogOpen, setReportDialogOpen] = useState<boolean>(false);
    const [reportVisitId, setReportVisitId] = useState<string>('');
    const [reportContent, setReportContent] = useState<string>('');
    const [reportOutcome, setReportOutcome] = useState<VisitOutcome>('COMPLIANT');
    const [reporterName, setReporterName] = useState<string>('');
    const [enterpriseForm, setEnterpriseForm] = useState<any>({});
    const [submittingReport, setSubmittingReport] = useState<boolean>(false);

    const fetchComplianceStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getComplianceStatus();
            setCompliance(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement du statut de conformité');
            console.error('Compliance status loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Charger directement les données de conformité sans vérifier /api/health
        fetchComplianceStatus();
        // Charger la liste des entreprises
        const loadEnterprises = async () => {
            try {
                const list = await entrepriseService.getEntreprises();
                setEntreprises(list);
            } catch (e) {
                console.error('Erreur chargement entreprises', e);
            }
        };
        loadEnterprises();
    }, []);

    const reloadVisits = async (enterpriseId: string) => {
        if (!enterpriseId) return;
        try {
            const raw = await visitService.getVisitsByEnterprise(enterpriseId);
            const all: Visit[] = Array.isArray(raw)
                ? raw
                : (raw && (raw as any).data
                    ? (raw as any).data
                    : ((raw as any)?.visits || []));
            const now = Date.now();
            const upcoming = all.filter(v => v.status !== 'COMPLETED' && new Date(v.scheduledAt).getTime() >= now);
            const past = all.filter(v => v.status === 'COMPLETED' || new Date(v.scheduledAt).getTime() < now);
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
            await reloadVisits(selectedEnterpriseId);
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || 'Erreur lors de la planification de la visite';
            console.error('Erreur lors de la planification de la visite', e);
            setError(msg);
        } finally {
            setRequesting(false);
        }
    };

    const openReportDialog = (visitId: string) => {
        const v = [...upcomingVisits, ...pastVisits].find(x => x._id === visitId);
        if (v && (v.status === 'COMPLETED' || (v.report && (v.report as any).submittedAt))) {
            // Rapport déjà soumis: ne pas autoriser la modification
            return;
        }
        setReportVisitId(visitId);
        setReportContent('');
        setReportOutcome('COMPLIANT');
        setReporterName('');
        // Pré-remplir formulaire entreprise avec snapshot si dispo ou depuis la liste
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
                nomEntreprise: initial?.identification?.nomEntreprise || initial?.nom || initial?.name || '',
                raisonSociale: initial?.identification?.raisonSociale || '',
                region: initial?.identification?.region || initial?.region || '',
                ville: initial?.identification?.ville || initial?.ville || '',
                dateCreation: initial?.identification?.dateCreation || initial?.dateCreation || '',
                secteurActivite: initial?.identification?.secteurActivite || initial?.secteurActivite || '',
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
        } catch (e: any) {
            const msg = e?.response?.data?.message || e?.message || 'Erreur lors de la soumission du rapport';
            console.error('Erreur soumission rapport', e);
            setError(msg);
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
        } catch (e) {
            console.error('Erreur téléchargement PDF', e);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const getStatusColor = (score: number): 'success' | 'warning' | 'error' => {
        if (score >= 90) return 'success';
        if (score >= 70) return 'warning';
        return 'error';
    };

    const getStatusIcon = (score: number) => {
        if (score >= 90) return <CheckCircle color="success" />;
        if (score >= 70) return <Warning color="warning" />;
        return <Error color="error" />;
    };

    const breadcrumbs = [
        { label: 'Administration', href: '/admin' },
        { label: 'Conformité' }
    ];

    const headerActions = [
        {
            label: 'Actualiser',
            icon: <RefreshIcon />,
            onClick: fetchComplianceStatus,
            variant: 'outlined' as const,
            color: 'primary' as const
        },
        {
            label: 'Rapport',
            icon: <AssessmentIcon />,
            onClick: () => console.log('Générer rapport conformité'),
            variant: 'contained' as const,
            color: 'primary' as const
        }
    ];

    return (
        <Box p={3}>
            <ArgonPageHeader
                title="Conformité"
                subtitle="Gestion de la conformité réglementaire"
                breadcrumbs={breadcrumbs}
                actions={headerActions}
                onRefresh={fetchComplianceStatus}
                loading={loading}
            />

            {error && (
                <Alert
                    severity="error"
                    action={
                        <Button color="inherit" size="small" onClick={fetchComplianceStatus}>
                            Réessayer
                        </Button>
                    }
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}

            {/* Section gestion des visites et rapports */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6">Visites et Rapports d'entreprise</Typography>
                <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr auto' }, gap: 2 }}>
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
                                <TextField {...params} label="Entreprise" placeholder="Rechercher par nom" fullWidth />
                            )}
                        />
                        <FormControl fullWidth>
                            <InputLabel id="type-select-label">Type</InputLabel>
                            <Select
                                labelId="type-select-label"
                                label="Type"
                                value={visitType}
                                onChange={(e) => setVisitType(e.target.value as VisitType)}
                            >
                                <MenuItem value="REGULAR">Régulière</MenuItem>
                                <MenuItem value="FOLLOW_UP">Suivi</MenuItem>
                                <MenuItem value="EMERGENCY">Urgence</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            type="datetime-local"
                            label="Date et heure"
                            InputLabelProps={{ shrink: true }}
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button variant="contained" onClick={handleRequestVisit} disabled={!selectedEnterpriseId || !scheduledAt || requesting}>
                                Planifier
                            </Button>
                        </Box>
                    </Box>
                </Paper>

                <Paper sx={{ p: 2 }}>
                    <TextField
                        label="Rechercher visites & rapports"
                        placeholder="Date, type, statut, contenu de rapport..."
                        value={visitsSearch}
                        onChange={(e) => setVisitsSearch(e.target.value)}
                        fullWidth
                    />
                </Paper>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Visites à venir</Typography>
                        {upcomingVisits.filter(v => {
                            const q = visitsSearch.toLowerCase();
                            if (!q) return true;
                            return (
                                new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                v.type.toLowerCase().includes(q) ||
                                v.status.toLowerCase().includes(q) ||
                                (v.report?.content || '').toLowerCase().includes(q) ||
                                (v.report?.outcome || '').toLowerCase().includes(q)
                            );
                        }).length === 0 ? (
                            <Typography color="text.secondary">Aucune visite planifiée</Typography>
                        ) : (
                            upcomingVisits
                              .filter(v => {
                                  const q = visitsSearch.toLowerCase();
                                  if (!q) return true;
                                  return (
                                      new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                      v.type.toLowerCase().includes(q) ||
                                      v.status.toLowerCase().includes(q) ||
                                      (v.report?.content || '').toLowerCase().includes(q) ||
                                      (v.report?.outcome || '').toLowerCase().includes(q)
                                  );
                              })
                              .map((v) => (
                                <Box key={v._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                                    <Box>
                                        <Typography variant="body2">
                                            {new Date(v.scheduledAt).toLocaleString()} • {v.type}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(() => {
                                                const ent = (v as any)?.enterpriseId;
                                                const name = ent?.identification?.nomEntreprise || ent?.nom || ent?.name;
                                                if (name) return name;
                                                const fromList = entreprises.find(e => e._id === (typeof ent === 'string' ? ent : ent?._id));
                                                return fromList ? getEnterpriseLabel(fromList) : '';
                                            })()}
                                        </Typography>
                                        <Chip size="small" label={v.status} />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {!(v as any)?.report?.submittedAt && (
                                            <Button size="small" variant="outlined" onClick={() => openReportDialog(v._id)}>
                                                Renseigner rapport
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                              ))
                        )}
                    </Paper>

                    <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>Visites passées</Typography>
                        {pastVisits.filter(v => {
                            const q = visitsSearch.toLowerCase();
                            if (!q) return true;
                            return (
                                new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                v.type.toLowerCase().includes(q) ||
                                v.status.toLowerCase().includes(q) ||
                                (v.report?.content || '').toLowerCase().includes(q) ||
                                (v.report?.outcome || '').toLowerCase().includes(q)
                            );
                        }).length === 0 ? (
                            <Typography color="text.secondary">Aucune visite passée</Typography>
                        ) : (
                            pastVisits
                              .filter(v => {
                                  const q = visitsSearch.toLowerCase();
                                  if (!q) return true;
                                  return (
                                      new Date(v.scheduledAt).toLocaleString().toLowerCase().includes(q) ||
                                      v.type.toLowerCase().includes(q) ||
                                      v.status.toLowerCase().includes(q) ||
                                      (v.report?.content || '').toLowerCase().includes(q) ||
                                      (v.report?.outcome || '').toLowerCase().includes(q)
                                  );
                              })
                              .map((v) => (
                                <Box key={v._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #eee' }}>
                                    <Box>
                                        <Typography variant="body2">
                                            {new Date(v.scheduledAt).toLocaleString()} • {v.type}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(() => {
                                                const ent = (v as any)?.enterpriseId;
                                                const name = ent?.identification?.nomEntreprise || ent?.nom || ent?.name;
                                                if (name) return name;
                                                const fromList = entreprises.find(e => e._id === (typeof ent === 'string' ? ent : ent?._id));
                                                return fromList ? getEnterpriseLabel(fromList) : '';
                                            })()}
                                        </Typography>
                                        <Chip size="small" label={v.status} />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        {/* Pas d'édition de rapport soumis */}
                                        <Button size="small" variant="contained" onClick={() => downloadVisitPdf(v._id)}>
                                            Télécharger PDF
                                        </Button>
                                    </Box>
                                </Box>
                              ))
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Dialog rapport de visite */}
            <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Rapport de visite</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        label="Nom du rapporteur"
                        placeholder="Nom et prénom"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Contenu du rapport"
                        placeholder="Observations, constats, recommandations..."
                        value={reportContent}
                        onChange={(e) => setReportContent(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />
                    {/* Formulaire Entreprise - Identification */}
                    <Typography variant="subtitle2">Identification</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <TextField label="Nom de l'entreprise"
                            value={enterpriseForm?.identification?.nomEntreprise || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, nomEntreprise: e.target.value }
                            }))}
                        />
                        <TextField label="Raison sociale"
                            value={enterpriseForm?.identification?.raisonSociale || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, raisonSociale: e.target.value }
                            }))}
                        />
                        <TextField label="Région"
                            value={enterpriseForm?.identification?.region || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, region: e.target.value }
                            }))}
                        />
                        <TextField label="Ville"
                            value={enterpriseForm?.identification?.ville || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, ville: e.target.value }
                            }))}
                        />
                        <TextField type="date" label="Date de création" InputLabelProps={{ shrink: true }}
                            value={(enterpriseForm?.identification?.dateCreation || '').toString().slice(0,10)}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, dateCreation: e.target.value }
                            }))}
                        />
                        <TextField label="Secteur d'activité"
                            value={enterpriseForm?.identification?.secteurActivite || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, secteurActivite: e.target.value }
                            }))}
                        />
                        <TextField label="Sous-secteur"
                            value={enterpriseForm?.identification?.sousSecteur || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, sousSecteur: e.target.value }
                            }))}
                        />
                        <TextField label="Filière de production"
                            value={enterpriseForm?.identification?.filiereProduction || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, filiereProduction: e.target.value }
                            }))}
                        />
                        <TextField label="Forme juridique"
                            value={enterpriseForm?.identification?.formeJuridique || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, formeJuridique: e.target.value }
                            }))}
                        />
                        <TextField label="Numéro de contribuable"
                            value={enterpriseForm?.identification?.numeroContribuable || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                identification: { ...prev.identification, numeroContribuable: e.target.value }
                            }))}
                        />
                    </Box>
                    {/* Performance Economique */}
                    <Typography variant="subtitle2">Performance économique</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <TextField label="CA (montant)" type="number"
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
                        <TextField label="CA (devise)"
                            value={enterpriseForm?.performanceEconomique?.chiffreAffaires?.devise || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                performanceEconomique: {
                                    ...prev.performanceEconomique,
                                    chiffreAffaires: {
                                        ...(prev.performanceEconomique?.chiffreAffaires || {}),
                                        devise: e.target.value
                                    }
                                }
                            }))}
                        />
                        <TextField label="CA (période)"
                            value={enterpriseForm?.performanceEconomique?.chiffreAffaires?.periode || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                performanceEconomique: {
                                    ...prev.performanceEconomique,
                                    chiffreAffaires: {
                                        ...(prev.performanceEconomique?.chiffreAffaires || {}),
                                        periode: e.target.value
                                    }
                                }
                            }))}
                        />
                        <TextField label="Évolution CA"
                            value={enterpriseForm?.performanceEconomique?.evolutionCA || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                performanceEconomique: { ...prev.performanceEconomique, evolutionCA: e.target.value }
                            }))}
                        />
                        <TextField label="Coûts (montant)" type="number"
                            value={enterpriseForm?.performanceEconomique?.coutsProduction?.montant || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                performanceEconomique: {
                                    ...prev.performanceEconomique,
                                    coutsProduction: {
                                        ...(prev.performanceEconomique?.coutsProduction || {}),
                                        montant: Number(e.target.value)
                                    }
                                }
                            }))}
                        />
                        <TextField label="Coûts (devise)"
                            value={enterpriseForm?.performanceEconomique?.coutsProduction?.devise || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                performanceEconomique: {
                                    ...prev.performanceEconomique,
                                    coutsProduction: {
                                        ...(prev.performanceEconomique?.coutsProduction || {}),
                                        devise: e.target.value
                                    }
                                }
                            }))}
                        />
                        <TextField label="Évolution des coûts"
                            value={enterpriseForm?.performanceEconomique?.evolutionCouts || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                performanceEconomique: { ...prev.performanceEconomique, evolutionCouts: e.target.value }
                            }))}
                        />
                    </Box>
                    {/* Investissement & Emploi */}
                    <Typography variant="subtitle2">Investissement & Emploi</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <TextField label="Effectifs employés" type="number"
                            value={enterpriseForm?.investissementEmploi?.effectifsEmployes || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                investissementEmploi: { ...prev.investissementEmploi, effectifsEmployes: Number(e.target.value) }
                            }))}
                        />
                        <TextField label="Nouveaux emplois créés" type="number"
                            value={enterpriseForm?.investissementEmploi?.nouveauxEmploisCrees || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                investissementEmploi: { ...prev.investissementEmploi, nouveauxEmploisCrees: Number(e.target.value) }
                            }))}
                        />
                        <TextField label="Nouveaux investissements (oui/non)"
                            value={enterpriseForm?.investissementEmploi?.nouveauxInvestissementsRealises ? 'oui' : 'non'}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                investissementEmploi: { ...prev.investissementEmploi, nouveauxInvestissementsRealises: e.target.value === 'oui' }
                            }))}
                        />
                    </Box>
                    {/* Innovation & Digitalisation */}
                    <Typography variant="subtitle2">Innovation & Digitalisation</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <TextField label="Intégration innovation (1-3)" type="number"
                            value={enterpriseForm?.innovationDigitalisation?.integrationInnovation || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                innovationDigitalisation: { ...prev.innovationDigitalisation, integrationInnovation: Number(e.target.value) }
                            }))}
                        />
                        <TextField label="Économie numérique (1-3)" type="number"
                            value={enterpriseForm?.innovationDigitalisation?.integrationEconomieNumerique || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                innovationDigitalisation: { ...prev.innovationDigitalisation, integrationEconomieNumerique: Number(e.target.value) }
                            }))}
                        />
                        <TextField label="Utilisation IA (1-3)" type="number"
                            value={enterpriseForm?.innovationDigitalisation?.utilisationIA || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                innovationDigitalisation: { ...prev.innovationDigitalisation, utilisationIA: Number(e.target.value) }
                            }))}
                        />
                    </Box>
                    {/* Conventions */}
                    <Typography variant="subtitle2">Conventions</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                        <TextField label="Atteinte cibles investissement (%)" type="number"
                            value={enterpriseForm?.conventions?.atteinteCiblesInvestissement || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                conventions: { ...prev.conventions, atteinteCiblesInvestissement: Number(e.target.value) }
                            }))}
                        />
                        <TextField label="Atteinte cibles emploi (%)" type="number"
                            value={enterpriseForm?.conventions?.atteinteCiblesEmploi || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                conventions: { ...prev.conventions, atteinteCiblesEmploi: Number(e.target.value) }
                            }))}
                        />
                        <TextField label="Niveau conformité (1-5)" type="number"
                            value={enterpriseForm?.conventions?.conformiteNormesSpecifiques?.niveauConformite || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                conventions: {
                                    ...prev.conventions,
                                    conformiteNormesSpecifiques: {
                                        ...(prev.conventions?.conformiteNormesSpecifiques || {}),
                                        niveauConformite: Number(e.target.value)
                                    }
                                }
                            }))}
                        />
                    </Box>
                    {/* Contact */}
                    <Typography variant="subtitle2">Contact</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                        <TextField label="Email"
                            value={enterpriseForm?.contact?.email || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                contact: { ...prev.contact, email: e.target.value }
                            }))}
                        />
                        <TextField label="Téléphone"
                            value={enterpriseForm?.contact?.telephone || ''}
                            onChange={(e) => setEnterpriseForm((prev: any) => ({
                                ...prev,
                                contact: { ...prev.contact, telephone: e.target.value }
                            }))}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReportDialogOpen(false)}>Annuler</Button>
                    <Button onClick={submitReport} variant="contained" disabled={submittingReport || !reportContent || !reporterName}>
                        {submittingReport ? 'Envoi...' : 'Enregistrer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AdminCompliance;
