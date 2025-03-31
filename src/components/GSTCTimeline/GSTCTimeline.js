// src/components/GSTCTimeline.js
import React, { useMemo } from 'react';
import GSTC from 'gantt-schedule-timeline-calendar';
import 'gantt-schedule-timeline-calendar/dist/style.css';

const GSTCTimeline = ({ tasks }) => {
  // Transforma las tareas al formato que GSTC espera:
  const items = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.id] = {
        id: task.id,
        label: task.title,
        // Puedes agregar otras propiedades si es necesario para personalizar el render
      };
      return acc;
    }, {});
  }, [tasks]);

  // Calcula el rango de tiempo usando las fechas de inicio y fin de las tareas:
  const timeRange = useMemo(() => {
    if (tasks.length === 0) {
      const now = Date.now();
      return { start: now, end: now + 30 * 24 * 60 * 60 * 1000 }; // 30 días desde ahora
    }
    const startTimes = tasks.map(task => new Date(task.startDate).getTime());
    const endTimes = tasks.map(task => new Date(task.endDate).getTime());
    return {
      start: Math.min(...startTimes),
      end: Math.max(...endTimes),
    };
  }, [tasks]);

  // Configuración básica de GSTC
  const config = useMemo(() => ({
    list: {
      items,
    },
    chart: {
      items: Object.keys(items),
      time: timeRange,
    },
    plugins: {} // Agregamos plugins como objeto vacío para evitar errores de suscripción
  }), [items, timeRange]);

  return (
    <div style={{ height: '500px' }}>
      <GSTC config={config} />
    </div>
  );
};

export default GSTCTimeline;
