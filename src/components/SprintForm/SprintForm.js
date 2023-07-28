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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nombre || !fechaInicio || !fechaFin) {
      console.error('Faltan campos obligatorios.');
      return;
    }

    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      await doc.loadInfo();

      const sheet = doc.sheetsByTitle['Sprints'];

      if (isEditMode && editSprintId !== null) {
        // Modo edición: actualizar el sprint existente
        const sprintToUpdate = sprints.find((sprint) => sprint.ID === editSprintId);
        if (sprintToUpdate) {
          sprintToUpdate.Nombre = nombre;
          sprintToUpdate.FechaDeInicio = fechaInicio;
          sprintToUpdate.FechaDeFin = fechaFin;
          const diffInDays = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24));
          sprintToUpdate.Dias = diffInDays;
          await sprintToUpdate.save();
          console.log(`Se actualizó el sprint con ID ${editSprintId}`);
        }
      } else {
        // Modo nuevo sprint: agregar un nuevo sprint
        const id = sheet.rowCount + 1;
        const diffInDays = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24));

        await sheet.addRow({
          ID: id,
          Nombre: nombre,
          FechaDeInicio: fechaInicio,
          FechaDeFin: fechaFin,
          Dias: diffInDays,
        });

        console.log(`Se agregó un nuevo sprint con ID ${id}`);
      }

      setNombre('');
      setFechaInicio('');
      setFechaFin('');
      setIsEditMode(false);
      setEditSprintId(null);

      // Recargar los sprints después de la actualización
      await loadSprints();

      onCloseModal();
    } catch (error) {
      console.error('Error al guardar el sprint:', error);
    }
  };

  const handleEditSprint = (sprintId) => {
    // Cargar los datos del sprint seleccionado para editar
    const sprintToEdit = sprints.find((sprint) => sprint.ID === sprintId);
    if (sprintToEdit) {
      setNombre(sprintToEdit.Nombre);
      setFechaInicio(sprintToEdit.FechaDeInicio);
      setFechaFin(sprintToEdit.FechaDeFin);
      setIsEditMode(true);
      setEditSprintId(sprintId);
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
      }

      // Recargar los sprints después de la eliminación
      await loadSprints();
    } catch (error) {
      console.error('Error al eliminar el sprint:', error);
    }
  };

  return (
    <div className="form-overlay">
      {/* Resto del código... */}
    </div>
  );
}

export default SprintForm;
