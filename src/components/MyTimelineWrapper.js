// src/components/MyTimelineWrapper.js
import React from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";

const MyTimelineWrapper = ({ tasks }) => {
  // Creamos un grupo para cada tarea
  const groups = tasks.map(task => ({
    id: task.id,
    title: task.title,
  }));

  // Cada tarea se mapea a un ítem, asignando el grupo correspondiente
  const items = tasks.map(task => ({
    id: task.id,
    group: task.id,
    title: task.title,
    start_time: moment(task.startDate),
    end_time: moment(task.endDate),
  }));

  // Definimos un rango de tiempo por defecto
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

export default MyTimelineWrapper;
