import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Timeline, { TimelineHeaders, DateHeader, TimelineMarkers, TodayMarker, CustomMarker } from "react-calendar-timeline";
import "./MyTimeline.css";
import "react-calendar-timeline/dist/style.css";
import moment from "moment";
import { Tooltip, Chip, Box, Button, TextField, Paper, Stack, Typography } from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';

// Estilos...
const ETAPA_STYLES = { /* ... */ };
const STATE_STYLES = { /* ... */ };
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";
const ROW_HEIGHT = 40;

const ItemRenderer = ({ item, getItemProps }) => {
  const props = getItemProps();
  const [g1,g2] = STATE_STYLES[item.Estado] || STATE_STYLES['Nuevo'];
  return (
    <Tooltip title={item.title} arrow>
      <div {...props} style={{ ...props.style, ...item.style, background: `linear-gradient(120deg, ${g1}, ${g2})` }}>
        <Chip label={item.title} size="small" sx={{ bgcolor:'rgba(255,255,255,0.7)' }}/>
      </div>
    </Tooltip>
  );
};

const MyTimeline = ({ tasks }) => {
  const now = moment();
  const defaultStart = now.clone().subtract(2,'months');
  const defaultEnd = now.clone().add(2,'months');
  const [filter,setFilter] = useState("");
  const [visStart,setVisStart] = useState(defaultStart.valueOf());
  const [visEnd,setVisEnd] = useState(defaultEnd.valueOf());

  // Groups
  const filtered = useMemo(() => tasks.filter(t=>t.title.toLowerCase().includes(filter.toLowerCase())),[tasks,filter]);
  const groups = useMemo(()=>filtered.map((t,index)=>({ id:t.id, title:t.title, stackItems:true })),[filtered]);

  // Items
  const items = useMemo(()=>{
    const map = {};
    filtered.forEach(t=>map[t.id]={
      start: moment(t.startDate), end: moment(t.endDate)
    });
    return filtered.map((t,idx)=>({
      id:t.id, group:t.id, title:t.title,
      start_time: map[t.id].start, end_time: map[t.id].end,
      Estado:t.Estado, etapa:t.etapa, estimacion:t.Estimacion, progress:t.progress,
      dependencies: Array.isArray(t.dependencies)?t.dependencies:[],
      style:{
        background:`linear-gradient(120deg, ${STATE_STYLES[t.Estado][0]}, ${STATE_STYLES[t.Estado][1]})`,
        ...(t.Estimacion?{}:{backgroundImage:PATTERNS, backgroundRepeat:'repeat'}),
        borderRadius:4,padding:4,color:'#fff',boxShadow:'0 2px 4px rgba(0,0,0,0.1)',
        borderLeft:`4px solid ${ETAPA_STYLES[t.etapa]||'#757575'}`
      }
    }));
  },[filtered]);

  // Dependencies
  const dependencies = useMemo(()=>items.flatMap(item=>
    item.dependencies.map(depId=>({ fromItem:depId,toItem:item.id }))
  ),[items]);

  // Zoom
  const zoom = delta=>{
    const span = visEnd - visStart;
    setVisStart(v=>v + delta*span*0.1);
    setVisEnd(e=>e - delta*span*0.1);
  };

  return (
    <Paper sx={{p:2}}>
      <Typography variant="h6" sx={{mb:2}}><ScheduleIcon/> Roadmap</Typography>
      <Stack direction="row" spacing={1} sx={{mb:2}}>
        <TextField label="Buscar…" size="small" value={filter} onChange={e=>setFilter(e.target.value)}/>
        <Button onClick={()=>zoom(-1)}>- Zoom</Button>
        <Button onClick={()=>zoom(1)}>+ Zoom</Button>
      </Stack>
      <Timeline
        groups={groups}
        items={items}
        defaultTimeStart={defaultStart}
        defaultTimeEnd={defaultEnd}
        visibleTimeStart={visStart}
        visibleTimeEnd={visEnd}
        onTimeChange={(s,e)=>{setVisStart(s);setVisEnd(e)}}
        itemRenderer={ItemRenderer}
        sidebarWidth={150}
        groupHeights={groups.map(()=>ROW_HEIGHT)}
        todayLineColor="red"
      >
        <TimelineHeaders>
          <DateHeader unit="primaryHeader" labelFormat="MMMM YYYY" />
          <DateHeader unit="week" labelFormat="Wo [semana]" />
          <DateHeader unit="day" labelFormat="DD" />
        </TimelineHeaders>
        <TimelineMarkers>
          <TodayMarker />
          {dependencies.map((dep,i)=>{
            const from = items.find(it=>it.id===dep.fromItem);
            const to = items.find(it=>it.id===dep.toItem);
            const groupIdx = groups.findIndex(g=>g.id===dep.toItem);
            return from && to ? (
              <CustomMarker
                key={i}
                date={from.end_time.valueOf()}
                render={({style})=>{
                  const x = style.left;
                  const y = groupIdx*ROW_HEIGHT + ROW_HEIGHT/2;
                  const dx = to.start_time.valueOf()-from.end_time.valueOf();
                  const px = dx/(defaultEnd-defaultStart)*style.width; // approximate
                  return (
                    <svg style={{position:'absolute', overflow:'visible', left:x, top:y, width:`${Math.abs(px)}px`, height:0}}>
                      <line x1={0} y1={0} x2={px} y2={0} stroke="gray" strokeWidth={2}/>
                      <polygon points={`${px-6},-4 ${px},0 ${px-6},4`} fill="gray"/>
                    </svg>
                  );
                }}
              />
            ) : null;
          })}
        </TimelineMarkers>
      </Timeline>
    </Paper>
  );
};

MyTimeline.propTypes={ tasks:PropTypes.array.isRequired };
export default MyTimeline;
