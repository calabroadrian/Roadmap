// src/components/GSTCTimeline.js
import React, { useMemo, useEffect, useRef } from "react";
import createGSTC from "gantt-schedule-timeline-calendar";
import "gantt-schedule-timeline-calendar/dist/style.css";

const GSTCTimeline = ({ tasks }) => {
  const containerRef = useRef(null);
  const safeTasks = tasks || [];

  // Calculamos la configuración de GSTC basándonos en las tareas
  const config = useMemo(() => {
    // Creamos la lista de items
    const items = safeTasks.reduce((acc, task) => {
      acc[task.id] = {
        id: task.id,
        label: task.title
      };
      return acc;
    }, {});

    // Calculamos el rango de tiempo
    let start = Date.now();
    let end = start + 30 * 24 * 60 * 60 * 1000; // Valor por defecto: 30 días
    if (safeTasks.length > 0) {
      const startTimes = safeTasks.map(task => new Date(task.startDate).getTime());
      const endTimes = safeTasks.map(task => new Date(task.endDate).getTime());
      start = Math.min(...startTimes);
      end = Math.max(...endTimes);
    }

    return {
      list: {
        items
      },
      chart: {
        items: Object.keys(items),
        time: { start, end }
      }
      // No agregamos plugins para evitar errores de suscripción
    };
  }, [safeTasks]);

  useEffect(() => {
    if (!containerRef.current) return;
    // Instanciamos GSTC usando la función default importada (createGSTC)
    const instance = createGSTC({ element: containerRef.current, state: createGSTC.api.state(config) });
    return () => {
      instance.destroy();
    };
  }, [config]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
};

export default GSTCTimeline;