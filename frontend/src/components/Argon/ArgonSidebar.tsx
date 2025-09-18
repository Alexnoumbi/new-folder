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

// Types
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
        role: string;
        avatar?: string;
    };
}

// Styled components - CORRECTION: utiliser isactive au lieu de $isActive
const StyledListItemButton = styled(ListItemButton)<{ isactive?: string }>(({ theme, isactive }) => ({
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    ...(isactive === 'true' && {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
    }),
}));

const ArgonSidebar: React.FC<ArgonSidebarProps> = ({
                                                       open,
                                                       onClose,
                                                       menuItems,
                                                       user
                                                   }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            onClose();
        }
    };

    const isActiveRoute = (path: string) => {
        return location.pathname === path ? 'true' : 'false';
    };

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={open}
            onClose={onClose}
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    backgroundColor: theme.palette.background.paper,
                    borderRight: `1px solid ${theme.palette.divider}`,
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" noWrap component="div">
                    Dashboard
                </Typography>
            </Box>

            {user && (
                <Box sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={user.avatar} alt={user.name}>
                            {user.name[0]}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1">{user.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.role}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            )}

            <Divider />

            <List sx={{ p: 2 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.id} disablePadding>
                        <StyledListItemButton
                            onClick={() => handleNavigation(item.path)}
                            isactive={isActiveRoute(item.path)}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                            {item.badge && (
                                <Box
                                    sx={{
                                        bgcolor: 'error.main',
                                        color: 'error.contrastText',
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        ml: 1,
                                    }}
                                >
                                    {item.badge}
                                </Box>
                            )}
                        </StyledListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default ArgonSidebar;