import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Business as BusinessIcon,
    Assessment as KPIIcon,
    Gavel as ComplianceIcon,
    People as UsersIcon,
    History as AuditIcon,
    Security as SecurityIcon,
    Description as ReportIcon,
    Monitor as SystemIcon,
    Menu as MenuIcon,
    Notifications,
    AccountCircle,
    Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import ArgonSidebar from '../components/Argon/ArgonSidebar';

const drawerWidth = 280;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#ffffff',
    color: '#1f2937',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb',
    zIndex: theme.zIndex.drawer + 1,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    minHeight: 64,
    padding: '0 24px',
    justifyContent: 'space-between',
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

// ✅ CORRECTION : MainContent simplifié sans margin left forcé
const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    // ✅ Suppression des marges forcées - laisse flexbox gérer
}));

// ✅ CORRECTION : ContentWrapper sans padding gauche excessif
const ContentWrapper = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3), // ✅ Padding uniforme maintenant que la sidebar est dans le flux
    maxWidth: '100%',
    height: '100%',
}));

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/admin/dashboard'
        },
        {
            id: 'portfolio',
            label: 'Portfolio',
            icon: <BusinessIcon />,
            path: '/admin/portfolio'
        },
        {
            id: 'kpis',
            label: 'KPIs',
            icon: <KPIIcon />,
            path: '/admin/kpis'
        },
        {
            id: 'compliance',
            label: 'Compliance',
            icon: <ComplianceIcon />,
            path: '/admin/compliance'
        },
        {
            id: 'users',
            label: 'Users & Access',
            icon: <UsersIcon />,
            path: '/admin/users'
        },
        {
            id: 'audit',
            label: 'Audit Trail',
            icon: <AuditIcon />,
            path: '/admin/audit'
        },
        {
            id: 'security',
            label: 'Security',
            icon: <SecurityIcon />,
            path: '/admin/security'
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: <ReportIcon />,
            path: '/admin/reports'
        },
        {
            id: 'system',
            label: 'System',
            icon: <SystemIcon />,
            path: '/admin/system'
        },
    ];

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        console.log('Déconnexion admin');
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <StyledAppBar elevation={0}>
                <StyledToolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <LogoContainer sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff' }}>
                                    A
                                </Typography>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Admin Portal
                            </Typography>
                        </LogoContainer>
                    </Box>

                    <UserActions>
                        <IconButton size="large" sx={{ color: 'text.primary' }}>
                            <Notifications />
                        </IconButton>
                        <IconButton size="large" sx={{ color: 'text.primary' }}>
                            <AccountCircle />
                        </IconButton>
                        <IconButton
                            size="large"
                            onClick={handleLogout}
                            sx={{ color: 'text.primary' }}
                        >
                            <Logout />
                        </IconButton>
                    </UserActions>
                </StyledToolbar>
            </StyledAppBar>

            {/* ✅ Sidebar maintenant dans le flux normal */}
            <ArgonSidebar
                open={isMobile ? mobileOpen : true}
                onClose={() => setMobileOpen(false)}
                menuItems={menuItems}
                user={{
                    name: 'Admin User',
                    role: 'Administrator',
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

export default AdminLayout;