// src/components/MyTimeline.js
import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Timeline, {
  TimelineHeaders,
  DateHeader,
  TimelineMarkers,
  TodayMarker,
  CustomMarker
} from "react-calendar-timeline";
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

const ETAPA_STYLES = { /* ... */ };
const STATE_STYLES = { /* ... */ };
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";

const ItemRenderer = ({ item, getItemProps }) => {
  const itemProps = getItemProps();
  const [startGrad, endGrad] = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo'];
  return (
    <Tooltip title={
      <Box sx={{ textAlign: 'left', fontSize: '0.85rem' }}>
        <div><strong>Estado:</strong> {item.Estado}</div>
        <div><strong>Etapa:</strong> {item.etapa}</div>
        <div><strong>Estimación:</strong> {item.estimacion || 'N/A'}</div>
        <div><strong>Inicio:</strong> {item.start_time.format('DD/MM/YYYY')}</div>
        <div><strong>Fin:</strong> {item.end_time.format('DD/MM/YYYY')}</div>
        <div><strong>Progreso:</strong> {item.progress || 'N/A'}%</div>
      </Box>
    } arrow placement="top">
      <div
        {...itemProps}
        className="timeline-item-hover"
        style={{
          ...itemProps.style,
          ...item.style,
          background: `linear-gradient(120deg, ${startGrad}, ${endGrad})`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {typeof item.progress === 'number' && (
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0,
            height: 4, width: `${item.progress}%`,
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: item.progress === 100 ? 2 : 0
          }} />
        )}
        <Chip
          icon={<ScheduleIcon fontSize="small" />}
          label={item.title}
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.7)',
            fontWeight: 500,
            ml: 1,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden'
          }}
        />
      </div>
    </Tooltip>
  );
};

const MyTimeline = ({ tasks }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2, 'months');
  const defaultEnd = now.clone().add(2, 'months');

  const [filter, setFilter] = useState("");
  const [visibleTimeStart, setVisibleTimeStart] = useState(defaultStart.valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(defaultEnd.valueOf());

  const filteredTasks = useMemo(
    () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
    [tasks, filter]
  );

  const groups = useMemo(
    () => filteredTasks.map(t => ({ id: t.id, title: t.title })),
    [filteredTasks]
  );

  const items = useMemo(
    () => filteredTasks.map(t => ({
      id: t.id,
      group: t.id,
      title: t.title,
      start_time: moment(t.startDate),
      end_time: moment(t.endDate),
      Estado: t.Estado,
      etapa: t.etapa,
      estimacion: t.Estimacion,
      progress: t.progress,
      Dependencias: Array.isArray(t.dependencies) ? t.dependencies.map(Number) : [],
      canMove: true,
      canResize: 'both',
      style: {
        background: `linear-gradient(120deg, ${STATE_STYLES[t.Estado]?.[0] || STATE_STYLES['Nuevo'][0]}, ${STATE_STYLES[t.Estado]?.[1] || STATE_STYLES['Nuevo'][1]})`,
        ...(t.Estimacion ? {} : { backgroundImage: PATTERNS, backgroundRepeat: 'repeat' }),
        borderRadius: 4,
        padding: 4,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderLeft: `4px solid ${ETAPA_STYLES[t.etapa] || '#757575'}`
      }
    })),
    [filteredTasks]
  );

  const moveResizeValidator = useCallback((action, item, time, resizeEdge) => {
    const deps = item.Dependencias || [];
    if (!deps.length) return true;
    const maxEnd = deps.reduce((max, id) => {
      const depItem = items.find(i => i.id === id);
      return depItem ? Math.max(max, depItem.end_time.valueOf()) : max;
    }, 0);
    const newStart = action === 'move' ? time : (resizeEdge === 'left' ? time : item.start_time.valueOf());
    if (newStart < maxEnd) {
      alert('No puedes iniciar antes de terminar dependencias');
      return false;
    }
    return true;
  }, [items]);

  const dependencyMarkers = useMemo(
    () => items.flatMap(item =>
      item.Dependencias.map(depId => {
        const dep = items.find(i => i.id === depId);
        if (!dep) return null;
        return (
          <CustomMarker key={`dep-${depId}-${item.id}`} date={dep.end_time.valueOf()}>
            <svg style={{ overflow: 'visible' }} height={20} width={80}>
              <line x1={0} y1={10} x2={80} y2={10} stroke="gray" strokeWidth={2} />
              <polygon points="80,5 90,10 80,15" fill="gray" />
            </svg>
          </CustomMarker>
        );
      })
    ), [items]
  );

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon /> Roadmap Timeline
        </Typography>
        <TextField label="Buscar…" size="small" value={filter} onChange={e => setFilter(e.target.value)} />
        <Button onClick={() => setVisibleTimeStart(v => v - (visibleTimeEnd - visibleTimeStart)*0.1) & setVisibleTimeEnd(v => v + (visibleTimeEnd - visibleTimeStart)*0.1)}>- Zoom</Button>
        <Button onClick={() => setVisibleTimeStart(v => v + (visibleTimeEnd - visibleTimeStart)*0.1) & setVisibleTimeEnd(v => v - (visibleTimeEnd - visibleTimeStart)*0.1)}>+ Zoom</Button>
      </Stack>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        onTimeChange={(start, end) => { setVisibleTimeStart(start); setVisibleTimeEnd(end); }}
        itemRenderer={ItemRenderer}
        moveResizeValidator={moveResizeValidator}
        todayLineColor="red"
        sidebarWidth={150}
        groupHeights={groups.map(() => 40)}
      >
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

MyTimeline.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      Estado: PropTypes.string,
      etapa: PropTypes.string,
      Estimacion: PropTypes.any,
      progress: PropTypes.number,
      dependencies: PropTypes.arrayOf(PropTypes.number)
    })
  ).isRequired
};

export default MyTimeline;
