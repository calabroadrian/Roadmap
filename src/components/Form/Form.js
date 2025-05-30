import { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import config from '../../config/config';
import DesignThinkingSidebar from '../DesignThinkingSidebar/DesignThinkingSidebar';

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Chip,
  IconButton,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const CLIENT_EMAIL = config.CLIENT_EMAIL;
const PRIVATE_KEY = config.PRIVATE_KEY;

const TAB_GENERAL = 'General';
const TAB_TESTING = 'Testing';
const TAB_DESIGN = 'Diseño';
const TAB_DEVELOPER = 'Desarrollador';

function Form({ item, onAddItem, onUpdateItem, onDeleteItem, onCloseModal, onRefresh }) {
  const theme = useTheme();
  const [Id, setId] = useState('');
  const [Descripcion, setDescripcion] = useState('');
  const [Estado, setEstado] = useState('');
  const [Titulo, setTitulo] = useState('');
  const [UsuarioAsignado, setUsuarioAsignado] = useState('');
  const [Sprint, setSprint] = useState('');
  const [Prioridad, setPrioridad] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [userList, setUserList] = useState([]);
  const [priorityList, setPriorityList] = useState([]);
  const [sprintList, setSprintList] = useState([]);
  const [isNewItem, setIsNewItem] = useState(true);
  const [showIdExistsError, setShowIdExistsError] = useState(false);
  const [isIdEditable, setIsIdEditable] = useState(true);
  const [activeTab, setActiveTab] = useState(TAB_GENERAL);

  // Fetch dropdown data
  useEffect(() => {
    const fetchLists = async () => {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({ client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY });
      await doc.loadInfo();
      const usersRows = await doc.sheetsByIndex[1].getRows();
      const sprintsRows = await doc.sheetsByIndex[2].getRows();
      setUserList(usersRows.map(r => r.NombreUsuario));
      setPriorityList(usersRows.map(r => r.Prioridad));
      setSprintList(sprintsRows.map(r => r.Nombre));
    };
    fetchLists();
  }, []);

  // Load existing item
  useEffect(() => {
    if (item) {
      setId(item.Id);
      setDescripcion(item.Descripcion);
      setEstado(item.Estado);
      setTitulo(item.Titulo);
      setUsuarioAsignado(item.UsuarioAsignado);
      setTags(item.Tags.split(',').map(t => t.trim()).filter(Boolean));
      setPrioridad(item.Prioridad);
      setSprint(item.Sprint);
      setIsNewItem(false);
      setIsIdEditable(false);
    } else {
      setId(''); setDescripcion(''); setEstado(''); setTitulo(''); setUsuarioAsignado(''); setTags([]);
      setPrioridad(''); setSprint(''); setIsNewItem(true); setIsIdEditable(true);
    }
  }, [item]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!Id || !Titulo || !Descripcion || !Estado || !Prioridad) return;

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth({ client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    if (isNewItem) {
      const rows = await sheet.getRows();
      if (rows.some(row => row.Id === Id)) {
        setShowIdExistsError(true);
        return;
      }
      setShowIdExistsError(false);

      // Add new row
      const newRow = await sheet.addRow({
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
        Id: newRow.Id,
        Descripcion: newRow.Descripcion,
        Estado: newRow.Estado,
        Titulo: newRow.Titulo,
        Tags: newRow.Tags,
        UsuarioAsignado: newRow.UsuarioAsignado,
        Prioridad: newRow.Prioridad,
        Sprint: newRow.Sprint,
      });
    } else {
      const rows = await sheet.getRows();
      const rowToUpdate = rows.find(row => row.Id === item.Id);
      if (!rowToUpdate) return;

      // Update fields
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
    onRefresh();
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (tagInput.trim()) {
        setTags([...tags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };
  const removeTag = idx => setTags(tags.filter((_, i) => i !== idx));

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 700, p: 4, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6'>{isNewItem ? 'Agregar tarea' : 'Editar tarea'}</Typography>
          <IconButton onClick={onCloseModal}><CloseIcon /></IconButton>
        </Box>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant='fullWidth' textColor='primary' indicatorColor='primary' sx={{ mb: 3 }}>
          {[TAB_GENERAL, TAB_DESIGN, TAB_DEVELOPER, TAB_TESTING].map(tab => (
            <Tab key={tab} label={tab} value={tab} sx={{ fontWeight: 600 }} />
          ))}
        </Tabs>

        {activeTab === TAB_GENERAL && (
          <Box component='form' onSubmit={handleSubmit} sx={{ p: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField size='small' label='ID' value={Id} onChange={e => setId(e.target.value)} fullWidth disabled={!isIdEditable} error={showIdExistsError} sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1 }} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField size='small' label='Título' value={Titulo} onChange={e => setTitulo(e.target.value)} fullWidth sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1 }} required />
              </Grid>
              <Grid item xs={12}>
                <Typography sx={{ mb: 1 }}>Descripción</Typography>
                <Paper variant='outlined' sx={{ mb: 2, p: 1, borderRadius: 1 }}>
                  <ReactQuill value={Descripcion} onChange={setDescripcion} theme='snow' />
                </Paper>
              </Grid>
              {[
                { label: 'Estado', value: Estado, set: setEstado, options: ['Pendiente', 'En Progreso', 'Completado'] },
                { label: 'Prioridad', value: Prioridad, set: setPrioridad, options: priorityList },
                { label: 'Sprint', value: Sprint, set: setSprint, options: sprintList },
                { label: 'Usuario Asignado', value: UsuarioAsignado, set: setUsuarioAsignado, options: userList }
              ].map(({ label, value, set, options }) => (
                <Grid item xs={12} sm={6} key={label}>
                  <FormControl fullWidth size='small' sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1 }}>
                    <InputLabel>{label}</InputLabel>
                    <Select value={value} label={label} onChange={e => set(e.target.value)} required>
                      {options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <TextField size='small' label='Tags' placeholder='Enter to add' value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} fullWidth sx={{ bgcolor: theme.palette.background.paper, borderRadius: 1 }} />
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', '& .MuiChip-root': { m: 0.5 } }}>
                  {tags.map((tag, i) => <Chip key={i} label={tag} onDelete={() => removeTag(i)} size='small' />)}
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant='outlined' onClick={onCloseModal} size='small' disableElevation>Cancelar</Button>
                <Button variant='contained' type='submit' size='small' disableElevation>{isNewItem ? 'Agregar' : 'Actualizar'}</Button>
                {!isNewItem && <Button color='error' onClick={onDeleteItem} size='small' disableElevation>Eliminar</Button>}
              </Grid>
            </Grid>
          </Box>
        )}
        {activeTab === TAB_DESIGN && <DesignThinkingSidebar taskId={Id} />}
        {activeTab === TAB_DEVELOPER && <Typography>Sección Desarrollador</Typography>}
        {activeTab === TAB_TESTING && <Typography>Sección Testing</Typography>}
      </Paper>
    </Box>
  );
}

export default Form;