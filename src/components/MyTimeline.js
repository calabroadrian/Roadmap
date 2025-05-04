import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Timeline, {
  TimelineHeaders,
  DateHeader,
  TimelineMarkers,
  TodayMarker,
  CustomMarker
} from "react-calendar-timeline";
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
  const [startGrad, endGrad] = STATE_STYLES[item.state] || STATE_STYLES['Nuevo'];
  const background = `linear-gradient(120deg, ${startGrad}, ${endGrad})`;
  return (
    <div
      {...itemProps}
      className="timeline-item-hover"
      style={{ ...itemProps.style, background, position: 'relative' }}
    >
      {item.etapa && (
        <Chip
          label={item.etapa}
          size="small"
          sx={{
            position: 'absolute', top: 2, right: 2,
            backgroundColor: ETAPA_STYLES[item.etapa] || '#757575',
            color: '#fff', fontSize: '10px', height: '18px'
          }}
        />
      )}
      {typeof item.progress === 'number' && (
        <Box
          sx={{
            position: 'absolute', bottom: 0, left: 0,
            height: '4px', width: `${item.progress}%`,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderBottomLeftRadius: 1,
            borderBottomRightRadius: item.progress === 100 ? 1 : 0,
          }}
        />
      )}
      <Tooltip
        title={
          <Box sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
            <div><strong>Estado:</strong> {item.state}</div>
            <div><strong>Etapa:</strong> {item.etapa}</div>
            <div><strong>Estimación:</strong> {item.estimacion || 'N/A'}</div>
            <div><strong>Inicio:</strong> {item.start_time ? item.start_time.format('DD/MM/YYYY') : 'N/A'}</div>
            <div><strong>Fin:</strong> {item.end_time ? item.end_time.format('DD/MM/YYYY') : 'N/A'}</div>
            <div><strong>Progreso:</strong> {item.progress || 'N/A'}</div>
          </Box>
        }
        arrow
        placement="top"
        enterDelay={300}
      >
        <Box sx={{ width: '100%', textAlign: 'center', color: '#fff', fontWeight: 500 }}>
          {item.title}
        </Box>
      </Tooltip>
    </div>
  );
};

ItemRenderer.propTypes = {
  item: PropTypes.object.isRequired,
  getItemProps: PropTypes.func.isRequired
};

