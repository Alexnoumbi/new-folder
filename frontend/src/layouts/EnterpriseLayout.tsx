import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme, Badge } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    Assignment as AssignmentIcon,
    Description as DocumentIcon,
    People as PeopleIcon,
    History as HistoryIcon,
    Message as MessageIcon,
    Assessment as AssessmentIcon,
    AccountCircle as AccountCircleIcon,
    Menu as MenuIcon,
    Notifications,
    Logout,
    DocumentScanner as ScannerIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ArgonSidebar from '../components/Argon/ArgonSidebar';
import { useAuth } from '../hooks/useAuth';
import { getEntreprise } from '../services/entrepriseService';

const drawerWidth = 280;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#ffffff',
    color: '#1f2937',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: theme.zIndex.drawer + 1,
    backdropFilter: 'blur(12px)',
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    minHeight: 72,
    padding: '0 32px',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
        padding: '0 16px',
        minHeight: 64,
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const UserActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
}));

// ✅ CORRECTION : MainContent simplifié sans margin/width forcés
const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    backgroundImage: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    // ✅ Suppression des marges/largeurs forcées - laisse flexbox gérer
}));

// ✅ CORRECTION : ContentWrapper avec padding uniforme
const ContentWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3), // ✅ Padding uniforme maintenant que la sidebar est dans le flux
    maxWidth: '100%', // ✅ Utilise toute la largeur disponible
    height: '100%',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    borderRadius: 12,
    color: '#64748B',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    transition: 'all 0.2s',
    width: 44,
    height: 44,
    '&:hover': {
        backgroundColor: '#f3f4f6',
        borderColor: '#e2e8f0',
        color: theme.palette.primary.main,
        transform: 'scale(1.07)',
    },
}));

const EnterpriseLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth();
    const [enterpriseName, setEnterpriseName] = useState<string>('');

    useEffect(() => {
        const loadEnterpriseName = async () => {
            try {
                if (user?.entrepriseId) {
                    const ent = await getEntreprise(user.entrepriseId);
                    const name = (ent as any)?.identification?.nomEntreprise || ent?.nom || ent?.name || '';
                    setEnterpriseName(name);
                }
            } catch {
                setEnterpriseName('');
            }
        };
        loadEnterpriseName();
    }, [user]);

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/enterprise'
        },
        {
            id: 'overview',
            label: 'Aperçu',
            icon: <BusinessIcon />,
            path: '/enterprise/overview'
        },
        {
            id: 'controls',
            label: 'Contrôles',
            icon: <AssignmentIcon />,
            path: '/enterprise/controls'
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: <DocumentIcon />,
            path: '/enterprise/documents'
        },
        {
            id: 'affiliations',
            label: 'Affiliations',
            icon: <PeopleIcon />,
            path: '/enterprise/affiliations'
        },
        {
            id: 'kpi-history',
            label: 'Historique KPI',
            icon: <HistoryIcon />,
            path: '/enterprise/kpi-history'
        },
        {
            id: 'messages',
            label: 'Messages',
            icon: <MessageIcon />,
            path: '/enterprise/messages'
        },
        {
            id: 'reports',
            label: 'Rapports',
            icon: <AssessmentIcon />,
            path: '/enterprise/reports'
        },
        {
            id: 'ocr',
            label: 'Scanner OCR',
            icon: <ScannerIcon />,
            path: '/enterprise/ocr'
        },
        {
            id: 'profile',
            label: 'Profil',
            icon: <AccountCircleIcon />,
            path: '/enterprise/profile'
        },
    ];

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleLogout = () => {
        console.log('Déconnexion entreprise');
        navigate('/login');
    };

    const displayName = user ? `${user.prenom || ''} ${user.nom || ''}`.trim() || user.email : 'Utilisateur';
    const displayEnterprise = enterpriseName || 'Entreprise';

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <StyledAppBar elevation={0}>
                <StyledToolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StyledIconButton
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </StyledIconButton>

                        <LogoContainer sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>
                                    E
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#262626' }}>
                                    {displayEnterprise}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1 }}>
                                    {displayName}
                                </Typography>
                            </Box>
                        </LogoContainer>
                    </Box>

                    <UserActions>
                        <StyledIconButton>
                            <Badge badgeContent={5} color="error">
                                <Notifications />
                            </Badge>
                        </StyledIconButton>
                        <StyledIconButton>
                            <AccountCircleIcon />
                        </StyledIconButton>
                        <StyledIconButton onClick={handleLogout}>
                            <Logout />
                        </StyledIconButton>
                    </UserActions>
                </StyledToolbar>
            </StyledAppBar>

            {/* ✅ Sidebar maintenant dans le flux normal */}
            <ArgonSidebar
                open={isMobile ? mobileOpen : true}
                onClose={() => setMobileOpen(false)}
                menuItems={menuItems}
                user={{
                    name: displayName,
                    role: displayEnterprise,
                    avatar: undefined
                }}
            />

            {/* ✅ MainContent maintenant adjacent à la sidebar sans margin forcé */}
            <MainContent>
                <Toolbar />
                <ContentWrapper>
                    {children}
                </ContentWrapper>
            </MainContent>
        </Box>
    );
};

export default EnterpriseLayout;