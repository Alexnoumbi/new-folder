import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  InputBase,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  Menu as MenuIcon,
  Search,
  NotificationsNone,
  Person,
  DarkMode,
  Help
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

interface ArgonNavbarProps {
  title?: string;
  onMenuClick?: () => void;
  notifications?: number;
  user?: {
    name: string;
    avatar?: string;
    role: string;
    status?: 'online' | 'away' | 'offline';
  };
  onLogout?: () => void;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  color: '#1f2937',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
  position: 'sticky',
  zIndex: theme.zIndex.appBar,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
  }
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: 72,
  padding: '0 32px',
  [theme.breakpoints.down('sm')]: {
    padding: '0 16px',
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'rgba(248, 250, 252, 0.8)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: '0 16px',
  margin: '0 24px',
  flex: 1,
  maxWidth: 480,
  height: 44,
  border: '1px solid rgba(226, 232, 240, 0.6)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    borderColor: 'rgba(102, 126, 234, 0.4)',
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    transform: 'translateY(-1px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    '&::before': {
      left: '100%',
    },
  },
  '&:focus-within': {
    borderColor: '#667eea',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1)',
    transform: 'translateY(-1px)',
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: 300,
  },
  [theme.breakpoints.down('sm')]: {
    margin: '0 12px',
    maxWidth: 200,
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: 8,
  flex: 1,
  '& .MuiInputBase-input': {
    padding: 0,
    fontSize: '0.875rem',
    fontWeight: 500,
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.8,
    },
  },
}));

const UserMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    backdropFilter: 'blur(20px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    minWidth: 280,
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent)',
    }
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '12px 20px',
  transition: 'all 0.2s ease',
  borderRadius: '8px',
  margin: '4px 8px',
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    transform: 'translateX(4px)',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 36,
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 36,
  height: 36,
  border: '2px solid rgba(102, 126, 234, 0.2)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'scale(1.1)',
    borderColor: '#667eea',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
}));

const StatusIndicator = styled(Box)<{ status?: string }>(({ theme, status }) => ({
  position: 'absolute',
  bottom: -2,
  right: -2,
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: '2px solid white',
  backgroundColor: 
    status === 'online' ? '#10b981' :
    status === 'away' ? '#f59e0b' :
    '#6b7280',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#ef4444',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s ease',
  borderRadius: 12,
  padding: 10,
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const TitleText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.25rem',
  background: 'linear-gradient(45deg, #667eea, #764ba2)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.025em',
}));

const ArgonNavbar: React.FC<ArgonNavbarProps> = ({
  title = 'Dashboard',
  onMenuClick,
  notifications = 0,
  user,
  onLogout
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    onLogout?.();
    handleMenuClose();
  };

  return (
    <StyledAppBar position="static">
      <StyledToolbar>
        <IconButtonStyled
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButtonStyled>

        <TitleText variant="h6"  sx={{ mr: 3 }}>
          {title}
        </TitleText>

        <SearchContainer>
          <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
          <SearchInput
            placeholder="Rechercher dans l'application..."
            inputProps={{ 'aria-label': 'rechercher' }}
          />
        </SearchContainer>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButtonStyled
            size="large"
            aria-label={`${notifications} notifications`}
            onClick={handleNotificationMenuOpen}
            sx={{ color: 'text.primary' }}
          >
            <NotificationBadge badgeContent={notifications} max={99}>
              <Notifications sx={{ fontSize: 22 }} />
            </NotificationBadge>
          </IconButtonStyled>

          <IconButtonStyled
            size="large"
            edge="end"
            aria-label="compte utilisateur"
            onClick={handleProfileMenuOpen}
            sx={{ color: 'text.primary', ml: 1 }}
          >
            <Box sx={{ position: 'relative' }}>
              <UserAvatar src={user?.avatar}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </UserAvatar>
              <StatusIndicator status={user?.status} />
            </Box>
          </IconButtonStyled>
        </Box>
      </StyledToolbar>

      {/* Menu de profil */}
      <UserMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <UserAvatar 
            src={user?.avatar} 
            sx={{ 
              width: 64, 
              height: 64, 
              mx: 'auto', 
              mb: 2,
              fontSize: '1.5rem'
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </UserAvatar>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {user?.name || 'Utilisateur'}
          </Typography>
          <Chip 
            label={user?.role || 'Utilisateur'} 
            size="small"
            sx={{ 
              backgroundColor: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              fontWeight: 500
            }}
          />
        </Box>
        <Divider sx={{ mx: 2 }} />
        
        <StyledMenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Person sx={{ color: '#667eea' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Mon Profil" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </StyledMenuItem>
        
        <StyledMenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Settings sx={{ color: '#667eea' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Paramètres" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </StyledMenuItem>
        
        <StyledMenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DarkMode sx={{ color: '#667eea' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Thème sombre" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </StyledMenuItem>
        
        <StyledMenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Help sx={{ color: '#667eea' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Aide & Support" 
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </StyledMenuItem>
        
        <Divider sx={{ mx: 2, my: 1 }} />
        
        <StyledMenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout sx={{ color: '#ef4444' }} />
          </ListItemIcon>
          <ListItemText 
            primary="Déconnexion" 
            primaryTypographyProps={{ fontWeight: 500, color: '#ef4444' }}
          />
        </StyledMenuItem>
      </UserMenu>

      {/* Menu de notifications */}
      <UserMenu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <NotificationsNone sx={{ fontSize: 48, color: '#667eea', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Centre de Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {notifications > 0 
              ? `Vous avez ${notifications} nouvelle${notifications > 1 ? 's' : ''} notification${notifications > 1 ? 's' : ''}`
              : 'Toutes vos notifications sont à jour'
            }
          </Typography>
        </Box>
        <Divider sx={{ mx: 2 }} />
        
        {notifications === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune nouvelle notification
            </Typography>
          </Box>
        ) : (
          <StyledMenuItem onClick={handleMenuClose}>
            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
              Voir toutes les notifications →
            </Typography>
          </StyledMenuItem>
        )}
      </UserMenu>
    </StyledAppBar>
  );
};

export default ArgonNavbar;