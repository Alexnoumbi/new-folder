import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Paper,
  Chip,
  Stack,
  useTheme,
  alpha,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Description as DescriptionIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  TrendingUp,
  CalendarMonth,
  CheckCircle,
  Warning,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// @ts-ignore
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import visitService from '../../services/visitService';
import { useAuth } from '../../hooks/useAuth';

interface Visit {
  _id: string;
  type: string;
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'SCHEDULED';
  scheduledAt: string;
  report?: {
    content: string;
    files: { name: string; url: string; }[];
    submittedAt: string;
    submittedBy: string;
    outcome: 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_FOLLOW_UP';
  };
}

moment.locale('fr');
const localizer = momentLocalizer(moment);

const statusConfig = {
  PLANNED: { 
    color: '#2196F3', 
    label: 'Planifiée', 
    icon: <CalendarMonth />,
    lightColor: '#E3F2FD'
  },
  COMPLETED: { 
    color: '#4CAF50', 
    label: 'Terminée', 
    icon: <CheckCircle />,
    lightColor: '#E8F5E9'
  },
  CANCELLED: { 
    color: '#F44336', 
    label: 'Annulée', 
    icon: <Cancel />,
    lightColor: '#FFEBEE'
  },
  SCHEDULED: { 
    color: '#FF9800', 
    label: 'Planifiée', 
    icon: <TrendingUp />,
    lightColor: '#FFF3E0'
  }
};

