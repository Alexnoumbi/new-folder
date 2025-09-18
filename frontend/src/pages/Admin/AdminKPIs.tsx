import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import KPIList from '../../components/KPI/KPIList';
import CreateKPIForm from '../../components/KPI/CreateKPIForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminKPIs = () => {
  const [value, setValue] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleKPICreated = () => {
    setValue(0); // Retour à l'onglet liste
    setRefreshKey(prev => prev + 1); // Force le rafraîchissement de la liste
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, p: 2 }}>
        Gestion des KPIs
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Liste des KPIs" />
          <Tab label="Créer un KPI" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <KPIList key={refreshKey} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CreateKPIForm onSuccess={handleKPICreated} />
      </TabPanel>
    </Box>
  );
};

export default AdminKPIs;
