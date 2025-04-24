// src/components/MyTimeline.js
import React, { useState, useMemo } from "react";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";
import { Tooltip, Chip } from "@mui/material";

// Definición de estilos para Etapas (phases)
const ETAPA_STYLES = {
  "Cambio de alcance": { color: "#FF9800" },
  "Impacto en inicio": { color: "#F44336" },
  "Ajustes": { color: "#2196F3" },
  "Sin requerimiento": { color: "#9E9E9E" },
  "Sin estimar": { color: "#EEEEEE" },
  "En pausa": { color: "#FFEB3B" },
  "Inicio de desarrollo": { color: "#4CAF50" },
};

// Definición de estilos para Estados (status)
const STATE_STYLES = {
  "Nuevo":       { gradient: ["#ffcdd2", "#e57373"] },
  "En curso":    { gradient: ["#fff9c4", "#ffeb3b"] },
  "En progreso": { gradient: ["#fff9c4", "#ffeb3b"] },
  "Hecho":       { gradient: ["#c8e6c9", "#4caf50"] },
};

// Patrón para items sin estimación
const PATTERNS = {
  stripes: "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)",
};

// Renderizador de cada item en la timeline
const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const etapaColor = ETAPA_STYLES[item.etapa]?.color || "#757575";

  return (
    <div {...itemProps} style={{ ...itemProps.style, ...item.style }}>
      {/* Etiqueta de etapa */}
      {item.etapa && (
        <Chip
          label={item.etapa}
          size="small"
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            backgroundColor: etapaColor,
            color: '#fff',
            fontSize: '10px',
            height: '18px',
          }}
        />
      )}
      {/* Tooltip con detalles */}
      <Tooltip
        title={
          <div style={{ textAlign: "left", fontSize: "0.85rem" }}>
            <div><strong>Estado:</strong> {item.state}</div>
            <div><strong>Etapa:</strong> {item.etapa}</div>
            <div><strong>Estimación:</strong> {item.estimacion || "N/A"}</div>
            <div><strong>Inicio:</strong> {moment(item.start_time).format("DD/MM/YYYY")}</div>
            <div><strong>Fin:</strong> {moment(item.end_time).format("DD/MM/YYYY")}</div>
            <div><strong>Progreso:</strong> {item.progress || "N/A"}</div>
          </div>
        }
        arrow
        placement="top"
        enterDelay={300}
      >
        <div style={{ width: '100%', textAlign: 'center' }}>{item.title}</div>
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

  // Agrupa tareas
  const groups = useMemo(
    () => safeTasks.map(task => ({ id: task.id, title: task.title })),
    [safeTasks]
  );

  // Prepara items con estilos
  const items = useMemo(
    () => safeTasks.map(task => {
      const stateDef = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
      const gradientCss = `linear-gradient(120deg, ${stateDef.gradient[0]}, ${stateDef.gradient[1]})`;
      const patternCss = !task.Estimacion ? PATTERNS.stripes : '';
      const bgImage = patternCss ? `url("${patternCss}"), ${gradientCss}` : gradientCss;

      return {
        id: task.id,
        group: task.id,
        title: task.title,
        start_time: moment(task.startDate),
        end_time: moment(task.endDate),
        state: task.Estado,
        etapa: task.etapa,
        style: {
          backgroundImage: bgImage,
          backgroundRepeat: 'repeat',
          backgroundSize: '200% 100%',
          borderRadius: '5px',
          padding: '4px',
          color: '#333',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          minHeight: '30px',
          fontSize: '13px',
          borderLeft: `4px solid ${ETAPA_STYLES[task.etapa]?.color || '#757575'}`,
          border: '1px solid #ccc',
        },
        estimacion: task.Estimacion,
        progress: task.progress,
      };
    }),
    [safeTasks]
  );

  if (!groups.length) return <p>No hay tareas disponibles</p>;

  return (
    <div className="mi-timeline-container">
      {/* Líneas semanales visibles */}
      <style>{`.rct-day-background:nth-child(7n+1) { border-left: 2px solid #ccc; }`}</style>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(start, end) => {
          setVisibleTimeStart(start);
          setVisibleTimeEnd(end);
        }}
        itemRenderer={ItemRenderer}
        headerLabelFormats={{
          monthShort: 'MMM',
          monthLong: 'MMMM YYYY',
          weekShort: 'W',
          weekLong: 'Wo [semana]'
        }}
        headerLabelGroupHeight={30}
        headerLabelHeight={30}
        minZoom={1000 * 60 * 60 * 24 * 7}
        maxZoom={1000 * 60 * 60 * 24 * 31 * 4}
        sidebarWidth={150}
        className="mi-rct-sidebar"
        sidebarContentRenderer={({ group }) => <div className="mi-rct-sidebar-row">{group.title}</div>}
        groupHeights={groups.map(() => 40)}
      />
    </div>
  );
};

export default MyTimeline;
