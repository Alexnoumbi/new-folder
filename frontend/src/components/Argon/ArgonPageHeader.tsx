import React from 'react';
import { Box, Typography, Button, IconButton, Breadcrumbs, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Home, ChevronRight, Refresh, Add, Edit, Delete } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

interface ArgonPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ActionButton[];
  onRefresh?: () => void;
  loading?: boolean;
}

const HeaderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: theme.spacing(3),
}));

const HeaderTop = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const TitleSection = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const ActionsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  '& .MuiBreadcrumbs-separator': {
    color: 'text.secondary',
  },
}));

const BreadcrumbLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  textDecoration: 'none',
  color: 'text.secondary',
  fontWeight: 500,
  transition: 'color 0.2s ease',
  '&:hover': {
    color: 'primary.main',
  },
}));

const getActionColor = (color?: string) => {
  switch (color) {
    case 'success': return '#4caf50';
    case 'error': return '#f44336';
    case 'warning': return '#ff9800';
    case 'info': return '#2196f3';
    default: return '#1976d2';
  }
};

const ArgonPageHeader: React.FC<ArgonPageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  onRefresh,
  loading = false
}) => {
  const location = useLocation();

  // Breadcrumbs par défaut basés sur la route actuelle
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', href: '/', icon: <Home /> },
    ...breadcrumbs
  ];

  return (
    <HeaderContainer>
      <HeaderTop>
        <TitleSection>
          {defaultBreadcrumbs.length > 1 && (
            <StyledBreadcrumbs
              separator={<ChevronRight fontSize="small" />}
              aria-label="breadcrumb"
              sx={{ mb: 1 }}
            >
              {defaultBreadcrumbs.map((item, index) => {
                const isLast = index === defaultBreadcrumbs.length - 1;
                
                if (isLast) {
                  return (
                    <Typography key={index} variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                  );
                }
                
                return (
                  <BreadcrumbLink key={index} href={item.href} color="inherit">
                    {item.icon}
                    {item.label}
                  </BreadcrumbLink>
                );
              })}
            </StyledBreadcrumbs>
          )}
          
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            {title}
          </Typography>
          
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </TitleSection>

        <ActionsSection>
          {onRefresh && (
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{ color: 'text.secondary' }}
            >
              <Refresh />
            </IconButton>
          )}
          
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'contained'}
              startIcon={action.icon}
              onClick={action.onClick}
              sx={{
                ...(action.variant === 'contained' && {
                  background: action.color === 'primary' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : `linear-gradient(135deg, ${getActionColor(action.color)} 0%, ${getActionColor(action.color)}dd 100%)`,
                  '&:hover': {
                    background: action.color === 'primary' 
                      ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                      : `linear-gradient(135deg, ${getActionColor(action.color)}dd 0%, ${getActionColor(action.color)}bb 100%)`,
                  },
                }),
                ...(action.variant === 'outlined' && {
                  borderColor: getActionColor(action.color),
                  color: getActionColor(action.color),
                  '&:hover': {
                    backgroundColor: `${getActionColor(action.color)}10`,
                    borderColor: getActionColor(action.color),
                  },
                }),
                ...(action.variant === 'text' && {
                  color: getActionColor(action.color),
                  '&:hover': {
                    backgroundColor: `${getActionColor(action.color)}10`,
                  },
                }),
              }}
            >
              {action.label}
            </Button>
          ))}
        </ActionsSection>
      </HeaderTop>
    </HeaderContainer>
  );
};

export default ArgonPageHeader; 