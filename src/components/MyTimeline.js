import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Gantt, ViewMode } from 'gantt-task-react';
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
const ETAPA_STYLES = /* igual que antes */ {
  CambioDeAlcance: '#FF9800',
  ImpactoEnInicio: '#F44336',
  Ajustes: '#2196F3',
  SinRequerimiento: '#9E9E9E',
  SinEstimar: '#EEEEEE',
  EnPausa: '#FFEB3B',
  InicioDeDesarrollo: '#4CAF50',
};
const STATE_STYLES = /* igual que antes */ {
  Nuevo: ['#ffcdd2', '#e57373'],
  EnCurso: ['#fff9c4', '#ffeb3b'],
  EnProgreso: ['#fff9c4', '#ffeb3b'],
  Hecho: ['#c8e6c9', '#4caf50'],
};
const DEFAULT_PATTERN = 'repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)';

// —————————————————— Función utilitaria de parseo ——————————————————
const parseDate = (val, fallback, endOfDay = false) => {
  if (!val) return fallback;
  let date;
  if (val instanceof Date) date = val;
  else if (typeof val === 'string') {
    const [d, m, y] = val.split('/').map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = moment(val)[endOfDay ? 'endOf' : 'toDate']('day');
  }
  if (isNaN(date.getTime())) return fallback;
  return endOfDay
    ? moment(date).endOf('day').toDate()
    : date;
};

const MyTimeline = ({ tasks }) => {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const theme = useTheme();
  const now = useMemo(() => moment(), []);
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').endOf('day').toDate();

  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filtrado
  const filtered = useMemo(
    () =>
      safeTasks.filter((t) =>
        t.title?.toLowerCase().includes(filter.toLowerCase())
      ),
    [safeTasks, filter]
  );

  // Mapear a Gantt
  const { ganttTasks, dependencies } = useMemo(() => {
    const gTasks = [];
    const deps = [];
    filtered.forEach((task) => {
      const [bg, prog] = STATE_STYLES[task.Estado] || STATE_STYLES.Nuevo;
      const etapaKey = (task.etapa || '').replace(/\s+/g, '');
      const etapaColor = ETAPA_STYLES[etapaKey] || bg;
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
        dependencies: Array.isArray(task.dependencies)
          ? task.dependencies.map(String)
          : [],
        styles: {
          backgroundColor: etapaColor,
          backgroundSelectedColor: etapaColor,
          progressColor: prog,
          progressSelectedColor: prog,
          fontColor: '#fff',
        },
        custom_class: task.Estimacion ? '' : 'task-no-estimation',
        data: { original: task },
      });

      if (Array.isArray(task.dependencies)) {
        task.dependencies.forEach((d) =>
          deps.push({
            source: String(task.id),
            target: String(d),
            type: 'FinishToStart',
          })
        );
      }
    });
    return { ganttTasks: gTasks, dependencies: deps };
  }, [filtered, defaultStart, defaultEnd]);

  const handleSelectTask = useCallback((gTask) => {
    setSelectedTask(gTask.data.original);
  }, []);
  const closeDrawer = () => setSelectedTask(null);

  const taskContent = useCallback((task) => (
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
      <Box sx={{
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        <Tooltip title={task.name} arrow>
          <Typography noWrap>{task.name}</Typography>
        </Tooltip>
      </Box>
      {task.etapa && (
        <Chip
          label={task.etapa}
          size="small"
          sx={{
            position: 'absolute', top: 4, right: 4,
            bgcolor: ETAPA_STYLES[task.etapa.replace(/\s+/g, '')] || '#757575',
            color: '#fff', fontSize: 10,
          }}
        />
      )}
    </Box>
  ), []);

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {/* Contenedor scroll horizontal */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
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
          taskContent={taskContent}
          columnWidth={60}
          rowHeight={40}
          headerHeight={50}
          barCornerRadius={4}
          listCellWidth="180px"
          fontFamily="Roboto, sans-serif"
        />
      </Box>

      {/* Controles de filtro y zoom */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Buscar tarea..."
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {[ViewMode.Day, ViewMode.Week, ViewMode.Month, ViewMode.Year].map(
          (mode) => (
            <Button
              key={mode}
              onClick={() => setViewMode(mode)}
              variant={viewMode === mode ? 'contained' : 'outlined'}
              size="small"
            >
              {mode}
            </Button>
          )
        )}
      </Box>

      {/* Drawer de detalles */}
      <Drawer
  anchor="right"
  variant="temporary"               // modal temporal (default)
  open={Boolean(selectedTask)}
  onClose={(event, reason) => {
    // solo cerramos si es backdropClick o escapeKeyDown
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      closeDrawer();
    }
  }}
>
  {/* Tu contenido de Drawer sin PaperProps ni ModalProps extras */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
    <Typography variant="h6">Detalle de Tarea</Typography>
    <IconButton onClick={closeDrawer}>
      <CloseIcon />
    </IconButton>
  </Box>
  <Divider sx={{ mb: 2 }} />
  {selectedTask && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* ...detalles de selectedTask */}
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
      dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
    })
  ),
};

MyTimeline.defaultProps = {
  tasks: [],
};

export default MyTimeline;
