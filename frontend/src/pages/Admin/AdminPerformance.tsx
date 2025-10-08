import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Chip,
  LinearProgress,
  Paper,
  Tooltip,
  IconButton
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  Assessment,
  Timeline,
  BarChart,
  ShowChart,
  PieChart as PieChartIcon,
  Refresh,
  Download,
  FilterList
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminPerformance: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  // Données de performance par module
  const modulePerformance = [
    { module: 'Portfolios', score: 92, trend: 'up', target: 85 },
    { module: 'Projets', score: 88, trend: 'up', target: 80 },
    { module: 'KPI', score: 95, trend: 'up', target: 90 },
    { module: 'Compliance', score: 78, trend: 'down', target: 85 },
    { module: 'Documents', score: 85, trend: 'neutral', target: 80 },
    { module: 'Rapports', score: 91, trend: 'up', target: 85 }
  ];

  // Évolution temporelle
  const timelineData = [
    { month: 'Jan', overall: 82, projets: 78, kpi: 85, compliance: 80 },
    { month: 'Fév', overall: 84, projets: 80, kpi: 87, compliance: 81 },
    { month: 'Mar', overall: 86, projets: 83, kpi: 89, compliance: 83 },
    { month: 'Avr', overall: 88, projets: 85, kpi: 91, compliance: 85 },
    { month: 'Mai', overall: 89, projets: 87, kpi: 92, compliance: 86 },
    { month: 'Jun', overall: 91, projets: 88, kpi: 95, compliance: 88 }
  ];

  // Comparaison par équipe/département
  const teamComparison = [
    { team: 'Équipe A', projets: 12, kpi: 45, budget: 85, satisfaction: 92 },
    { team: 'Équipe B', projets: 15, kpi: 52, budget: 78, satisfaction: 88 },
    { team: 'Équipe C', projets: 10, kpi: 38, budget: 92, satisfaction: 85 },
    { team: 'Équipe D', projets: 8, kpi: 30, budget: 88, satisfaction: 90 }
  ];

  // Radar multi-dimensions
  const dimensionsData = [
    { dimension: 'Qualité', value: 92 },
    { dimension: 'Délais', value: 85 },
    { dimension: 'Budget', value: 88 },
    { dimension: 'Satisfaction', value: 90 },
    { dimension: 'Innovation', value: 78 },
    { dimension: 'Impact', value: 95 }
  ];

  // Distribution des performances
  const performanceDistribution = [
    { range: '90-100%', count: 12, color: theme.palette.success.main },
    { range: '80-89%', count: 18, color: theme.palette.info.main },
    { range: '70-79%', count: 8, color: theme.palette.warning.main },
    { range: '<70%', count: 3, color: theme.palette.error.main }
  ];

  const COLORS = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp fontSize="small" color="success" />;
    if (trend === 'down') return <TrendingDown fontSize="small" color="error" />;
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
          <Box>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Analyse de Performance
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue détaillée des performances par module et équipe
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Période</InputLabel>
              <Select
                value={timeRange}
                label="Période"
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="7d">7 derniers jours</MenuItem>
                <MenuItem value="30d">30 derniers jours</MenuItem>
                <MenuItem value="90d">3 derniers mois</MenuItem>
                <MenuItem value="1y">1 an</MenuItem>
              </Select>
            </FormControl>
            
            <Tooltip title="Actualiser">
              <IconButton
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Télécharger">
              <IconButton
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <Download color="primary" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Performance par Module */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {modulePerformance.map((module, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: module.score >= module.target ? 'success.main' : 'warning.main',
                background: `linear-gradient(135deg, ${alpha(
                  module.score >= module.target ? theme.palette.success.main : theme.palette.warning.main, 
                  0.05
                )} 0%, ${alpha(
                  module.score >= module.target ? theme.palette.success.main : theme.palette.warning.main, 
                  0.02
                )} 100%)`,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    {module.module}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {getTrendIcon(module.trend)}
                    <Chip 
                      label={`${module.score}%`} 
                      color={module.score >= module.target ? 'success' : 'warning'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                </Stack>

                <Box mb={1.5}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Score vs Cible ({module.target}%)
                    </Typography>
                    <Typography variant="caption" fontWeight={600}>
                      {module.score - module.target > 0 ? '+' : ''}{module.score - module.target}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={module.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.grey[500], 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: module.score >= module.target
                          ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`
                          : `linear-gradient(90deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
                      }
                    }}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Objectif: {module.target}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Graphiques Avancés */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Évolution Temporelle */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }}
                >
                  <ShowChart sx={{ color: 'primary.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Évolution des Performances
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tendances mensuelles par module
                  </Typography>
                </Box>
              </Stack>

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="overall"
                    name="Score Global"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projets"
                    name="Projets"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="kpi"
                    name="KPI"
                    stroke={theme.palette.info.main}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    name="Compliance"
                    stroke={theme.palette.warning.main}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.info.main, 0.1)
                  }}
                >
                  <PieChartIcon sx={{ color: 'info.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Distribution
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Répartition des scores
                  </Typography>
                </Box>
              </Stack>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={performanceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {performanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>

              <Stack spacing={1} mt={2}>
                {performanceDistribution.map((item, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: item.color
                        }}
                      />
                      <Typography variant="body2">{item.range}</Typography>
                    </Stack>
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{
                        bgcolor: alpha(item.color, 0.1),
                        color: item.color,
                        fontWeight: 600
                      }}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Comparaison par Équipe & Dimensions */}
      <Grid container spacing={3}>
        {/* Comparaison Équipes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.success.main, 0.1)
                  }}
                >
                  <BarChart sx={{ color: 'success.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Performance par Équipe
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Comparaison des indicateurs clés
                  </Typography>
                </Box>
              </Stack>

              <ResponsiveContainer width="100%" height={350}>
                <RechartsBarChart data={teamComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="team" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="projets" fill={theme.palette.primary.main} name="Projets" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="kpi" fill={theme.palette.success.main} name="KPI" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="budget" fill={theme.palette.warning.main} name="Budget %" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="satisfaction" fill={theme.palette.info.main} name="Satisfaction" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Analyse Multi-Dimensions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.1)
                  }}
                >
                  <Assessment sx={{ color: 'warning.main', fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    Analyse Multi-Dimensionnelle
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Performance sur 6 dimensions clés
                  </Typography>
                </Box>
              </Stack>

              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={dimensionsData}>
                  <PolarGrid stroke={theme.palette.divider} />
                  <PolarAngleAxis dataKey="dimension" stroke={theme.palette.text.secondary} />
                  <PolarRadiusAxis stroke={theme.palette.text.secondary} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>

              <Grid container spacing={1} mt={2}>
                {dimensionsData.map((dim, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.grey[500], 0.05)
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {dim.dimension}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {dim.value}%
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminPerformance;

