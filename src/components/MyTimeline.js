// src/components/MyTimeline.js
import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import "./MyTimeline.css"; // Tus estilos personalizados
import moment from "moment";

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

  // Mapeamos cada tarea a un ítem, asignándola a su propio grupo
  const items = safeTasks.map((task) => {
    let backgroundColor = "linear-gradient(120deg, #64b5f6, #1e88e5)"; // color por defecto
    switch (task.Estado) {
      case "Nuevo":
        backgroundColor = "linear-gradient(120deg, #ffcdd2, #e57373)";
        break;
      case "En curso":
        backgroundColor = "linear-gradient(120deg, #fff9c4, #ffeb3b)";
        break;
      case "Hecho":
        backgroundColor = "linear-gradient(120deg, #c8e6c9, #4caf50)";
        break;
      default:
        break;
    }
    // Si no tiene estimación, aplicamos un patrón de fondo
    const backgroundImage = !task.Estimacion
      ? "repeating-linear-gradient(45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)"
      : "";
      
    return {
      id: task.id,
      group: task.id,
      title: task.title,
      start_time: moment(task.startDate),
      end_time: moment(task.endDate),
      style: {
        background: backgroundColor,
        backgroundImage: backgroundImage,
      },
    };
  });

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
