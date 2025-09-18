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
    Button
} from '@mui/material';
import {
    Edit,
    Save,
    Cancel,
    Refresh,
    Person,
    Email,
    Phone,
    Business,
    Security,
    Palette,
    Language
} from '@mui/icons-material';
import { getUserById, updateUser } from '../../services/userService';
import { pollingService } from '../../services/pollingService';
import type { User, UserUpdateData } from '../../types/user.types';
import ArgonPageHeader from '../../components/Argon/ArgonPageHeader';
import ArgonCard from '../../components/Argon/ArgonCard';
import { useAuth } from '../../hooks/useAuth';
import { getEntreprise, updateEntreprise } from '../../services/entrepriseService';

const ProfilePage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<UserUpdateData>({
        preferences: {
            darkMode: false,
            language: 'fr'
        }
    });

    // Entreprise state
    const [entrepriseId, setEntrepriseId] = useState<string | null>(null);
    const [entreprise, setEntreprise] = useState<any | null>(null);
    const [entrepriseLoading, setEntrepriseLoading] = useState<boolean>(false);

    const fetchEntreprise = useCallback(async (id: string) => {
        try {
            setEntrepriseLoading(true);
            const data = await getEntreprise(id);
            setEntreprise(data);
        } catch (e) {
            // Ignorer pour ne pas bloquer le profil
        } finally {
            setEntrepriseLoading(false);
        }
    }, []);

    const fetchProfile = useCallback(async () => {
        if (!currentUser?.id) return;
        try {
            setLoading(true);
            const data = await getUserById(currentUser.id);
            setProfile(data);
            setFormData(data);
            const entId = (data as any).entrepriseId || null;
            setEntrepriseId(entId);
            if (entId) {
                fetchEntreprise(entId);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement du profil');
        } finally {
            setLoading(false);
        }
    }, [currentUser, fetchEntreprise]);

    useEffect(() => {
        // Initial fetch
        fetchProfile();

        // Start polling for updates
        pollingService.startPolling('profile', fetchProfile, {
            interval: 30000, // Poll every 30 seconds
            onError: (error) => {
                console.error('Error polling profile:', error);
                setError('Erreur lors de la mise à jour automatique du profil');
            }
        });

        // Cleanup on unmount
        return () => {
            pollingService.stopPolling('profile');
        };
    }, [fetchProfile]);

    const handleSubmit = async () => {
        if (!profile?.id) return;
        try {
            setSaving(true);
            const updatedUser = await updateUser(profile.id, {
                ...formData,
                preferences: {
                    ...profile.preferences,
                    ...formData.preferences
                }
            });
            setProfile(updatedUser as any);

            // Mettre à jour l'entreprise si présent et en édition
            if (entreprise && entreprise._id) {
                const payload = {
                    identification: {
                        nomEntreprise: entreprise.identification?.nomEntreprise || '',
                        raisonSociale: entreprise.identification?.raisonSociale || '',
                        region: entreprise.identification?.region || '',
                        ville: entreprise.identification?.ville || '',
                        dateCreation: entreprise.identification?.dateCreation,
                        secteurActivite: entreprise.identification?.secteurActivite || '',
                        sousSecteur: entreprise.identification?.sousSecteur || '',
                        filiereProduction: entreprise.identification?.filiereProduction || '',
                        formeJuridique: entreprise.identification?.formeJuridique || '',
                        numeroContribuable: entreprise.identification?.numeroContribuable || ''
                    },
                    performanceEconomique: entreprise.performanceEconomique ? {
                        chiffreAffaires: {
                            montant: Number(entreprise.performanceEconomique?.chiffreAffaires?.montant) || undefined,
                            devise: entreprise.performanceEconomique?.chiffreAffaires?.devise || 'FCFA',
                            periode: entreprise.performanceEconomique?.chiffreAffaires?.periode || undefined
                        },
                        evolutionCA: entreprise.performanceEconomique?.evolutionCA || undefined,
                        coutsProduction: {
                            montant: Number(entreprise.performanceEconomique?.coutsProduction?.montant) || undefined,
                            devise: entreprise.performanceEconomique?.coutsProduction?.devise || 'FCFA'
                        },
                        situationTresorerie: entreprise.performanceEconomique?.situationTresorerie || undefined,
                        sourcesFinancement: entreprise.performanceEconomique?.sourcesFinancement || undefined
                    } : undefined,
                    investissementEmploi: entreprise.investissementEmploi ? {
                        effectifsEmployes: Number(entreprise.investissementEmploi?.effectifsEmployes) || 0,
                        nouveauxEmploisCrees: Number(entreprise.investissementEmploi?.nouveauxEmploisCrees) || 0,
                        nouveauxInvestissementsRealises: !!entreprise.investissementEmploi?.nouveauxInvestissementsRealises,
                        typesInvestissements: entreprise.investissementEmploi?.typesInvestissements || {
                            immobiliers: false,
                            mobiliers: false,
                            incorporels: false,
                            financiers: false
                        }
                    } : undefined,
                    innovationDigitalisation: entreprise.innovationDigitalisation ? {
                        integrationInnovation: Number(entreprise.innovationDigitalisation?.integrationInnovation) || 1,
                        integrationEconomieNumerique: Number(entreprise.innovationDigitalisation?.integrationEconomieNumerique) || 1,
                        utilisationIA: Number(entreprise.innovationDigitalisation?.utilisationIA) || 1
                    } : undefined,
                    conventions: entreprise.conventions ? {
                        respectDelaisReporting: {
                            conforme: !!entreprise.conventions?.respectDelaisReporting?.conforme,
                            joursRetard: Number(entreprise.conventions?.respectDelaisReporting?.joursRetard) || 0
                        },
                        atteinteCiblesInvestissement: Number(entreprise.conventions?.atteinteCiblesInvestissement) || 0,
                        atteinteCiblesEmploi: Number(entreprise.conventions?.atteinteCiblesEmploi) || 0,
                        conformiteNormesSpecifiques: {
                            conforme: !!entreprise.conventions?.conformiteNormesSpecifiques?.conforme,
                            niveauConformite: Number(entreprise.conventions?.conformiteNormesSpecifiques?.niveauConformite) || 1
                        }
                    } : undefined,
                    contact: {
                        email: entreprise.contact?.email || '',
                        siteWeb: entreprise.contact?.siteWeb || '',
                        adresse: {
                            rue: entreprise.contact?.adresse?.rue || '',
                            ville: entreprise.contact?.adresse?.ville || '',
                            codePostal: entreprise.contact?.adresse?.codePostal || '',
                            pays: entreprise.contact?.adresse?.pays || ''
                        },
                        telephone: entreprise.contact?.telephone || ''
                    },
                    statut: entreprise.statut || 'En attente',
                    informationsCompletes: !!entreprise.informationsCompletes,
                    dateCreation: entreprise.dateCreation || undefined,
                    description: entreprise.description || ''
                } as any;
                const updatedEnt = await updateEntreprise(entreprise._id, payload);
                setEntreprise(updatedEnt as any);
            }

            setEditing(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil');
            console.error('Error updating profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile || {});
        setEditing(false);
    };

    const breadcrumbs = [
        { label: profile?.typeCompte === 'entreprise' ? 'Entreprise' : 'Administration', href: `/${profile?.typeCompte}` },
        { label: 'Profil' }
    ];

    const headerActions = [
        {
            label: editing ? 'Annuler' : 'Modifier',
            icon: editing ? <Cancel /> : <Edit />,
            onClick: editing ? handleCancel : () => setEditing(true),
            variant: editing ? 'outlined' as const : 'contained' as const,
            color: editing ? 'error' as const : 'primary' as const
        },
        ...(editing ? [{
            label: 'Sauvegarder',
            icon: <Save />,
            onClick: handleSubmit,
            variant: 'contained' as const,
            color: 'success' as const,
            loading: saving
        }] : [{
            label: 'Actualiser',
            icon: <Refresh />,
            onClick: fetchProfile,
            variant: 'outlined' as const,
            color: 'primary' as const
        }])
    ];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <ArgonPageHeader
                    title="Mon Profil"
                    subtitle="Gestion de votre profil utilisateur"
                    breadcrumbs={breadcrumbs}
                    actions={headerActions}
                />
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <ArgonPageHeader
                title="Mon Profil"
                subtitle="Gestion de votre profil utilisateur"
                breadcrumbs={breadcrumbs}
                actions={headerActions}
                onRefresh={fetchProfile}
                loading={loading}
            />

            {profile && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
                    <ArgonCard
                        title="Informations Personnelles"
                        value=""
                        icon={<Person />}
                        color="primary"
                    >
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'primary.main',
                                        mr: 3,
                                        fontSize: '2rem'
                                    }}
                                >
                                    {profile.nom.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {profile.nom} {profile.prenom}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {profile.role}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    label="Nom"
                                    value={formData.nom || profile.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Prénom"
                                    value={formData.prenom || profile.prenom}
                                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Email"
                                    value={formData.email || profile.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                                <TextField
                                    label="Téléphone"
                                    value={formData.telephone || profile.telephone || ''}
                                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Box>
                        </Box>
                    </ArgonCard>

                    {profile.typeCompte === 'entreprise' && (
                        <ArgonCard
                            title="Informations Entreprise"
                            value=""
                            icon={<Business />}
                            color="info"
                        >
                            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                {/* Identification */}
                                <TextField
                                    label="Nom de l'entreprise"
                                    value={entreprise?.identification?.nomEntreprise || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, nomEntreprise: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Raison sociale"
                                    value={entreprise?.identification?.raisonSociale || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, raisonSociale: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    select
                                    label="Région"
                                    value={entreprise?.identification?.region || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, region: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'].map(r => (
                                        <MenuItem key={r} value={r}>{r}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Ville"
                                    value={entreprise?.identification?.ville || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, ville: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    type="date"
                                    label="Date de création (identification)"
                                    InputLabelProps={{ shrink: true }}
                                    value={entreprise?.identification?.dateCreation ? String(entreprise.identification.dateCreation).slice(0,10) : ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, dateCreation: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    select
                                    label="Secteur d'activité"
                                    value={entreprise?.identification?.secteurActivite || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, secteurActivite: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['Primaire', 'Secondaire', 'Tertiaire'].map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Sous-secteur"
                                    value={entreprise?.identification?.sousSecteur || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, sousSecteur: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['Agro-industriel', 'Forêt-Bois', 'Mines', 'Pétrole-Gaz', 'Industrie manufacturière', 'BTP', 'Énergie', 'Eau', 'Commerce', 'Transport', 'Télécommunications', 'Banque-Assurance', 'Tourisme', 'Santé', 'Éducation', 'Autres'].map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Filière de production"
                                    value={entreprise?.identification?.filiereProduction || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, filiereProduction: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    select
                                    label="Forme juridique"
                                    value={entreprise?.identification?.formeJuridique || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, formeJuridique: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['SARL', 'SA', 'EI', 'SUARL', 'SARLU', 'SNC', 'SCS', 'SAS', 'Autres'].map(f => (
                                        <MenuItem key={f} value={f}>{f}</MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Numéro de contribuable"
                                    value={entreprise?.identification?.numeroContribuable || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, identification: { ...entreprise?.identification, numeroContribuable: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />

                                {/* Contact */}
                                <TextField
                                    label="Email (entreprise)"
                                    value={entreprise?.contact?.email || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, contact: { ...entreprise?.contact, email: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Site web"
                                    value={entreprise?.contact?.siteWeb || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, contact: { ...entreprise?.contact, siteWeb: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Adresse - Rue"
                                    value={entreprise?.contact?.adresse?.rue || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, contact: { ...entreprise?.contact, adresse: { ...entreprise?.contact?.adresse, rue: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Adresse - Ville"
                                    value={entreprise?.contact?.adresse?.ville || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, contact: { ...entreprise?.contact, adresse: { ...entreprise?.contact?.adresse, ville: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Adresse - Code postal"
                                    value={entreprise?.contact?.adresse?.codePostal || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, contact: { ...entreprise?.contact, adresse: { ...entreprise?.contact?.adresse, codePostal: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Adresse - Pays"
                                    value={entreprise?.contact?.adresse?.pays || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, contact: { ...entreprise?.contact, adresse: { ...entreprise?.contact?.adresse, pays: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />

                                {/* Métadonnées */}
                                <TextField
                                    select
                                    label="Statut"
                                    value={entreprise?.statut || 'En attente'}
                                    onChange={(e) => setEntreprise({ ...entreprise, statut: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['En attente', 'Actif', 'Inactif', 'Suspendu'].map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </TextField>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={!!entreprise?.informationsCompletes}
                                            onChange={(e) => setEntreprise({ ...entreprise, informationsCompletes: e.target.checked })}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Informations complètes"
                                />
                                <TextField
                                    type="date"
                                    label="Date de création (métadonnées)"
                                    InputLabelProps={{ shrink: true }}
                                    value={entreprise?.dateCreation ? String(entreprise.dateCreation).slice(0,10) : ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, dateCreation: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    label="Dernière modification (lecture seule)"
                                    value={entreprise?.updatedAt ? new Date(entreprise.updatedAt).toLocaleString() : ''}
                                    disabled
                                    fullWidth
                                />
                                <TextField
                                    multiline
                                    minRows={3}
                                    label="Description"
                                    value={entreprise?.description || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, description: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                />

                                {entrepriseLoading && (
                                    <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={20} />
                                        <Typography variant="body2" color="text.secondary">Chargement des informations entreprise…</Typography>
                                    </Box>
                                )}
                            </Box>
                        </ArgonCard>
                    )}

                    {/* Performance Économique */}
                    {profile.typeCompte === 'entreprise' && (
                        <ArgonCard title="Performance Économique" value="" icon={<Business />} color="primary">
                            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    type="number"
                                    label="CA - Montant"
                                    value={entreprise?.performanceEconomique?.chiffreAffaires?.montant || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, chiffreAffaires: { ...entreprise?.performanceEconomique?.chiffreAffaires, montant: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    select
                                    label="CA - Devise"
                                    value={entreprise?.performanceEconomique?.chiffreAffaires?.devise || 'FCFA'}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, chiffreAffaires: { ...entreprise?.performanceEconomique?.chiffreAffaires, devise: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['FCFA','USD','EUR'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                                <TextField
                                    select
                                    label="CA - Période"
                                    value={entreprise?.performanceEconomique?.chiffreAffaires?.periode || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, chiffreAffaires: { ...entreprise?.performanceEconomique?.chiffreAffaires, periode: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['Trimestre 1','Trimestre 2','Trimestre 3','Trimestre 4','Année complète'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                </TextField>
                                <TextField
                                    select
                                    label="Évolution CA"
                                    value={entreprise?.performanceEconomique?.evolutionCA || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, evolutionCA: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['Hausse','Baisse','Stabilité'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                                <TextField
                                    type="number"
                                    label="Coûts prod - Montant"
                                    value={entreprise?.performanceEconomique?.coutsProduction?.montant || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, coutsProduction: { ...entreprise?.performanceEconomique?.coutsProduction, montant: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    select
                                    label="Coûts prod - Devise"
                                    value={entreprise?.performanceEconomique?.coutsProduction?.devise || 'FCFA'}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, coutsProduction: { ...entreprise?.performanceEconomique?.coutsProduction, devise: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['FCFA','USD','EUR'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                                </TextField>
                                <TextField
                                    select
                                    label="Trésorerie"
                                    value={entreprise?.performanceEconomique?.situationTresorerie || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, situationTresorerie: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                >
                                    {['Difficile','Normale','Aisée'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                                </TextField>
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.ressourcesPropres} onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, sourcesFinancement: { ...entreprise?.performanceEconomique?.sourcesFinancement, ressourcesPropres: e.target.checked } } })} disabled={!editing} />}
                                    label="Ressources propres"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.subventions} onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, sourcesFinancement: { ...entreprise?.performanceEconomique?.sourcesFinancement, subventions: e.target.checked } } })} disabled={!editing} />}
                                    label="Subventions"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.concoursBancaires} onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, sourcesFinancement: { ...entreprise?.performanceEconomique?.sourcesFinancement, concoursBancaires: e.target.checked } } })} disabled={!editing} />}
                                    label="Concours bancaires"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.creditsFournisseur} onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, sourcesFinancement: { ...entreprise?.performanceEconomique?.sourcesFinancement, creditsFournisseur: e.target.checked } } })} disabled={!editing} />}
                                    label="Crédits fournisseur"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.performanceEconomique?.sourcesFinancement?.autres} onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, sourcesFinancement: { ...entreprise?.performanceEconomique?.sourcesFinancement, autres: e.target.checked } } })} disabled={!editing} />}
                                    label="Autres"
                                />
                                <TextField
                                    label="Détails (autres)"
                                    value={entreprise?.performanceEconomique?.sourcesFinancement?.autresDetails || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, performanceEconomique: { ...entreprise?.performanceEconomique, sourcesFinancement: { ...entreprise?.performanceEconomique?.sourcesFinancement, autresDetails: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                            </Box>
                        </ArgonCard>
                    )}

                    {/* Investissement & Emploi */}
                    {profile.typeCompte === 'entreprise' && (
                        <ArgonCard title="Investissement & Emploi" value="" icon={<Business />} color="success">
                            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    type="number"
                                    label="Effectifs employés"
                                    value={entreprise?.investissementEmploi?.effectifsEmployes || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, investissementEmploi: { ...entreprise?.investissementEmploi, effectifsEmployes: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    type="number"
                                    label="Nouveaux emplois créés"
                                    value={entreprise?.investissementEmploi?.nouveauxEmploisCrees || ''}
                                    onChange={(e) => setEntreprise({ ...entreprise, investissementEmploi: { ...entreprise?.investissementEmploi, nouveauxEmploisCrees: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.investissementEmploi?.nouveauxInvestissementsRealises} onChange={(e) => setEntreprise({ ...entreprise, investissementEmploi: { ...entreprise?.investissementEmploi, nouveauxInvestissementsRealises: e.target.checked } })} disabled={!editing} />}
                                    label="Nouveaux investissements réalisés"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.investissementEmploi?.typesInvestissements?.immobiliers} onChange={(e) => setEntreprise({ ...entreprise, investissementEmploi: { ...entreprise?.investissementEmploi, typesInvestissements: { ...entreprise?.investissementEmploi?.typesInvestissements, immobiliers: e.target.checked } } })} disabled={!editing} />}
                                    label="Immobiliers"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.investissementEmploi?.typesInvestissements?.mobiliers} onChange={(e) => setEntreprise({ ...entreprise, investissementEmploi: { ...entreprise?.investissementEmploi, typesInvestissements: { ...entreprise?.investissementEmploi?.typesInvestissements, mobiliers: e.target.checked } } })} disabled={!editing} />}
                                    label="Mobiliers"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.investissementEmploi?.typesInvestissements?.incorporels} onChange={(e) => setEntreprise({ ...entreprise, investissementEmploi: { ...entreprise?.investissementEmploi, typesInvestissements: { ...entreprise?.investissementEmploi?.typesInvestissements, incorporels: e.target.checked } } })} disabled={!editing} />}
                                    label="Incorporels"
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.investissementEmploi?.typesInvestissements?.financiers} onChange={(e) => setEntreprise({ ...entreprise, investissementEmploi: { ...entreprise?.investissementEmploi, typesInvestissements: { ...entreprise?.investissementEmploi?.typesInvestissements, financiers: e.target.checked } } })} disabled={!editing} />}
                                    label="Financiers"
                                />
                            </Box>
                        </ArgonCard>
                    )}

                    {/* Innovation & Digitalisation */}
                    {profile.typeCompte === 'entreprise' && (
                        <ArgonCard title="Innovation & Digitalisation" value="" icon={<Business />} color="info">
                            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    type="number"
                                    label="Intégration Innovation (1-3)"
                                    value={entreprise?.innovationDigitalisation?.integrationInnovation || 1}
                                    onChange={(e) => setEntreprise({ ...entreprise, innovationDigitalisation: { ...entreprise?.innovationDigitalisation, integrationInnovation: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    type="number"
                                    label="Économie Numérique (1-3)"
                                    value={entreprise?.innovationDigitalisation?.integrationEconomieNumerique || 1}
                                    onChange={(e) => setEntreprise({ ...entreprise, innovationDigitalisation: { ...entreprise?.innovationDigitalisation, integrationEconomieNumerique: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                    <TextField
                                    type="number"
                                    label="Utilisation IA (1-3)"
                                    value={entreprise?.innovationDigitalisation?.utilisationIA || 1}
                                    onChange={(e) => setEntreprise({ ...entreprise, innovationDigitalisation: { ...entreprise?.innovationDigitalisation, utilisationIA: e.target.value } })}
                                        disabled={!editing}
                                        fullWidth
                                    />
                                </Box>
                        </ArgonCard>
                    )}

                    {/* Conventions */}
                    {profile.typeCompte === 'entreprise' && (
                        <ArgonCard title="Conventions" value="" icon={<Business />} color="warning">
                            <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.conventions?.respectDelaisReporting?.conforme} onChange={(e) => setEntreprise({ ...entreprise, conventions: { ...entreprise?.conventions, respectDelaisReporting: { ...entreprise?.conventions?.respectDelaisReporting, conforme: e.target.checked } } })} disabled={!editing} />}
                                    label="Respect délais reporting (conforme)"
                                />
                                <TextField
                                    type="number"
                                    label="Jours de retard"
                                    value={entreprise?.conventions?.respectDelaisReporting?.joursRetard || 0}
                                    onChange={(e) => setEntreprise({ ...entreprise, conventions: { ...entreprise?.conventions, respectDelaisReporting: { ...entreprise?.conventions?.respectDelaisReporting, joursRetard: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    type="number"
                                    label="Atteinte cibles investissement (0-100)"
                                    value={entreprise?.conventions?.atteinteCiblesInvestissement || 0}
                                    onChange={(e) => setEntreprise({ ...entreprise, conventions: { ...entreprise?.conventions, atteinteCiblesInvestissement: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    type="number"
                                    label="Atteinte cibles emploi (0-100)"
                                    value={entreprise?.conventions?.atteinteCiblesEmploi || 0}
                                    onChange={(e) => setEntreprise({ ...entreprise, conventions: { ...entreprise?.conventions, atteinteCiblesEmploi: e.target.value } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <FormControlLabel
                                    control={<Switch checked={!!entreprise?.conventions?.conformiteNormesSpecifiques?.conforme} onChange={(e) => setEntreprise({ ...entreprise, conventions: { ...entreprise?.conventions, conformiteNormesSpecifiques: { ...entreprise?.conventions?.conformiteNormesSpecifiques, conforme: e.target.checked } } })} disabled={!editing} />}
                                    label="Conformité normes spécifiques (conforme)"
                                />
                                <TextField
                                    type="number"
                                    label="Niveau de conformité (1-5)"
                                    value={entreprise?.conventions?.conformiteNormesSpecifiques?.niveauConformite || 1}
                                    onChange={(e) => setEntreprise({ ...entreprise, conventions: { ...entreprise?.conventions, conformiteNormesSpecifiques: { ...entreprise?.conventions?.conformiteNormesSpecifiques, niveauConformite: e.target.value } } })}
                                    disabled={!editing}
                                    fullWidth
                                />
                            </Box>
                        </ArgonCard>
                    )}

                    <ArgonCard
                        title="Sécurité"
                        value=""
                        icon={<Security />}
                        color="warning"
                    >
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    type="password"
                                    label="Mot de passe actuel"
                                    value={formData.currentPassword || ''}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                />
                                <TextField
                                    type="password"
                                    label="Nouveau mot de passe"
                                    value={formData.newPassword || ''}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    disabled={!editing}
                                    fullWidth
                                />
                            </Box>
                        </Box>
                    </ArgonCard>

                    <ArgonCard
                        title="Préférences"
                        value=""
                        icon={<Palette />}
                        color="info"
                    >
                        <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.preferences?.darkMode || false}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                preferences: {
                                                    ...formData.preferences,
                                                    darkMode: e.target.checked
                                                }
                                            })}
                                            disabled={!editing}
                                        />
                                    }
                                    label="Mode sombre"
                                />
                                <TextField
                                    select
                                    label="Langue"
                                    value={formData.preferences?.language || 'fr'}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        preferences: {
                                            ...formData.preferences,
                                            language: e.target.value
                                        }
                                    })}
                                    disabled={!editing}
                                    fullWidth
                                    SelectProps={{
                                        native: true
                                    }}
                                    InputProps={{
                                        startAdornment: <Language sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                >
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                </TextField>
                            </Box>
                        </Box>
                    </ArgonCard>
                </Box>
            )}
        </Box>
    );
};

export default ProfilePage;
