import React from 'react';
import { Box, Typography, Breadcrumbs, Link, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Home, ChevronRight, Refresh } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface ArgonBreadcrumbProps {
  items: BreadcrumbItem[];
  onRefresh?: () => void;
  loading?: boolean;
}

const BreadcrumbContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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

const ActiveBreadcrumb = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  color: 'text.primary',
  fontWeight: 600,
}));

const ArgonBreadcrumb: React.FC<ArgonBreadcrumbProps> = ({
  items,
  onRefresh,
  loading = false
}) => {
  return (
    <BreadcrumbContainer>
      <StyledBreadcrumbs
        separator={<ChevronRight fontSize="small" />}
        aria-label="breadcrumb"
      >
        <BreadcrumbLink href="/" color="inherit">
          <Home fontSize="small" />
          Accueil
        </BreadcrumbLink>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          if (isLast || item.active) {
            return (
              <ActiveBreadcrumb key={index} variant="body2">
                {item.icon}
                {item.label}
              </ActiveBreadcrumb>
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

      {onRefresh && (
        <IconButton
          size="small"
          onClick={onRefresh}
          disabled={loading}
          sx={{ color: 'text.secondary' }}
        >
          <Refresh />
        </IconButton>
      )}
    </BreadcrumbContainer>
  );
};

export default ArgonBreadcrumb; 