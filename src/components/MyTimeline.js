import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import moment from 'moment';
import { Chip, Box, Button, TextField, Paper, Typography } from '@mui/material';
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
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [locale] = useState('es');
  const [mounted, setMounted] = useState(false);

  const zoomIn = useCallback(() => setViewMode(vm => {
    switch (vm) {
      case ViewMode.Year: return ViewMode.Month;
      case ViewMode.Month: return ViewMode.Week;
      case ViewMode.Week: return ViewMode.Day;
      default: return vm;
    }
  }), []);

  const zoomOut = useCallback(() => setViewMode(vm => {
    switch (vm) {
      case ViewMode.Day: return ViewMode.Week;
      case ViewMode.Week: return ViewMode.Month;
      case ViewMode.Month: return ViewMode.Year;
      default: return vm;
    }
  }), []);

  useEffect(() => {
    const converted = filteredTasks.map(task => {
      const stateDef = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
      const hasPattern = !task.Estimacion;
      let start = defaultStart;
      let end = defaultEnd;

      // Parse start
      if (task.startDate) {
        if (typeof task.startDate === 'string') {
          const [d, m, y] = task.startDate.split('/').map(Number);
          start = new Date(y, m - 1, d);
        } else if (task.startDate instanceof Date) {
          start = task.startDate;
        } else {
          start = moment(task.startDate).toDate();
        }
      }

      // Parse end
      if (task.endDate) {
        if (typeof task.endDate === 'string') {
          const [d, m, y] = task.endDate.split('/').map(Number);
          end = new Date(y, m - 1, d, 23, 59, 59);
        } else if (task.endDate instanceof Date) {
          end = task.endDate;
        } else {
          end = moment(task.endDate).endOf('day').toDate();
        }
      }

      if (!isValidDate(start)) start = defaultStart;
      if (!isValidDate(end)) end = defaultEnd;

      // Milestone example: when etapa equals "Entrega final"
      const isMilestone = task.etapa === 'Entrega final';

      return {
        id: String(task.id),
        name: task.title,
        start,
        end,
        progress: Number(task.progress) || 0,
        type: isMilestone ? 'milestone' : 'task',
        project: '',
        dependencies: task.dependencies?.map(String) || [],
        styles: {
          progressColor: stateDef[1],
          progressSelectedColor: stateDef[1],
          backgroundColor: ETAPA_STYLES[task.etapa] || stateDef[0],
          backgroundSelectedColor: ETAPA_STYLES[task.etapa] || stateDef[0],
          fontColor: '#fff'
        },
        isDisabled: false,
        isHidden: false,
        custom_class: hasPattern ? 'task-no-estimation' : ''
      };
    });

    setGanttTasks(converted);
    setDependencies(
      filteredTasks.flatMap(task =>
        Array.isArray(task.dependencies)
          ? task.dependencies.map(dep => ({ source: String(task.id), target: String(dep), type: 'FinishToStart' }))
          : []
      )
    );
    setMounted(true);
  }, [filteredTasks, defaultStart, defaultEnd]);

  const taskRenderer = task => (
    <Box sx={{
      backgroundColor: task.styles.backgroundColor,
      color: task.styles.fontColor,
      borderRadius: '5px',
      padding: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      fontSize: '13px',
      backgroundImage: task.custom_class ? PATTERNS : 'none'
    }}>
      <Box sx={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        <Tooltip title={task.name} arrow placement="top">
          <Typography noWrap>{task.name}</Typography>
        </Tooltip>
      </Box>
      {task.etapa && (
        <Chip
          label={task.etapa}
          size="small"
          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: ETAPA_STYLES[task.etapa] || '#757575', color: '#fff', fontSize: '10px', height: '18px' }}
        />
      )}
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon /> Roadmap Timeline
      </Typography>
      <Box sx={{ mb: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField label="Buscar…" size="small" value={filter} onChange={e => setFilter(e.target.value)} />
        <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <style jsx global>{`
        .task-no-estimation { background-repeat: repeat; }
        .gantt_task_content { overflow: visible; }
      `}</style>
      {mounted && (
        <Gantt
          tasks={ganttTasks}
          dependencies={dependencies}
          viewMode={viewMode}
          locale={locale}
          today={new Date()}
          todayLineColor="#2196F3"
          weekends={false}
          scrollOffset={5}
          onRowDoubleClick={task => console.log('Double click:', task)}
          onDateChange={(task, start, end) => console.log('onDateChange', task, start, end)}
          onTaskClick={task => console.log('onTaskClick', task)}
          onProgressChange={(task, progress) => console.log('onProgressChange', task, progress)}
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
