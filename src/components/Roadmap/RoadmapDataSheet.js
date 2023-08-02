  import './Roadmap.css';
  import { useState, useEffect } from 'react';
  import config from '../../config/config';

  const SPREADSHEET_ID = config.SPREADSHEET_ID;
  const CLIENT_EMAIL = config.CLIENT_EMAIL;
  const PRIVATE_KEY = config.PRIVATE_KEY;
  const API_KEY = config.API_KEY;
  const CLIENT_ID = config.CLIENT_ID;

  const RoadmapDataSheet = ({
    selectedItem,
    onEditItem,
    onAddItem,
    onSelectItem,
    onDeselectItem,
    setStatuses,
    setSprints,
    statuses, // Recibimos la variable statuses como propiedad
    sprints, // Recibimos la variable sprints como propiedad
  }) => {
    console.log('RoadmapDataSheet rendered');
    const [items, setItems] = useState([]);
    const [filterSprint, setFilterSprint] = useState('');

       
    const handleSelectItem = (item) => {
      console.log('handleSelectItem called'); 
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
