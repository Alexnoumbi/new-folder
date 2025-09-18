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
  IconButton
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
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

const statusColors = {
  PLANNED: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  SCHEDULED: 'info'
};

const statusLabels = {
  PLANNED: 'Planifiée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  SCHEDULED: 'Planifiée'
};

const monthLabels = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

const VisitsCalendar: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const [filters, setFilters] = useState<{[k in keyof typeof statusLabels]: boolean}>({
    PLANNED: true,
    COMPLETED: true,
    CANCELLED: true,
    SCHEDULED: true
  });
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const loadVisits = async () => {
      try {
        if (!user?.entrepriseId) return;
        const data: any = await visitService.getVisitsByEnterprise(user.entrepriseId);
        const normalized: Visit[] = Array.isArray(data)
          ? data
          : (Array.isArray(data?.data) ? data.data : []);
        setVisits(normalized as any);
      } catch (error) {
        console.error('Error loading visits:', error);
        setVisits([] as any);
      }
    };
    loadVisits();
  }, [user]);

  const handleViewReport = (visit: Visit) => {
    setSelectedVisit(visit);
    setDialogOpen(true);
  };

  const filteredVisits = useMemo(() => {
    const list = Array.isArray(visits) ? visits : [];
    return list.filter(v => filters[(v as any).status as keyof typeof statusLabels]);
  }, [visits, filters]);

  const events = filteredVisits.map(visit => ({
    id: (visit as any)._id,
    title: `${getStatusLabel((visit as any).status)} - Visite ${(visit as any).type?.toLowerCase?.() || ''}`,
    start: new Date((visit as any).scheduledAt),
    end: moment((visit as any).scheduledAt).add(2, 'hours').toDate(),
    visit: visit,
    status: (visit as any).status
  }));

  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: `var(--mui-palette-${statusColors[event.status as keyof typeof statusColors]}-main)`,
      borderRadius: '8px',
      opacity: 0.95,
      color: 'white',
      border: 'none',
      display: 'block',
      padding: '2px 6px'
    } as React.CSSProperties;
    return { style };
  };

  function getStatusLabel(status: keyof typeof statusLabels) {
    return statusLabels[status];
  }

  const goPrev = () => setCurrentDate(prev => moment(prev).subtract(1, 'month').toDate());
  const goNext = () => setCurrentDate(prev => moment(prev).add(1, 'month').toDate());
  const goToday = () => setCurrentDate(new Date());

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
      gap: 2,
      minHeight: 480
    }}>
      {/* Panneau gauche */}
      <Box sx={{
        borderRadius: 3,
        background: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)',
        color: 'white',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ mr: 1 }}>
              <Box sx={{ width: 24, height: 2, bgcolor: 'white', borderRadius: 1, mb: 0.5 }} />
              <Box sx={{ width: 24, height: 2, bgcolor: 'white', borderRadius: 1, mb: 0.5 }} />
              <Box sx={{ width: 24, height: 2, bgcolor: 'white', borderRadius: 1 }} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Agenda</Typography>
          </Box>

          <Typography variant="h2" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {format(currentDate, 'dd', { locale: fr })}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            {format(currentDate, 'EEEE', { locale: fr }).toUpperCase()}
          </Typography>

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Événements du jour
          </Typography>
          <Box component="ul" sx={{ pl: 3, m: 0 }}>
            {events.filter(e => format(e.start, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')).slice(0, 3).map((e) => (
              <li key={e.id}>{e.title}</li>
            ))}
            {events.filter(e => format(e.start, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')).length === 0 && (
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Aucun événement</Typography>
            )}
          </Box>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>Actions</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button size="small" variant="outlined" color="inherit" startIcon={<AddIcon />} sx={{ borderColor: 'white', color: 'white' }}>
              Nouvelle visite
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Panneau calendrier */}
      <Box sx={{
        borderRadius: 3,
        bgcolor: 'background.paper',
        p: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        {/* Header mois/année */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={goPrev}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton size="small" onClick={goNext}>
              <ChevronRightIcon />
            </IconButton>
            <Button size="small" onClick={goToday}>Aujourd'hui</Button>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </Typography>
          <FormGroup row>
            {Object.keys(statusLabels).map((key) => (
              <FormControlLabel
                key={key}
                control={<Checkbox size="small" checked={filters[key as keyof typeof statusLabels]} onChange={(e) => setFilters(prev => ({...prev, [key]: e.target.checked}))} />}
                label={statusLabels[key as keyof typeof statusLabels]}
              />
            ))}
          </FormGroup>
        </Box>

        {/* Ligne des mois */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary', mb: 1, flexWrap: 'wrap' }}>
          {monthLabels.map((m, idx) => (
            <Typography
              key={m}
              variant="body2"
              sx={{ cursor: 'pointer', fontWeight: moment(currentDate).month() === idx ? 700 : 500, color: moment(currentDate).month() === idx ? 'primary.main' : 'text.secondary' }}
              onClick={() => setCurrentDate(d => moment(d).month(idx).toDate())}
            >
              {m}
            </Typography>
          ))}
        </Box>

        {/* Calendrier */}
        <Box sx={{ height: 420, '& .rbc-toolbar': { display: 'none' }, '& .rbc-month-view': { border: 'none' }, '& .rbc-header': { padding: '6px 0', fontWeight: 600, color: 'text.secondary' }, '& .rbc-date-cell': { padding: '4px 6px' }, '& .rbc-today': { backgroundColor: 'rgba(39, 174, 96, 0.08)' }, '& .rbc-off-range-bg': { backgroundColor: 'action.hover' } }}>
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
      </Box>

      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Rapport de visite - {selectedVisit && format(new Date(selectedVisit.scheduledAt), 'PPP', { locale: fr })}
        </DialogTitle>
        <DialogContent dividers>
          {selectedVisit?.report && (
            <>
              <Typography variant="body1" paragraph>
                {selectedVisit.report.content}
              </Typography>
              {selectedVisit.report.files?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Pièces jointes:
                  </Typography>
                  {selectedVisit.report.files.map((file: any, index: number) => (
                    <Button
                      key={index}
                      startIcon={<DescriptionIcon />}
                      href={file.url}
                      target="_blank"
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {file.name}
                    </Button>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisitsCalendar;
