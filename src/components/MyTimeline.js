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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider
} from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';

// Constants omitted for brevity

const MyTimeline = ({ tasks }) => {
  const now = useMemo(() => moment(), []);
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').endOf('day').toDate();

  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const [selectedTask, setSelectedTask] = useState(null);

  const filtered = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

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
        custom_class: hasPattern ? 'task-no-estimation' : ''
      });
      (task.dependencies || []).forEach(dep =>
        deps.push({ source: String(task.id), target: String(dep), type: 'FinishToStart' })
      );
    });
    return { ganttTasks: gTasks, dependencies: deps };
  }, [filtered, defaultStart, defaultEnd]);

  const handleSelectTask = useCallback(
    ganttTask => {
      const found = tasks.find(t => String(t.id) === ganttTask.id);
      setSelectedTask(found || null);
    },
    [tasks]
  );
  const handleClose = () => setSelectedTask(null);

  const taskContent = useCallback(
    task => (
      <Box
        sx={{
          ...task.styles,
          borderRadius: 2,
          p: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundImage: task.custom_class ? DEFAULT_PATTERN : 'none',
          overflow: 'hidden',
          position: 'relative',
          fontSize: 13
        }}
      >
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
              fontSize: 10
            }}
          />
        )}
      </Box>
    ),
    []
  );

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
        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            setViewMode(vm =>
              vm === ViewMode.Day
                ? ViewMode.Week
                : vm === ViewMode.Week
                ? ViewMode.Month
                : vm === ViewMode.Month
                ? ViewMode.Year
                : vm
            )
          }
        >
          - Zoom
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            setViewMode(vm =>
              vm === ViewMode.Year
                ? ViewMode.Month
                : vm === ViewMode.Month
                ? ViewMode.Week
                : vm === ViewMode.Week
                ? ViewMode.Day
                : vm
            )
          }
        >
          + Zoom
        </Button>
      </Box>

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

      <Dialog open={Boolean(selectedTask)} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {selectedTask?.title}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent dividers>
          <Typography gutterBottom>
            <strong>ID:</strong> {selectedTask?.id}
          </Typography>
          <Typography gutterBottom>
            <strong>Inicio:</strong>{' '}
            {selectedTask && moment(selectedTask.startDate).format('DD/MM/YYYY')}
          </Typography>
          <Typography gutterBottom>
            <strong>Fin:</strong>{' '}
            {selectedTask && moment(selectedTask.endDate).format('DD/MM/YYYY')}
          </Typography>
          <Typography gutterBottom>
            <strong>Progreso:</strong> {selectedTask?.progress}%
          </Typography>
          {selectedTask?.dependencies?.length > 0 && (
            <Typography gutterBottom>
              <strong>Depende de:</strong> {selectedTask.dependencies.join(', ')}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
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
      )
    })
  ).isRequired
};

export default MyTimeline;
