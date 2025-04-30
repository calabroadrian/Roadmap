// src/components/MyTimeline.js
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
  "Nuevo":       ["#ffcdd2", "#e57373"],
  "En curso":    ["#fff9c4", "#ffeb3b"],
  "En progreso": ["#fff9c4", "#ffeb3b"],
  "Hecho":       ["#c8e6c9", "#4caf50"],
};
// Patrón para items sin estimación
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";

// Renderizador de cada item
const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const grad = STATE_STYLES[item.state] || STATE_STYLES['Nuevo'];
  const background = `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`;
  return (
    <div {...itemProps} className="timeline-item-hover" style={{ ...itemProps.style, ...item.style, background }}>
      {item.etapa && (
        <Chip
          label={item.etapa}
          size="small"
          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: ETAPA_STYLES[item.etapa] || '#757575', color: '#fff', fontSize: '10px', height: '18px' }}
        />
      )}
      <Tooltip
        title={
          <Box sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
            <div><strong>Estado:</strong> {item.state}</div>
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
  const items = useMemo(
    () => safeTasks.map(task => {
      const stateDef = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
      const grad = `linear-gradient(120deg, ${stateDef[0]}, ${stateDef[1]})`;
      const hasPattern = !task.Estimacion;
      return {
        id: task.id,
        group: task.id,
        title: task.title,
        start_time: moment(task.startDate),
        end_time: moment(task.endDate),
        state: task.Estado,
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
        }
      };
    }), [safeTasks]
  );

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
        headerLabelFormats={{ monthShort: 'MMM', monthLong: 'MMMM YYYY' }}
        timelineHeaders={
          <TimelineHeaders>
            <DateHeader unit="primaryHeader" labelFormat="MMMM YYYY" />
            <DateHeader unit="week" labelFormat="Wo [semana]" />
            <DateHeader unit="day" labelFormat="DD" />
          </TimelineHeaders>
        }
        todayLineColor="red"
        sidebarWidth={150}
        className="mi-rct-sidebar"
        groupHeights={groups.map(() => 40)}
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
      Estado: PropTypes.string,
      etapa: PropTypes.string,
      Estimacion: PropTypes.any,
      progress: PropTypes.any,
    })
  ).isRequired,
};

export default MyTimeline;
