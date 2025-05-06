import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Gantt } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import moment from 'moment';
import { Tooltip, Chip, Box, Button, TextField, Paper, Stack, Typography } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PropTypes from 'prop-types';

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
    "Nuevo": ["#ffcdd2", "#e57373"],
    "En curso": ["#fff9c4", "#ffeb3b"],
    "En progreso": ["#fff9c4", "#ffeb3b"],
    "Hecho": ["#c8e6c9", "#4caf50"],
};

// Patrón para items sin estimación
const PATTERNS = "repeating-linear-gradient(-45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";

const MyTimeline = ({ tasks }) => {
    const now = moment();
    const defaultStart = now.clone().subtract(2, 'months');
    const defaultEnd = now.clone().add(2, 'months');

    const [filter, setFilter] = useState("");
    const filteredTasks = useMemo(
        () => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())),
        [tasks, filter]
    );

    const [ganttTasks, setGanttTasks] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [viewMode, setViewMode] = useState('Month');
    const [locale, setLocale] = useState('es');
    const [mounted, setMounted] = useState(false);

    const timelineRef = useRef(null);

    const zoomIn = useCallback(() => {
        setViewMode(prevMode => {
            switch (prevMode) {
                case 'Year': return 'Month';
                case 'Month': return 'Week';
                case 'Week': return 'Day';
                case 'Day': return 'Day';
                default: return prevMode;
            }
        });
    }, []);

    const zoomOut = useCallback(() => {
        setViewMode(prevMode => {
            switch (prevMode) {
                case 'Day': return 'Week';
                case 'Week': return 'Month';
                case 'Month': return 'Year';
                case 'Year': return 'Year';
                default: return prevMode;
            }
        });
    }, []);

    // Convierte tus datos al formato esperado por Gantt-Task-React
    useEffect(() => {
        const convertedTasks = filteredTasks.map(task => {
            const stateDef = STATE_STYLES[task.Estado] || STATE_STYLES['Nuevo'];
            const hasPattern = !task.Estimacion;

            // Parsea las fechas usando el formato d/m/aaaa si es necesario, y convierte a Date
            const startDate = task.startDate
                ? (typeof task.startDate === 'string' ? moment(task.startDate, "DD/MM/YYYY").toDate() : task.startDate)
                : defaultStart.toDate();
            const endDate = task.endDate
                ? (typeof task.endDate === 'string' ? moment(task.endDate, "DD/MM/YYYY").toDate() : task.endDate)
                : defaultEnd.toDate();

            return {
                id: task.id?.toString() || '',
                name: task.title,
                startDate: startDate,
                endDate: endDate,
                color: stateDef[0],
                textColor: '#fff',
                progress: task.progress || 0,
                dependencies: task.dependencies || [],
                custom_class: hasPattern ? 'task-no-estimation' : '',
                etapa: task.etapa,
                estado: task.Estado,
                estimacion: task.Estimacion
            };
        });
        setGanttTasks(convertedTasks);

        const deps = [];
        filteredTasks.forEach(task => {
            if (task.dependencies && Array.isArray(task.dependencies) && task.dependencies.length > 0) {
                task.dependencies.forEach(depId => {
                    deps.push({
                        source: task.id?.toString() || '',
                        target: depId.toString(),
                        type: 'finish-to-start'
                    });
                });
            }
        });
        setDependencies(deps);
        setMounted(true);
    }, [filteredTasks, defaultStart, defaultEnd]);

    const taskRenderer = (task) => {
        const etapa = task.etapa;
        const estado = task.estado;
        const estimacion = task.estimacion;

        return (
            <div style={{
                backgroundColor: task.color,
                color: task.textColor || '#fff',
                borderRadius: '5px',
                padding: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                fontSize: '13px'
            }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.name}
                </span>
                {etapa && (
                    <Chip
                        label={etapa}
                        size="small"
                        sx={{
                            position: 'absolute', top: 2, right: 2, bgcolor: ETAPA_STYLES[etapa] || '#757575',
                            color: '#fff', fontSize: '10px', height: '18px'
                        }}
                    />
                )}
            </div>
        );
    };

    return (
        <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon /> Roadmap Timeline
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                {Object.entries(STATE_STYLES).map(([status, grad]) => (
                    <Chip
                        key={status}
                        label={status}
                        size="small"
                        sx={{ background: `linear-gradient(120deg, ${grad[0]}, ${grad[1]})`, color: '#fff' }}
                    />
                ))}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                {Object.entries(ETAPA_STYLES).map(([etapa, color]) => (
                    <Chip
                        key={etapa}
                        label={etapa}
                        size="small"
                        sx={{ backgroundColor: color, color: '#fff' }}
                    />
                ))}
            </Stack>
            <Box sx={{ mb: 1, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    label="Buscar…"
                    size="small"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <Button size="small" variant="outlined" onClick={zoomOut}>- Zoom</Button>
                <Button size="small" variant="outlined" onClick={zoomIn}>+ Zoom</Button>
            </Box>
            <style jsx global>{`
                .task-no-estimation {
                    background-image: ${PATTERNS};
                    background-repeat: repeat;
                }
                .gantt_task_content {
                  overflow: visible;
                }
            `}</style>
            {mounted &&
                <Gantt
                    tasks={ganttTasks}
                    dependencies={dependencies}
                    viewMode={viewMode}
                    locale={locale}
                    onDateChange={(task, start, end) => {
                        console.log('onDateChange', task, start, end);
                    }}
                    onTaskClick={(task) => {
                        console.log('onTaskClick', task);
                    }}
                    onProgressChange={(task, progress) => {
                        console.log('onProgressChange', task, progress);
                    }}
                    onAddEmptyTask={(y, x) => {
                        console.log("onAddEmptyTask", y, x);
                    }}
                    onRowClick={(task) => {
                        console.log("onRowClick", task);
                    }}
                    taskContentRender={taskRenderer}
                    columnWidth={40}
                    rowHeight={40}
                />
            }
        </Paper>
    );
};

MyTimeline.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            title: PropTypes.string.isRequired,
            startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
            endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
            Estado: PropTypes.string,
            etapa: PropTypes.string,
            Estimacion: PropTypes.any,
            progress: PropTypes.any,
            dependencies: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
            Bloqueos: PropTypes.arrayOf(PropTypes.string),
        })
    ).isRequired,
};

export default MyTimeline;

