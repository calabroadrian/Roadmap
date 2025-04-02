// src/components/MyTimeline.js
import React from "react";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css"
import moment from "moment";

const MyTimeline = ({ tasks }) => {
  if (!tasks || tasks.length === 0) return <p>No hay tareas disponibles</p>;

  // Creamos un grupo para cada tarea
  const groups = tasks.map((task) => ({
    id: task.id,
    title: task.title,
  }));

  // Asignamos cada tarea a su propio grupo
  const items = tasks.map((task) => ({
    id: task.id,
    group: task.id,
    title: task.title,
    start_time: moment(task.startDate),
    end_time: moment(task.endDate),
  }));

  // Vista mensual por defecto
  const monthStart = moment().startOf("month");
  const monthEnd = moment().endOf("month");

  const [visibleTimeStart, setVisibleTimeStart] = useState(monthStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(monthEnd.valueOf());

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
