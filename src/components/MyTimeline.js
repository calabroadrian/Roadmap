import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
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

const MyTimeline = ({ tasks }) => {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months').toDate();
  const defaultEnd = now.clone().add(2, 'months').toDate();

  const [filter, setFilter] = useState("");
  const filteredTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  // Construir items y edges para vis-timeline
  const { items, edges } = useMemo(() => {
    const itemsDs = [];
    const edgesDs = [];
    // Mapear tareas y ajustar fechas por dependencias
    const taskMap = {};
    filteredTasks.forEach(task => {
      taskMap[task.id] = {
        ...task,
        start: moment(task.startDate).toDate(),
        end: moment(task.endDate).toDate(),
      };
    });
    const getAdjustedStart = id => {
      const t = taskMap[id];
      if (!t.dependencies?.length) return t.start;
      let latest = t.start;
      t.dependencies.forEach(depId => {
        const dep = taskMap[depId];
        if (!dep) return;
        const depEnd = getAdjustedStart(depId) < dep.end ? dep.end : dep.start;
        if (depEnd > latest) latest = depEnd;
      });
      return moment(latest).add(1, 'day').toDate();
    };
    filteredTasks.forEach(task => {
      const start = getAdjustedStart(task.id);
      const colorGradient = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
      itemsDs.push({
        id: task.id,
        content: task.title,
        start,
        end: moment(task.endDate).toDate(),
        style: `background: linear-gradient(120deg, ${colorGradient[0]}, ${colorGradient[1]}); border-left: 4px solid ${ETAPA_STYLES[task.etapa] || '#757575'}; color: #fff;`,
        title: `Estado: ${task.Estado}\nEtapa: ${task.etapa}\nEstimación: ${task.Estimacion || 'N/A'}`,
      });
      (task.dependencies || []).forEach(depId => {
        if (taskMap[depId]) edgesDs.push({ from: depId, to: task.id, arrows: 'to' });
      });
    });
    return { items: new DataSet(itemsDs), edges: new DataSet(edgesDs) };
  }, [filteredTasks]);

  useEffect(() => {
    if (containerRef.current) {
      if (timelineRef.current) timelineRef.current.destroy();
      const options = {
        stack: false,
        zoomable: true,
        moveable: true,
        start: defaultStart,
        end: defaultEnd,
        editable: false,
        orientation: { axis: 'bottom', item: 'top' },
        margin: { item: 10 },
      };
      timelineRef.current = new Timeline(containerRef.current, items, edges, options);
    }
    return () => timelineRef.current?.destroy();
  }, [items, edges, defaultStart, defaultEnd]);

  const zoomIn = useCallback(() => timelineRef.current?.zoomIn(), []);
  const zoomOut = useCallback(() => timelineRef.current?.zoomOut(), []);

  return (
    <Paper elevation={3} sx={{ p:2, bgcolor:'background.paper', borderRadius:2 }}>
      <Typography variant="h6" gutterBottom sx={{ display:'flex', alignItems:'center', gap:1 }}>
        <ScheduleIcon /> Roadmap Timeline
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb:1, flexWrap:'wrap' }}>
        {Object.entries(STATE_STYLES).map(([status, grad]) => (
          <Chip key={status} label={status} size="small" sx={{ background: `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`, color:'#fff' }} />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb:2, flexWrap:'wrap' }}>
        {Object.entries(ETAPA_STYLES).map(([etapa, color]) => (
          <Chip key={etapa} label={etapa} size="small" sx={{ backgroundColor: color, color:'#fff' }} />
        ))}
      </Stack>
      <Box sx={{ mb:1, display:'flex', gap:2, alignItems:'center', flexWrap:'wrap' }}>
        <TextField label="Buscar…" size="small" value={filter} onChange={e=>setFilter(e.target.value)} />
        <Button variant="outlined" size="small" onClick={zoomOut}>- Zoom</Button>
        <Button variant="outlined" size="small" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <div ref={containerRef} style={{ height:'500px' }} />
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
    })
  ).isRequired,
};

export default MyTimeline;
