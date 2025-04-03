// src/components/MyTimeline.js
import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css"; // Tus estilos personalizados
import moment from "moment";
import { Tooltip } from "@mui/material";

const MyTimeline = ({ tasks }) => {
  const safeTasks = tasks || [];

  // Rango de tiempo: mostramos el año actual
  const yearStart = moment().startOf("year");
  const yearEnd = moment().endOf("year");

  const [visibleTimeStart, setVisibleTimeStart] = useState(yearStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(yearEnd.valueOf());

  if (safeTasks.length === 0) {
    return <p>No hay tareas disponibles</p>;
  }

  // Creamos un grupo para cada tarea (cada tarea en su propia fila)
  const groups = safeTasks.map((task) => ({
    id: task.id,
    title: task.title,
  }));

  // Mapeamos cada tarea a un ítem, asignándole el grupo correspondiente y pasando datos adicionales
  const items = safeTasks.map((task) => ({
    id: task.id,
    group: task.id,
    title: task.title,
    start_time: moment(task.startDate),
    end_time: moment(task.endDate),
    estimacion: task.estimacion,
    progress: task.progress,
    dependencias: task.dependencias,
    bloqueos: task.bloqueos,
  }));

  // Renderizador personalizado de cada ítem que envuelve el contenido en un Tooltip
  const itemRenderer = ({ item, timelineContext, getItemProps, getResizeProps }) => {
    // Obtenemos los props para los resize (si los hay)
    const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
    return (
      <div {...getItemProps({ style: { ...getItemProps().style, borderRadius: "10px", padding: "5px", cursor: "pointer" } })}>
        <Tooltip
          title={
            <div style={{ textAlign: "left", fontSize: "0.85rem" }}>
              <div><strong>Estimación:</strong> {item.estimacion || "N/A"}</div>
              <div><strong>Fecha Inicio:</strong> {moment(item.start_time).format("DD/MM/YYYY")}</div>
              <div><strong>Fecha Fin:</strong> {moment(item.end_time).format("DD/MM/YYYY")}</div>
              <div><strong>Progreso:</strong> {item.progress || "N/A"}</div>
              <div><strong>Dependencias:</strong> {item.dependencias || "N/A"}</div>
              <div><strong>Bloqueos:</strong> {item.bloqueos || "N/A"}</div>
            </div>
          }
          arrow
          placement="top"
          enterDelay={300}
        >
          <div style={{ textAlign: "center" }}>{item.title}</div>
        </Tooltip>
      </div>
    );
  };

  return (
    <div>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={yearStart}
        defaultTimeEnd={yearEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(start, end) => {
          setVisibleTimeStart(start);
          setVisibleTimeEnd(end);
        }}
        itemRenderer={itemRenderer}
        headerLabelFormats={{
          dayShort: "",
          dayLong: "",
          monthShort: "MMM",
          monthLong: "MMMM",
          yearShort: "",
          yearLong: "",
        }}
        headerLabelGroupHeight={50}
        headerLabelHeight={50}
        minZoom={1000 * 60 * 60 * 24 * 30}   // Zoom mínimo: 1 mes
        maxZoom={1000 * 60 * 60 * 24 * 365}     // Zoom máximo: 1 año
      />
    </div>
  );
};

export default MyTimeline;
