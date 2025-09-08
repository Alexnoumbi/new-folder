import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
// @ts-ignore
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

const VisitsCalendar: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Load visits
    const loadVisits = async () => {
      try {
        const response = await fetch('/api/visits');
        const data = await response.json();
        setVisits(data);
      } catch (error) {
        console.error('Error loading visits:', error);
      }
    };
    loadVisits();
  }, []);

  const handleViewReport = (visit: Visit) => {
    setSelectedVisit(visit);
    setDialogOpen(true);
  };

  const events = visits.map(visit => ({
    id: visit._id,
    title: `${getStatusLabel(visit.status)} - Visite ${visit.type.toLowerCase()}`,
    start: new Date(visit.scheduledAt),
    end: moment(visit.scheduledAt).add(2, 'hours').toDate(),
    visit: visit,
    status: visit.status
  }));

  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: `var(--mui-palette-${statusColors[event.status as keyof typeof statusColors]}-main)`,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };
    return { style };
  };

  const getStatusLabel = (status: keyof typeof statusLabels) => {
    return statusLabels[status];
  };

  return (
    <Box sx={{ height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event: any) => {
          handleViewReport(event.visit);
        }}
        views={['month', 'week', 'day']}
        defaultView={'month'}
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
              {selectedVisit.report.files.length > 0 && (
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
