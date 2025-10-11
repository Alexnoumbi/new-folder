import React, { useState } from 'react';
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
  Tooltip,
  Badge,
  InputBase,
  styled
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  Logout,
  Dashboard,
  Assessment,
  Description,
  CalendarToday,
  Brightness4,
  Brightness7,
  Search,
  Business,
  CheckCircle,
  Upload,
  People
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    background: `linear-gradient(180deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
    borderRight: 'none',
    boxShadow: '4px 0 24px rgba(0,0,0,0.12)'
  },
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  maxWidth: 400,
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

interface EnterpriseLayoutProps {
  children: React.ReactNode;
}

const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Tableau de bord', icon: <Dashboard />, path: '/enterprise/dashboard' },
    { text: 'Documents', icon: <Description />, path: '/enterprise/documents', badge: 2 },
    { text: 'Messages', icon: <Upload />, path: '/enterprise/messages' },
    { text: 'Profil', icon: <Business />, path: '/enterprise/profile' }
  ];

  const notifications = [
    { id: 1, text: 'Nouveau document requis', time: 'Il y a 1h', unread: true },
    { id: 2, text: 'Visite planifiée demain', time: 'Il y a 3h', unread: true },
    { id: 3, text: 'KPI validé', time: 'Il y a 5h', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'white',
          borderBottom: 1,
          borderColor: 'divider'
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
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mr: 2
            }}
          >
            TrackImpact
          </Typography>

          <Chip 
            label="ENTREPRISE" 
            size="small" 
            color="success"
            sx={{ 
              fontWeight: 600,
              fontSize: 11,
              height: 24
            }}
          />

          {/* Search Bar */}
          <SearchBar>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Rechercher..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </SearchBar>

          <Box sx={{ flexGrow: 1 }} />

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
                onClick={handleNotifications}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications color="primary" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={notifAnchorEl}
              open={Boolean(notifAnchorEl)}
              onClose={handleNotifClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 360
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>
                  Notifications
                </Typography>
              </Box>
              {notifications.map((notif) => (
                <MenuItem 
                  key={notif.id} 
                  onClick={handleNotifClose}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderLeft: 3,
                    borderColor: notif.unread ? 'primary.main' : 'transparent'
                  }}
                >
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="body2" fontWeight={notif.unread ? 600 : 400}>
                      {notif.text}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notif.time}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Menu>

            <Tooltip title="Paramètres">
              <IconButton
                onClick={() => navigate('/enterprise/settings')}
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
                  bgcolor: theme.palette.success.main,
                  fontWeight: 700
                }}
              >
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                  {user?.prenom} {user?.nom}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Entreprise
                </Typography>
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
                  minWidth: 220
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.prenom} {user?.nom}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <MenuItem onClick={() => { handleClose(); navigate('/enterprise/profile'); }}>
                <Avatar sx={{ width: 24, height: 24, mr: 2 }} />
                Mon profil
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/enterprise/settings'); }}>
                <Settings sx={{ mr: 2, fontSize: 20 }} />
                Paramètres
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <Logout sx={{ mr: 2, fontSize: 20 }} />
                Déconnexion
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <StyledDrawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? DRAWER_WIDTH : 73,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerOpen ? DRAWER_WIDTH : 73,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden'
          }
        }}
      >
        <Toolbar />
        
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: alpha('#fff', 0.1),
          display: drawerOpen ? 'block' : 'none'
        }}>
          <Typography variant="overline" sx={{ color: alpha('#fff', 0.6), fontWeight: 600, fontSize: 11 }}>
            Navigation
          </Typography>
        </Box>

        <List sx={{ px: 1, pt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  px: 2.5,
                  py: 1,
                  mx: 1,
                  my: 0.5,
                  borderRadius: 2,
                  color: 'white',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 0.2),
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: drawerOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ 
                    opacity: drawerOpen ? 1 : 0,
                    '& .MuiTypography-root': {
                      fontSize: '0.95rem',
                      fontWeight: 500
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </StyledDrawer>

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

export default EnterpriseLayout;

