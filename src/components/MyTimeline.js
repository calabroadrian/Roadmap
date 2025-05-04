import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Timeline, { TimelineHeaders, DateHeader } from "react-calendar-timeline";
import "./MyTimeline.css";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";
import { Tooltip, Chip, Box, Button, TextField, Paper, Stack, Typography } from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';

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

// Renderizador de cada item
const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const grad = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo'];
  const background = `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`;
  return (
    <div {...itemProps} className="timeline-item-hover" style={{ ...itemProps.style, ...item.style, background }}>
      {item.etapa && (
        <Chip
          label={item.etapa}
          size="small"
          sx={{
            position: 'absolute', top: 2, right: 2, bgcolor: ETAPA_STYLES[item.etapa] || '#757575', color: '#fff', fontSize: '10px', height: '18px'
          }}
        />
      )}
      <Tooltip
        title={
          <Box sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
            <div><strong>Estado:</strong> {item.Estado}</div>
            <div><strong>Etapa:</strong> {item.etapa}</div>
            <div><strong>Estimación:</strong> {item.estimacion || 'N/A'}</div>
            <div><strong>Inicio:</strong> {moment(item.start_time).format('DD/MM/YYYY')}</div>
            <div><strong>Fin:</strong> {moment(item.end_time).format('DD/MM/YYYY')}</div>
            <div><strong>Progreso:</strong> {item.progress || 'N/A'}</div>
          </Box>
        }
        arrow
        placement="top"
        enterDelay={300}
      >
        <Box sx={{ width: '100%', textAlign: 'center', color: '#fff', fontWeight: 500 }}>{item.title}</Box>
      </Tooltip>
    </div>
  );
};

