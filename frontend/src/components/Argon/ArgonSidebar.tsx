import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Box,
    Divider,
    Avatar,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: number;
    children?: MenuItem[];
}

interface ArgonSidebarProps {
    open: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
    user?: {
        name: string;
        avatar?: string;
        role: string;
    };
}

// ✅ CORRECTION PRINCIPALE : Sidebar avec position appropriée
const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: 280,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    '& .MuiDrawer-paper': {
        width: 280,
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        borderRight: 'none',
        boxSizing: 'border-box',
        // ✅ SUPPRESSION de position: 'fixed' qui causait le problème
        // La sidebar sera maintenant dans le flux normal
        overflow: 'hidden',
        [theme.breakpoints.up('md')]: {
            position: 'relative', // ✅ Position relative pour desktop
            height: '100vh',
        },
        [theme.breakpoints.down('md')]: {
            position: 'fixed', // ✅ Fixed seulement pour mobile
        },
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    borderBottom: '1px solid rgba(248, 250, 252, 0.08)',
}));

const UserContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    backgroundColor: 'rgba(30, 58, 138, 0.3)',
    margin: theme.spacing(2),
    borderRadius: 16,
    border: '1px solid rgba(59, 130, 246, 0.2)',
}));

const StyledListItemButton = styled(ListItemButton)<{ active?: boolean }>(({ theme, active }) => ({
    margin: '4px 16px',
    borderRadius: 12,
    minHeight: 48,
    color: active ? '#FFFFFF' : 'rgba(248, 250, 252, 0.7)',
    backgroundColor: active ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    border: active ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        backgroundColor: active ? 'rgba(59, 130, 246, 0.3)' : 'rgba(248, 250, 252, 0.08)',
        transform: 'translateX(4px)',
    },
    '& .MuiListItemIcon-root': {
        color: active ? '#3B82F6' : 'rgba(248, 250, 252, 0.7)',
        minWidth: 40,
        transition: 'all 0.2s ease',
    },
    '& .MuiListItemText-primary': {
        fontWeight: active ? 600 : 500,
        fontSize: '0.875rem',
    },
}));

const Badge = styled(Box)(({ theme }) => ({
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginLeft: theme.spacing(1),
    boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
}));

const ArgonSidebar: React.FC<ArgonSidebarProps> = ({
                                                       open,
                                                       onClose,
                                                       menuItems,
                                                       user
                                                   }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleItemClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            onClose();
        }
    };

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <StyledDrawer
            variant={isMobile ? "temporary" : "permanent"}
            anchor="left"
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                display: { xs: 'block', sm: 'block' },
                '& .MuiDrawer-paper': {
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                <LogoContainer>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF' }}>
                            A
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                            Argon Admin
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(248, 250, 252, 0.6)' }}>
                            Dashboard v2.0
                        </Typography>
                    </Box>
                </LogoContainer>

                {user && (
                    <UserContainer>
                        <Avatar
                            src={user.avatar}
                            sx={{
                                width: 40,
                                height: 40,
                                border: '2px solid rgba(59, 130, 246, 0.3)'
                            }}
                        >
                            {user.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: '#FFFFFF',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {user.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'rgba(248, 250, 252, 0.7)',
                                    fontSize: '0.75rem'
                                }}
                            >
                                {user.role}
                            </Typography>
                        </Box>
                    </UserContainer>
                )}

                <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
                    <List sx={{ py: 2 }}>
                        {menuItems.map((item) => (
                            <ListItem key={item.id} disablePadding>
                                <StyledListItemButton
                                    active={isActive(item.path)}
                                    onClick={() => handleItemClick(item.path)}
                                >
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} />
                                    {item.badge && item.badge > 0 && (
                                        <Badge>{item.badge}</Badge>
                                    )}
                                </StyledListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Divider sx={{ borderColor: 'rgba(248, 250, 252, 0.08)' }} />
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(248, 250, 252, 0.5)',
                            display: 'block'
                        }}
                    >
                        © 2024 Argon Admin
                    </Typography>
                </Box>
            </Box>
        </StyledDrawer>
    );
};

export default ArgonSidebar;