const monthLabels = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const monthLabelsShort = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const VisitsCalendar: React.FC = () => {
  const theme = useTheme();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const [filters, setFilters] = useState<{[k in keyof typeof statusConfig]: boolean}>({
    PLANNED: true,
    COMPLETED: true,
    CANCELLED: true,
    SCHEDULED: true
  });
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const loadVisits = async () => {
    try {
      console.log('👤 User data:', user);
      if (!user?.entrepriseId) {
        console.warn('❌ No entrepriseId for user');
        return;
      }
      console.log('🔄 Fetching visits for entrepriseId:', user.entrepriseId);
      setRefreshing(true);
      const data: any = await visitService.getVisitsByEnterprise(user.entrepriseId);
      console.log('📥 Visits API response:', data);
      const normalized: Visit[] = Array.isArray(data)
        ? data
        : (Array.isArray(data?.data) ? data.data : []);
      console.log('✅ Visits loaded:', normalized.length);
      if (normalized.length > 0) {
        console.log('📝 First visit:', normalized[0]);
      }
      setVisits(normalized as any);
    } catch (error) {
      console.error('❌ Error loading visits:', error);
      setVisits([] as any);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVisits();
    
    // Rafraîchir automatiquement toutes les 30 secondes pour voir les nouvelles visites planifiées
    const interval = setInterval(loadVisits, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleViewReport = (visit: Visit) => {
    setSelectedVisit(visit);
    setDialogOpen(true);
  };

  const filteredVisits = useMemo(() => {
    const list = Array.isArray(visits) ? visits : [];
    console.log('🔍 [FILTER] Total visits:', list.length);
    console.log('🔍 [FILTER] Filter config:', filters);
    const filtered = list.filter(v => {
      const status = (v as any).status;
      const included = filters[status as keyof typeof statusConfig];
      console.log(`🔍 [FILTER] Visit ${(v as any)._id} - status: ${status}, included: ${included}`);
      return included;
    });
    console.log('✅ [FILTER] Filtered count:', filtered.length);
    return filtered;
  }, [visits, filters]);

  const events = filteredVisits.map(visit => {
    const status = (visit as any).status;
    const config = statusConfig[status as keyof typeof statusConfig];
    console.log('📅 [EVENT] Creating event for visit:', (visit as any)._id, 'Status:', status);
    return {
      id: (visit as any)._id,
      title: `${config?.label || 'Visite'} - ${(visit as any).type?.toLowerCase?.() || 'visite'}`,
      start: new Date((visit as any).scheduledAt),
      end: moment((visit as any).scheduledAt).add(2, 'hours').toDate(),
      visit: visit,
      status: status
    };
  });
  console.log('📅 [EVENT] Total events created:', events.length);

  const eventStyleGetter = (event: any) => {
    const config = statusConfig[event.status as keyof typeof statusConfig];
    const style = {
      backgroundColor: config.color,
      borderRadius: '6px',
      opacity: 0.95,
      color: 'white',
      border: 'none',
      display: 'block',
      padding: '4px 8px',
      fontSize: '0.85rem',
      fontWeight: 500
    } as React.CSSProperties;
    return { style };
  };

  const goPrev = () => setCurrentDate(prev => moment(prev).subtract(1, 'month').toDate());
  const goNext = () => setCurrentDate(prev => moment(prev).add(1, 'month').toDate());
  const goToday = () => setCurrentDate(new Date());

  const todayEvents = events.filter(e => 
    format(e.start, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  );

  const statsData = Object.keys(statusConfig).map(status => ({
    status,
    count: filteredVisits.filter(v => v.status === status).length
  }));

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' },
      gap: 3,
      minHeight: 520
    }}>
      {/* Sidebar */}
      <Box>
        <Paper sx={{
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          mb: 2,
          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
        }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <CalendarMonth />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Mon Agenda
            </Typography>
          </Stack>

          <Typography variant="h1" sx={{ fontWeight: 700, lineHeight: 1, mb: 0.5 }}>
            {format(currentDate, 'dd')}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, mb: 3, textTransform: 'uppercase', fontWeight: 600 }}>
            {format(currentDate, 'EEEE', { locale: fr })}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, opacity: 0.9 }}>
            Événements du jour ({todayEvents.length})
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7, mb: 1, display: 'block' }}>
            {visits.length} visite(s) totale(s)
          </Typography>
          <Box>
            {todayEvents.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.8, fontStyle: 'italic' }}>
                Aucun événement prévu
              </Typography>
            ) : (
              <Stack spacing={1}>
                {todayEvents.slice(0, 3).map((e) => (
                  <Paper
                    key={e.id}
                    sx={{
                      p: 1.5,
                      bgcolor: alpha('#fff', 0.15),
                      backdropFilter: 'blur(10px)',
                      border: '1px solid',
                      borderColor: alpha('#fff', 0.2),
                      color: 'white',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      {format(e.start, 'HH:mm')}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {e.title}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>

          <Stack spacing={1} mt={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
              onClick={loadVisits}
              disabled={refreshing}
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: alpha('#fff', 0.1)
                }
              }}
            >
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
            <Typography variant="caption" sx={{ opacity: 0.7, textAlign: 'center' }}>
              Auto-refresh toutes les 30s
            </Typography>
          </Stack>
        </Paper>

        {/* Statistics */}
        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Statistiques
          </Typography>
          <Stack spacing={2}>
            {statsData.map(({ status, count }) => {
              const config = statusConfig[status as keyof typeof statusConfig];
              return (
                <Stack
                  key={status}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: config.lightColor,
                    border: 1,
                    borderColor: alpha(config.color, 0.2)
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ color: config.color }}>{config.icon}</Box>
                    <Typography variant="body2" fontWeight={500}>
                      {config.label}
                    </Typography>
                  </Stack>
                  <Chip
                    label={count}
                    size="small"
                    sx={{
                      bgcolor: config.color,
                      color: 'white',
                      fontWeight: 700
                    }}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Paper>
      </Box>

      {/* Calendar Panel */}
      <Paper sx={{
        borderRadius: 3,
        p: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: 1,
        borderColor: 'divider'
      }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Mois précédent">
                <IconButton onClick={goPrev} size="small" sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}>
                  <ChevronLeftIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Mois suivant">
                <IconButton onClick={goNext} size="small" sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}>
                  <ChevronRightIcon />
                </IconButton>
              </Tooltip>
            </Stack>
            <Button
              size="small"
              variant="outlined"
              onClick={goToday}
              sx={{ textTransform: 'none' }}
            >
              Aujourd'hui
            </Button>
          </Stack>

          <Typography variant="h5" fontWeight={700}>
            {monthLabels[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Typography>

          <FormGroup row>
            {Object.entries(statusConfig).map(([key, config]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    size="small"
                    checked={filters[key as keyof typeof statusConfig]}
                    onChange={(e) => setFilters(prev => ({...prev, [key]: e.target.checked}))}
                    sx={{
                      color: config.color,
                      '&.Mui-checked': { color: config.color }
                    }}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight={500}>
                    {config.label}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </Stack>

        {/* Month Navigation */}
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
          {monthLabelsShort.map((m, idx) => (
            <Chip
              key={m}
              label={m}
              size="small"
              onClick={() => setCurrentDate(d => moment(d).month(idx).toDate())}
              sx={{
                cursor: 'pointer',
                fontWeight: moment(currentDate).month() === idx ? 700 : 500,
                bgcolor: moment(currentDate).month() === idx
                  ? theme.palette.primary.main
                  : alpha(theme.palette.grey[500], 0.1),
                color: moment(currentDate).month() === idx
                  ? 'white'
                  : 'text.secondary',
                '&:hover': {
                  bgcolor: moment(currentDate).month() === idx
                    ? theme.palette.primary.dark
                    : alpha(theme.palette.grey[500], 0.2)
                }
              }}
            />
          ))}
        </Stack>

        {/* Calendar */}
        <Box sx={{
          height: 450,
          '& .rbc-toolbar': { display: 'none' },
          '& .rbc-month-view': {
            border: 'none',
            borderRadius: 2
          },
          '& .rbc-header': {
            padding: '12px 0',
            fontWeight: 700,
            color: theme.palette.text.primary,
            borderBottom: `2px solid ${theme.palette.divider}`,
            fontSize: '0.9rem'
          },
          '& .rbc-date-cell': {
            padding: '8px',
            fontSize: '0.9rem',
            fontWeight: 600
          },
          '& .rbc-today': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08)
          },
          '& .rbc-off-range-bg': {
            backgroundColor: alpha(theme.palette.grey[500], 0.03)
          },
          '& .rbc-day-bg': {
            borderColor: theme.palette.divider
          },
          '& .rbc-event': {
            borderRadius: '6px !important',
            border: 'none !important',
            margin: '2px !important'
          },
          '& .rbc-event-content': {
            fontSize: '0.75rem'
          }
        }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            onNavigate={(d: Date) => setCurrentDate(d)}
            view={Views.MONTH}
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event: any) => {
              handleViewReport(event.visit);
            }}
            messages={{
              next: 'Suivant',
              previous: 'Précédent',
              today: 'Aujourd\'hui',
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              noEventsInRange: 'Aucune visite dans cette période'
            }}
          />
        </Box>
      </Paper>

      {/* Report Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: selectedVisit
                ? alpha(statusConfig[selectedVisit.status as keyof typeof statusConfig].color, 0.1)
                : 'transparent'
            }}>
              {selectedVisit && statusConfig[selectedVisit.status as keyof typeof statusConfig].icon}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Rapport de visite
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedVisit && format(new Date(selectedVisit.scheduledAt), 'PPP à HH:mm', { locale: fr })}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedVisit?.report ? (
            <>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedVisit.report.content}
              </Typography>
              {selectedVisit.report.files?.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                    Pièces jointes ({selectedVisit.report.files.length}):
                  </Typography>
                  <Stack spacing={1}>
                    {selectedVisit.report.files.map((file: any, index: number) => (
                      <Button
                        key={index}
                        startIcon={<DescriptionIcon />}
                        href={file.url}
                        target="_blank"
                        variant="outlined"
                        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                      >
                        {file.name}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}
            </>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Aucun rapport disponible pour cette visite
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisitsCalendar;
