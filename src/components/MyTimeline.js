import React, { useState } from "react";
import Timeline from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import "./MyTimeline.css";
import moment from "moment";

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
        let backgroundImage = "";

        switch (task.Estado) {
            case "Nuevo":
                backgroundColor = "linear-gradient(120deg, #ffcdd2, #e57373)";
                break;
            case "En curso":
                backgroundColor = "linear-gradient(120deg, #fff9c4, #ffeb3b)";
                break;
            case "Hecho":
                backgroundColor = "linear-gradient(120deg, #c8e6c9, #4caf50)";
                break;
            default:
                break;
        }

        if (!task.Estimacion) {
            backgroundImage = "repeating-linear-gradient(45deg, #eee, #eee 10px, #ddd 10px, #ddd 20px)";
        }

        console.log("Tarea:", task, "Estilos:", { background: backgroundColor, backgroundImage: backgroundImage }); // Depuración

        return {
            id: task.id,
            group: task.id,
            title: task.title,
            start_time: moment(task.startDate),
            end_time: moment(task.endDate),
            style: {
                background: backgroundColor,
                backgroundImage: backgroundImage,
                borderRadius: "10px", // Añade esto
                transition: "transform 0.3s ease, box-shadow 0.3s ease", // Añade esto
                color: "white", // Añade esto
                fontWeight: "500", // Añade esto
                display: "flex", // Añade esto
                alignItems: "center", // Añade esto
                justifyContent: "center", // Añade esto
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Añade esto
                minHeight: "40px", // Añade esto
            },
        };
    });

    console.log("Items:", items); // Depuración
    console.log("Tareas:", tasks); // Depuración

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
        </div>
    );
};

export default MyTimeline;