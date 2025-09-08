import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { SystemProps } from '@mui/system';

interface BoxItemProps extends BoxProps {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  children: ReactNode;
}

export const BoxItem: React.FC<BoxItemProps> = ({
  children,
  xs = 12,
  sm,
  md,
  lg,
  xl,
  ...props
}) => (
  <Box
    sx={{
      width: {
        xs: `${(xs / 12) * 100}%`,
        ...(sm && { sm: `${(sm / 12) * 100}%` }),
        ...(md && { md: `${(md / 12) * 100}%` }),
        ...(lg && { lg: `${(lg / 12) * 100}%` }),
        ...(xl && { xl: `${(xl / 12) * 100}%` }),
      },
      ...props.sx
    }}
    {...props}
  >
    {children}
  </Box>
);
