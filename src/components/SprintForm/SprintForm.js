import { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import './SprintForm.css';
import config from '../../config/config';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const CLIENT_EMAIL = config.CLIENT_EMAIL;
const PRIVATE_KEY = config.PRIVATE_KEY;

function SprintForm({ onCloseModal }) {
  const [nombre, setNombre] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [sprints, setSprints] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSprintId, setEditSprintId] = useState(null);

  useEffect(() => {
    // Cargar los sprints existentes cuando se monta el componente
    loadSprints();
  }, []);

  const loadSprints = async () => {
    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      await doc.loadInfo();

      const sheet = doc.sheetsByTitle['Sprints'];
      const rows = await sheet.getRows();
      setSprints(rows);
    } catch (error) {
      console.error('Error al cargar los sprints:', error);
    }
  };

  // Resto del código sin cambios ...

  const handleEditSprint = (sprintId) => {
    // Cargar los datos del sprint seleccionado para editar
    const sprintToEdit = sprints.find((sprint) => sprint.ID === sprintId);
    if (sprintToEdit) {
      setNombre(sprintToEdit.Nombre);
      setFechaInicio(sprintToEdit.FechaDeInicio);
      setFechaFin(sprintToEdit.FechaDeFin);
      setIsEditMode(true);
      setEditSprintId(sprintId);
    } else {
      // Si no se encuentra el sprint, limpiar los campos para agregar uno nuevo
      setNombre('');
      setFechaInicio('');
      setFechaFin('');
      setIsEditMode(false);
      setEditSprintId(null);
    }
  };
  
  const handleDeleteSprint = async (sprintId) => {
    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      await doc.loadInfo();
  
      const sheet = doc.sheetsByTitle['Sprints'];
  
      const sprintToDelete = sprints.find((sprint) => sprint.ID === sprintId);
      if (sprintToDelete) {
        await sprintToDelete.delete();
        console.log(`Se eliminó el sprint con ID ${sprintId}`);
  
        // Actualizar el estado después de eliminar el sprint
        setSprints((prevSprints) => prevSprints.filter((sprint) => sprint.ID !== sprintId));
      }
    } catch (error) {
      console.error('Error al eliminar el sprint:', error);
    }
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <h2>{isEditMode ? 'Editar Sprint' : 'Agregar Sprint'}</h2>
          <button className="form-close-btn" onClick={onCloseModal}>
            X
          </button>
        </div>
        <form className="sprint-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre:</label>
            <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="fechaInicio">Fecha de inicio:</label>
            <input type="date" id="fechaInicio" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="fechaFin">Fecha de fin:</label>
            <input type="date" id="fechaFin" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="form-group">
            <button type="submit" className="submit-btn">
              {isEditMode ? 'Guardar Cambios' : 'Agregar Sprint'}
            </button>
          </div>
        </form>
        <div className="sprint-grid">
  <h2>Lista de Sprints</h2>
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Inicio</th>
        <th>Fin</th>
        <th>Días</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {sprints.map((sprint) => (
        <tr key={sprint.ID}>
          <td>{sprint.Nombre}</td>
          <td>{sprint.FechaDeInicio}</td>
          <td>{sprint.FechaDeFin}</td>
          <td>{sprint.Dias}</td>
          <td>
            <button onClick={() => handleEditSprint(sprint.ID)} className="edit-btn">
              Editar
            </button>
            <button onClick={() => handleDeleteSprint(sprint.ID)} className="delete-btn">
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

      </div>
    </div>
  );
}

export default SprintForm;