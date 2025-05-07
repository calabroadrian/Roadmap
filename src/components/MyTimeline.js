import React, { useState, useMemo, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Gantt } from 'frappe-gantt';
// Para usar la versión local: copia `node_modules/frappe-gantt/dist/frappe-gantt.css`
// a `src/styles/frappe-gantt.css` y luego importa así:
import 'src/styles/frappe-gantt.css';
import { Gantt } CloseIcon from '@mui/icons-material/Close';

// Usamos Frappe Gantt (MIT) como alternativa gratuita
const ETAPA_STYLES = {
  CambioDeAlcance: '#FF9800',
  ImpactoEnInicio: '#F44336',
  Ajustes: '#2196F3',
  SinRequerimiento: '#9E9E9E',
  SinEstimar: '#EEEEEE',
  EnPausa: '#FFEB3B',
  InicioDeDesarrollo: '#4CAF50',
};
const STATE_STYLES = {
  Nuevo: ['#ffcdd2', '#e57373'],
  EnCurso: ['#fff9c4', '#ffeb3b'],
  EnProgreso: ['#fff9c4', '#ffeb3b'],
  Hecho: ['#c8e6c9', '#4caf50'],
};

function parseDate(val, fallback) {
  if (!val) return fallback;
  let d;
  if (val instanceof Date) d = val;
  else if (typeof val === 'string') {
    const [dd, mm, yy] = val.split('/').map(Number);
    d = new Date(yy, mm - 1, dd);
  } else d = moment(val).toDate();
  return isNaN(d.getTime()) ? fallback : d;
}

export default function MyTimeline({ tasks }) {
  const [filter, setFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const ganttEl = useRef(null);
  const ganttInstance = useRef(null);

  const filtered = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  // Crear datos para Frappe Gantt
  const ganttTasks = useMemo(
    () => filtered.map(t => {
      const [bg, prog] = STATE_STYLES[t.Estado] || STATE_STYLES.Nuevo;
      const etapaKey = (t.etapa || '').replace(/\s+/g, '');
      return {
        id       : String(t.id),
        name     : t.title,
        start    : moment(parseDate(t.startDate, new Date())).format('YYYY-MM-DD'),
        end      : moment(parseDate(t.endDate, new Date())).format('YYYY-MM-DD'),
        progress : Number(t.progress) || 0,
        dependencies: (t.dependencies || []).join(','),
        custom_class: t.Estimacion ? '' : 'bar--no-estimation',
        styles   : { '--bar-background': ETAPA_STYLES[etapaKey] || bg, '--bar-progress': prog }
      };
    }),
    [filtered]
  );

  // Inicializar Gantt
  useEffect(() => {
    if (!ganttEl.current) return;
    // limpiar antiguo
    ganttInstance.current = new Gantt(ganttEl.current, ganttTasks, {
      on_click: task => setSelectedTask(tasks.find(x => String(x.id) === task.id)),
      on_date_change: () => {},
      on_progress_change: () => {},
      view_mode: 'Month', // puedes cambiar a Day, Week, Year
      language: 'es'
    });
    return () => ganttInstance.current && ganttInstance.current.refresh(ganttEl.current, []);
  }, [ganttTasks, tasks]);

  const close = () => setSelectedTask(null);

  return (
    <Paper sx={{ p:3, borderRadius:2 }}>
      <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
        <ScheduleIcon fontSize="large" sx={{ mr:1 }} />
        <Typography variant="h5">Roadmap Timeline</Typography>
      </Box>
      <Box sx={{ display:'flex', gap:2, mb:2, flexWrap:'wrap' }}>
        <TextField label="Buscar" size="small" value={filter} onChange={e=>setFilter(e.target.value)} />
      </Box>
      <div ref={ganttEl} />

      <Drawer anchor="right" open={Boolean(selectedTask)} onClose={close} PaperProps={{ sx:{ width:350, p:2 } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}>
          <Typography variant="h6">Tarea Detalle</Typography>
          <IconButton onClick={close}><CloseIcon/></IconButton>
        </Box>
        <Divider sx={{ mb:2 }} />
        {selectedTask && (
          <Box sx={{ display:'flex', flexDirection:'column', gap:1 }}>
            <Typography><strong>ID:</strong> {selectedTask.id}</Typography>
            <Typography><strong>Nombre:</strong> {selectedTask.title}</Typography>
            <Typography><strong>Inicio:</strong> {moment(selectedTask.startDate).format('DD/MM/YYYY')}</Typography>
            <Typography><strong>Fin:</strong> {moment(selectedTask.endDate).format('DD/MM/YYYY')}</Typography>
            <Typography><strong>Progreso:</strong> {selectedTask.progress}%</Typography>
            {selectedTask.dependencies?.length > 0 && (
              <Typography><strong>Depende de:</strong> {selectedTask.dependencies.join(', ')}</Typography>
            )}
          </Box>
        )}
      </Drawer>
    </Paper>
  );
}

MyTimeline.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id       : PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title    : PropTypes.string.isRequired,
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    endDate  : PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    Estado   : PropTypes.string,
    etapa    : PropTypes.string,
    Estimacion: PropTypes.any,
    progress : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  })).isRequired,
};