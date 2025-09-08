import React from 'react';
import { Grid, GridProps } from '@mui/material';

export const GridItem: React.FC<GridProps> = ({ children, ...props }) => (
  <Grid item {...(props as any)}>
    {children}
  </Grid>
);
