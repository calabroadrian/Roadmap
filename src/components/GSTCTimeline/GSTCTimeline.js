// src/components/GSTCTimeline.js
import React, { useMemo } from 'react';
import GSTC from 'gstc-react';
import 'gstc/dist/style.css';

const GSTCTimeline = ({ tasks }) => {
  // Transformamos las tareas a un formato simple para GSTC
  // Se espera que cada tarea tenga: id, Titulo, startDate, endDate, progress (opcional)
  const items = useMemo(() => {
    return tasks.reduce((acc, task) => {
      acc[task.Id] = {
        id: task.Id,
        label: task.Titulo,
        // Puedes agregar propiedades adicionales para personalizar el render
      };
      return acc;
    }, {});
  }, [tasks]);

  // Determinar el rango de tiempo usando las fechas de inicio y fin de las tareas
  const timeRange = useMemo(() => {
    if (tasks.length === 0) {
      const now = Date.now();
      return { start: now, end: now + 30 * 24 * 60 * 60 * 1000 }; // 30 días desde ahora
    }
    const startDates = tasks.map(task => new Date(task.startDate).getTime());
    const endDates = tasks.map(task => new Date(task.endDate).getTime());
    return {
      start: Math.min(...startDates),
      end: Math.max(...endDates),
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
  }), [items, timeRange]);

  return (
    <div style={{ height: '500px' }}>
      <GSTC config={config} />
    </div>
  );
};

export default GSTCTimeline;
