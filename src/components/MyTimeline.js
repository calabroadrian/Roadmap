// src/components/MyTimeline.js
import React, { useState, useMemo, useCallback, useRef } from "react";
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

// Renderizador de cada item actualizado
const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const [startGrad, endGrad] = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo'];
  return (
    <Tooltip title={`${item.title} (${item.Estado})`} arrow placement="top">
      <div
        {...itemProps}
        className="timeline-item-hover"
        style={{
          ...itemProps.style,
          ...item.style,
          background: `linear-gradient(120deg, ${startGrad}, ${endGrad})`,
          borderRadius: 4,
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Chip
          icon={<ScheduleIcon fontSize="small" />}
          label={item.title}
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 500 }}
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
  const filteredTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());
  const timelineRef = useRef(null);

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

  const itemsWithDependencies = useMemo(
    () => filteredTasks.map(task => ({
      id: task.id,
      group: task.id,
      title: task.title,
      start_time: moment(task.startDate),
      end_time: moment(task.endDate),
      Estado: task.Estado,
      etapa: task.etapa,
      estimacion: task.Estimacion,
      progress: task.progress,
      Dependencias: Array.isArray(task.dependencies) ? task.dependencies.map(Number) : [],
      style: {
        background: `linear-gradient(120deg, ${
          STATE_STYLES[task.Estado]?.[0] || STATE_STYLES['Nuevo'][0]
        }, ${
          STATE_STYLES[task.Estado]?.[1] || STATE_STYLES['Nuevo'][1]
        })`,
        ...(task.Estimacion
          ? {}
          : { backgroundImage: PATTERNS, backgroundRepeat: 'repeat' }
        ),
        borderRadius: 4,
        padding: 4,
        color: '#fff',
        fontWeight: 500,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${ETAPA_STYLES[task.etapa] || '#757575'}`
      }
    })),
    [filteredTasks]
  );

  const dependencyMarkers = useMemo(
    () =>
      itemsWithDependencies.flatMap(item =>
        item.Dependencias.map(depId => {
          const dep = itemsWithDependencies.find(i => i.id === depId);
          if (!dep) return null;
          return (
            <CustomMarker key={`dep-${depId}-${item.id}`} date={dep.end_time.valueOf()}>
              <svg style={{ overflow: 'visible' }} height={20} width={60}>
                <line x1={0} y1={10} x2={60} y2={10} stroke="gray" strokeWidth={2} />
                <polygon points="60,5 70,10 60,15" fill="gray" />
              </svg>
            </CustomMarker>
          );
        })
      ),
    [itemsWithDependencies]
  );

  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <ScheduleIcon /> Roadmap Timeline
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          label="Buscar…"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button size="small" variant="outlined" onClick={zoomOut}>
          - Zoom
        </Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>
          + Zoom
        </Button>
      </Stack>
      <style>{`
        .rct-day-background:nth-child(7n+1) { border-left: 2px solid #ccc; }
        .rct-item.rct-selected { background: none !important; }
        .timeline-item-hover:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
      `}</style>
      <Timeline
        ref={timelineRef}
        groups={groups}
        items={itemsWithDependencies}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s, e) => {
          setVisibleTimeStart(s);
          setVisibleTimeEnd(e);
        }}
        itemRenderer={ItemRenderer}
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
      startDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date)
      ]),
      endDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date)
      ]),
      Estado: PropTypes.string,
      etapa: PropTypes.string,
      Estimacion: PropTypes.any,
      progress: PropTypes.any,
      dependencies: PropTypes.arrayOf(PropTypes.number),
    })
  ).isRequired,
};

export default MyTimeline;
