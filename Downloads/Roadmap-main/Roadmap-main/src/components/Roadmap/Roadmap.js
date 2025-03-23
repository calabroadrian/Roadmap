import './Roadmap.css';

const Roadmap = ({ items, selectedItem, onEditItem, onAddItem, onSelectItem, onDeselectItem }) => {
  // Creamos una matriz separada para cada estado
  const toDoItems = items.filter((item) => item.status === 'to-do');
  const inProgressItems = items.filter((item) => item.status === 'in-progress');
  const doneItems = items.filter((item) => item.status === 'done');

  const handleSelectItem = (item) => {
    if (selectedItem === item) {
      onDeselectItem();
    } else {
      onSelectItem(item);
    }
  };

  return (
    <div className="roadmap-wrapper">
      <div className="roadmap-column">
        <div className="roadmap-column-header">
          <h2>Por hacer</h2>
        </div>
        <ul>
          {toDoItems.map((item) => (
            <li
              key={item.id}
              className={`roadmap-item ${item.status} ${selectedItem === item ? 'selected' : ''}`}
              onClick={() => handleSelectItem(item)}
              onDoubleClick={() => onEditItem(item)}
            >
              <h3 className="item-title">{item.title}</h3>
              <p className="item-description">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="roadmap-column">
        <div className="roadmap-column-header">
          <h2>En progreso</h2>
        </div>
        <ul>
          {inProgressItems.map((item) => (
              <li
                key={item.id}
                className={`roadmap-item ${item.status} ${selectedItem === item ? 'selected' : ''}`}
                onClick={() => handleSelectItem(item)}
                onDoubleClick={() => onEditItem(item)}
              >
              <h3 className="item-title">{item.title}</h3>
              <p className="item-description">{item.description}</p>
              </li>
          ))}
        </ul>
      </div>
      <div className="roadmap-column">
        <div className="roadmap-column-header">
          <h2>Hecho</h2>
        </div>
        <ul>
          {doneItems.map((item) => (
            <li
              key={item.id}
              className={`roadmap-item ${item.status} ${selectedItem === item ? 'selected' : ''}`}
              onClick={() => handleSelectItem(item)}
              onDoubleClick={() => onEditItem(item)}
            >
              <h3 className="item-title">{item.title}</h3>
              <p className="item-description">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Roadmap;