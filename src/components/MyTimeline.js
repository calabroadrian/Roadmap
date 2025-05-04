import React, { useState, useMemo, useCallback } from "react";
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
  const grad = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo']; // Usa item.Estado
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
            <div><strong>Estado:</strong> {item.Estado}</div> {/* Usa item.Estado */}
            <div><strong>Etapa:</strong> {item.etapa}</div>
            <div><strong>Estimación:</strong> {item.Estimacion || 'N/A'}</div>
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
  const safeTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());

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
    () => safeTasks.map(task => ({ id: task.id, title: task.title })),
    [safeTasks]
  );

  const itemsWithDependencies = useMemo(() => {
    // Primero, mapeamos las tareas para tener un acceso rápido por ID
    const taskMap = safeTasks.reduce((acc, task) => {
      acc[task.id] = {
        ...task,
        start_time: moment(task.startDate),
        end_time: moment(task.endDate)
      };
      return acc;
    }, {});

    // Función para calcular la fecha de inicio ajustada por dependencias
    const getAdjustedStartTime = (taskId, visited = new Set()) => {
      const task = taskMap[taskId];
      if (!task || !task.dependencies || task.dependencies.length === 0) {
        return task ? task.start_time : moment(null); // Retorna la fecha de inicio original si no hay dependencias
      }

      if (visited.has(taskId)) {
        console.warn(`Ciclo de dependencia detectado en la tarea ${task.title} (${task.id}).`);
        return task.start_time; // Evitar bucles
      }
      visited.add(taskId);

      let latestDependencyEndDate = moment(null);
      task.dependencies.forEach(dependencyId => {
        const dependencyEndDate = getAdjustedStartTime(dependencyId, new Set(visited)).end_time;
        if (dependencyEndDate && dependencyEndDate.isAfter(latestDependencyEndDate)) {
          latestDependencyEndDate = dependencyEndDate;
        }
      });

      // Si alguna dependencia tiene una fecha de fin posterior a la fecha de inicio original, ajustamos la fecha de inicio
      if (latestDependencyEndDate.isValid() && latestDependencyEndDate.isAfter(task.start_time)) {
        return latestDependencyEndDate.clone().add(1, 'day'); // Puedes ajustar esto según cómo definas la dependencia (empieza al día siguiente, etc.)
      }

      return task.start_time;
    };

    return safeTasks.map(task => {
      const stateDef = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo']; // Usa task.Estado
      const grad = `linear-gradient(120deg, ${stateDef[0]}, ${stateDef[1]})`;
      const hasPattern = !task.Estimacion;
      const adjustedStartTime = getAdjustedStartTime(task.id);

      return {
        id: task.id,
        group: task.id,
        title: task.title,
        start_time: adjustedStartTime,
        end_time: moment(task.endDate),
        Estado: task.Estado, // Usa task.Estado
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
      };
    });
  }, [safeTasks]);

  const dependencies = useMemo(() => {
    const taskMap = safeTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {});

    const deps = [];
    safeTasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(dependencyId => {
          if (taskMap[dependencyId]) {
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
    return deps;
  }, [safeTasks]);

  const dependencyRenderer = useCallback(({ dependencies, getItemById, itemLinkRenderer }) => {
    return (
      <div className="dependencies">
        {dependencies.map((dependency) => {
          const fromItem = getItemById(dependency.fromItem);
          const toItem = getItemById(dependency.toItem);

          if (!fromItem || !toItem) {
            return null;
          }

          const fromAnchor = moment(fromItem.end_time).valueOf();
          const toAnchor = moment(toItem.start_time).valueOf();

          // Ajusta la posición vertical para que la flecha no se superponga con el texto
          const fromY = fromItem.top + fromItem.height / 2;
          const toY = toItem.top + toItem.height / 2;

          // Define los puntos de la línea y la flecha
          const points = `
            ${fromItem.left + fromItem.width},${fromY}
            ${fromItem.left + fromItem.width + 20},${fromY}
            ${fromItem.left + fromItem.width + 20},${toY}
            ${toItem.left - 5},${toY}
          `;

          const arrowPoints = `
            ${toItem.left - 5},${toY - 5}
            ${toItem.left + 5},${toY}
            ${toItem.left - 5},${toY + 5}
          `;

          return (
            <svg key={`dep-${dependency.fromItem}-${dependency.toItem}`} style={{ position: 'absolute', overflow: 'visible', zIndex: 10 }}>
              <polyline
                points={points}
                stroke="#757575"
                strokeWidth={1.5}
                fill="none"
                markerEnd="url(#arrowhead)"
              />
              <marker id="arrowhead" viewBox="0 0 10 10" refX="0" refY="5" markerUnits="strokeWidth" markerWidth="8" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#757575" />
              </marker>
            </svg>
          );
        })}
      </div>
    );
  }, [safeTasks]);

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
        .timeline-item-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
        .dependencies svg { position: absolute; z-index: 10; }
      `}</style>
      <Timeline
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
        dependencyRenderer={dependencyRenderer}
        dependencies={dependencies}
      />
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
      Estado: PropTypes.string, // Usa PropTypes.string para Estado
      etapa: PropTypes.string,
      Estimacion: PropTypes.any,
      progress: PropTypes.any,
      dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])), // Nuevo campo para las dependencias
      Bloqueos: PropTypes.arrayOf(PropTypes.string),
    })
  ).isRequired,
};

export default MyTimeline;
