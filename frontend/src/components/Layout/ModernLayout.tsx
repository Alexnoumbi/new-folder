import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  useTheme,
  alpha,
  Divider,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  Logout,
  Dashboard,
  Business,
  Assessment,
  Description,
  People,
  CalendarToday,
  AccountTree,
  BarChart,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const adminItems = [
      { icon: <Dashboard />, text: 'Tableau de bord', path: '/admin/dashboard' },
      { icon: <Business />, text: 'Entreprises', path: '/admin/entreprises' },
      { icon: <People />, text: 'Utilisateurs', path: '/admin/users' },
      { icon: <AccountTree />, text: 'Cadres de Résultats', path: '/admin/results-framework' },
      { icon: <BarChart />, text: 'Dashboard Avancé', path: '/admin/advanced-dashboard' },
      { icon: <Assessment />, text: 'Rapports', path: '/admin/reports' }
    ];

    const enterpriseItems = [
      { icon: <Dashboard />, text: 'Tableau de bord', path: '/enterprise/dashboard' },
      { icon: <Assessment />, text: 'KPI', path: '/enterprise/kpi' },
      { icon: <Description />, text: 'Documents', path: '/enterprise/documents' },
      { icon: <CalendarToday />, text: 'Visites', path: '/enterprise/visits' },
      { icon: <Business />, text: 'Mon Entreprise', path: '/enterprise/profile' }
    ];

    return user?.typeCompte === 'admin' ? adminItems : enterpriseItems;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'white',
          borderBottom: 1,
          borderColor: 'divider',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ 
              mr: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <MenuIcon color="primary" />
          </IconButton>

          <Box
            component="img"
            src="/logo.svg"
            alt="TrackImpact"
            sx={{ height: 35, mr: 2 }}
          />

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            TrackImpact
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={darkMode ? 'Mode clair' : 'Mode sombre'}>
              <IconButton 
                onClick={() => setDarkMode(!darkMode)}
                sx={{ 
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.2) }
                }}
              >
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Notifications color="primary" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Paramètres">
              <IconButton
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Settings color="primary" />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

            <Box
              onClick={handleMenu}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                p: 1,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: theme.palette.primary.main,
                  fontWeight: 700
                }}
              >
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                  {user?.prenom} {user?.nom}
                </Typography>
                <Chip
                  label={user?.typeCompte === 'admin' ? 'Administrateur' : 'Entreprise'}
                  size="small"
                  color="primary"
                  sx={{ height: 20, fontSize: 11 }}
                />
              </Box>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 200
                }
              }}
            >
              <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                <Avatar sx={{ width: 24, height: 24, mr: 2 }} />
                Mon profil
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                <Settings sx={{ mr: 2 }} />
                Paramètres
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 2 }} />
                Déconnexion
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            mt: '64px'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="overline" color="text.secondary" fontWeight={600}>
            Navigation
          </Typography>
        </Box>
        <List>
          {getMenuItems().map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: alpha(theme.palette.grey[500], 0.02)
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default ModernLayout;

