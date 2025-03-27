import { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import {
  TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
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
  const [selectedSprintId, setSelectedSprintId] = useState(null);

  useEffect(() => {
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

  const getNextUniqueId = () => {
    if (sprints.length === 0) return 1;
    const maxId = Math.max(...sprints.map((sprint) => parseInt(sprint.ID, 10)));
    return maxId + 1;
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
        const id = getNextUniqueId();
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
      await loadSprints();

    } catch (error) {
      console.error('Error al guardar el sprint:', error);
    }
  };

  const handleEditSprint = () => {
    const sprintToEdit = sprints.find((sprint) => sprint.ID === selectedSprintId);
    if (sprintToEdit) {
      setNombre(sprintToEdit.Nombre);
      setFechaInicio(sprintToEdit.FechaDeInicio);
      setFechaFin(sprintToEdit.FechaDeFin);
      setIsEditMode(true);
      setEditSprintId(selectedSprintId);
    }
  };

  const handleDeleteSprint = async () => {
    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      await doc.loadInfo();

      const sprintToDelete = sprints.find((sprint) => sprint.ID === selectedSprintId);
      if (sprintToDelete) {
        await sprintToDelete.delete();
        console.log(`Se eliminó el sprint con ID ${selectedSprintId}`);

        setSprints((prevSprints) => prevSprints.filter((sprint) => sprint.ID !== selectedSprintId));
        setSelectedSprintId(null);
      }
    } catch (error) {
      console.error('Error al eliminar el sprint:', error);
    }
  };

  return (
    <Dialog open={true} onClose={onCloseModal} fullWidth maxWidth="md">
      <DialogTitle>{isEditMode ? 'Editar Sprint' : 'Agregar Sprint'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre"
            fullWidth
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Fecha de Inicio"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Fecha de Fin"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            margin="normal"
          />
          <DialogActions>
            <Button onClick={onCloseModal}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditMode ? 'Guardar Cambios' : 'Agregar Sprint'}
            </Button>
          </DialogActions>
        </form>
        <Typography variant="h6" gutterBottom>Lista de Sprints</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Días</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sprints.map((sprint) => (
                <TableRow
                  key={sprint.ID}
                  selected={selectedSprintId === sprint.ID}
                  onClick={() => setSelectedSprintId(sprint.ID)}
                >
                  <TableCell>{sprint.Nombre}</TableCell>
                  <TableCell>{sprint.FechaDeInicio}</TableCell>
                  <TableCell>{sprint.FechaDeFin}</TableCell>
                  <TableCell>{sprint.Dias}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditSprint} disabled={!selectedSprintId} color="primary">Editar Sprint</Button>
        <Button onClick={handleDeleteSprint} disabled={!selectedSprintId} color="secondary">Eliminar Sprint</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SprintForm;
