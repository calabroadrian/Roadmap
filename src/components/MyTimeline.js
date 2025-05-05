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
  const [g1, g2] = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo'];
  const background = `linear-gradient(120deg, ${g1}, ${g2})`;

  return (
    <Tooltip
      title={
        <Box sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
          <div><strong>Estado:</strong> {item.Estado}</div>
          <div><strong>Etapa:</strong> {item.etapa}</div>
          <div><strong>Estimación:</strong> {item.estimacion || 'N/A'}</div>
          <div><strong>Inicio:</strong> {moment(item.start_time).format('DD/MM/YYYY')}</div>
          <div><strong>Fin:</strong> {moment(item.end_time).format('DD/MM/YYYY')}</div>
          <div><strong>Progreso:</strong> {item.progress != null ? `${item.progress}%` : 'N/A'}</div>
        </Box>
      }
      arrow
      placement="top"
      enterDelay={300}
    >
      <div
        {...itemProps}
        className="timeline-item-hover"
        style={{
          ...itemProps.style,
          ...item.style,
          background,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {typeof item.progress === 'number' && (
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: 4,
            width: `${item.progress}%`,
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
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        />
      </div>
    </Tooltip>
  );
};

ItemRenderer.propTypes = {
  item: PropTypes.object.isRequired,
  getItemProps: PropTypes.func.isRequired,
};

const MyTimeline = ({ tasks }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months');
  const defaultEnd = now.clone().add(2, 'months');

  const [filter, setFilter] = useState("");
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());

  const filteredTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  const groups = useMemo(
    () => filteredTasks.map(t => ({ id: t.id, title: t.title })),
    [filteredTasks]
  );

  const items = useMemo(
    () => filteredTasks.map(t => ({
      id: t.id,
      group: t.id,
      title: t.title,
      start_time: moment(t.startDate),
      end_time: moment(t.endDate),
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

  // Dependencias nativas
  const dependencies = useMemo(
    () => items.flatMap(item =>
      item.dependencies.map(depId => ({ fromItem: depId, toItem: item.id }))
    ),
    [items]
  );

  // Renderizador de flechas
  const dependencyRenderer = useCallback(({ fromItem, toItem, getItemById }) => {
    const from = getItemById(fromItem);
    const to   = getItemById(toItem);
    if (!from || !to) return null;
    const width = Math.abs(to.right - from.right) + 10;
    return (
      <CustomMarker key={`${fromItem}-${toItem}`} date={from.end_time.valueOf()}>
        <svg style={{ overflow: 'visible' }} height={20} width={width}>
          <line
            x1={0} y1={10}
            x2={width - 10} y2={10}
            stroke="gray" strokeWidth={2}
          />
          <polygon
            points={`${width - 10},5 ${width},10 ${width - 10},15`}
            fill="gray"
          />
        </svg>
      </CustomMarker>
    );
  }, []);

  const zoom = delta => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(v => v + delta * span * 0.1);
    setVisibleTimeEnd(e => e - delta * span * 0.1);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ScheduleIcon /> Roadmap Timeline
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          label="Buscar…"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Button onClick={() => zoom(-1)}>- Zoom</Button>
        <Button onClick={() => zoom(1)}>+ Zoom</Button>
      </Stack>
      <Timeline
        ref={timelineRef}
        groups={groups}
        items={items}
        dependencies={dependencies}
        dependencyRenderer={dependencyRenderer}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s, e) => { setVisibleTimeStart(s); setVisibleTimeEnd(e); }}
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
      dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
    })
  ).isRequired
};

export default MyTimeline;
