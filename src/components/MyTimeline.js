import React, { useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Gantt from 'frappe-gantt';
import '../styles/frappe-gantt.css';
import { Box, Button, TextField, Paper, Typography, Drawer, IconButton, Divider, Chip } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';

const VIEW_MODES = ['Day', 'Week', 'Month', 'Year'];

function parseDate(val, fallback) {
  if (!val) return fallback;
  let d;
  if (val instanceof Date) d = val;
  else if (typeof val === 'string') {
    const [dd, mm, yy] = val.split('/').map(Number);
    d = new Date(yy, mm - 1, dd);
  } else d = moment(val).toDate();
  return isNaN(d.getTime()) ? fallback : d;
}

export default function MyTimeline({ tasks }) {
  const [filter, setFilter] = useState('');
  const [viewModeIdx, setViewModeIdx] = useState(2);
  const [selectedTask, setSelectedTask] = useState(null);
  const containerRef = useRef(null);

  const filtered = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  const ganttTasks = useMemo(
    () => filtered.map(t => {
      // sanitize Estado and etapa for CSS class names
      const estadoClass = `status-${t.Estado.replace(/\s+/g, '')}`;
      const etapaKey = (t.etapa || '').replace(/\s+/g, '');
      const etapaClass = `etapa-${etapaKey}`;
      return {
        id: String(t.id),
        name: t.title,
        start: moment(parseDate(t.startDate, new Date())).format('YYYY-MM-DD'),
        end: moment(parseDate(t.endDate, new Date())).format('YYYY-MM-DD'),
        progress: Number(t.progress) || 0,
        dependencies: (t.dependencies || []).join(','),
        custom_class: `${estadoClass} ${etapaClass}`
      };
    }),
    [filtered]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    new Gantt(el, ganttTasks, {
      on_click: task => setSelectedTask(tasks.find(x => String(x.id) === task.id)),
      view_mode: VIEW_MODES[viewModeIdx],
      language: 'es'
    });
  }, [ganttTasks, viewModeIdx, tasks]);

  const zoomOut = () => setViewModeIdx(i => Math.min(i + 1, VIEW_MODES.length - 1));
  const zoomIn = () => setViewModeIdx(i => Math.max(i - 1, 0));
  const close = () => setSelectedTask(null);

  return (
    <Paper sx={{ p:3, borderRadius:2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb:2 }}>
        <ScheduleIcon fontSize="large" sx={{ mr:1 }} />
        <Typography variant="h5">Roadmap Timeline</Typography>
      </Box>
      <Box sx={{ display:'flex', gap:2, mb:2, flexWrap:'wrap' }}>
        <TextField
          label="Buscar"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button variant="outlined" size="small" onClick={zoomOut}>- Zoom</Button>
        <Button variant="outlined" size="small" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <div ref={containerRef} style={{ width: '100%', overflowX: 'auto' }} />

      <Drawer anchor="right" open={Boolean(selectedTask)} onClose={close} PaperProps={{ sx:{ width:350, p:2 } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
          <Typography variant="h6">Tarea Detalle</Typography>
          <IconButton onClick={close}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb:2 }} />
        {selectedTask && (
          <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
            <Typography><strong>ID:</strong> {selectedTask.id}</Typography>
            <Typography><strong>Nombre:</strong> {selectedTask.title}</Typography>
            <Typography><strong>Inicio:</strong> {moment(selectedTask.startDate).format('DD/MM/YYYY')}</Typography>
            <Typography><strong>Fin:</strong> {moment(selectedTask.endDate).format('DD/MM/YYYY')}</Typography>
            <Typography><strong>Progreso:</strong> {selectedTask.progress}%</Typography>
            {selectedTask.etapa && (
              <Chip
                label={selectedTask.etapa}
                size="small"
                sx={{
                  bgcolor: 'primary.main', // badge color independent
                  color: '#fff',
                  fontSize: 10
                }}
              />
            )}
          </Box>
        )}
      </Drawer>
    </Paper>
  );
}

MyTimeline.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id        : PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title     : PropTypes.string.isRequired,
    startDate : PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    endDate   : PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    Estado    : PropTypes.string,
    etapa     : PropTypes.string,
    Estimacion: PropTypes.any,
    progress  : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  })).isRequired,
};
