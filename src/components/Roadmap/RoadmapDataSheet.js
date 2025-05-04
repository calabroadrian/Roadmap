// src/components/RoadmapDataSheet.js
import { useState, useEffect } from "react";
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
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import config from "../../config/config";
import MyTimeline from "../MyTimeline";

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const API_KEY = config.API_KEY;
const CLIENT_ID = config.CLIENT_ID;

const RoadmapDataSheet = ({ selectedItem, onEditItem, onSelectItem, onDeselectItem, refreshTrigger }) => {
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
        if (data && data.values && Array.isArray(data.values) && data.values.length > 0) {
          const headers = data.values[0];
          const tagsColumnIndex = headers.indexOf("Tags");
          const sprintColumnIndex = headers.indexOf("Sprint");
          const parsedData = data.values.slice(1).map((row) => {
            return headers.reduce((obj, key, index) => {
              obj[key] = row[index] || "";
              return obj;
            }, {});
          });
          parsedData.forEach((item) => {
            item.tags = item[headers[tagsColumnIndex]] || "";
          });
          setItems(parsedData);
          setStatuses([...new Set(parsedData.map((item) => item.Estado))]);
          setSprints([...new Set(parsedData.map((item) => item[headers[sprintColumnIndex]]))]);
        } else {
          console.error("No se encontraron datos válidos en la respuesta API");
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [refreshTrigger]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getBackgroundColor = (Estado) => {
    switch (Estado) {
      case "Nuevo":
        return "#F9D8C7";
      case "En progreso":
        return "#FFF3C8";
      case "Hecho":
        return "#65f6b5";
      default:
        return "white";
    }
  };

  const getTaskCountByStatus = (Estado) => {
    return items.filter(
      (item) =>
        item.Estado === Estado &&
        (tabValue === 0 || item.Sprint === sprints[tabValue - 1])
    ).length;
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant={view === "vertical" ? "contained" : "outlined"} onClick={() => setView("vertical")}>
          Tablero 
        </Button>
        <Button variant={view === "horizontal" ? "contained" : "outlined"} onClick={() => setView("horizontal")}>
          Roadmap Timeline
        </Button>
      </Box>

      {view === "vertical" ? (
        <>
          <Typography variant="h5" gutterBottom>
            Tablero
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Todos los Sprints" value={0} />
            {sprints.map((sprint, index) => (
              <Tab label={sprint} key={sprint} value={index + 1} />
            ))}
          </Tabs>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            {statuses.map((Estado) => (
              <Grid item xs={12} md={4} key={Estado}>
                <Paper elevation={0} sx={{ padding: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>{Estado}</Typography>
                    <Badge badgeContent={getTaskCountByStatus(Estado)} color="primary">
                      <AssignmentIcon />
                    </Badge>
                  </Box>
                  {items
                    .filter(
                      (item) =>
                        item.Estado === Estado &&
                        (tabValue === 0 || item.Sprint === sprints[tabValue - 1])
                    )
                    .map((item) => (
                      <Card
                        key={item.Id}
                        sx={{ backgroundColor: getBackgroundColor(item.Estado), marginBottom: 2, cursor: "pointer", "&:hover": { backgroundColor: "#f0f0f0" } }}
                        onClick={() => onSelectItem(item)}
                        onDoubleClick={() => onEditItem(item)}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">{item.Titulo}</Typography>
                            <Tooltip title={`Assigned to ${item.UsuarioAsignado}`}>
                              <Avatar>{item.UsuarioAsignado.charAt(0)}</Avatar>
                            </Tooltip>
                          </Box>
                          <Typography variant="body2" dangerouslySetInnerHTML={{ __html: item.Descripcion }} />
                          <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                            {item.tags.split(",").map((tag) => (
                              <Chip key={tag} label={tag.trim()} sx={{ marginRight: 1, marginBottom: 0 }} />
                            ))}
                            <Typography variant="body2">{item.Prioridad}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Roadmap Timeline
          </Typography>
          <MyTimeline
    tasks={items.map((item) => ({
        id: item.Id,
        title: item.Titulo,
        startDate: item["Fecha Inicio"] || item.startDate,
        endDate: item["Fecha Fin"] || item.endDate,
        etapa:  item["etapa"] ||  item.etapa,
        Estado: item.Estado,
        Estimacion: item.Estimacion,
        progress: item.progress, // Agregado
        dependencies: item.dependencies, // Agregado
        Bloqueos: item.Bloqueos, // Agregado
    }))}
/>
        </>
      )}
    </Box>
  );
};

export default RoadmapDataSheet;
