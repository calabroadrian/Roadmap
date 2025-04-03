// src/components/GSTCTimeline.js
import React, { useMemo, useEffect, useRef } from "react";
import createGSTC from "gantt-schedule-timeline-calendar";
import "gantt-schedule-timeline-calendar/dist/style.css";

const GSTCTimeline = ({ tasks }) => {
  const containerRef = useRef(null);
  const safeTasks = tasks || [];

  // Configuración base de GSTC calculada a partir de las tareas
  const config = useMemo(() => {
    // Crear la lista de items
    const items = safeTasks.reduce((acc, task) => {
      acc[task.id] = {
        id: task.id,
        label: task.title
      };
      return acc;
    }, {});

    // Calcular el rango de tiempo basado en las tareas
    let start = Date.now();
    let end = start + 30 * 24 * 60 * 60 * 1000; // Por defecto: 30 días
    if (safeTasks.length > 0) {
      const startTimes = safeTasks.map(task => new Date(task.startDate).getTime());
      const endTimes = safeTasks.map(task => new Date(task.endDate).getTime());
      start = Math.min(...startTimes);
      end = Math.max(...endTimes);
    }

    return {
      list: { items },
      chart: { items: Object.keys(items), time: { start, end } }
    };
  }, [safeTasks]);

  // Creamos un "dummy" observable para el state, que incluya un método subscribe vacío.
  const safeState = useMemo(() => {
    return {
      ...config,
      subscribe: () => {
        // Dummy: no hacemos nada, retornamos función de cleanup vacía
        return () => {};
      }
    };
  }, [config]);

  useEffect(() => {
    if (!containerRef.current) return;
    // Instanciamos GSTC pasando safeState en la propiedad state
    const instance = createGSTC({ element: containerRef.current, state: safeState });
    return () => {
      instance.destroy();
    };
  }, [safeState]);

  return <div ref={containerRef} style={{ width: "100%", height: "1000px" }} />;
};

export default GSTCTimeline;
