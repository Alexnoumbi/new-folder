import React from 'react';
import { default as Grid, GridLegacyProps } from '@mui/material/GridLegacy';

export const GridItem: React.FC<GridLegacyProps> = ({ children, ...props }) => (
  <Grid item {...props}>
    {children}
  </Grid>
);
