// src/components/MyTimeline.js
import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import "./MyTimeline.css"; // Tus estilos personalizados
import moment from "moment";

const MyTimeline = ({ tasks }) => {
  const safeTasks = tasks || [];

  // Definimos el rango de tiempo: el año actual
  const yearStart = moment().startOf("year");
  const yearEnd = moment().endOf("year");

  // Establecemos el rango visible inicial
  const [visibleTimeStart, setVisibleTimeStart] = useState(yearStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(yearEnd.valueOf());

  // Si no hay tareas, mostramos un mensaje
  if (safeTasks.length === 0) {
    return <p>No hay tareas disponibles</p>;
  }

  // Creamos un grupo para cada tarea, para que cada tarea tenga su propia fila
  const groups = safeTasks.map((task) => ({
    id: task.id,
    title: task.title,
  }));

  // Mapeamos cada tarea a un ítem asignado a su propio grupo
  const items = safeTasks.map((task) => ({
    id: task.id,
    group: task.id,
    title: task.title,
    start_time: moment(task.startDate),
    end_time: moment(task.endDate),
  }));

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
        headerLabelFormats={{
          dayShort: "",     // No mostrar días
          dayLong: "",
          monthShort: "MMM", // Ejemplo: Ene, Feb, Mar, ...  
          monthLong: "MMMM", // Ejemplo: Enero, Febrero, etc.
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
