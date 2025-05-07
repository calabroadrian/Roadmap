import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Gantt from 'frappe-gantt';
import '../styles/frappe-gantt.css';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Drawer,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';

// Color maps
const ETAPA_STYLES = { /* ... same as before ... */ };
const STATE_STYLES = { /* ... same as before ... */ };
const VIEW_MODES = ['Day', 'Week', 'Month', 'Year'];

// Utility
function parseDate(val, fallback) { /* unchanged */ }

export default function MyTimeline({ tasks, onTaskChange }) {
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('Month');
  const [selectedTask, setSelectedTask] = useState(null);
  const [groupByEtapa, setGroupByEtapa] = useState(false);
  const containerRef = useRef(null);
  const ganttRef = useRef(null);

  // Debounce filter input
  const handleFilterChange = useCallback(
    debounce(val => setFilter(val), 300), []
  );

  const filtered = useMemo(() => {
    let arr = tasks;
    if (filter) arr = arr.filter(t => t.title.toLowerCase().includes(filter.toLowerCase()));
    if (groupByEtapa) arr = arr.sort((a, b) => (a.etapa || '').localeCompare(b.etapa || ''));
    return arr;
  }, [tasks, filter, groupByEtapa]);

  const ganttTasks = useMemo(
    () => filtered.map(t => {
      const [bgColor, progressColor] = STATE_STYLES[t.Estado] || STATE_STYLES.Nuevo;
      const etapaKey = (t.etapa || '').replace(/\s+/g, '');
      const etapaColor = ETAPA_STYLES[etapaKey] || bgColor;
      return {
        id: String(t.id),
        name: t.title,
        start: moment(parseDate(t.startDate, new Date())).format('YYYY-MM-DD'),
        end: moment(parseDate(t.endDate, new Date())).format('YYYY-MM-DD'),
        progress: Number(t.progress) || 0,
        dependencies: (t.dependencies || []).join(','),
        custom_class: t.Estimacion ? '' : 'bar--no-estimation',
        barColor: etapaColor,
        barProgressColor: progressColor
      };
    }), [filtered]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    ganttRef.current = new Gantt(el, ganttTasks, {
      view_mode: viewMode,
      language: 'es',
      on_click: task => {
        const orig = tasks.find(x => String(x.id) === task.id);
        setSelectedTask(orig);
      },
      on_date_change: (task, start, end) => {
        onTaskChange({ ...tasks.find(t => String(t.id) === task.id), startDate: start, endDate: end });
      },
      on_progress_change: (task, progress) => {
        onTaskChange({ ...tasks.find(t => String(t.id) === task.id), progress });
      }
    });
    return () => ganttRef.current && ganttRef.current.clear();
  }, [ganttTasks, viewMode, tasks, onTaskChange]);

  const exportPNG = () => {
    if (ganttRef.current) ganttRef.current.download('png');
  };

  return (
    <Paper sx={{ p:3, borderRadius:2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb:2 }}>
        <ScheduleIcon fontSize="large" sx={{ mr:1 }} />
        <Typography variant="h5">Roadmap Timeline</Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ display:'flex', gap:2, mb:2, flexWrap:'wrap' }}>
        <TextField label="Buscar" size="small" onChange={e => handleFilterChange(e.target.value)} />

        <FormControl size="small">
          <InputLabel>Vista</InputLabel>
          <Select
            value={viewMode}
            label="Vista"
            onChange={e => setViewMode(e.target.value)}
          >
            {VIEW_MODES.map(mode => <MenuItem key={mode} value={mode}>{mode}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControlLabel
          control={<Switch checked={groupByEtapa} onChange={e => setGroupByEtapa(e.target.checked)} />}
          label="Agrupar por Etapa"
        />

        <Button variant="outlined" size="small" onClick={exportPNG}>Exportar PNG</Button>
      </Box>

      {/* Gantt Container */}
      <div ref={containerRef} style={{ width: '100%', overflowX: 'auto' }} />

      {/* Detail Drawer */}
      <Drawer anchor="right" open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)}
        PaperProps={{ sx:{ width:350, p:2 } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
          <Typography variant="h6">Detalle de Tarea</Typography>
          <IconButton onClick={() => setSelectedTask(null)}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb:2 }} />

        {selectedTask && (
          <Box component="form" sx={{ display:'flex', flexDirection:'column', gap:1 }} onSubmit={e => e.preventDefault()}>
            <TextField
              label="Nombre"
              value={selectedTask.title}
              onChange={e => onTaskChange({ ...selectedTask, title: e.target.value })}
            />
            <TextField
              label="Inicio"
              type="date"
              value={moment(selectedTask.startDate).format('YYYY-MM-DD')}
              onChange={e => onTaskChange({ ...selectedTask, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fin"
              type="date"
              value={moment(selectedTask.endDate).format('YYYY-MM-DD')}
              onChange={e => onTaskChange({ ...selectedTask, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Progreso"
              type="number"
              inputProps={{ min:0, max:100 }}
              value={selectedTask.progress}
              onChange={e => onTaskChange({ ...selectedTask, progress: e.target.value })}
            />
            {selectedTask.etapa && (
              <Chip
                label={selectedTask.etapa}
                sx={{ bgcolor: ETAPA_STYLES[selectedTask.etapa.replace(/\s+/g, '')] }}
              />
            )}
          </Box>
        )}
      </Drawer>
    </Paper>
  );
}

MyTimeline.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({ /* unchanged */ })).isRequired,
  onTaskChange: PropTypes.func // callback for edits
};

// Debounce util
t function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
