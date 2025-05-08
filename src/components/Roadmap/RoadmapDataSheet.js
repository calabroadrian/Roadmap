import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Chip,
  ButtonGroup,
  Button,
  useTheme,
  Slide
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MyTimeline from '../MyTimeline';
import config from '../../config/config';

const { SPREADSHEET_ID, API_KEY, CLIENT_ID } = config;

const RoadmapDataSheet = ({ onEditItem, onSelectItem, refreshTrigger }) => {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tab, setTab] = useState(0);
  const [view, setView] = useState('board'); // 'board' or 'timeline'

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/issues!A1:ZZ?key=${API_KEY}&access_token=${CLIENT_ID}`
        );
        const data = await res.json();
        if (!data.values) return;
        const [headers, ...rows] = data.values;
        const parsed = rows.map(r => {
          const obj = {};
          headers.forEach((h, i) => { obj[h] = r[i] || ''; });
          obj.tags = obj.Tags?.split(',').map(t => t.trim()) || [];
          obj.dependencies = obj.dependencies ? [obj.dependencies] : [];
          return obj;
        });
        setItems(parsed);
        setStatuses([...new Set(parsed.map(i => i.Estado))]);
        setSprints([...new Set(parsed.map(i => i.Sprint))]);
      } catch { /* silent */ }
    }
    fetchData();
  }, [refreshTrigger]);

  const handleTab = (_, v) => setTab(v);
  const countByStatus = s => items.filter(i => i.Estado === s && (tab === 0 || i.Sprint === sprints[tab-1])).length;

  const backgroundMap = { Nuevo: theme.palette.info.light, 'En progreso': theme.palette.warning.light, Hecho: theme.palette.success.light };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ButtonGroup variant="outlined">
          <Button onClick={() => setView('board')} selected={view==='board'}>Tablero</Button>
          <Button onClick={() => setView('timeline')} selected={view==='timeline'}>Timeline</Button>
        </ButtonGroup>
      </Box>

      {view === 'board' ? (
        <>
          <Tabs value={tab} onChange={handleTab} variant="scrollable" scrollButtons allowScrollButtonsMobile sx={{ mb: 2 }}>
            <Tab label={`Todos (${items.length})`} />
            {sprints.map((s,i) => <Tab key={s} label={s} />)}
          </Tabs>
          <Grid container spacing={2}>
            {statuses.map(status => (
              <Grid key={status} item xs={12} md={4}>
                <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                  <CardHeader
                    avatar={<Avatar sx={{ bgcolor: theme.palette.primary.main }}><AssignmentIcon /></Avatar>}
                    title={status}
                    subheader={`(${countByStatus(status)})`}
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ pt: 1 }}>
                    {items
                      .filter(i => i.Estado === status && (tab === 0 || i.Sprint === sprints[tab-1]))
                      .map(item => (
                        <Card
                          key={item.Id}
                          onClick={() => onSelectItem(item)}
                          onDoubleClick={() => onEditItem(item)}
                          sx={{
                            mb: 2,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: backgroundMap[item.Estado] || theme.palette.background.paper,
                            cursor: 'pointer',
                            transition: 'transform .2s',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 }
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600} noWrap>{item.Titulo}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {item.tags.map(tag => <Chip key={tag} label={tag} size="small" />)}
                          </Box>
                        </Card>
                      ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Slide direction="up" in>
          <Box>
            <MyTimeline tasks={items.map(item => ({
              id: item.Id,
              title: item.Titulo,
              startDate: item['Fecha Inicio'],
              endDate: item['Fecha Fin'],
              status: item.Estado,
              dependencies: item.dependencies
            }))} />
          </Box>
        </Slide>
      )}
    </Box>
  );
};

export default RoadmapDataSheet;
