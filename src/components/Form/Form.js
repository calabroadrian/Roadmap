import React, { useState, useEffect } from 'react';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import config from '../../config/config';
import DesignThinkingSidebar from '../DesignThinkingSidebar/DesignThinkingSidebar';
import {
  Box,
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
  Paper,
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

const Form = ({ item, onAddItem, onDeselectItem, onUpdateItem, onDeleteItem, onCloseModal, onRefresh }) => {
  const theme = useTheme();
  const [formState, setFormState] = useState({
    Id: '',
    Titulo: '',
    Descripcion: '',
    Estado: '',
    Prioridad: '',
    Sprint: '',
    UsuarioAsignado: ''
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [lists, setLists] = useState({ users: [], priorities: [], sprints: [] });
  const [isNew, setIsNew] = useState(true);
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_GENERAL);

  // Fetch dropdown lists
  useEffect(() => {
    (async () => {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({ client_email: CLIENT_EMAIL, private_key: PRIVATE_KEY });
      await doc.loadInfo();
      const [sheetUsers, , sheetSprints] = doc.sheetsByIndex;
      const [usersRows] = await Promise.all([
        sheetUsers.getRows(),
        sheetUsers.getRows()
      ]);
      setLists(lists => ({
        ...lists,
        users: usersRows.map(r => r.NombreUsuario),
        priorities: usersRows.map(r => r.Prioridad),
        sprints: sheetSprints.getRows().then(rows => rows.map(r => r.Nombre))
      }));
    })();
  }, []);

  // Load item into form
  useEffect(() => {
    if (item) {
      const { Id, Titulo, Descripcion, Estado, Prioridad, Sprint, UsuarioAsignado, Tags } = item;
      setFormState({ Id, Titulo, Descripcion, Estado, Prioridad, Sprint, UsuarioAsignado });
      setTags(Tags?.split(',').map(t => t.trim()) || []);
      setIsNew(false);
    }
  }, [item]);

  const handleChange = e => setFormState({ ...formState, [e.target.name]: e.target.value });
  const handleTagKey = e => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = idx => setTags(tags.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    const { Id, Titulo, Descripcion, Estado, Prioridad } = formState;
    if (!Id || !Titulo || !Descripcion || !Estado || !Prioridad) {
      setShowError(true);
      return;
    }
    // ... perform Google Sheets add/update logic here ...
    onCloseModal();
    onRefresh();
  };

  const panels = {
    [TAB_GENERAL]: (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {['Id', 'Titulo'].map(field => (
            <Grid item xs={12} sm={6} key={field}>
              <TextField
                label={field}
                name={field}
                value={formState[field]}
                onChange={handleChange}
                fullWidth
                required
                error={field === 'Id' && showError && !formState.Id}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Typography sx={{ mb: 1 }}>Descripción</Typography>
            <Paper variant="outlined" sx={{ mb: 2 }}>
              <ReactQuill value={formState.Descripcion} onChange={value => setFormState(s => ({ ...s, Descripcion: value }))} />
            </Paper>
          </Grid>
          {['Estado', 'Prioridad', 'Sprint', 'UsuarioAsignado'].map((field, idx) => (
            <Grid item xs={12} sm={6} key={field}>
              <FormControl fullWidth>
                <InputLabel>{field}</InputLabel>
                <Select
                  name={field}
                  value={formState[field]}
                  label={field}
                  onChange={handleChange}
                  required
                >
                  {lists[field.toLowerCase()]?.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Tags"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="Enter to add"
              fullWidth
            />
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag, i) => (
                <Chip key={i} label={tag} onDelete={() => removeTag(i)} size="small" />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={onCloseModal}>Cancelar</Button>
            <Button type="submit" variant="contained">{isNew ? 'Agregar' : 'Actualizar'}</Button>
            {!isNew && <Button color="error" onClick={onDeleteItem}>Eliminar</Button>}
          </Grid>
        </Grid>
      </Box>
    ),
    [TAB_DESIGN]: (<DesignThinkingSidebar taskId={formState.Id} />),
    [TAB_DEVELOPER]: (<Typography>Cursos Desarrollador</Typography>),
    [TAB_TESTING]: (<Typography>Cursos Testing</Typography>)
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 800, p: 3, borderRadius: 2, position: 'relative' }}>
        <IconButton onClick={onCloseModal} sx={{ position: 'absolute', top: 8, right: 8 }}> <CloseIcon /> </IconButton>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} textColor="primary" indicatorColor="primary">
          {[TAB_GENERAL, TAB_DESIGN, TAB_DEVELOPER, TAB_TESTING].map(tab => <Tab key={tab} label={tab} value={tab} />)}
        </Tabs>
        {panels[activeTab]}
      </Paper>
    </Box>
  );
};

export default Form;
