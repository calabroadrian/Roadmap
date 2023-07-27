import './Roadmap.css';
import { useState, useEffect } from 'react';
import config from '../../config/config';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const API_KEY = config.API_KEY;
const CLIENT_ID = config.CLIENT_ID;

const RoadmapDataSheet = ({ selectedItem, onEditItem, onAddItem, onSelectItem, onDeselectItem }) => {
  const [items, setItems] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [filterSprint, setFilterSprint] = useState('');

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
          const tagsColumnIndex = headers.indexOf('Tags');
          const sprintColumnIndex = headers.indexOf('Sprint');
          const parsedData = data.values.slice(1).map(row => {
            return headers.reduce((obj, key, index) => {
              obj[key] = row[index] || '';
              return obj;
            }, {});
          });

          // Agregar tags al objeto de cada elemento
          parsedData.forEach(item => {
            item.tags = item[headers[tagsColumnIndex]];
          });

          setItems(parsedData);

          const distinctStatuses = [...new Set(parsedData.map(item => item.Estado))];
          setStatuses(distinctStatuses);

          const distinctSprints = [...new Set(parsedData.map(item => item[headers[sprintColumnIndex]]))];
          setSprints(distinctSprints);
        } else {
          console.error('No se encontraron datos válidos en la respuesta API');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleSelectItem = (item) => {
    if (selectedItem === item) {
      onDeselectItem();
    } else {
      onDeselectItem();
      onSelectItem(item);
      setFilterSprint(item.Sprint);
    }
  };

  const getBackgroundColor = (Estado) => {
    switch (Estado) {
      case 'Nuevo':
        return '#F9D8C7';
      case 'En progreso':
        return '#FFF3C8';
      case 'Hecho':
        return '#65f6b5';
      default:
        return 'white';
    }
  };

  return (
    <div className="roadmap-wrapper">
      <div className="roadmap-filters">
        <label htmlFor="sprint-filter">Filtrar por Sprint:</label>
        <select id="sprint-filter" value={filterSprint} onChange={(e) => setFilterSprint(e.target.value)}>
          <option value="">Todos los Sprints</option>
          {sprints.map((sprint) => (
            <option value={sprint} key={sprint}>{sprint}</option>
          ))}
        </select>
      </div>
      <div className="roadmap-columns">
        {statuses.map((Estado) => (
          <div className="roadmap-column" key={Estado}>
            <div className="roadmap-column-header">
              <h2>{Estado}</h2>
            </div>
            <ul>
              {items
                .filter((item) => item.Estado === Estado && (filterSprint === '' || item.Sprint === filterSprint))
                .map((item) => (
                  <li
                    key={item.Id}
                    className={`roadmap-item ${item.Estado} ${selectedItem === item ? 'selected' : ''}`}
                    onClick={() => handleSelectItem(item)}
                    onDoubleClick={() => onEditItem(item)}
                    style={{ backgroundColor: getBackgroundColor(item.Estado) }}
                  >
                    <h3 className="item-title">{item.Titulo}</h3>
                    <h3 className="item-description" dangerouslySetInnerHTML={{ __html: item.Descripcion }}></h3>
                    <div className="item-details">
                      <p className="item-assignee">{item.UsuarioAsignado}</p>
                      <p className="item-priority">{item.Prioridad}</p>
                    </div>
                    <div className="item-tags">
                      {item.tags.split(',').map(tag => (
                        <span key={tag} className="item-tag">{tag.trim()}</span>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapDataSheet;