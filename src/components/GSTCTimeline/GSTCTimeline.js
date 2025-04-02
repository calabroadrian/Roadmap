// src/components/GSTCTimeline.js
import React, { useMemo } from 'react';
import GSTC from 'gantt-schedule-timeline-calendar';
import 'gantt-schedule-timeline-calendar/dist/style.css';

const GSTCTimeline = ({ tasks }) => {
  // Si no hay tareas, muestra un mensaje informativo.
  if (!tasks || tasks.length === 0) {
    return <div>No hay tareas para mostrar en el timeline.</div>;
  }

  // Transformamos las tareas en items para GSTC.
  const items = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.id] = {
        id: task.id,
        label: task.title,
        // Puedes agregar más propiedades aquí para personalizar cada item.
      };
      return acc;
    }, {});
  }, [tasks]);

  // Calculamos el rango de tiempo usando las fechas de inicio y fin de las tareas.
  const timeRange = useMemo(() => {
    const startTimes = tasks.map(task => new Date(task.startDate).getTime());
    const endTimes = tasks.map(task => new Date(task.endDate).getTime());
    return {
      start: Math.min(...startTimes),
      end: Math.max(...endTimes),
    };
  }, [tasks]);

  // Configuración básica de GSTC.
  const config = useMemo(() => ({
    list: {
      items,
    },
    chart: {
      items: Object.keys(items),
      time: timeRange,
    }
    // No se agregan plugins para evitar errores relacionados con 'subscribe'
  }), [items, timeRange]);

  return (
    <div style={{ height: '500px' }}>
      <GSTC config={config} />
    </div>
  );
};

export default GSTCTimeline;
