import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Box, Button, TextField, Paper, Typography, Chip, Tooltip, Drawer, IconButton, Divider } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';

// Constants (sin cambios)
const ETAPA_STYLES = { /* ... */ };
const STATE_STYLES = { /* ... */ };
const DEFAULT_PATTERN = 'repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)';

// Helper functions (sin cambios significativos)
const parseDate = (val, fallback, endOfDay = false) => { /* ... */ };
const isValidDate = d => d && !isNaN(d.getTime());

const MyTimeline = ({ tasks }) => {
  // Timeline range (sin cambios)
  const now = useMemo(() => moment(), []);
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').endOf('day').toDate();

  // States (sin cambios)
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter tasks (sin cambios)
  const filtered = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  // Prepare Gantt data (sin cambios en la lógica)
  const { ganttTasks, dependencies } = useMemo(() => {
    const gTasks = [];
    const deps = [];
    filtered.forEach(task => {
      const [bgColor, progressColor] = STATE_STYLES[task.Estado] || STATE_STYLES.Nuevo;
      const etapaKey = task.etapa.replace(/\s+/g, '');
      const etapaColor = ETAPA_STYLES[etapaKey] || bgColor;
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

  // Zoom handlers (sin cambios)
  const zoomIn = useCallback(() => { /* ... */ }, []);
  const zoomOut = useCallback(() => { /* ... */ }, []);

  // Task click handler opens drawer (sin cambios)
  const handleSelectTask = useCallback(task => setSelectedTask(task), []);
  const closeDrawer = () => setSelectedTask(null);

  // Custom task content (actualizado para usar clases)
  const taskContent = useCallback(task => (
    <Box className="task-content" sx={{ ...task.styles }}>
      <Box className="task-content-title" sx={{ color: task.styles?.fontColor }}>
        <Tooltip title={task.name} arrow>
          <Typography noWrap>{task.name}</Typography>
        </Tooltip>
      </Box>
      {task.etapa && (
        <Chip
          label={task.etapa}
          size="small"
          className="task-content-chip"
          sx={{ bgcolor: ETAPA_STYLES[task.etapa.replace(/\s+/g, '')] || '#757575' }}
        />
      )}
    </Box>
  ), []);

  return (
    <Paper className="my-timeline-container" sx={{ p: 3, borderRadius: 2 }}>
      <Box className="timeline-header">
        <ScheduleIcon fontSize="large" className="timeline-header-icon" />
        <Typography variant="h5" className="timeline-header-title">Roadmap Timeline</Typography>
      </Box>
      <Box className="timeline-controls">
        <TextField
          label="Buscar"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="timeline-search-input"
        />
        <Button variant="outlined" size="small" onClick={zoomOut} className="timeline-button">- Zoom</Button>
        <Button variant="outlined" size="small" onClick={zoomIn} className="timeline-button">+ Zoom</Button>
      </Box>
      <div className="gantt-container">
        <Gantt
          tasks={ganttTasks}
          dependencies={dependencies}
          viewMode={viewMode}
          locale="es"
          today={new Date()}
          todayLineColor="#3498db" // Usando el color акцентный
          weekends={false}
          scrollOffset={5}
          onSelectTask={handleSelectTask}
          taskContent={taskContent}
          ganttHeight={600}
        />
      </div>
      <Drawer
        anchor="right"
        open={Boolean(selectedTask)}
        onClose={closeDrawer}
        PaperProps={{ className: 'task-details-drawer' }}
      >
        <Box className="task-details-header">
          <Typography variant="h6" className="task-details-title">Detalle de la Tarea</Typography>
          <IconButton onClick={closeDrawer} className="task-details-close-button" aria-label="cerrar">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider className="task-details-divider" />
        {selectedTask && (
          <Box className="task-details-info">
            <Typography className="task-details-info-item"><strong>ID:</strong> {selectedTask.id}</Typography>
            <Typography className="task-details-info-item"><strong>Nombre:</strong> {selectedTask.name}</Typography>
            <Typography className="task-details-info-item"><strong>Estado:</strong> {selectedTask.Estado}</Typography>
            <Typography className="task-details-info-item"><strong>Etapa:</strong> {selectedTask.etapa}</Typography>
            {selectedTask.Estimacion && (
              <Typography className="task-details-info-item">
                <strong>Estimación:</strong> {selectedTask.Estimacion}
              </Typography>
            )}
            <Typography className="task-details-info-item">
              <strong>Inicio:</strong> {moment(selectedTask.start).format('DD/MM/YYYY')}
            </Typography>
            <Typography className="task-details-info-item">
              <strong>Fin:</strong> {moment(selectedTask.end).format('DD/MM/YYYY')}
            </Typography>
            <Typography className="task-details-info-item"><strong>Progreso:</strong> {selectedTask.progress}%</Typography>
            {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
              <Typography className="task-details-info-item">
                <strong>Depende de:</strong> {selectedTask.dependencies.join(", ")}
              </Typography>
            )}
            {/* Añade aquí más detalles si es necesario */}
          </Box>
        )}
      </Drawer>
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