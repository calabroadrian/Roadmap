import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
  Gantt,
  ViewMode,
  EventOption,
  Task,
  StylingOption,
  PopoverProps,
} from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Chip,
  Tooltip,
  Drawer,
  IconButton,
  Divider,
  useTheme,
  Slide,
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';

// —————————————————— Constantes de estilo ——————————————————
const ETAPA_STYLES = { /* …igual que antes… */ };
const STATE_STYLES = { /* …igual que antes… */ };
const DEFAULT_PATTERN = 'repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)';

// —————————————————— Función utilitaria de parseo ——————————————————
const parseDate = (val, fallback, endOfDay = false) => {
  /* …igual que antes… */
};

const MyTimeline = ({ tasks }) => {
  const theme = useTheme();
  const now = useMemo(() => moment(), []);
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').endOf('day').toDate();

  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filtrado por título
  const filtered = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  // Mapear a la estructura de Gantt
  const { ganttTasks, dependencies } = useMemo(() => {
    const gTasks = [], deps = [];
    filtered.forEach(task => {
      const [bg, prog] = STATE_STYLES[task.Estado] || STATE_STYLES.Nuevo;
      const etapaKey = task.etapa.replace(/\s+/g, '');
      const color = ETAPA_STYLES[etapaKey] || bg;
      const start = parseDate(task.startDate, defaultStart);
      const end = parseDate(task.endDate, defaultEnd, true);
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
          backgroundColor: color,
          backgroundSelectedColor: color,
          progressColor: prog,
          progressSelectedColor: prog,
          fontColor: '#fff',
        },
        custom_class: !task.Estimacion ? 'task-no-estimation' : '',
        // Prop extra para identificar en handlers
        data: { original: task },
      });
      (task.dependencies || []).forEach(d =>
        deps.push({ source: String(task.id), target: String(d), type: 'FinishToStart' })
      );
    });
    return { ganttTasks: gTasks, dependencies: deps };
  }, [filtered, defaultStart, defaultEnd]);

  // Selección y cierre de Drawer
  const handleSelectTask = useCallback((ganttTask: Task, ev: EventOption) => {
    setSelectedTask(ganttTask.data.original);
  }, []);

  const handleDateChange = useCallback((task: Task, start: Date, end: Date) => {
    // Aquí podrías enviar PATCH a tu API, por ejemplo
    console.log(`El usuario cambió fechas de ${task.id} a`, start, end);
  }, []);

  const closeDrawer = () => setSelectedTask(null);

  // Contenido personalizado de la barra
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
        <Tooltip title={task.name} arrow><Typography noWrap>{task.name}</Typography></Tooltip>
      </Box>
      {task.etapa && (
        <Chip
          label={task.etapa}
          size="small"
          sx={{
            position: 'absolute', top: 4, right: 4,
            bgcolor: ETAPA_STYLES[task.etapa.replace(/\s+/g, '')] || '#757575',
            color: '#fff', fontSize: 10
          }}
        />
      )}
    </Box>
  ), []);

  // Popover al hover
  const popoverRender: PopoverProps['popoverHTMLRenderer'] = task => `
    <div style="padding:8px;">
      <strong>${task.name}</strong><br/>
      Inicio: ${moment(task.start).format('DD/MM/YYYY')}<br/>
      Fin: ${moment(task.end).format('DD/MM/YYYY')}
    </div>
  `;

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Header y controles */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ScheduleIcon fontSize="large" sx={{ mr: 1 }} />
        <Typography variant="h5">Roadmap Timeline</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar tarea..."
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button onClick={() => setViewMode(ViewMode.Day)} variant="outlined" size="small">Día</Button>
        <Button onClick={() => setViewMode(ViewMode.Week)} variant="outlined" size="small">Semana</Button>
        <Button onClick={() => setViewMode(ViewMode.Month)} variant="outlined" size="small">Mes</Button>
        <Button onClick={() => setViewMode(ViewMode.Year)} variant="outlined" size="small">Año</Button>
      </Box>

      {/* Gantt enriquecido */}
      <Gantt
        tasks={ganttTasks}
        dependencies={dependencies}
        viewMode={viewMode}
        locale="es"
        today={new Date()}
        todayLineColor={theme.palette.primary.main}
        weekends={false}
        scrollOffset={5}
        onSelect={handleSelectTask}
        onDateChange={handleDateChange}
        onDoubleClick={handleSelectTask}
        taskContent={taskContent}
        columnWidth={60}
        rowHeight={40}
        headerHeight={50}
        barCornerRadius={4}
        listCellWidth="180px"
        popoverHTMLRenderer={popoverRender}
        fontFamily="Roboto, sans-serif"
      />

      {/* Drawer con transición */}
      <Drawer
        anchor="right"
        open={Boolean(selectedTask)}
        onClose={closeDrawer}
        TransitionComponent={Slide}
        SlideProps={{ direction: 'left', timeout: 300 }}
        PaperProps={{ sx: { width: 360, p: 2 } }}
        ModalProps={{
          keepMounted: true,
          onBackdropClick: closeDrawer,
          onEscapeKeyDown: closeDrawer
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Detalle de Tarea</Typography>
          <IconButton onClick={closeDrawer}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {selectedTask && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography><strong>ID:</strong> {selectedTask.id}</Typography>
            <Typography><strong>Nombre:</strong> {selectedTask.title}</Typography>
            <Typography>
              <strong>Inicio:</strong> {moment(selectedTask.startDate).format('DD/MM/YYYY')}
            </Typography>
            <Typography>
              <strong>Fin:</strong> {moment(selectedTask.endDate).format('DD/MM/YYYY')}
            </Typography>
            <Typography><strong>Progreso:</strong> {selectedTask.progress}%</Typography>
            {selectedTask.dependencies?.length > 0 && (
              <Typography>
                <strong>Depende de:</strong> {selectedTask.dependencies.join(', ')}
              </Typography>
            )}
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
