// src/components/GSTCTimeline.js
import React, { useMemo } from 'react';
import GSTC from 'gantt-schedule-timeline-calendar'; // Importa el componente principal del paquete
import 'gantt-schedule-timeline-calendar/dist/style.css'; // Asegúrate de usar la ruta correcta según el paquete

/**
 * Se espera que tasks sea un arreglo de objetos con las siguientes propiedades:
 * {
 *   id: string | number,
 *   title: string,
 *   startDate: string (fecha en formato ISO),
 *   endDate: string (fecha en formato ISO),
 *   progress: number (opcional)
 * }
 */
const GSTCTimeline = ({ tasks }) => {
  // Transformamos las tareas al formato que GSTC espera.
  // La configuración depende de cómo desees mostrar la información; aquí usamos una configuración básica.
  const config = useMemo(() => {
    // Creamos la lista de items (tareas)
    const items = tasks.reduce((acc, task) => {
      acc[task.id] = {
        id: task.id,
        label: task.title,
      };
      return acc;
    }, {});

    // Determinar el rango de tiempo usando las fechas de inicio y fin de las tareas.
    let startTimes = tasks.map(task => new Date(task.startDate).getTime());
    let endTimes = tasks.map(task => new Date(task.endDate).getTime());
    if (startTimes.length === 0 || endTimes.length === 0) {
      const now = Date.now();
      startTimes = [now];
      endTimes = [now + 30 * 24 * 60 * 60 * 1000];
    }
    const timeRange = {
      start: Math.min(...startTimes),
      end: Math.max(...endTimes),
    };

    return {
      // Configuración de la lista de items (tareas)
      list: {
        items,
      },
      // Configuración del chart (timeline)
      chart: {
        items: Object.keys(items),
        time: timeRange,
      },
    };
  }, [tasks]);

  return (
    <div style={{ height: '500px' }}>
      <GSTC config={config} />
    </div>
  );
};

export default GSTCTimeline;
