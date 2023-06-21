import './Roadmap.css';
import { useState, useEffect } from 'react';

const SPREADSHEET_ID = '1FLc7zZF5jLw_yZv6QU-3T-2yxmFyfxgueqr6GMTJPuc';
const API_KEY = "AIzaSyDmSizgIBCqkrK2BoUdnvuiDQZ9m_o4zNQ";
const CLIENT_ID = "113797463942398973735";
const RoadmapDataSheet = ({ selectedItem, onEditItem, onAddItem, onSelectItem, onDeselectItem }) => {
  const [items, setItems] = useState([]);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    // Fetch data from Google Sheets API
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/issues!A1:ZZ?key=${API_KEY}&access_token=${CLIENT_ID}`
        );
        const data = await response.json();
    
        if (data && data.values && Array.isArray(data.values) && data.values.length > 0) {
          const headers = data.values[0];
          const parsedData = data.values.slice(1).map(row => {
            return headers.reduce((obj, key, index) => {
              obj[key] = row[index] || '';
              return obj;
            }, {});
          });
    
          setItems(parsedData);
        } else {
          console.error('No se encontraron datos válidos en la respuesta API');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Obtenemos los distintos estados presentes en los datos
    const distinctStatuses = [...new Set(items.map(item => item.Estado))];
    setStatuses(distinctStatuses);
  }, [items]);

  const handleSelectItem = (item) => {
    if (selectedItem === item) {
      onDeselectItem();
    } else {
      onSelectItem(item);
    }
  };

  const getBackgroundColor = (Estado) => {
    switch (Estado) {
      case 'Nuevo':
        return '#F9D8C7';
      case 'En progreso':
        return '#FFF3C8';
      case 'Validación de usuario':
        return '#C9F7C5';
      default:
        return 'white';
    }
  };

  return (
    <div className="roadmap-wrapper">
      {statuses.map(Estado => (
        <div className="roadmap-column" key={Estado}>
          <div className="roadmap-column-header">
            <h2>{Estado}</h2>
          </div>
          <ul>
            {items
              .filter((item) => item.Estado === Estado)
              .map((item) => (
                <li
                  key={item.Id} // Asegúrate de usar una propiedad única del objeto como la clave
                  className={`roadmap-item ${item.Estado} ${selectedItem === item ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item)}
                  onDoubleClick={() => onEditItem(item)}
                  style={{ backgroundColor: getBackgroundColor(item.Estado) }}
                >
                  <h3 className="item-title">{item.Descripcion}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-details">
                    <p className="item-assignee">Asignado: {item.Assignee}</p>
                    <p className="item-priority">Prioridad: {item.Priority}</p>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default RoadmapDataSheet;
