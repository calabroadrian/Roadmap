// Improved MyTimeline component with refactoring and performance optimizations
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Box, Button, TextField, Paper, Typography, Chip, Tooltip } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';

// Constants
const ETAPA_STYLES = {
  CambioDeAlcance: '#FF9800',
  ImpactoEnInicio: '#F44336',
  Ajustes: '#2196F3',
  SinRequerimiento: '#9E9E9E',
  SinEstimar: '#EEEEEE',
  EnPausa: '#FFEB3B',
  InicioDeDesarrollo: '#4CAF50',
};
const STATE_STYLES = {
  Nuevo: ['#ffcdd2', '#e57373'],
  EnCurso: ['#fff9c4', '#ffeb3b'],
  EnProgreso: ['#fff9c4', '#ffeb3b'],
  Hecho: ['#c8e6c9', '#4caf50'],
};
const DEFAULT_PATTERN = 'repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)';

// Helper: safe date parsing
const parseDate = (val, fallback, endOfDay = false) => {
  let date;
  if (!val) return fallback;
  if (val instanceof Date) date = val;
  else if (typeof val === 'string') {
    const [d, m, y] = val.split('/').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = moment(val)[endOfDay ? 'endOf' : 'toDate']('day');
  }
  return isNaN(date?.getTime()) ? fallback : (endOfDay ? moment(date).endOf('day').toDate() : date);
};
const isValidDate = d => d && !isNaN(d.getTime());

const MyTimeline = ({ tasks }) => {
  const now = useMemo(() => moment(), []);
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').endOf('day').toDate();

  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);

  const filtered = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  const { ganttTasks, dependencies } = useMemo(() => {
    const gTasks = [];
    const deps = [];

    filtered.forEach(task => {
      const [bgColor, progressColor] = STATE_STYLES[task.Estado] || STATE_STYLES.Nuevo;
      const etapaColor = ETAPA_STYLES[task.etapa.replace(/\s+/g, '')] || bgColor;
      const start = parseDate(task.startDate, defaultStart);
      const end = parseDate(task.endDate, defaultEnd, true);
      const hasPattern = !task.Estimacion;
      const isMilestone = task.etapa === 'Entrega final';

      gTasks.push({
        id: String(task.id),
        name: task.title,
        start,
        end,
        progress: Number(task.progress) || 0,
        type: isMilestone ? 'milestone' : 'task',
        dependencies: (task.dependencies || []).map(String),
        styles: {
          backgroundColor: etapaColor,
          backgroundSelectedColor: etapaColor,
          progressColor,
          progressSelectedColor: progressColor,
          fontColor: '#fff',
        },
        custom_class: hasPattern ? 'task-no-estimation' : '',
      });

      (task.dependencies || []).forEach(dep => deps.push({ source: String(task.id), target: String(dep), type: 'FinishToStart' }));
    });
    return { ganttTasks: gTasks, dependencies: deps };
  }, [filtered, defaultStart, defaultEnd]);

  const zoomIn = useCallback(() => setViewMode(vm => {
    if (vm === ViewMode.Year) return ViewMode.Month;
    if (vm === ViewMode.Month) return ViewMode.Week;
    if (vm === ViewMode.Week) return ViewMode.Day;
    return vm;
  }), []);

  const zoomOut = useCallback(() => setViewMode(vm => {
    if (vm === ViewMode.Day) return ViewMode.Week;
    if (vm === ViewMode.Week) return ViewMode.Month;
    if (vm === ViewMode.Month) return ViewMode.Year;
    return vm;
  }), []);

  const taskContent = useCallback(task => (
    <Box sx={{
      ...task.styles,
      borderRadius: 2,
      p: 1,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundImage: task.custom_class ? DEFAULT_PATTERN : 'none',
      overflow: 'hidden',
      position: 'relative',
      fontSize: 13,
    }}>
      <Box sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        <Tooltip title={task.name} arrow>
          <Typography noWrap>{task.name}</Typography>
        </Tooltip>
      </Box>
      {task.etapa && (
        <Chip label={task.etapa} size="small" sx={{
          position: 'absolute', top: 4, right: 4, bgcolor: ETAPA_STYLES[task.etapa.replace(/\s+/g, '')] || '#757575', color: '#fff', fontSize: 10
        }}/>
      )}
    </Box>
  ), []);

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ScheduleIcon fontSize="large" sx={{ mr: 1 }} />
        <Typography variant="h5">Roadmap Timeline</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button variant="outlined" size="small" onClick={zoomOut}>- Zoom</Button>
        <Button variant="outlined" size="small" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <style jsx global>{`
        .task-no-estimation { background-repeat: repeat; }
        .gantt_task_content { overflow: visible; }
      `}</style>
      <Gantt
        tasks={ganttTasks}
        dependencies={dependencies}
        viewMode={viewMode}
        locale="es"
        today={new Date()}
        todayLineColor="#2196F3"
        weekends={false}
        scrollOffset={5}
        onSelect={console.log}
        onDateChange={console.log}
        onProgressChange={console.log}
        taskContent={taskContent}
        ganttHeight={600}
      />
    </Paper>
  );
};

MyTimeline.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    Estado: PropTypes.string,
    etapa: PropTypes.string,
    Estimacion: PropTypes.any,
    progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  })).isRequired,
};

export default MyTimeline;