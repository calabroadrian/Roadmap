import { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import config from '../../config/config';
import DesignThinkingSidebar from '../DesignThinkingSidebar/DesignThinkingSidebar';

import {
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import './Form.css';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const CLIENT_EMAIL = config.CLIENT_EMAIL;
const PRIVATE_KEY = config.PRIVATE_KEY;

const TAB_GENERAL = "General";
const TAB_TESTING = "Testing";
const TAB_DESIGN = "Diseño";
const TAB_DEVELOPER = "Desarrollador";

function Form({ item, onAddItem, onDeselectItem, onUpdateItem, onDeleteItem, onCloseModal }) {
  const [Id, setId] = useState('');
  const [Descripcion, SetDescripcion] = useState('');
  const [Estado, setEstado] = useState('');
  const [Titulo, setTitulo] = useState('');
  const [UsuarioAsignado, setUsuarioAsignado] = useState('');
  const [Sprint, setSprint] = useState('');
  const [Prioridad, setPrioridad] = useState('');
  const [idExists, setIdExists] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [userList, setUserList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [sprintList, setSprintList] = useState([]);
  const [isNewItem, setIsNewItem] = useState(true);
  const [showIdExistsError, setShowIdExistsError] = useState(false);
  const [isIdEditable, setIsIdEditable] = useState(true);
  const [activeTab, setActiveTab] = useState(TAB_GENERAL);
  const [showDesignThinkingSidebar, setShowDesignThinkingSidebar] = useState(true);

  useEffect(() => {
    // Obtener el listado de usuarios de la hoja de Google Sheets
    const fetchUserList = async () => {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[1]; // Suponiendo que el listado de usuarios está en la segunda hoja
      const rows = await sheet.getRows();
      const users = rows.map(row => row.NombreUsuario); // Ajusta esto según la estructura de tus datos de usuarios
      setUserList(users);
    };

    const fetchPriorityList = async () => {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[1]; // Suponiendo que el listado de prioridades está en la segunda hoja
      const rows = await sheet.getRows();
      const priorities = rows.map(row => row.Prioridad); // Ajusta esto según la estructura de tus datos de prioridades
      setPriorityList(priorities);
    };

    const fetchSprintList = async () => {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[2]; // Suponiendo que el listado de Sprint está en la segunda hoja
      const rows = await sheet.getRows();
      const sprints = rows.map(row => row.Nombre); //
      setSprintList(sprints);
    };

    fetchUserList();
    fetchPriorityList();
    fetchSprintList();
  }, []);

  useEffect(() => {
    setIdExists(false);
    if (item) {
      setId(item.Id);
      SetDescripcion(item.Descripcion);
      setEstado(item.Estado);
      setTitulo(item.Titulo);
      setUsuarioAsignado(item.UsuarioAsignado);
      setTags(item.Tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''));
      setPrioridad(item.Prioridad);
      setSprint(item.Sprint);
      setIsNewItem(false);
      setIsIdEditable(false); // Deshabilitar el campo de ID
    } else {
      setId('');
      SetDescripcion('');
      setEstado('');
      setTitulo('');
      setUsuarioAsignado('');
      setTags([]);
      setSprint('');
      setIsNewItem(true);
      setIsIdEditable(true); // Habilitar el campo de ID
    }
  }, [item]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!Id || !Titulo || !Descripcion || !Estado || !Prioridad) {
      console.error('Faltan campos obligatorios.');
      return;
    }

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    if (isNewItem) {
      const rows = await sheet.getRows();
      const exists = rows.some(row => row.Id === Id);

      if (exists) {
        console.error('El ID ya existe en el sheet. Por favor, elige otro ID único.');
        setShowIdExistsError(true);
        return;
      } else {
        setShowIdExistsError(false);
      }

      await sheet.addRow({
        Id,
        Descripcion,
        Estado,
        Titulo,
        Tags: tags.join(','),
        UsuarioAsignado,
        Prioridad,
        Sprint,
      });

      onAddItem({
        id: Date.now(),
        Id,
        Descripcion,
        Estado,
        Titulo,
        Tags: tags.join(','),
        UsuarioAsignado,
        Prioridad,
        Sprint,
      });
    } else {
      const rows = await sheet.getRows();
      const rowToUpdate = rows.find(row => row.Id === item.Id);

      if (!rowToUpdate) {
        console.error('No se encontró el elemento a actualizar en el sheet.');
        return;
      }

      rowToUpdate.Id = Id;
      rowToUpdate.Descripcion = Descripcion;
      rowToUpdate.Estado = Estado;
      rowToUpdate.Titulo = Titulo;
      rowToUpdate.Tags = tags.join(',');
      rowToUpdate.UsuarioAsignado = UsuarioAsignado;
      rowToUpdate.Prioridad = Prioridad;
      rowToUpdate.Sprint = Sprint;

      await rowToUpdate.save();

      onUpdateItem({
        id: item.id,
        Id,
        Descripcion,
        Estado,
        Titulo,
        Tags: tags.join(','),
        UsuarioAsignado,
        Prioridad,
        Sprint,
      });
    }

    onCloseModal();
    console.log('Formulario enviado');
    window.location.reload();
    console.log(item);
  };

  const addTag = (tag) => {
    if (tag.trim() !== '') {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (index) => {
    const updatedTags = [...tags];
    updatedTags.splice(index, 1);
    setTags(updatedTags);
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const tag = event.target.value.trim();
      if (tag !== '') {
        addTag(tag);
      }
    }
  };

  const handleDelete = async () => {
    onDeleteItem(item);
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY,
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row._rawData[0] === item.Id);
    await rowToDelete.delete();
    onDeselectItem();
    window.location.reload();
    onCloseModal();
    setShowDesignThinkingSidebar(false);
  };

  return (
    <div className="form-overlay">
      <div className="form-container">
        <div className="form-header">
          <Typography variant="h5">Agregar nueva tarea</Typography>
          <Button variant="outlined" color="secondary" onClick={() => {
            setShowDesignThinkingSidebar(false);
            onCloseModal();
          }}>
            X
          </Button>
        </div>
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
          <Tab label="General" value={TAB_GENERAL} />
          <Tab label="Diseño" value={TAB_DESIGN} />
          <Tab label="Desarrollador" value={TAB_DEVELOPER} />
          <Tab label="Testing" value={TAB_TESTING} />
        </Tabs>
        <Grid container spacing={2} p={2}>
      {activeTab === TAB_GENERAL && (
        <Grid item xs={12}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="ID"
                  variant="outlined"
                  fullWidth
                  value={Id}
                  onChange={(e) => setId(e.target.value)}
                  error={showIdExistsError}
                  disabled={!isIdEditable}
                  required
                />
                {showIdExistsError && (
                  <Typography color="error" variant="body2">
                    El ID ya existe. Por favor, elige otro ID único.
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Título"
                  variant="outlined"
                  fullWidth
                  value={Titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
              <Typography variant="h6" style={{ marginBottom: '0.5rem' }}>
              Descripción
            </Typography>
            <ReactQuill
              value={Descripcion}
              onChange={SetDescripcion}
              style={{ marginBottom: '1rem' }}
            />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={Estado}
                    label="Estado"
                    onChange={(e) => setEstado(e.target.value)}
                    required
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="En Progreso">En Progreso</MenuItem>
                    <MenuItem value="Completado">Completado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={Prioridad}
                    label="Prioridad"
                    onChange={(e) => setPrioridad(e.target.value)}
                    required
                  >
                    {priorityList.map(priority => (
                      <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Sprint</InputLabel>
                  <Select
                    value={Sprint}
                    label="Sprint"
                    onChange={(e) => setSprint(e.target.value)}
                    required
                  >
                    {sprintList.map(sprint => (
                      <MenuItem key={sprint} value={sprint}>{sprint}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" fullWidth>
                  <InputLabel>Usuario Asignado</InputLabel>
                  <Select
                    value={UsuarioAsignado}
                    label="Usuario Asignado"
                    onChange={(e) => setUsuarioAsignado(e.target.value)}
                    required
                  >
                    {userList.map(user => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={10} sm={6}>
                <TextField
                  label="Tags"
                  variant="outlined"
                  fullWidth
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Presiona Enter para agregar tags"
                />
                <div className="tags-container" style={{ marginTop: '16px' }}>
                  {tags.map((tag, index) => (
                    <Chip 
                      key={index}
                      label={tag}
                      onDelete={() => removeTag(index)}
                      className="tag-chip"
                    />
                  ))}
                </div>
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" style={{ marginTop: 16 }}>
                  {isNewItem ? 'Agregar' : 'Actualizar'}
                </Button>
                {item && (
                  <Button
                    variant="contained"
                    color="secondary"
                    style={{ marginLeft: 16, marginTop: 16 }}
                    onClick={handleDelete}
                  >
                    Eliminar
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
        </Grid>
      )}

      {activeTab === TAB_DESIGN && (
        <Grid item xs={12}>
          <Typography variant="h6">Contenido para Diseño</Typography>
          {/* Agrega aquí los campos específicos para la pestaña de Diseño */}
        </Grid>
      )}
      {activeTab === TAB_DEVELOPER && (
        <Grid item xs={12}>
          <Typography variant="h6">Contenido para Desarrollador</Typography>
          {/* Agrega aquí los campos específicos para la pestaña de Desarrollador */}
        </Grid>
      )}
      {activeTab === TAB_TESTING && (
        <Grid item xs={12}>
          <Typography variant="h6">Contenido para Testing</Typography>
          {/* Agrega aquí los campos específicos para la pestaña de Testing */}
        </Grid>
      )}
    </Grid>
      </div>
    </div>
  );
}

export default Form;
