// src/components/MyTimeline.js
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Timeline from "react-calendar-timeline";
import {
  Paper,
  Typography,
  Chip,
  Box,
  Button,
  TextField,
  Stack,
  useTheme
} from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';
import "./MyTimeline.css";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";

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
  const etapaColor = ETAPA_STYLES[item.etapa] || "#757575";
  return (
    <div {...itemProps} className="timeline-item">
      {item.etapa && (
        <Chip
          label={item.etapa}
          size="small"
          className="etapa-chip"
          sx={{ bgcolor: etapaColor }}
        />
      )}
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Typography noWrap sx={{ fontWeight: 500 }}>{item.title}</Typography>
      </Box>
      <Box className="tooltip-box">
        <Typography variant="caption"><strong>Estado:</strong> {item.state}</Typography><br/>
        <Typography variant="caption"><strong>Etapa:</strong> {item.etapa}</Typography><br/>
        <Typography variant="caption"><strong>Estimación:</strong> {item.estimacion||'N/A'}</Typography><br/>
        <Typography variant="caption"><strong>Inicio:</strong> {moment(item.start_time).format('DD/MM/YYYY')}</Typography><br/>
        <Typography variant="caption"><strong>Fin:</strong> {moment(item.end_time).format('DD/MM/YYYY')}</Typography><br/>
        <Typography variant="caption"><strong>Progreso:</strong> {item.progress||'N/A'}</Typography>
      </Box>
    </div>
  );
};

const MyTimeline = ({ tasks }) => {
  const theme = useTheme();
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
      const grad = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
      const background = `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`;
      const hasPattern = !task.Estimacion;
      return {
        id: task.id,
        group: task.id,
        title: task.title,
        start_time: moment(task.startDate),
        end_time: moment(task.endDate),
        state: task.Estado,
        etapa: task.etapa,
        style: {
          background,
          ...(hasPattern && { backgroundImage: PATTERNS, backgroundRepeat: 'repeat' }),
          borderRadius: '8px',
          padding: '4px',
          color: '#fff',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'transform 0.2s',
        },
        estimacion: task.Estimacion,
        progress: task.progress,
      };
    }),
    [safeTasks]
  );

  return (
    <Paper elevation={3} sx={{ p:2, bgcolor: theme.palette.background.paper }}>
      <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb:1 }}>
        <ScheduleIcon sx={{ mr:1 }} /> Roadmap
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb:1, flexWrap: 'wrap' }}>
        {Object.entries(STATE_STYLES).map(([status, grad]) => (
          <Chip key={status} label={status} size="small" sx={{ background: `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`, color:'#fff' }} />
        ))}
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mb:2, flexWrap: 'wrap' }}>
        {Object.entries(ETAPA_STYLES).map(([etapa, def]) => (
          <Chip key={etapa} label={etapa} size="small" sx={{ backgroundColor: def, color:'#fff' }} />
        ))}
      </Stack>
      <Box sx={{ mb:1, display:'flex', gap:2, flexWrap:'wrap' }}>
        <TextField size="small" label="Buscar…" value={filter} onChange={e=>setFilter(e.target.value)} />
        <Box sx={{ display:'flex', gap:1 }}>
          <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
          <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
        </Box>
      </Box>
      <style>{`
        .rct-day-background:nth-child(7n+1) { border-left: 2px solid ${theme.palette.divider}; }
        .timeline-item:hover { transform: scale(1.02); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .etapa-chip { position:absolute; top:4px; right:4px; font-size:0.7rem; }
      `}</style>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s,e)=>{setVisibleTimeStart(s);setVisibleTimeEnd(e);}}
        itemRenderer={ItemRenderer}
        headerLabelFormats={{ monthShort: 'MMM', monthLong: 'MMMM YYYY' }}
        todayLineColor={theme.palette.error.main}
        sidebarWidth={150}
        className="mi-rct-sidebar"
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
