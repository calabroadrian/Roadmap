// src/components/MyTimeline.js
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";
import { Tooltip, Chip, Box, Button, TextField } from "@mui/material";

// Estilos para Etapas
const ETAPA_STYLES = {
  "Cambio de alcance": { color: "#FF9800" },
  "Impacto en inicio": { color: "#F44336" },
  "Ajustes": { color: "#2196F3" },
  "Sin requerimiento": { color: "#9E9E9E" },
  "Sin estimar": { color: "#EEEEEE" },
  "En pausa": { color: "#FFEB3B" },
  "Inicio de desarrollo": { color: "#4CAF50" },
};

// Estilos para Estados
const STATE_STYLES = {
  "Nuevo":       { gradient: ["#ffcdd2", "#e57373"] },
  "En curso":    { gradient: ["#fff9c4", "#ffeb3b"] },
  "En progreso": { gradient: ["#fff9c4", "#ffeb3b"] },
  "Hecho":       { gradient: ["#c8e6c9", "#4caf50"] },
};

// Patrón para items sin estimación
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";

// Renderizador de cada item
const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const etapaColor = ETAPA_STYLES[item.etapa]?.color || "#757575";
  return (
    <div {...itemProps} style={{ ...itemProps.style, ...item.style }}>
      {item.etapa && (
        <Chip
          label={item.etapa}
          size="small"
          style={{ position: 'absolute', top: 2, right: 2, backgroundColor: etapaColor, color: '#fff', fontSize: '10px', height: '18px' }}
        />
      )}
      <Tooltip
        title={
          <div style={{ textAlign: 'left', fontSize: '0.85rem' }}>
            <div><strong>Estado:</strong> {item.state}</div>
            <div><strong>Etapa:</strong> {item.etapa}</div>
            <div><strong>Estimación:</strong> {item.estimacion || 'N/A'}</div>
            <div><strong>Inicio:</strong> {moment(item.start_time).format('DD/MM/YYYY')}</div>
            <div><strong>Fin:</strong> {moment(item.end_time).format('DD/MM/YYYY')}</div>
            <div><strong>Progreso:</strong> {item.progress || 'N/A'}</div>
          </div>
        }
        arrow placement="top" enterDelay={300}
      >
        <div style={{ width: '100%', textAlign: 'center' }}>{item.title}</div>
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

  // Zoom handlers
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
      const grad = `linear-gradient(120deg, ${stateDef.gradient[0]}, ${stateDef.gradient[1]})`;
      return {
        id: task.id,
        group: task.id,
        title: task.title,
        start_time: moment(task.startDate),
        end_time: moment(task.endDate),
        state: task.Estado,
        etapa: task.etapa,
        style: { background: grad, ...(task.Estimacion ? {} : { backgroundImage: PATTERNS, backgroundRepeat: 'repeat' }), borderRadius: '5px', padding: '4px', color: '#333', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minHeight: '30px', fontSize: '13px', borderLeft: `4px solid ${ETAPA_STYLES[task.etapa]?.color || '#757575'}`, border: '1px solid #ccc' },
        estimacion: task.Estimacion,
        progress: task.progress,
      };
    }),
    [safeTasks]
  );

  if (!groups.length) return <p>No hay tareas disponibles</p>;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Buscar tarea…"
          size="small"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
          <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
        </Box>
      </Box>
      {/* Semanas visibles y mantener colores tras selección */}
      <style>{`
        .rct-day-background:nth-child(7n+1) { border-left: 2px solid #ccc; }
        .rct-item.rct-selected { background: none !important; }
      `}</style>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(start, end) => { setVisibleTimeStart(start); setVisibleTimeEnd(end); }}
        itemRenderer={ItemRenderer}
        headerLabelFormats={{ monthShort: 'MMM', monthLong: 'MMMM YYYY' }}
        todayLineColor="red"
        minZoom={1000 * 60 * 60 * 24 * 7}
        maxZoom={1000 * 60 * 60 * 24 * 31 * 4}
        sidebarWidth={150}
        className="mi-rct-sidebar"
        sidebarContentRenderer={({ group }) => <div className="mi-rct-sidebar-row">{group.title}</div>}
        groupHeights={groups.map(() => 40)}
      />
    </Box>
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
