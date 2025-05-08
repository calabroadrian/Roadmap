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
  const [view, setView] = useState("vertical"); // "vertical" o "horizontal"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/issues!A1:ZZ?key=${API_KEY}&access_token=${CLIENT_ID}`
        );
        const data = await response.json();
        if (data.values?.length) {
          const [headers, ...rows] = data.values;
          const tagsIndex = headers.indexOf("Tags");
          const sprintIndex = headers.indexOf("Sprint");
          const depIndex = headers.indexOf("dependencies");

          const parsed = rows.map(row => {
            const obj = headers.reduce((acc, key, idx) => ({ ...acc, [key]: row[idx] || "" }), {});
            obj.tags = obj[headers[tagsIndex]]?.split(",").map(t => t.trim()) || [];
            obj.dependencies = row[depIndex] ? [row[depIndex]] : [];
            return obj;
          });

          setItems(parsed);
          setStatuses([...new Set(parsed.map(i => i.Estado))]);
          setSprints([...new Set(parsed.map(i => i.Sprint))]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const handleTabChange = (_, newValue) => setTabValue(newValue);
  const getBackgroundColor = estado => {
    const map = {
      Nuevo: theme.palette.info.light,
      "En progreso": theme.palette.warning.light,
      Hecho: theme.palette.success.light
    };
    return map[estado] || theme.palette.background.paper;
  };
  const getTaskCountByStatus = estado =>
    items.filter(
      i =>
        i.Estado === estado &&
        (tabValue === 0 || i.Sprint === sprints[tabValue - 1])
    ).length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Vista Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 1 }}>
        <Button
          variant={view === 'vertical' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setView('vertical')}
        >
          Tablero
        </Button>
        <Button
          variant={view === 'horizontal' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => setView('horizontal')}
        >
          Roadmap Timeline
        </Button>
      </Box>

      {view === 'vertical' ? (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Tablero
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons='auto'
            allowScrollButtonsMobile
            sx={{ mb: 2 }}
          >
            <Tab label={`Todos los Sprints (${items.length})`} value={0} />
            {sprints.map((s, idx) => (
              <Tab key={s} label={s} value={idx + 1} />
            ))}
          </Tabs>

          <Grid container spacing={2}>
            {statuses.map(status => (
              <Grid item xs={12} md={4} key={status}>
                <Paper
                  elevation={1}
                  sx={{ p: 2, borderRadius: 2, height: '100%' }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {status}
                    </Typography>
                    <Badge badgeContent={getTaskCountByStatus(status)} color="primary">
                      <AssignmentIcon />
                    </Badge>
                  </Box>
                  {items
                    .filter(
                      item =>
                        item.Estado === status &&
                        (tabValue === 0 || item.Sprint === sprints[tabValue - 1])
                    )
                    .map(item => (
                      <Card
                        key={item.Id}
                        onClick={() => onSelectItem(item)}
                        onDoubleClick={() => onEditItem(item)}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          bgcolor: getBackgroundColor(item.Estado),
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 3
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                            {item.Titulo}
                          </Typography>
                          <Tooltip title={`Assigned to ${item.UsuarioAsignado}`}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 24, height: 24, fontSize: 14 }}>
                              {item.UsuarioAsignado.charAt(0)}
                            </Avatar>
                          </Tooltip>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ mt: 0.5, mb: 1, color: theme.palette.text.secondary }}
                          noWrap
                        >
                          {item.Descripcion.replace(/<[^>]+>/g, '')}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {item.tags.map(tag => (
                              <Chip key={tag} label={tag} size="small" />
                            ))}
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
        </>
      ) : (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Roadmap Timeline
          </Typography>
          <Box sx={{ height: 500 }}>
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
        </>
      )}
    </Box>
  );
};

export default RoadmapDataSheet;
