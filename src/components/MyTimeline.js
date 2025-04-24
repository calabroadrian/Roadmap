// src/components/MyTimeline.js
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";
import { Tooltip, Chip, Box, Button } from "@mui/material";

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
// Patrón de estimación
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";

// Render del ítem
const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const etapaColor = ETAPA_STYLES[item.etapa] || "#757575";
  return (
    <div {...itemProps} className="timeline-item">
      {item.etapa && <Chip label={item.etapa} size="small" className="etapa-chip" />}
      <Tooltip title={
        <div className="tooltip-content">
          <div><strong>Estado:</strong> {item.state}</div>
          <div><strong>Etapa:</strong> {item.etapa}</div>
          <div><strong>Estimación:</strong> {item.estimacion || "N/A"}</div>
          <div><strong>Inicio:</strong> {moment(item.start_time).format("DD/MM/YYYY")}</div>
          <div><strong>Fin:</strong> {moment(item.end_time).format("DD/MM/YYYY")}</div>
          <div><strong>Progreso:</strong> {item.progress || "N/A"}</div>
        </div>}
        arrow placement="top" enterDelay={300}
      >
        <div className="item-title">{item.title}</div>
      </Tooltip>
    </div>
  );
};

const MyTimeline = ({ tasks }) => {
  const safeTasks = tasks || [];
  const now = moment();
  const defaultStart = now.clone().subtract(2, "months");
  const defaultEnd = now.clone().add(2, "months");

  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());

  const groups = useMemo(
    () => safeTasks.map(t => ({ id: t.id, title: t.title })),
    [safeTasks]
  );

  const items = useMemo(
    () => safeTasks.map(t => {
      const grad = STATE_STYLES[t.Estado] || STATE_STYLES['Nuevo'];
      const bgGradient = `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`;
      const bgImage = t.Estimacion ? bgGradient : `${bgGradient}, ${PATTERNS}`;
      return {
        id: t.id,
        group: t.id,
        title: t.title,
        start_time: moment(t.startDate),
        end_time: moment(t.endDate),
        state: t.Estado,
        etapa: t.etapa,
        style: { backgroundImage: bgImage },
        estimacion: t.Estimacion,
        progress: t.progress,
      };
    }),
    [safeTasks]
  );

  // Zoom handlers
  const zoomIn = useCallback(() => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart + span * 0.1);
    setVisibleTimeEnd(visibleTimeEnd - span * 0.1);
  }, [visibleTimeStart, visibleTimeEnd]);
  const zoomOut = useCallback(() => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(visibleTimeStart - span * 0.1);
    setVisibleTimeEnd(visibleTimeEnd + span * 0.1);
  }, [visibleTimeStart, visibleTimeEnd]);

  return (
    <Box>
      <Box className="zoom-controls">
        <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s,e) => {setVisibleTimeStart(s); setVisibleTimeEnd(e);}}
        itemRenderer={ItemRenderer}
        headerLabelFormats={{
          monthShort: 'MMM', monthLong: 'MMMM YYYY',
          dayShort: 'dd', dayLong: 'dddd DD'
        }}
        todayLineColor="red"
        sidebarWidth={150}
        className="mi-rct-sidebar"
        sidebarContentRenderer={({group})=><div className="sidebar-row">{group.title}</div>}
        groupHeights={groups.map(()=>36)}
      />
    </Box>
  );
};

MyTimeline.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string,PropTypes.number]),
    title: PropTypes.string,
    startDate: PropTypes.oneOfType([PropTypes.string,PropTypes.instanceOf(Date)]),
    endDate: PropTypes.oneOfType([PropTypes.string,PropTypes.instanceOf(Date)]),
    Estado: PropTypes.string,
    etapa: PropTypes.string,
    Estimacion: PropTypes.any,
    progress: PropTypes.any,
  }))
};

export default MyTimeline;
