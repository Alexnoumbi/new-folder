import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  Add,
  MoreVert,
  TrendingUp,
  Assignment,
  Timeline,
  AccountTree,
  Warning,
  CheckCircle,
  Edit,
  Delete,
  Visibility
} from '@mui/icons-material';
import resultsFrameworkService, { ResultsFramework } from '../../services/resultsFrameworkService';
import { colorUtils } from '../../theme/modernTheme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminResultsFramework: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ResultsFramework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<ResultsFramework | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadFrameworks();
  }, []);

  const loadFrameworks = async () => {
    try {
      // Pour l'instant, on charge tous les frameworks (à adapter selon le projet)
      // const data = await resultsFrameworkService.getFrameworksByProject(projectId);
      // setFrameworks(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des cadres:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'Brouillon',
      ACTIVE: 'Actif',
      COMPLETED: 'Terminé',
      ARCHIVED: 'Archivé'
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Cadres de Résultats
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gérez vos cadres logiques et théories du changement
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={() => setOpenDialog(true)}
        >
          Nouveau Cadre
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cadres Actifs
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {frameworks.filter(f => f.status === 'ACTIVE').length}
                  </Typography>
                </Box>
                <AccountTree sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Outcomes Totaux
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {frameworks.reduce((sum, f) => sum + f.outcomes.length, 0)}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Activités En Cours
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {frameworks.reduce((sum, f) => 
                      sum + f.activities.filter(a => a.status === 'IN_PROGRESS').length, 0
                    )}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'warning.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Progression Moyenne
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {frameworks.length > 0
                      ? Math.round(
                          frameworks.reduce((sum, f) => sum + (f.overallProgress || 0), 0) /
                            frameworks.length
                        )
                      : 0}%
                  </Typography>
                </Box>
                <Timeline sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Frameworks List */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label="Tous" />
            <Tab label="Actifs" />
            <Tab label="Brouillons" />
            <Tab label="Terminés" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {frameworks.length === 0 ? (
              <Alert severity="info">
                Aucun cadre de résultats. Créez-en un pour commencer !
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {frameworks.map((framework) => (
                  <Grid item xs={12} md={6} key={framework._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {framework.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {framework.description}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={getStatusLabel(framework.status)}
                              color={getStatusColor(framework.status) as any}
                              size="small"
                            />
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" mb={1}>
                            <Typography variant="body2">Progression</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {framework.overallProgress || 0}%
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={framework.overallProgress || 0}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Outcomes
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {framework.outcomes.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Outputs
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {framework.outputs.length}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="caption" color="text.secondary">
                              Activités
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {framework.activities.length}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Stack direction="row" spacing={1} mt={2}>
                          <Button
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => setSelectedFramework(framework)}
                          >
                            Voir
                          </Button>
                          <Button size="small" startIcon={<Edit />}>
                            Éditer
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {frameworks
                .filter(f => f.status === 'ACTIVE')
                .map((framework) => (
                  <Grid item xs={12} md={6} key={framework._id}>
                    {/* Same card structure */}
                  </Grid>
                ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Brouillons */}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Terminés */}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Create Framework Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer un Nouveau Cadre de Résultats</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nom du Cadre"
              fullWidth
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Type de Cadre</InputLabel>
              <Select label="Type de Cadre">
                <MenuItem value="LOGFRAME">Cadre Logique</MenuItem>
                <MenuItem value="THEORY_OF_CHANGE">Théorie du Changement</MenuItem>
                <MenuItem value="RESULTS_CHAIN">Chaîne de Résultats</MenuItem>
                <MenuItem value="OUTCOME_MAPPING">Cartographie des Résultats</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Date de Début"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Date de Fin"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button variant="contained">Créer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminResultsFramework;

