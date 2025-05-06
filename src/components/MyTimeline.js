// Improved MyTimeline component with Gantt select and modal details
import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Box, Button, TextField, Paper, Typography, Chip, Tooltip, Drawer, IconButton, Divider } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';

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
  // Timeline range
  const now = useMemo(() => moment(), []);
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').endOf('day').toDate();

  // States
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter tasks
  const filtered = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  // Prepare Gantt data
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

  // Zoom handlers
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

  // Task click handler abre el drawer
  const handleSelectTask = useCallback(task => {
    console.log('handleSelectTask', task); // Agregado para depuración
    if (selectedTask?.id === task.id) {
      // Si se hace clic en la misma tarea, se cierra el drawer
      setSelectedTask(null);
    } else {
      setSelectedTask(task);
    }
  }, [selectedTask]);

  const closeDrawer = useCallback(() => {
    console.log('closeDrawer llamado'); // Para verificar que se llama a la función
    setSelectedTask(null);
  }, []);

  // Custom task content
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
          <Chip
            label={task.etapa}
            size="small"
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              bgcolor: ETAPA_STYLES[task.etapa.replace(/\s+/g, '')] || '#757575',
              color: '#fff',
              fontSize: 10,
            }}
          />
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
        <TextField label="Buscar" size="small" value={filter} onChange={e => setFilter(e.target.value)} />
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
        onSelect={handleSelectTask}
        taskContent={taskContent}
        ganttHeight={600}
      />
      <Drawer anchor="right" open={Boolean(selectedTask)} onClose={closeDrawer} PaperProps={{ sx: { width: 350, p: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Detalle de la tarea</Typography>
          <IconButton onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {selectedTask && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                <strong>ID:</strong> {selectedTask.id}
              </Typography>
              <Button
                size="small"
                onClick={() => navigator.clipboard.writeText(selectedTask.id)}
              >
                Copiar
              </Button>
            </Box>
            <Typography variant="body2">
              <strong>Nombre:</strong> {selectedTask.name}
            </Typography>
            <Typography variant="body2">
              <strong>Inicio:</strong> {moment(selectedTask.start).format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="body2">
              <strong>Fin:</strong> {moment(selectedTask.end).format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="body2">
              <strong>Progreso:</strong> {selectedTask.progress}%
            </Typography>
            {selectedTask.dependencies && selectedTask.dependencies.length > 0 && (
              <Typography variant="body2">
                <strong>Depende de:</strong> {selectedTask.dependencies.join(', ')}
              </Typography>
            )}
              {selectedTask.etapa && (
                <>
                  <Divider sx={{ mt: 1, mb: 1 }} />
                  <Chip
                    label={`Etapa: ${selectedTask.etapa}`}
                    size="small"
                    sx={{
                      bgcolor:
                        ETAPA_STYLES[selectedTask.etapa.replace(/\s+/g, '')] ||
                        '#757575',
                      color: '#fff',
                      fontWeight: 'bold',
                      alignSelf: 'flex-start',
                    }}
                  />
                </>
              )}
          </Box>
        )}
      </Drawer>
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
      dependencies: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        ),
    })
  ).isRequired,
};

export default MyTimeline;