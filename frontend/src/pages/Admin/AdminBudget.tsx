import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  alpha,
  Chip,
  LinearProgress,
  Paper,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { default as Grid } from '@mui/material/GridLegacy';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Receipt,
  Warning,
  Refresh,
  Download,
  FilterList
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminBudget: React.FC = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('2025');

  // Données budgétaires consolidées
  const budgetOverview = {
    total: 500000000,
    allocated: 450000000,
    spent: 375000000,
    committed: 50000000,
    available: 25000000
  };

  const budgetByCategory = [
    { name: 'Projets', budget: 250000000, spent: 200000000, percentage: 80 },
    { name: 'Opérations', budget: 100000000, spent: 85000000, percentage: 85 },
    { name: 'Infrastructure', budget: 75000000, spent: 60000000, percentage: 80 },
    { name: 'Formation', budget: 50000000, spent: 30000000, percentage: 60 },
    { name: 'R&D', budget: 25000000, spent: 0, percentage: 0 }
  ];

  const monthlyTrend = [
    { month: 'Jan', planifie: 35, depense: 32 },
    { month: 'Fév', planifie: 40, depense: 38 },
    { month: 'Mar', planifie: 45, depense: 42 },
    { month: 'Avr', planifie: 38, depense: 35 },
    { month: 'Mai', planifie: 42, depense: 40 },
    { month: 'Jun', planifie: 48, depense: 45 }
  ];

  const budgetDistribution = [
    { name: 'Alloué', value: budgetOverview.allocated },
    { name: 'Dépensé', value: budgetOverview.spent },
    { name: 'Engagé', value: budgetOverview.committed },
    { name: 'Disponible', value: budgetOverview.available }
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  const executionRate = Math.round((budgetOverview.spent / budgetOverview.allocated) * 100);

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
              Budget Consolidé
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue d'ensemble financière de tous les portfolios et projets
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Année</InputLabel>
              <Select
                value={timeRange}
                label="Année"
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
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
            <Tooltip title="Télécharger Excel">
              <IconButton
                sx={{ 
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                }}
              >
                <Download color="success" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Budget Total</Typography>
                <AccountBalance fontSize="small" color="primary" />
              </Stack>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {(budgetOverview.total / 1000000).toFixed(0)}M
              </Typography>
              <Typography variant="caption" color="text.secondary">FCFA</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: alpha(theme.palette.success.main, 0.2) }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Dépensé</Typography>
                <Receipt fontSize="small" color="success" />
              </Stack>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {(budgetOverview.spent / 1000000).toFixed(0)}M
              </Typography>
              <Chip 
                label={`${executionRate}%`} 
                size="small" 
                color="success"
                sx={{ mt: 0.5, fontWeight: 600 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: alpha(theme.palette.warning.main, 0.2) }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Engagé</Typography>
                <Warning fontSize="small" color="warning" />
              </Stack>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {(budgetOverview.committed / 1000000).toFixed(0)}M
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round((budgetOverview.committed / budgetOverview.allocated) * 100)}% du total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: 1, borderColor: alpha(theme.palette.info.main, 0.2) }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Disponible</Typography>
                <AttachMoney fontSize="small" color="info" />
              </Stack>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {(budgetOverview.available / 1000000).toFixed(0)}M
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round((budgetOverview.available / budgetOverview.total) * 100)}% restant
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Budget Distribution */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Répartition du Budget
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={budgetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {budgetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>

              <Stack spacing={1} mt={2}>
                {budgetDistribution.map((item, index) => (
                  <Stack key={index} direction="row" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: COLORS[index % COLORS.length]
                        }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight={700}>
                      {(item.value / 1000000).toFixed(0)}M FCFA
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trend */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Évolution Mensuelle
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="colorPlanifie" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDepense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                  <YAxis stroke={theme.palette.text.secondary} />
                  <RechartsTooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="planifie"
                    name="Planifié (M)"
                    stroke={theme.palette.primary.main}
                    fillOpacity={1}
                    fill="url(#colorPlanifie)"
                  />
                  <Area
                    type="monotone"
                    dataKey="depense"
                    name="Dépensé (M)"
                    stroke={theme.palette.success.main}
                    fillOpacity={1}
                    fill="url(#colorDepense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget by Category */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom mb={3}>
            Budget par Catégorie
          </Typography>

          <Stack spacing={3}>
            {budgetByCategory.map((category, index) => (
              <Box key={index}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {category.name}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {(category.spent / 1000000).toFixed(0)}M / {(category.budget / 1000000).toFixed(0)}M FCFA
                    </Typography>
                    <Chip
                      label={`${category.percentage}%`}
                      size="small"
                      color={category.percentage >= 80 ? 'success' : category.percentage >= 60 ? 'warning' : 'error'}
                      sx={{ fontWeight: 600, minWidth: 60 }}
                    />
                  </Stack>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={category.percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: category.percentage >= 80 
                        ? theme.palette.success.main 
                        : category.percentage >= 60 
                        ? theme.palette.warning.main 
                        : theme.palette.error.main
                    }
                  }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminBudget;

