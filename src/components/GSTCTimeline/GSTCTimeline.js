// src/components/GSTCTimeline.js
import React, { useMemo, useEffect, useRef } from "react";
import { GSTC } from "gantt-schedule-timeline-calendar";
import "gantt-schedule-timeline-calendar/dist/style.css";

const GSTCTimeline = ({ tasks }) => {
  const containerRef = useRef(null);

  // Aseguramos que tasks sea un arreglo (incluso vacío)
  const safeTasks = tasks || [];

  // Calculamos la configuración para GSTC utilizando useMemo
  const config = useMemo(() => {
    // Crear la lista de items a partir de las tareas
    const items = safeTasks.reduce((acc, task) => {
      acc[task.id] = {
        id: task.id,
        label: task.title,
        // Puedes extender propiedades aquí si necesitas render personalizado
      };
      return acc;
    }, {});

    // Determinar el rango de tiempo basado en startDate y endDate
    let start = Date.now();
    let end = start + 30 * 24 * 60 * 60 * 1000; // 30 días por defecto
    if (safeTasks.length > 0) {
      const startTimes = safeTasks.map(task => new Date(task.startDate).getTime());
      const endTimes = safeTasks.map(task => new Date(task.endDate).getTime());
      start = Math.min(...startTimes);
      end = Math.max(...endTimes);
    }

    return {
      list: {
        items,
      },
      chart: {
        items: Object.keys(items),
        time: { start, end },
      }
      // No agregamos plugins para evitar errores de suscripción
    };
  }, [safeTasks]);

  // Instanciar GSTC cuando cambie la configuración
  useEffect(() => {
    if (!containerRef.current) return;
    const instance = GSTC({ element: containerRef.current, state: GSTC.api.state(config) });
    return () => {
      instance.destroy();
    };
  }, [config]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
};

export default GSTCTimeline;
