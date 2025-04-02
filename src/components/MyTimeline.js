// src/components/MyTimeline.js
import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css";
import moment from "moment";

const MyTimeline = ({ tasks }) => {
  const safeTasks = tasks || [];

  // Llamamos a useState incondicionalmente
  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");
  const [visibleTimeStart, setVisibleTimeStart] = useState(monthStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(monthEnd.valueOf());

  // Si no hay tareas, renderizamos un mensaje
  if (safeTasks.length === 0) {
    return <p>No hay tareas disponibles</p>;
  }

  // Creamos un grupo para cada tarea
  const groups = safeTasks.map((task) => ({
    id: task.id,
    title: task.title,
  }));

  // Mapeamos cada tarea a un ítem, asignándola a su propio grupo
  const items = safeTasks.map((task) => ({
    id: task.id,
    group: task.id,
    title: task.title,
    start_time: moment(task.startDate),
    end_time: moment(task.endDate),
  }));

  return (
    <Timeline
      groups={groups}
      items={items}
      defaultTimeStart={monthStart}
      defaultTimeEnd={monthEnd}
      visibleTimeStart={visibleTimeStart}
      visibleTimeEnd={visibleTimeEnd}
      onTimeChange={(start, end) => {
        setVisibleTimeStart(start);
        setVisibleTimeEnd(end);
      }}
    />
  );
};

export default MyTimeline;
