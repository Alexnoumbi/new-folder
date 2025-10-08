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
  Paper,
  Collapse,
  styled
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
  Brightness7,
  Search,
  ExpandLess,
  ExpandMore,
  DynamicForm,
  FolderOpen,
  Forum,
  Insights,
  Timeline,
  Upload,
  LibraryBooks,
  Map,
  CheckCircle,
  TrendingUp,
  Security,
  CloudDownload,
  DocumentScanner,
  NotificationsActive
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

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  badge?: number;
  children?: MenuItem[];
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard', 'data']);

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

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu)
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const menuItems: MenuItem[] = [
    {
      text: 'Tableaux de Bord',
      icon: <Dashboard />,
      children: [
        { text: 'Vue d\'ensemble', icon: <TrendingUp />, path: '/admin/dashboard' },
        { text: 'Monitoring', icon: <Insights />, path: '/admin/monitoring' },
        { text: 'Performance', icon: <BarChart />, path: '/admin/performance' }
      ]
    },
    {
      text: 'Gestion des Données',
      icon: <DynamicForm />,
      children: [
        { text: 'Form Builder', icon: <DynamicForm />, path: '/admin/form-builder', badge: 3 },
        { text: 'Soumissions', icon: <CheckCircle />, path: '/admin/submissions' },
        { text: 'Scanner OCR', icon: <DocumentScanner />, path: '/admin/ocr' }
      ]
    },
    {
      text: 'Cadres & Résultats',
      icon: <AccountTree />,
      children: [
        { text: 'Cadres Logiques', icon: <AccountTree />, path: '/admin/results-framework' },
        { text: 'KPIs', icon: <Assessment />, path: '/admin/kpis' },
        { text: 'Indicateurs', icon: <Assessment />, path: '/admin/indicators' }
      ]
    },
    {
      text: 'Portfolios & Projets',
      icon: <FolderOpen />,
      children: [
        { text: 'Portfolio', icon: <FolderOpen />, path: '/admin/portfolio' },
        { text: 'Projets', icon: <Business />, path: '/admin/projects' },
        { text: 'Budget Consolidé', icon: <TrendingUp />, path: '/admin/budget' }
      ]
    },
    {
      text: 'Entreprises',
      icon: <Business />,
      path: '/admin/entreprises',
      badge: 5
    },
    {
      text: 'Compliance',
      icon: <CheckCircle />,
      path: '/admin/compliance'
    },
    {
      text: 'Collaboration',
      icon: <Forum />,
      children: [
        { text: 'Discussions', icon: <Forum />, path: '/admin/discussions', badge: 12 },
        { text: 'Workflows', icon: <Timeline />, path: '/admin/workflows' },
        { text: 'Approbations', icon: <CheckCircle />, path: '/admin/approvals', badge: 4 }
      ]
    },
    {
      text: 'Rapports & Exports',
      icon: <LibraryBooks />,
      children: [
        { text: 'Rapports', icon: <LibraryBooks />, path: '/admin/reports' },
        { text: 'Exports Planifiés', icon: <CloudDownload />, path: '/admin/scheduled-exports' },
        { text: 'Templates', icon: <Description />, path: '/admin/report-templates' }
      ]
    },
    {
      text: 'Système & Sécurité',
      icon: <Security />,
      children: [
        { text: 'Utilisateurs', icon: <People />, path: '/admin/users' },
        { text: 'Sécurité', icon: <Security />, path: '/admin/security' },
        { text: 'Audit Trail', icon: <Timeline />, path: '/admin/audit-trail' },
        { text: 'Audit', icon: <Assessment />, path: '/admin/audit' },
        { text: 'Système', icon: <Security />, path: '/admin/system' }
      ]
    },
    {
      text: 'Paramètres',
      icon: <Settings />,
      path: '/admin/settings'
    }
  ];

  const notifications = [
    { id: 1, text: 'Nouveau formulaire soumis', time: 'Il y a 5min', type: 'info', unread: true },
    { id: 2, text: 'Approbation requise: Budget Q4', time: 'Il y a 1h', type: 'warning', unread: true },
    { id: 3, text: 'Rapport mensuel généré', time: 'Il y a 2h', type: 'success', unread: false },
    { id: 4, text: '3 discussions en attente', time: 'Il y a 3h', type: 'info', unread: true }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.text.toLowerCase().replace(/\s+/g, '-'));

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ display: 'block' }}>
          <ListItemButton
            onClick={() => {
              if (hasChildren) {
                toggleMenu(item.text.toLowerCase().replace(/\s+/g, '-'));
              } else if (item.path) {
                navigate(item.path);
              }
            }}
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
                bgcolor: alpha(theme.palette.primary.main, 0.2),
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
                  fontSize: depth > 0 ? '0.875rem' : '0.95rem',
                  fontWeight: depth > 0 ? 400 : 500
                }
              }}
            />
            {hasChildren && drawerOpen && (
              isExpanded ? <ExpandLess /> : <ExpandMore />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isExpanded && drawerOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => (
                <ListItem key={child.text} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => child.path && navigate(child.path)}
                    sx={{
                      minHeight: 40,
                      px: 2.5,
                      py: 0.75,
                      mx: 1,
                      my: 0.25,
                      ml: 4,
                      borderRadius: 2,
                      color: alpha('#fff', 0.8),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        color: 'white'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 2,
                        justifyContent: 'center',
                        color: 'inherit'
                      }}
                    >
                      <Badge badgeContent={child.badge} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
                        {child.icon}
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={child.text}
                      sx={{ 
                        '& .MuiTypography-root': {
                          fontSize: '0.875rem'
                        }
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

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
            label="ADMIN" 
            size="small" 
            color="primary"
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
                  minWidth: 360,
                  maxHeight: 480
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
                    borderColor: notif.unread ? 'primary.main' : 'transparent',
                    bgcolor: notif.unread ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
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
                  {notif.unread && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        ml: 1
                      }}
                    />
                  )}
                </MenuItem>
              ))}
              <MenuItem sx={{ justifyContent: 'center', color: 'primary.main', fontWeight: 600 }}>
                Voir tout
              </MenuItem>
            </Menu>

            <Tooltip title="Paramètres">
              <IconButton
                onClick={() => navigate('/admin/settings')}
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
                <Typography variant="caption" color="text.secondary">
                  Administrateur
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
              <MenuItem onClick={() => { handleClose(); navigate('/admin/profile'); }}>
                <Avatar sx={{ width: 24, height: 24, mr: 2 }} />
                Mon profil
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/admin/settings'); }}>
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
        
        {/* Sidebar Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: alpha('#fff', 0.1),
          display: drawerOpen ? 'block' : 'none'
        }}>
          <Typography variant="overline" sx={{ color: alpha('#fff', 0.6), fontWeight: 600, fontSize: 11 }}>
            Menu Principal
          </Typography>
        </Box>

        <List sx={{ px: 1, pt: 2 }}>
          {menuItems.map(item => renderMenuItem(item))}
        </List>

        {/* Quick Stats in Sidebar */}
        {drawerOpen && (
          <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: alpha('#fff', 0.1) }}>
            <Paper
              sx={{
                p: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.3)} 100%)`,
                border: 1,
                borderColor: alpha('#fff', 0.2),
                borderRadius: 2
              }}
            >
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.8), fontWeight: 600 }}>
                Statut du Système
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip 
                  label="12 Actifs" 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.3),
                    color: 'white',
                    fontSize: 11
                  }} 
                />
                <Chip 
                  label="3 Pending" 
                  size="small" 
                  sx={{ 
                    bgcolor: alpha(theme.palette.warning.main, 0.3),
                    color: 'white',
                    fontSize: 11
                  }} 
                />
              </Stack>
            </Paper>
          </Box>
        )}
      </StyledDrawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          bgcolor: alpha(theme.palette.grey[500], 0.02),
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;

