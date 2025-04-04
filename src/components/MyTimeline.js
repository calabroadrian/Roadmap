import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import "./MyTimeline.css";
import moment from "moment";
import { Tooltip } from "@mui/material";

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

        return {
            id: task.id,
            group: task.id,
            title: task.title,
            start_time: moment(task.startDate),
            end_time: moment(task.endDate),
            className: className,
            style: {
                background: backgroundColor,
                backgroundImage: backgroundImage + " !important",
                borderRadius: "10px",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                color: "white",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            },
            estimacion: task.Estimacion,
            progress: task.progress,
            dependencias: task.Dependencias,
            bloqueos: task.Bloqueos,
        };
    });

    const itemRenderer = ({ item, getItemProps }) => {
        const itemProps = getItemProps();
        return (
            <div {...itemProps} style={{ ...itemProps.style, ...item.style }}>
                <Tooltip
                    title={
                        <div style={{ textAlign: "left", fontSize: "0.85rem" }}>
                            <div><strong>Estimación:</strong> {item.estimacion || "N/A"}</div>
                            <div><strong>Fecha Inicio:</strong> {moment(item.start_time).format("DD/MM/YYYY")}</div>
                            <div><strong>Fecha Fin:</strong> {moment(item.end_time).format("DD/MM/YYYY")}</div>
                            <div><strong>Progreso:</strong> {item.progress || "N/A"}</div>
                            <div><strong>Dependencias:</strong> {item.dependencias || "N/A"}</div>
                            <div><strong>Bloqueos:</strong> {item.bloqueos || "N/A"}</div>
                        </div>
                    }
                    arrow
                    placement="top"
                    enterDelay={300}
                >
                    <div style={{ textAlign: "center" }}>{item.title}</div>
                </Tooltip>
            </div>
        );
    };

    const groupHeights = groups.map(() => 30); // Define la altura de las filas a 30px

    const sidebarContentRenderer = ({ group }) => {
        return (
            <div className="mi-rct-sidebar-row">
                {group.title}
            </div>
        );
    };

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
                itemRenderer={itemRenderer}
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
                sidebarWidth={300}
                className="mi-rct-sidebar"
                groupHeights={groupHeights} // Aplica la altura de las filas
                sidebarContentRenderer={sidebarContentRenderer}
            />
        </div>
    );
};

export default MyTimeline;