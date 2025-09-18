import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AdminSettings: React.FC = () => {
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Paramètres administrateur
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box width="100%">
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configuration générale
            </Typography>
            {/* Settings content will go here */}
            <Typography variant="body1">
              Cette section est en cours de développement.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminSettings;
