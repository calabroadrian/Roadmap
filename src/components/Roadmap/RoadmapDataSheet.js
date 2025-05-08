import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Badge,
  Button,
  useTheme
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import config from "../../config/config";
import MyTimeline from "../MyTimeline";

const { SPREADSHEET_ID, API_KEY, CLIENT_ID } = config;

const RoadmapDataSheet = ({ selectedItem, onEditItem, onSelectItem, onDeselectItem, refreshTrigger }) => {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [view, setView] = useState("vertical");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/issues!A1:ZZ?key=${API_KEY}&access_token=${CLIENT_ID}`
        );
        const data = await res.json();
        if (!data.values?.length) return;
        const [headers, ...rows] = data.values;
        const ti = headers.indexOf("Tags");
        const si = headers.indexOf("Sprint");
        const di = headers.indexOf("dependencies");

        const parsed = rows.map(r => {
          const o = headers.reduce((acc, h, i) => ({ ...acc, [h]: r[i] || "" }), {});
          o.tags = o[headers[ti]]?.split(",").map(t => t.trim()) || [];
          o.dependencies = r[di] ? [r[di]] : [];
          return o;
        });

        setItems(parsed);
        setStatuses([...new Set(parsed.map(i => i.Estado))]);
        setSprints([...new Set(parsed.map(i => i.Sprint))]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [refreshTrigger]);

  const handleTabChange = (_, v) => setTabValue(v);
  const getBg = estado => {
    const map = {
      Nuevo: theme.palette.info[50],
      "En progreso": theme.palette.warning[50],
      Hecho: theme.palette.success[50]
    };
    return map[estado] || theme.palette.background.paper;
  };
  const countTasks = estado =>
    items.filter(
      i => i.Estado === estado && (tabValue === 0 || i.Sprint === sprints[tabValue - 1])
    ).length;

  return (
    <Box sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
        <Button size="small" variant={view === 'vertical' ? 'contained' : 'outlined'} onClick={() => setView('vertical')}>
          Tablero
        </Button>
        <Button size="small" variant={view === 'horizontal' ? 'contained' : 'outlined'} onClick={() => setView('horizontal')}>
          Timeline
        </Button>
      </Box>

      {view === 'vertical' ? (
        <>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            sx={{ mb: 2, '.MuiTabs-indicator': { backgroundColor: theme.palette.primary.main } }}
          >
            <Tab label={`Todos (${items.length})`} value={0} />
            {sprints.map((s, i) => <Tab key={s} label={s} value={i + 1} />)}
          </Tabs>

          <Box
            sx={{
              maxHeight: '60vh',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': { width: 6 },
              '&::-webkit-scrollbar-track': { background: theme.palette.background.default },
              '&::-webkit-scrollbar-thumb': { background: theme.palette.grey[400], borderRadius: 3 }
            }}
          >
            <Grid container spacing={2}>
              {statuses.map(status => (
                <Grid item xs={12} md={4} key={status}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {status}
                      </Typography>
                      <Badge badgeContent={countTasks(status)} color="primary">
                        <AssignmentIcon />
                      </Badge>
                    </Box>
                    {items.filter(i => i.Estado === status && (tabValue === 0 || i.Sprint === sprints[tabValue - 1])).map(item => (
                      <Card
                        key={item.Id}
                        onClick={() => onSelectItem(item)}
                        onDoubleClick={() => onEditItem(item)}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: getBg(item.Estado),
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 2 }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {item.Titulo}
                          </Typography>
                          <Tooltip title={`Assigned to ${item.UsuarioAsignado}`}> 
                            <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: theme.palette.primary.main }}>
                              {item.UsuarioAsignado.charAt(0)}
                            </Avatar>
                          </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {item.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}
                          </Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {item.Prioridad}
                          </Typography>
                        </Box>
                      </Card>
                    ))}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      ) : (
        <Box sx={{ height: '60vh' }}>
          <MyTimeline
            tasks={items.map(item => ({
              id: item.Id,
              title: item.Titulo,
              startDate: item['Fecha Inicio'],
              endDate: item['Fecha Fin'],
              etapa: item.etapa,
              Estado: item.Estado,
              Estimacion: item.Estimacion,
              progress: item.progress,
              dependencies: item.dependencies,
              Bloqueos: item.Bloqueos
            }))}
          />
        </Box>
      )}
    </Box>
  );
};

export default RoadmapDataSheet;
