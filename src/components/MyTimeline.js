import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css";
import moment from "moment";
import ReactTooltip from 'react-tooltip';

const MyTimeline = ({ tasks }) => {
    const safeTasks = tasks || [];

    const yearStart = moment().startOf("year");
    const yearEnd = moment().endOf("year");

    const [visibleTimeStart, setVisibleTimeStart] = useState(yearStart.valueOf());
    const [visibleTimeEnd, setVisibleTimeEnd] = useState(yearEnd.valueOf());

    if (safeTasks.length === 0) {
        return <p>No hay tareas disponibles</p>;
    }

    const groups = safeTasks.map((task) => ({
        id: task.id,
        title: task.title,
    }));

    const items = safeTasks.map((task) => {
        let backgroundColor = "linear-gradient(120deg, #64b5f6, rgb(30, 229, 100))";
        let backgroundImage = "";
        let className = "mi-timeline-item";

        switch (task.Estado) {
            case "Nuevo":
                backgroundColor = "linear-gradient(120deg, #ffcdd2, #e57373)";
                className += " mi-timeline-nuevo";
                break;
            case "En curso":
                backgroundColor = "linear-gradient(120deg, #fff9c4, #ffeb3b)";
                className += " mi-timeline-encurso";
                break;
            case "Hecho":
                backgroundColor = "linear-gradient(120deg, #c8e6c9, #4caf50)";
                className += " mi-timeline-hecho";
                break;
            default:
                break;
        }

        if (!task.Estimacion) {
            backgroundImage = "repeating-linear-gradient(45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";
        }

        console.log("Tarea:", task, "Estilos:", { background: backgroundColor, backgroundImage: backgroundImage });

        return {
            id: task.id,
            group: task.id,
            title: task.title,
            start_time: moment(task.startDate),
            end_time: moment(task.endDate),
            className: className,
            style: {
                backgroundImage: backgroundImage + " !important",
                borderRadius: "10px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                color: "white",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                minHeight: "40px",
            },
            'data-tip': `
                <strong>Estimación:</strong> ${task.Estimacion || 'N/A'}<br/>
                <strong>Fecha Inicio:</strong> ${moment(task.startDate).format('DD/MM/YYYY')}<br/>
                <strong>Fecha Fin:</strong> ${moment(task.endDate).format('DD/MM/YYYY')}<br/>
                <strong>Progreso:</strong> ${task.progress || 'N/A'}<br/>
                <strong>Dependencias:</strong> ${task.Dependencias || 'N/A'}<br/>
                <strong>Bloqueos:</strong> ${task.Bloqueos || 'N/A'}
            `,
            'data-for': `task-${task.id}`
        };
    });

    console.log("Items:", items);
    console.log("Tareas:", tasks);

    return (
        <div>
            <Timeline
                groups={groups}
                items={items}
                defaultTimeStart={yearStart}
                defaultTimeEnd={yearEnd}
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                onTimeChange={(start, end) => {
                    setVisibleTimeStart(start);
                    setVisibleTimeEnd(end);
                }}
                headerLabelFormats={{
                    dayShort: "",
                    dayLong: "",
                    monthShort: "MMM",
                    monthLong: "MMMM",
                    yearShort: "",
                    yearLong: "",
                }}
                headerLabelGroupHeight={50}
                headerLabelHeight={50}
                minZoom={1000 * 60 * 60 * 24 * 30}
                maxZoom={1000 * 60 * 60 * 24 * 365}
            />
            {items.map(item => (
                <ReactTooltip 
                    key={`tooltip-${item.id}`}
                    id={`task-${item.id}`} 
                    html={true} 
                    effect="solid" 
                    place="top" 
                />
            ))}
        </div>
    );
};

export default MyTimeline;