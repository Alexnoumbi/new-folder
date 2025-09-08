import React from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Avatar,
    Collapse,
    Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import DescriptionIcon from '@mui/icons-material/Description';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { styled, useTheme } from '@mui/material/styles';

const drawerWidth = 280;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#ffffff',
    color: '#1e293b',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e2e8f0',
    zIndex: theme.zIndex.drawer + 1,
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: '#1e40af',
        color: '#ffffff',
        borderRight: 'none',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
    },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    margin: '4px 16px',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: 'translateX(4px)',
        transition: 'all 0.3s ease',
    },
    '&.Mui-selected': {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&::before': {
            content: '""',
            position: 'absolute',
            left: '-16px',
            top: 0,
            bottom: 0,
            width: '4px',
            backgroundColor: '#ffffff',
            borderRadius: '0 2px 2px 0',
        },
    },
}));

const menuItems = [
    { text: 'Tableau de bord', path: '/admin/dashboard', icon: <DashboardIcon /> },
    { text: 'Entreprises', path: '/admin/entreprises', icon: <BusinessIcon /> },
    { text: 'KPI & Indicateurs', path: '/admin/kpis', icon: <AssessmentIcon /> },
    { text: 'Conformité', path: '/admin/compliance', icon: <GavelIcon /> },
    { text: 'Utilisateurs', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Sécurité', path: '/admin/security', icon: <SecurityIcon /> },
    { text: 'Rapports', path: '/admin/reports', icon: <DescriptionIcon /> },
];

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const theme = useTheme();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleListItemClick = (path: string, index: number) => {
        setSelectedIndex(index);
        navigate(path);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const drawer = (
        <Box>
            <Toolbar sx={{ minHeight: '80px' }}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                        Administration
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Gestion du système
                    </Typography>
                </Box>
            </Toolbar>
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            <List>
                {menuItems.map((item, index) => (
                    <StyledListItemButton
                        key={item.text}
                        selected={selectedIndex === index}
                        onClick={() => handleListItemClick(item.path, index)}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}
                        />
                    </StyledListItemButton>
                ))}
            </List>
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
            <List>
                <StyledListItemButton onClick={handleLogout}>
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Déconnexion"
                        primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    />
                </StyledListItemButton>
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <StyledAppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Admin Panel
                    </Typography>
                    <IconButton size="large" color="inherit">
                        <Avatar sx={{ width: 32, height: 32 }} />
                    </IconButton>
                </Toolbar>
            </StyledAppBar>

            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                <StyledDrawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{ display: { xs: 'block', sm: 'none' } }}
                >
                    {drawer}
                </StyledDrawer>
                <StyledDrawer
                    variant="permanent"
                    sx={{ display: { xs: 'none', sm: 'block' } }}
                    open
                >
                    {drawer}
                </StyledDrawer>
            </Box>

            {/* ✅ CORRECTION PRINCIPALE : Padding personnalisé au lieu de p: 3 */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    // ❌ ANCIEN: p: 3,  // Supprimé !
                    // ✅ NOUVEAU: Padding spécifique
                    paddingLeft: 0,           // ✅ Supprime l'espace à gauche
                    paddingRight: 3,          // ✅ Garde l'espace à droite
                    paddingTop: 2,            // ✅ Petit espace en haut
                    paddingBottom: 3,         // ✅ Espace en bas
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    backgroundColor: '#f8fafc',
                }}
            >
                <Toolbar />
                {/* ✅ Container pour le contenu avec padding contrôlé */}
                <Box sx={{ paddingLeft: 3 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;