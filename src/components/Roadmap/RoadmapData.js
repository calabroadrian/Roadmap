import './Roadmap.css';
import { useState, useEffect } from 'react';
import roadmapData from './roadmapData.json';

const RoadmapData = ({ selectedItem, onEditItem, onAddItem, onSelectItem, onDeselectItem }) => {
  const [items, setItems] = useState([]);
  const [statuses, setStatuses] = useState([]);
  console.log(items);

  useEffect(() => {
    // Cambiamos la estructura del json para incluir el estado en el campo status
    const updatedData = roadmapData.map(item => {
      const status = extractStatusFromTitle(item.title) || '';
      return {
        ...item,
        status,
        id: item.id.replace('http://redmineac.buenosaires.gob.ar/issues/', '') // Extraemos el ID de la URL
      };
    });
    setItems(updatedData);
  }, []);

  useEffect(() => {
    // Obtenemos los distintos estados presentes en los datos
    const distinctStatuses = [...new Set(items.map(item => item.status))];
    setStatuses(distinctStatuses);
  }, [items]);

  const handleSelectItem = (item) => {
    if (selectedItem === item) {
      onDeselectItem();
    } else {
      onSelectItem(item);
    }
  };

  const extractStatusFromTitle = (title) => {
    const regex = /\(([^)]+)\)/;
    const match = title.match(regex);
    return match ? match[1] : null;
  }

  const getBackgroundColor = (status) => {
    switch (status) {
      case 'Nuevo':
        return '#F9D8C7';
      case 'En análisis':
        return '#FFF3C8';
      case 'Pendiente aprobación':
        return '#C9F7C5';
      default:
        return 'white';
    }
  };

  
  
  return (
    <div className="roadmap-wrapper">
      {statuses.map(status => (
        <div className="roadmap-column" key={status}>
          <div className="roadmap-column-header">
            <h2>{status}</h2>
          </div>
          <ul>
            {items.filter((item) => item.status === status).map((item) => (
              <li
                key={item.id}
                className={`roadmap-item ${item.status} ${selectedItem === item ? 'selected' : ''}`}
                onClick={() => handleSelectItem(item)}
                onDoubleClick={() => onEditItem(item)}
                style={{ backgroundColor: getBackgroundColor(item.status) }}
              >
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};


export default RoadmapData;
