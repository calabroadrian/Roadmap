import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import moment from 'moment';
import { Tooltip, Chip, Box, Button, TextField, Paper, Stack, Typography } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PropTypes from 'prop-types';

// Estilos para Etapas
const ETAPA_STYLES = {
  "Cambio de alcance": "#FF9800",
  "Impacto en inicio": "#F44336",
  "Ajustes": "#2196F3",
  "Sin requerimiento": "#9E9E9E",
  "Sin estimar": "#EEEEEE",
  "En pausa": "#FFEB3B",
  "Inicio de desarrollo": "#4CAF50",
};

// Estilos para Estados
const STATE_STYLES = {
  "Nuevo": ["#ffcdd2", "#e57373"],
  "En curso": ["#fff9c4", "#ffeb3b"],
  "En progreso": ["#fff9c4", "#ffeb3b"],
  "Hecho": ["#c8e6c9", "#4caf50"],
};

// Patrón para items sin estimación
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";

const isValidDate = date => date instanceof Date && !isNaN(date.getTime());

const MyTimeline = ({ tasks }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').toDate();

  const [filter, setFilter] = useState("");
  const filteredTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  const [ganttTasks, setGanttTasks] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [viewMode, setViewMode] = useState('Month');
  const [locale, setLocale] = useState('es');
  const [mounted, setMounted] = useState(false);

  const zoomIn = useCallback(() => setViewMode(vm => {
    switch (vm) {
      case 'Year': return 'Month';
      case 'Month': return 'Week';
      case 'Week': return 'Day';
      default: return 'Day';
    }
  }), []);

  const zoomOut = useCallback(() => setViewMode(vm => {
    switch (vm) {
      case 'Day': return 'Week';
      case 'Week': return 'Month';
      case 'Month': return 'Year';
      default: return 'Year';
    }
  }), []);

  useEffect(() => {
    const converted = filteredTasks.map(item => {
      const stateDef = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo'];
      const hasPattern = !item.Estimacion;

      let start = defaultStart;
      let end = defaultEnd;

      if (item.startDate) {
        if (typeof item.startDate === 'string') {
          const [d, m, y] = item.startDate.split('/').map(Number);
          start = new Date(y, m - 1, d);
        } else if (item.startDate instanceof Date) {
          start = item.startDate;
        } else {
          start = moment(item.startDate).toDate();
        }
      }
      if (item.endDate) {
        if (typeof item.endDate === 'string') {
          const [d, m, y] = item.endDate.split('/').map(Number);
          end = new Date(y, m - 1, d, 23, 59, 59);
        } else if (item.endDate instanceof Date) {
          end = item.endDate;
        } else {
          end = moment(item.endDate).endOf('day').toDate();
        }
      }
      if (!isValidDate(start)) start = defaultStart;
      if (!isValidDate(end)) end = defaultEnd;

      return {
        id: String(item.id),
        name: item.title,
        start,
        end,
        progress: Number(item.progress) || 0,
        type: 'task',
        project: '',
        dependencies: item.dependencies?.map(String) || [],
        styles: {
          progressColor: stateDef[1],
          progressSelectedColor: stateDef[1],
          backgroundColor: stateDef[0],
          backgroundSelectedColor: stateDef[0],
          fontColor: '#fff'
        },
        isDisabled: false,
        isHidden: false,
        custom_class: hasPattern ? 'task-no-estimation' : '',
        _raw: item
      };
    });
    setGanttTasks(converted);
    const deps = filteredTasks.flatMap(item =>
      Array.isArray(item.dependencies)
        ? item.dependencies.map(dep => ({ source: String(item.id), target: String(dep), type: 'FinishToStart' }))
        : []
    );
    setDependencies(deps);
    setMounted(true);
  }, [filteredTasks, defaultStart, defaultEnd]);

  const taskRenderer = task => {
    const raw = task._raw;
    // calcular duración en días
    const start = moment(task.start);
    const end = moment(task.end);
    const durationDays = end.diff(start, 'days') + 1;

    return (
      <Tooltip
        title={
          <Box sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
            <div><strong>Estado:</strong> {raw.Estado}</div>
            <div><strong>Etapa:</strong> {raw.etapa}</div>
            <div><strong>Estimación:</strong> {raw.Estimacion || 'N/A'}</div>
            <div><strong>Inicio:</strong> {raw.startDate ? moment(raw.startDate).format('DD/MM/YYYY') : 'N/A'}</div>
            <div><strong>Fin:</strong> {raw.endDate ? moment(raw.endDate).format('DD/MM/YYYY') : 'N/A'}</div>
            <div><strong>Duración:</strong> {durationDays} día{durationDays > 1 ? 's' : ''}</div>
            <div><strong>Progreso:</strong> {task.progress}%</div>
          </Box>
        }
        arrow
        placement="top"
        enterDelay={300}
      >
        <Box sx={{
          width: '100%',
          height: '100%',
          backgroundColor: task.styles.backgroundColor,
          color: task.styles.fontColor,
          borderRadius: '5px',
          padding: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          fontSize: '13px',
          ...(task.custom_class ? { backgroundImage: PATTERNS } : {})
        }}>
          <Typography noWrap sx={{ flex: 1, textAlign: 'center', fontWeight: 500 }}>{task.name}</Typography>
          {raw.etapa && (
            <Chip
              label={raw.etapa}
              size="small"
              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: ETAPA_STYLES[raw.etapa] || '#757575', color: '#fff', fontSize: '10px', height: '18px' }}
            />
          )}
        </Box>
      </Tooltip>
    );
  };

  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><ScheduleIcon /> Roadmap Timeline</Typography>
      <Box sx={{ mb: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Buscar…" size="small" value={filter} onChange={e => setFilter(e.target.value)} />
        <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <style jsx global>{` 
        .task-no-estimation { background-repeat: repeat !important; }
        .gantt_task_content { overflow: visible; }
      `}</style>
      {mounted && (
        <Gantt
          tasks={ganttTasks}
          dependencies={dependencies}
          viewMode={viewMode}
          locale={locale}
          onDateChange={(task, start, end) => console.log('onDateChange', task, start, end)}
          onTaskClick={task => console.log('onTaskClick', task)}
          onProgressChange={(task, progress) => console.log('onProgressChange', task, progress)}
          onAddTask={() => console.log('onAddTask')}
          onSelectTask={task => console.log('onSelectTask', task)}
          onViewChange={mode => console.log('onViewChange', mode)}
          ganttHeight={700}
          taskContent={taskRenderer}
        />
      )}
    </Paper>
  );
};

MyTimeline.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      Estado: PropTypes.string,
      etapa: PropTypes.string,
      Estimacion: PropTypes.any,
      progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
    })
  ).isRequired,
};

export default MyTimeline;