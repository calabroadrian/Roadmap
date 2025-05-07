import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Paper, Typography, Box, Drawer, IconButton, Divider } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import moment from 'moment';

// Import Bryntum Gantt CSS
import 'bryntum-gantt/gantt.stockholm.css';
// Import Bryntum Gantt JS
import 'bryntum-gantt/gantt.umd.js';

// Constants (Adaptados para Bryntum)
const ETAPA_STYLES = {
  'CambioDeAlcance': '#FF9800',
  'ImpactoEnInicio': '#F44336',
  'Ajustes': '#2196F3',
  'SinRequerimiento': '#9E9E9E',
  'SinEstimar': '#EEEEEE',
  'EnPausa': '#FFEB3B',
  'InicioDeDesarrollo': '#4CAF50',
  'Entrega final': '#8E24AA' // Añadido estilo para "Entrega final"
};

const STATE_STYLES = {
  'Nuevo': ['#ffcdd2', '#e57373'],
  'EnCurso': ['#fff9c4', '#ffeb3b'],
  'EnProgreso': ['#fff9c4', '#ffeb3b'],
  'Hecho': ['#c8e6c9', '#4caf50'],
};

const DEFAULT_PATTERN = 'repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)';

const MyTimeline = ({ tasks }) => {
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('month'); // Bryntum viewMode
  const [selectedTask, setSelectedTask] = useState(null);
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);

  // Función para parsear fechas (adaptada para Bryntum)
  const parseBryntumDate = (val, fallback, endOfDay = false) => {
    if (!val) return fallback;

    let date;
    if (val instanceof Date) {
      date = val;
    } else if (typeof val === 'string') {
      const [d, m, y] = val.split('/').map(Number);
      date = new Date(y, m - 1, d);
    } else {
      date = new Date(val); // Trata de usar el constructor Date directamente
    }

    if (isNaN(date.getTime())) {
      return fallback;
    }

    return endOfDay ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59) : date;
  };

  // Prepara los datos para Bryntum Gantt
  const bryntumTasks = React.useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())).map(task => {
      const [bgColor, progressColor] = STATE_STYLES[task.Estado] || STATE_STYLES.Nuevo;
      const etapaKey = task.etapa.replace(/\s+/g, '');
      const etapaColor = ETAPA_STYLES[etapaKey] || bgColor;
      const start = parseBryntumDate(task.startDate, new Date());
      const end = parseBryntumDate(task.endDate, new Date(), true);
      const hasPattern = !task.Estimacion;
      const isMilestone = task.etapa === 'Entrega final';

      return {
        id: String(task.id),
        name: task.title,
        startDate: start,
        endDate: end,
        percentDone: Number(task.progress) || 0,
        milestone: isMilestone,
        barColor: etapaColor,
        cls: hasPattern ? 'task-no-estimation' : '',
        progressColor: progressColor,

      };
    });
  }, [tasks, filter]);

  const bryntumDependencies = React.useMemo(() => {
    const deps = [];
    tasks.forEach(task => {
      (task.dependencies || []).forEach(depId => {
        deps.push({
          from: String(task.id),
          to: String(depId),
          type: 'finish-to-start'
        });
      });
    });
    return deps;
  }, [tasks]);


  // Inicializa el Gantt de Bryntum
  useEffect(() => {
    if (ganttRef.current && !ganttInstance.current) {
      try {
        ganttInstance.current = new window.bryntum.gantt.Gantt({ // Usa window para acceder a Bryntum
          appendTo: ganttRef.current,
          project: {
            tasks: bryntumTasks,
            dependencies: bryntumDependencies,
          },
          viewPreset: viewMode,
          columns: [
            { type: 'name', width: 250, field: 'name' },
            {
              type: 'date',
              field: 'startDate',
              text: 'Inicio',
              format: 'DD/MM/YYYY',
              width: 120
            },
            {
              type: 'date',
              field: 'endDate',
              text: 'Fin',
              format: 'DD/MM/YYYY',
              width: 120
            },
            {
              type: 'number',
              field: 'percentDone',
              text: 'Progreso',
              width: 100,
              renderer: ({ record }) => `${record.percentDone}%`
            },
            {
              type: 'dependency',
              text: 'Dependencias',
              width: 120
            }
          ],
          taskRenderer: ({ taskRecord }) => {
            let pattern = '';
            if (taskRecord.cls.includes('task-no-estimation')) {
              pattern = `background-image: ${DEFAULT_PATTERN};`;
            }
            const [bgColor] = STATE_STYLES[taskRecord.raw.Estado] || STATE_STYLES.Nuevo;
            return `<div style="
                        border-radius: 2px;
                        padding: 5px 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        overflow: hidden;
                        position: relative;
                        font-size: 13px;
                        background-color: ${taskRecord.barColor};
                        color: #fff;
                        ${pattern}
                    ">
                        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                              title="${taskRecord.name}">${taskRecord.name}</span>
                    </div>`;
          },
          eventRenderer: ({ eventRecord }) => {
            return `<div style="
                        border-radius: 2px;
                        padding: 5px 10px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        overflow: hidden;
                        position: relative;
                        font-size: 13px;
                        background-color: ${eventRecord.barColor};
                        color: #fff;

                    ">
                        <span style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
                              title="${eventRecord.name}">${eventRecord.name}</span>
                    </div>`;
          },
          listeners: {
            taskClick: (gantt, event) => {
              const clickedTask = event.record.data;
              const fullTaskData = tasks.find(t => String(t.id) === clickedTask.id);
              setSelectedTask(fullTaskData);
            },
          },
        });
      } catch (error) {
        console.error("Failed to initialize Bryntum Gantt:", error);
        return; // Importante: No continuar si la inicialización falla
      }
    }

    // Actualiza el Gantt cuando cambian las tasks o el viewMode
    if (ganttInstance.current) {
      ganttInstance.current.project.loadData({
        tasks: bryntumTasks,
        dependencies: bryntumDependencies
      });
      ganttInstance.current.setViewPreset(viewMode);
    }

    // Limpieza al desmontar el componente
    return () => {
      if (ganttInstance.current) {
        ganttInstance.current.destroy();
        ganttInstance.current = null;
      }
    };
  }, [bryntumTasks, bryntumDependencies, viewMode, tasks]);

  const handleSelectTask = React.useCallback((taskId) => {
    const task = tasks.find(t => String(t.id) === taskId);
    setSelectedTask(task);
  }, [tasks]);

  const closeDrawer = () => setSelectedTask(null);

  const handleZoomChange = (zoomIn) => {
    if (!ganttInstance.current) return;

    const currentViewMode = ganttInstance.current.getViewPreset().name;

    let newViewMode = currentViewMode;

    if (zoomIn) {
      switch (currentViewMode) {
        case 'year': newViewMode = 'month'; break;
        case 'month': newViewMode = 'week'; break;
        case 'week': newViewMode = 'day'; break;
        default: newViewMode = 'day';
      }
    } else {
      switch (currentViewMode) {
        case 'day': newViewMode = 'week'; break;
        case 'week': newViewMode = 'month'; break;
        case 'month': newViewMode = 'year'; break;
        default: newViewMode = 'year';
      }
    }
    setViewMode(newViewMode);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ScheduleIcon fontSize="large" sx={{ mr: 1 }} />
        <Typography variant="h5">Roadmap Timeline</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField label="Buscar" size="small" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <Button variant="outlined" size="small" onClick={() => handleZoomChange(false)}>- Zoom</Button>
        <Button variant="outlined" size="small" onClick={() => handleZoomChange(true)}>+ Zoom</Button>
      </Box>
      <div ref={ganttRef} className="gantt-container" style={{ width: '100%' }} />

      <Drawer
        anchor="right"
        open={Boolean(selectedTask)}
        onClose={closeDrawer}
        ModalProps={{
          keepMounted: true,
          onBackdropClick: closeDrawer,
          onEscapeKeyDown: closeDrawer,
        }}
        PaperProps={{
          sx: { width: 350, p: 2 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Tarea Detalle</Typography>
          <IconButton aria-label="Cerrar" onClick={closeDrawer}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {selectedTask && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography><strong>ID:</strong> {selectedTask.id}</Typography>
            <Typography><strong>Nombre:</strong> {selectedTask.title}</Typography>
            <Typography><strong>Inicio:</strong> {moment(selectedTask.startDate).format('DD/MM/YYYY')}</Typography>
            <Typography><strong>Fin:</strong> {moment(selectedTask.endDate).format('DD/MM/YYYY')}</Typography>
            <Typography><strong>Progreso:</strong> {selectedTask.progress}%</Typography>
            {selectedTask.dependencies?.length > 0 && (
              <Typography><strong>Depende de:</strong> {selectedTask.dependencies.join(', ')}</Typography>
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
    dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  })).isRequired,
};

export default MyTimeline;
