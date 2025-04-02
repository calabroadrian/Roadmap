// src/components/MyTimeline.js
import React from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";

const MyTimeline = ({ tasks }) => {
  // Creamos un grupo único para todas las tareas
  const groups = [{ id: 1, title: "Tareas" }];

  // Mapeamos las tareas al formato requerido: id, group, title, start_time, end_time
  const items = tasks.map((task) => ({
    id: task.id,
    group: 1,
    title: task.title,
    start_time: moment(task.startDate),
    end_time: moment(task.endDate)
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
      />
    </div>
  );
};

export default MyTimeline;
