// src/components/MyTimeline.js
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
import {
  Tooltip,
  Chip,
  Box,
  Button,
  TextField,
  Paper,
  Stack,
  Typography
} from "@mui/material";
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

// Custom item renderer with progress bar and Chip
const ItemRenderer = ({ item, getItemProps }) => {
  const props = getItemProps();
  const [g1, g2] = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo'];
  return (
    <Tooltip title={item.title} arrow placement="top">
      <div
        {...props}
        className="timeline-item-hover"
        style={{
          ...props.style,
          background: `linear-gradient(120deg, ${g1}, ${g2})`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {typeof item.progress === 'number' && (
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0,
            height: 4, width: `${item.progress}%`,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: item.progress === 100 ? 2 : 0
          }} />
        )}
        <Chip
          icon={<ScheduleIcon fontSize="small" />}
          label={item.title}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            fontWeight: 500,
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        />
      </div>
    </Tooltip>
  );
};

const MyTimeline = ({ tasks }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months');
  const defaultEnd = now.clone().add(2, 'months');

  const [filter, setFilter] = useState("");
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());

  // Filtrar por título
  const filteredTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  // Grupos
  const groups = useMemo(
    () => filteredTasks.map(t => ({ id: t.id, title: t.title })),
    [filteredTasks]
  );

  // Items incluyendo dependencias y configuración
  const items = useMemo(
    () => filteredTasks.map(t => ({
      id: t.id,
      group: t.id,
      title: t.title,
      start_time: moment(t.startDate, moment.ISO_8601),
      end_time: moment(t.endDate, moment.ISO_8601),
      Estado: t.Estado,
      etapa: t.etapa,
      estimacion: t.Estimacion,
      progress: t.progress,
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      canMove: true,
      canResize: 'both',
      style: {
        background: `linear-gradient(120deg, ${STATE_STYLES[t.Estado]?.[0]}, ${STATE_STYLES[t.Estado]?.[1]})`,
        ...(t.Estimacion ? {} : { backgroundImage: PATTERNS, backgroundRepeat: 'repeat' }),
        borderRadius: 4,
        padding: 4,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${ETAPA_STYLES[t.etapa] || '#757575'}`
      }
    })),
    [filteredTasks]
  );

  // Validar dependencia al mover/resize
  const moveResizeValidator = useCallback((action, item, time, edge) => {
    if (!item.dependencies || !item.dependencies.length) return true;
    const maxDepEnd = item.dependencies.reduce((max, depId) => {
      const dep = items.find(i => i.id === depId);
      return dep ? Math.max(max, dep.end_time.valueOf()) : max;
    }, 0);
    const newStart = action === 'move' ? time : (edge === 'left' ? time : item.start_time.valueOf());
    if (newStart < maxDepEnd) {
      alert('No puedes iniciar antes de la finalización de tus dependencias');
      return false;
    }
    return true;
  }, [items]);

  // Marcadores de dependencia
  const dependencyMarkers = useMemo(
    () => items.flatMap(item =>
      item.dependencies.map(depId => {
        const dep = items.find(i => i.id === depId);
        if (!dep) return null;
        return (
          <CustomMarker key={`dep-${depId}-${item.id}`} date={dep.end_time.valueOf()}>
            <svg style={{ overflow: 'visible' }} height={20} width={80}>
              <line x1={0} y1={10} x2={80} y2={10} stroke="gray" strokeWidth={2} />
              <polygon points="80,5 90,10 80,15" fill="gray" />
            </svg>
          </CustomMarker>
        );
      })
    ), [items]
  );

  // Zoom
  const zoomIn = () => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(v => v + span * 0.1);
    setVisibleTimeEnd(v => v - span * 0.1);
  };
  const zoomOut = () => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(v => v - span * 0.1);
    setVisibleTimeEnd(v => v + span * 0.1);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon /> Roadmap Timeline
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField label="Buscar…" size="small" value={filter} onChange={e => setFilter(e.target.value)} />
        <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
      </Stack>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s,e) => { setVisibleTimeStart(s); setVisibleTimeEnd(e); }}
        itemRenderer={ItemRenderer}
        moveResizeValidator={moveResizeValidator}
        todayLineColor="red"
        sidebarWidth={150}
        className="mi-rct-sidebar"
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
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      Estado: PropTypes.string,
      etapa: PropTypes.string,
      Estimacion: PropTypes.any,
      progress: PropTypes.number,
      dependencies: PropTypes.arrayOf(PropTypes.number)
    })
  ).isRequired
};

export default MyTimeline;
