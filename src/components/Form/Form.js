import React, { useState, useEffect } from 'react';
import './Form.css';

function Form({ item, onAddItem, onDeselectItem, onUpdateItem, onDeleteItem, onCloseModal }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setStatus(item.status);
    }
  }, [item]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newItem = { id: Date.now(), title, description, status };
    if (item) {
      onUpdateItem({ ...item, title, description, status });
      onDeselectItem();
    } else {
      onAddItem(newItem); // aquí se envía el objeto sin el arreglo
    }
    setTitle('');
    setDescription('');
    setStatus('');
    onCloseModal();
  };

  const handleDelete = () => {
    onDeleteItem(item);
    onDeselectItem();
    onCloseModal();
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <h2>Agregar nueva tarea</h2>
          <button className="form-close" onClick={onCloseModal}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className='form-group-1'>
            <div>
              <label>Título:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label>Descripción:</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            </div>
            <div>
              <label>Estado:</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)} required>
                <option value="">Select a status</option>
                <option value="to-do">Por hacer</option>
                <option value="in-progress">En progreso</option>
                <option value="done">Hecho</option>
              </select>
            </div>
          </div>
          <div className="form-group-2">
            <button className="form-submit" type="submit">{item ? 'Modificar' : 'Agregar'}</button>
            {item && <button className="form-delete" type="submit" onClick={handleDelete}>Eliminar</button>}
            {item && <button className="form-cancel" type="submit" onClick={onDeselectItem}>Cancelar</button>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;