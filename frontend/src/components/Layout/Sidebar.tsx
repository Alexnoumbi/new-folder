import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export interface SidebarItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  sections: SidebarSection[];
  title: string;
  width?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onClose,
  sections,
  title,
  width = 280,
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

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, p: 1 }}>
        {sections.map((section, sectionIndex) => (
          <Box key={sectionIndex}>
            {section.title && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    px: 2,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {section.title}
                </Typography>
              </>
            )}
            <List component="nav" sx={{ py: 0 }}>
              {section.items.map((item) => (
                <ListItemButton
                  key={item.id}
                  selected={location.pathname.includes(item.path)}
                  onClick={() => handleItemClick(item.path)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    color: 'white',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.4)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: location.pathname.includes(item.path) ? 600 : 400,
                    }}
                  />
                  {item.badge && (
                    <Box
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        borderRadius: '50%',
                        minWidth: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {item.badge}
                    </Box>
                  )}
                </ListItemButton>
              ))}
            </List>
            {sectionIndex < sections.length - 1 && (
              <Divider sx={{ my: 1, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          backgroundColor: '#1f2937',
          borderRight: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar; 