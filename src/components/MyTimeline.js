// src/components/MyTimeline.js
import React from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";

const MyTimeline = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return <p>No hay tareas disponibles</p>;

  // Creamos un grupo para cada tarea (una fila por tarea)
  const groups = tasks.map((task) => ({
    id: task.id, // Cada tarea tendrá su propio grupo
    title: task.title,
  }));

  // Asignamos cada tarea a su propio grupo
  const items = tasks.map((task) => ({
    id: task.id,
    group: task.id, // Se usa el mismo ID del grupo para separarlas
    title: task.title,
    start_time: moment(task.startDate),
    end_time: moment(task.endDate),
  }));

  // Definimos un rango de tiempo por defecto: desde ayer hasta dentro de 7 días
  const defaultTimeStart = moment().startOf("day").subtract(1, "day");
  const defaultTimeEnd = moment().startOf("day").add(7, "days");

  return (
    <div>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        itemHeightRatio={0.75}
        canMove={false} // Desactiva la edición manual
        canResize={false}
      />
    </div>
  );
};

export default MyTimeline;