const MyTimeline = ({ tasks }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months');
  const defaultEnd = now.clone().add(2, 'months');

  const [filter, setFilter] = useState("");
  const filteredTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());
  const timelineRef = useRef(null);
  const [mounted, setMounted] = useState(false); // Nuevo estado para controlar el montaje

  const zoomIn = useCallback(() => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(v => v + span * 0.1);
    setVisibleTimeEnd(v => v - span * 0.1);
  }, [visibleTimeStart, visibleTimeEnd]);
  const zoomOut = useCallback(() => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(v => v - span * 0.1);
    setVisibleTimeEnd(v => v + span * 0.1);
  }, [visibleTimeStart, visibleTimeEnd]);

  const groups = useMemo(
    () => filteredTasks.map(task => ({ id: task.id, title: task.title })),
    [filteredTasks]
  );

  const itemsWithDependencies = useMemo(() => {
    // Primero, mapeamos las tareas para tener un acceso rápido por ID
    const taskMap = filteredTasks.reduce((acc, task) => {
      acc[task.id] = {
        ...task,
        start_time: moment(task.startDate),
        end_time: moment(task.endDate),
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [], // Aseguramos que dependencies sea un array
      };
      return acc;
    }, {});

    // Función para calcular la fecha de inicio ajustada por dependencias
    const getAdjustedStartTime = (taskId, visited = new Set()) => {
      const task = taskMap[taskId];
      if (!task || !task.dependencies || task.dependencies.length === 0) {
        return task ? task.start_time : moment(null);
      }

      if (visited.has(taskId)) {
        console.warn(`Ciclo de dependencia detectado en la tarea ${task.title} (${task.id}).`);
        return task.start_time;
      }
      visited.add(taskId);

      let latestDependencyEndDate = moment(null);
      // Agregamos esta verificación para asegurarnos de que task.dependencies sea un array
      if (Array.isArray(task.dependencies)) {
        task.dependencies.forEach(dependencyId => {
          const dependencyTask = taskMap[dependencyId]; // Obtener la tarea dependiente
          const dependencyEndDate = dependencyTask ? getAdjustedStartTime(dependencyId, new Set(visited)).end_time : moment(null); // Verificar si la tarea existe
          if (dependencyEndDate && dependencyEndDate.isAfter(latestDependencyEndDate)) {
            latestDependencyEndDate = dependencyEndDate;
          }
        });
      } else {
        console.warn(`task.dependencies no es un array para la tarea ${task.title} (${task.id}).`);
        return task.start_time;
      }

      // Si alguna dependencia tiene una fecha de fin posterior a la fecha de inicio original, ajustamos la fecha de inicio
      if (latestDependencyEndDate.isValid() && latestDependencyEndDate.isAfter(task.start_time)) {
        return latestDependencyEndDate.clone().add(1, 'day');
      }

      return task.start_time;
    };

    const processedItems = filteredTasks.map(task => {
      const stateDef = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
      const grad = `linear-gradient(120deg, ${stateDef[0]}, ${stateDef[1]})`;
      const hasPattern = !task.Estimacion;
      const adjustedStartTime = getAdjustedStartTime(task.id);

      return {
        id: task.id,
        group: task.id,
        title: task.title,
        start_time: adjustedStartTime,
        end_time: moment(task.endDate),
        Estado: task.Estado,
        etapa: task.etapa,
        estimacion: task.Estimacion,
        progress: task.progress,
        style: {
          background: grad,
          ...(hasPattern && { backgroundImage: PATTERNS, backgroundRepeat: 'repeat' }),
          borderRadius: '5px',
          padding: '4px',
          color: '#fff',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '30px',
          fontSize: '13px',
          borderLeft: `4px solid ${ETAPA_STYLES[task.etapa] || '#757575'}`
        },
        dependencies: Array.isArray(task.dependencies) ? task.dependencies : [], // Aseguramos que dependencies sea un array
        top: 0,  // Agregamos top y left para el posicionamiento
        left: 0,
        height: 30,
      };
    });

    return processedItems;
  }, [filteredTasks]);

  const dependencies = useMemo(() => {
    const taskMap = filteredTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {});

    const deps = [];
    filteredTasks.forEach(task => {
      if (task.dependencies && Array.isArray(task.dependencies) && task.dependencies.length > 0) {
        task.dependencies.forEach(dependencyId => {
          const dependencyTask = taskMap[dependencyId]; // Obtener la tarea dependiente
          if (dependencyTask) { // Verificar si la tarea dependiente existe
            deps.push({
              fromItem: dependencyId,
              toItem: task.id,
              label: '',
            });
          } else {
            console.warn(`Dependencia no encontrada: Tarea ${task.title} (${task.id}) depende de ${dependencyId}`);
          }
        });
      }
    });
    console.log("Dependencies:", deps); // Imprimimos las dependencias para inspección
    return deps;
  }, [filteredTasks]);

  const [svgs, setSvgs] = useState([]);

  useEffect(() => {
    setMounted(true); // Establecemos el estado a montado cuando el componente se monta
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const newSvgs = [];

    dependencies.forEach(dependency => {
      const fromItem = itemsWithDependencies.find(item => item.id === dependency.fromItem);
      const toItem = itemsWithDependencies.find(item => item.id === dependency.toItem);

      if (fromItem && toItem) {
        const xStart = fromItem.left + fromItem.width;
        const yStart = fromItem.top + fromItem.height / 2;
        const xEnd = toItem.left;
        const yEnd = toItem.top + toItem.height / 2;
        const length = Math.sqrt(Math.pow(xEnd - xStart, 2) + Math.pow(yEnd - yStart, 2));
        const angle = Math.atan2(yEnd - yStart, xEnd - xStart) * 180 / Math.PI;

        // Validación para evitar valores NaN
        if (isNaN(length) || isNaN(xStart) || isNaN(yStart) || isNaN(angle)) {
          console.warn(
            "Valores NaN detectados al calcular la dependencia:",
            { fromItem, toItem, xStart, yStart, xEnd, yEnd, length, angle }
          );
          return; // No renderizar la línea si los valores son inválidos
        }

        const svg = (
          <svg
            key={`${dependency.fromItem}-${dependency.toItem}`}
            style={{
              position: 'absolute',
              overflow: 'visible',
              zIndex: 10,
              left: '0px',
              top: '0px',
              width: `${length}px`,
              height: '0px',
              transform: `translate(${xStart}px, ${yStart}px) rotate(${angle}deg)`,
              pointerEvents: 'none',
            }}
          >
            <line
              x1="0"
              y1="0"
              x2={length}
              y2="0"
              stroke="#757575"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              markerUnits="strokeWidth"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#757575" />
            </marker>
          </svg>
        );
        newSvgs.push(svg);
      }
    });
    setSvgs(newSvgs);
  }, [dependencies, itemsWithDependencies, mounted]);


  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon /> Roadmap Timeline
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
        {Object.entries(STATE_STYLES).map(([status, grad]) => (
          <Chip
            key={status}
            label={status}
            size="small"
            sx={{ background: `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`, color: '#fff' }}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
        {Object.entries(ETAPA_STYLES).map(([etapa, color]) => (
          <Chip
            key={etapa}
            label={etapa}
            size="small"
            sx={{ backgroundColor: color, color: '#fff' }}
          />
        ))}
      </Stack>
      <Box sx={{ mb: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Buscar…"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <style>{`
        .rct-day-background:nth-child(7n+1) { border-left: 2px solid #ccc; }
        .rct-item.rct-selected { background: none !important; }
        /* Hover más elaborado */
        .timeline-item-hover:hover { transform: translateY(-2px); box-shadow: 0 0 5px rgba(0,0,0,0.3); }
        .dependencies svg { position: absolute; z-index: 10; pointer-events: none;
        }
        .rct-calendar-timeline {
          width: 100%;
          height: 100%;
          overflow-x: auto;
          overflow-y: auto;
          position: relative;
        }
      `}</style>
      <Timeline
        ref={timelineRef}
        groups={groups}
        items={itemsWithDependencies}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s, e) => { setVisibleTimeStart(s); setVisibleTimeEnd(e); }}
        itemRenderer={ItemRenderer}
        headerLabelFormats={{ monthShort: 'MMM', monthLong: 'MMMM' }}
        timelineHeaders={
          <TimelineHeaders>
            <DateHeader unit="primaryHeader" labelFormat="MMMM" />
            <DateHeader unit="week" labelFormat="Wo [semana]" />
            <DateHeader unit="day" labelFormat="DD" />
          </TimelineHeaders>
        }
        todayLineColor="red"
        sidebarWidth={150}
        className="mi-rct-sidebar"
        groupHeights={groups.map(() => 40)}
        //dependencyRenderer={dependencyRenderer}
        //dependencies={dependencies}
        >
        {svgs}
      </Timeline>
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
      progress: PropTypes.any,
      dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
      Bloqueos: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
};

export default MyTimeline;