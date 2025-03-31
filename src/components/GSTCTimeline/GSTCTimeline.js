// src/components/GSTCTimeline.js
import React, { useMemo } from 'react';
import GSTC from 'gantt-schedule-timeline-calendar';
import 'gantt-schedule-timeline-calendar/dist/style.css';

const GSTCTimeline = ({ tasks }) => {
  // Si no hay tareas, evita renderizar GSTC
  if (!tasks || tasks.length === 0) {
    return <p>No hay tareas para mostrar.</p>;
  }

  // Transformamos las tareas en items para GSTC.
  const items = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.id] = {
        id: task.id,
        label: task.title,
      };
      return acc;
    }, {});
  }, [tasks]);

  // Calculamos el rango de tiempo basado en startDate y endDate de las tareas.
  const timeRange = useMemo(() => {
    const startTimes = tasks.map(task => new Date(task.startDate).getTime());
    const endTimes = tasks.map(task => new Date(task.endDate).getTime());
    return {
      start: Math.min(...startTimes),
      end: Math.max(...endTimes),
    };
  }, [tasks]);

  // Configuración básica de GSTC sin plugins (si no se requieren)
  const config = useMemo(() => ({
    list: {
      items,
    },
    chart: {
      items: Object.keys(items),
      time: timeRange,
    },
    // Notamos que no agregamos "plugins: {}" para evitar problemas de suscripción
  }), [items, timeRange]);

  return (
    <div style={{ height: '500px' }}>
      <GSTC config={config} />
    </div>
  );
};

export default GSTCTimeline;
