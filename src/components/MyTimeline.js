// src/components/MyTimeline.js
import React, { useState, useMemo, useCallback } from "react";
import Timeline, { TimelineHeaders, DateHeader, TimelineMarkers, TodayMarker, CustomMarker } from "react-calendar-timeline";
import PropTypes from "prop-types";
import "./MyTimeline.css";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";
import {
  Tooltip,
  Chip,
  Box,
  Button,
  TextField,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';

// Estilos para Etapas
const ETAPA_STYLES = {
  "Cambio de alcance": "#FF9800",
  "Impacto en inicio": "#F44336",
  "Ajustes": "#2196F3",
  "Sin requerimiento": "#9E9E9E",
  "Sin estimar": "#EEEEEE",
  "En pausa": "#FFEB3B",
  "Inicio de desarrollo": "#4CAF50",
};
// Estilos para Estados
const STATE_STYLES = {
  "Nuevo":       ["#ffcdd2", "#e57373"],
  "En curso":    ["#fff9c4", "#ffeb3b"],
  "En progreso": ["#fff9c4", "#ffeb3b"],
  "Hecho":       ["#c8e6c9", "#4caf50"],
};
// Patrón para items sin estimación
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";

// Renderizador de cada item
const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const grad = STATE_STYLES[item.state] || STATE_STYLES['Nuevo'];
  const background = `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`;
  return (
    <div
      {...itemProps}
      className="timeline-item-hover"
      style={{ ...itemProps.style, ...item.style, background, position: 'relative' }}
    >
      {item.etapa && (
        <Chip
          label={item.etapa}
          size="small"
          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: ETAPA_STYLES[item.etapa], color: '#fff', fontSize: '10px', height: '18px' }}
        />
      )}
      {typeof item.progress === 'number' && (
        <div
          style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', width: `${item.progress}%`, backgroundColor: 'rgba(255,255,255,0.8)', borderBottomLeftRadius: '4px', borderBottomRightRadius: item.progress === 100 ? '4px' : '0' }}
        />
      )}
      <Tooltip
        title={
          <Box sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
            <div><strong>Estado:</strong> {item.state}</div>
            <div><strong>Etapa:</strong> {item.etapa}</div>
            <div><strong>Estimación:</strong> {item.estimacion || 'N/A'}</div>
            <div><strong>Inicio:</strong> {item.start_time.format('DD/MM/YYYY')}</div>
            <div><strong>Fin:</strong> {item.end_time.format('DD/MM/YYYY')}</div>
            <div><strong>Progreso:</strong> {item.progress || 'N/A'}</div>
          </Box>
        }
        arrow placement="top" enterDelay={300}
      >
        <Box sx={{ width: '100%', textAlign: 'center', color: '#fff', fontWeight: 500 }}>{item.title}</Box>
      </Tooltip>
    </div>
  );
};