const MyTimeline = ({ tasks, onTasksChange }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months');
  const defaultEnd = now.clone().add(2, 'months');

  const [filter, setFilter] = useState("");
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());

  // Normalizar dependencias y parsear fechas usando un solo useMemo
    const safeTasks = useMemo(() => {
        return tasks
            .filter(t => t.title.toLowerCase().includes(filter.toLowerCase()))
            .map(t => {
                const parsedStartDate = t.startDate ? moment(t.startDate, ['M/D/YYYY', moment.ISO_8601]) : null;
                const parsedEndDate = t.endDate ? moment(t.endDate, ['M/D/YYYY', moment.ISO_8601]) : null;

                return {
                    ...t,
                    startDate: parsedStartDate,
                    endDate: parsedEndDate,
                    Dependencias: Array.isArray(t.Dependencias)
                        ? t.Dependencias.map(Number)
                        : typeof t.Dependencias === 'string'
                            ? JSON.parse(t.Dependencias || '[]')
                            : [],
                };
            });
    }, [tasks, filter]);

  const groups = useMemo(
    () => safeTasks.map(t => ({ id: t.id, title: t.title })),
    [safeTasks]
  );

    const items = useMemo(() => {
        return safeTasks.map(t => {
            const stateDef = STATE_STYLES[t.Estado] || STATE_STYLES['Nuevo'];
            return {
                id: t.id,
                group: t.id,
                title: t.title,
                start_time: t.startDate,  // Usar los objetos moment directamente
                end_time: t.endDate,      // Usar los objetos moment directamente
                state: t.Estado,
                etapa: t.etapa,
                estimacion: t.Estimacion,
                progress: t.progress,
                Dependencias: t.Dependencias,
                canMove: true,
                canResize: 'both',
                style: {
                    background: `linear-gradient(120deg, ${stateDef[0]}, ${stateDef[1]})`,
                    ...(t.Estimacion ? {} : { backgroundImage: PATTERNS, backgroundRepeat: 'repeat' }),
                    borderRadius: 4,
                    padding: 4,
                    color: '#fff',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    minHeight: 30,
                    fontSize: 13,
                    borderLeft: `4px solid ${ETAPA_STYLES[t.etapa] || '#757575'}`
                }
            };
        });
    }, [safeTasks]);

  // Validador de dependencia al mover/resize
  const moveResizeValidator = useCallback((action, item, time, resizeEdge) => {
    const deps = item.Dependencias || [];
    if (!deps.length) return true;
    const maxDepEnd = deps.reduce((max, depId) => {
      const dep = items.find(i => i.id === depId);
      return dep ? Math.max(max, dep.end_time ? dep.end_time.valueOf() : 0) : max; // Manejar null o undefined
    }, 0);
    // en mover, 'time' es nuevo start
    const newStart = action === 'move' ? time : (action === 'resize' && resizeEdge === 'left' ? time : item.start_time ? item.start_time.valueOf() : 0);
    if (newStart < maxDepEnd) {
      alert('La tarea no puede comenzar antes de la finalización de sus dependencias.');
      return false;
    }
    return true;
  }, [items]);

  // Marcadores de dependencia
  const dependencyMarkers = useMemo(
    () => items.flatMap(item =>
      item.Dependencias.map(depId => {
        const dep = items.find(i => i.id === depId);
        if (!dep || !dep.end_time) return null; // Saltar si la dependencia no existe o no tiene end_time
        return (
          <CustomMarker
            key={`dep-${depId}-${item.id}`}
            date={dep.end_time.valueOf()}
            render={({ style }) => (
              <svg style={{ ...style, overflow: 'visible' }} height={40} width={80}>
                <line x1={0} y1={10} x2={80} y2={10} stroke="gray" strokeWidth={2} />
                <polygon points="80,5 90,10 80,15" fill="gray" />
              </svg>
            )}
          />
        );
      })
    ).filter(marker => marker !== null), // Eliminar los marcadores nulos
    [items]
  );

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

  const handleItemMove = useCallback(
        (itemId, newStart, newEnd) => {
            const updatedTasks = safeTasks.map(task => {
                if (task.id === itemId) {
                    return {
                        ...task,
                        startDate: moment(newStart),
                        endDate: moment(newEnd),
                    };
                }
                return task;
            });
            onTasksChange(updatedTasks);
        },
        [safeTasks, onTasksChange]
    );

    const handleItemResize = useCallback(
        (itemId, newStart, newEnd) => {
             const updatedTasks = safeTasks.map(task => {
                if (task.id === itemId) {
                    return {
                        ...task,
                         startDate: moment(newStart),
                        endDate: moment(newEnd),
                    };
                }
                return task;
            });
            onTasksChange(updatedTasks);
        },
        [safeTasks, onTasksChange]
    );

  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon /> Roadmap Timeline
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
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
        <TextField label="Buscar…" size="small" value={filter} onChange={e => setFilter(e.target.value)} />
        <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <style>{`
        .rct-day-background:nth-child(7n+1) { border-left: 2px solid #ccc; }
        .rct-item.rct-selected { background: none !important; }
        .timeline-item-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
      `}</style>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s, e) => { setVisibleTimeStart(s); setVisibleTimeEnd(e); }}
        itemRenderer={ItemRenderer}
        moveResizeValidator={moveResizeValidator}
        onItemMove={handleItemMove}
        onItemResize={handleItemResize}
        todayLineColor="red"
        sidebarWidth={150}
        className="mi-rct-sidebar"
        groupHeights={groups.map(() => 40)}
      >
        <TimelineHeaders>
          <DateHeader unit="primaryHeader" labelFormat="MMMM YYYY" />
          <DateHeader unit="week" labelFormat="Wo [semana]" />
          <DateHeader unit="day" labelFormat="DD" />
        </TimelineHeaders>
        <TimelineMarkers>
          <TodayMarker />
          {dependencyMarkers}
        </TimelineMarkers>
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
      Dependencias: PropTypes.arrayOf(PropTypes.number)
    })
  ).isRequired,
  onTasksChange: PropTypes.func.isRequired,
};

export default MyTimeline;