const MyTimeline = ({ tasks }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months');
  const defaultEnd = now.clone().add(2, 'months');

  const [filter, setFilter] = useState("");
  const safeTasks = useMemo(() => {
    return tasks
      .filter(t => t.title.toLowerCase().includes(filter.toLowerCase()))
      .map(t => {
        let deps = [];
        if (Array.isArray(t.Dependencias)) deps = t.Dependencias;
        else if (typeof t.Dependencias === 'string') {
          try { deps = JSON.parse(t.Dependencias); }
          catch { deps = t.Dependencias.replace(/\[|\]/g,'').split(',').map(s=>s.trim()).filter(Boolean); }
        }
        return { ...t, Dependencias: deps };
      });
  }, [tasks, filter]);

  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());

  const zoomIn = useCallback(() => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(v => v + span * 0.1);
    setVisibleTimeEnd(v => v - span * 0.1);
  }, [visibleTimeEnd, visibleTimeStart]);
  const zoomOut = useCallback(() => {
    const span = visibleTimeEnd - visibleTimeStart;
    setVisibleTimeStart(v => v - span * 0.1);
    setVisibleTimeEnd(v => v + span * 0.1);
  }, [visibleTimeEnd, visibleTimeStart]);

  const groups = useMemo(() => safeTasks.map(task => ({ id: task.id, title: task.title })), [safeTasks]);
  const items = useMemo(() => safeTasks.map(task => {
    const start = moment(task.startDate, ['YYYY-MM-DD','M/D/YYYY']);
    const end = moment(task.endDate, ['YYYY-MM-DD','M/D/YYYY']);
    const stateDef = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
    const grad = `linear-gradient(120deg, ${stateDef[0]}, ${stateDef[1]})`;
    return { id: task.id, group: task.id, title: task.title,
      start_time: start, end_time: end, state: task.Estado, etapa: task.etapa,
      estimacion: task.Estimacion, progress: task.progress, Dependencias: task.Dependencias,
      style: { background: grad, ...(task.Estimacion?{}:{backgroundImage:PATTERNS,backgroundRepeat:'repeat'}), borderRadius:'5px',padding:'4px',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 4px rgba(0,0,0,0.1)',minHeight:'30px',fontSize:'13px',borderLeft:`4px solid ${ETAPA_STYLES[task.etapa]}` }
    };
  }), [safeTasks]);

  const dependencyMarkers = useMemo(() => {
    return items.flatMap(item => item.Dependencias.map(depId => {
      const dep = items.find(i=>i.id===depId);
      if (!dep) return null;
      return (<CustomMarker key={`${depId}-${item.id}`} date={dep.end_time.valueOf()} render={({style})=>(<svg style={{...style,overflow:'visible'}} height="20" width="100"><line x1="0" y1="10" x2="100" y2="10" stroke="gray" strokeWidth="2"/><polygon points="100,5 110,10 100,15" fill="gray"/></svg>)} />);
    }));
  }, [items]);

  return (
    <Paper elevation={3} sx={{p:2,bgcolor:'background.paper',borderRadius:2}}>
      <Typography variant="h6" gutterBottom sx={{display:'flex',alignItems:'center',gap:1}}><ScheduleIcon/> Roadmap Timeline</Typography>
      <Box sx={{mb:1,display:'flex',gap:2,flexWrap:'wrap'}}>
        <TextField label="Buscar…" size="small" value={filter} onChange={e=>setFilter(e.target.value)}/>
        <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
        <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
      </Box>
      <style>{`.rct-day-background:nth-child(7n+1){border-left:2px solid #ccc}.timeline-item-hover:hover{transform:translateY(-2px);box-shadow:0 4px 8px rgba(0,0,0,0.2)}`}</style>
      <Timeline groups={groups} items={items}
        defaultTimeStart={defaultStart} defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart} visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(s,e)=>{setVisibleTimeStart(s);setVisibleTimeEnd(e)}}
        itemRenderer={ItemRenderer} todayLineColor="red" sidebarWidth={150} className="mi-rct-sidebar" groupHeights={groups.map(()=>40)}>
        <TimelineHeaders>
          <DateHeader unit="primaryHeader" labelFormat="MMMM YYYY" />
          <DateHeader unit="week" labelFormat="Wo [semana]" />
          <DateHeader unit="day" labelFormat="DD" />
        </TimelineHeaders>
        <TimelineMarkers>
          <TodayMarker />
          {dependencyMarkers}
        </TimelineMarkers>
      </Timeline>
    </Paper>
  );
};

MyTimeline.propTypes = { tasks: PropTypes.arrayOf(PropTypes.shape({
  id:PropTypes.oneOfType([PropTypes.string,PropTypes.number]).isRequired,
  title:PropTypes.string.isRequired,
  startDate:PropTypes.string,isRequired,
  endDate:PropTypes.string,isRequired,
  Estado:PropTypes.string,etapa:PropTypes.string,Estimacion:PropTypes.any,progress:PropTypes.any,Dependencias:PropTypes.array
})).isRequired };
export default MyTimeline;
