  import { useState, useEffect } from 'react';
  import './Form.css';
  import { GoogleSpreadsheet } from 'google-spreadsheet';
  import ReactQuill from 'react-quill';
  import 'react-quill/dist/quill.snow.css';
  import config from '../../config/config';
  
  const SPREADSHEET_ID = config.SPREADSHEET_ID;
  const CLIENT_EMAIL = config.CLIENT_EMAIL;
  const PRIVATE_KEY = config.PRIVATE_KEY;
  const API_KEY = config.API_KEY;
  const CLIENT_ID = config.CLIENT_ID;
  
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
        const sheet = doc.sheetsByIndex[2]; // Suponiendo que el listado de Sprint está en la tercera hoja
        const rows = await sheet.getRows();
        const sprints = rows.map(row => row.Nombre); // Ajusta esto según la estructura de tus datos de sprints
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
  
    // Manejar el envío del formulario
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (Id && !isNewItem) {
        // Actualizar el elemento existente
        const updatedItem = {
          Id,
          Descripcion,
          Estado,
          Titulo,
          UsuarioAsignado,
          Tags: tags.join(', '),
          Prioridad,
          Sprint,
        };
        onUpdateItem(updatedItem);
      } else if (Id && isNewItem) {
        // Agregar un nuevo elemento
        const newItem = {
          Id,
          Descripcion,
          Estado,
          Titulo,
          UsuarioAsignado,
          Tags: tags.join(', '),
          Prioridad,
          Sprint,
        };
        onAddItem(newItem);
      }
    };
  
    // Manejar la eliminación del elemento
    const handleDelete = () => {
      if (item) {
        onDeleteItem(item);
      }
    };
  
    // Manejar el cambio de estado del campo ID
    const handleIdChange = (e) => {
      const newId = e.target.value;
      setId(newId);
      setShowIdExistsError(false); // Ocultar el mensaje de error cuando se cambia el ID
      if (newId !== '') {
        // Verificar si el ID ya existe en la hoja
        checkIdExists(newId);
      }
    };
  
    // Verificar si el ID ya existe en la hoja
    const checkIdExists = async (id) => {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[0]; // Suponiendo que los datos están en la primera hoja
      const rows = await sheet.getRows();
      const idExists = rows.some(row => row.Id === id);
      setIdExists(idExists);
      setShowIdExistsError(idExists);
    };
  
    // Manejar la adición de tags
    const handleTagKeyDown = (e) => {
      if (e.key === 'Enter' && tagInput) {
        setTags([...tags, tagInput]);
        setTagInput('');
      }
    };
  
    // Eliminar un tag
    const removeTag = (index) => {
      const updatedTags = tags.filter((tag, i) => i !== index);
      setTags(updatedTags);
    };
  
    return (
      <div className="form-overlay">
        <div className="form-container">
          <div className="form-header">
            <h2>Agregar nueva tarea</h2>
            <button className="form-close" onClick={onCloseModal}>
              X
            </button>
          </div>
          <div className="form-tabs">
            {/* Agregar botones o enlaces para cada pestaña */}
            <button
              className={activeTab === TAB_GENERAL ? "active" : ""}
              onClick={() => setActiveTab(TAB_GENERAL)}
            >
              General
            </button>
            <button
              className={activeTab === TAB_TESTING ? "active" : ""}
              onClick={() => setActiveTab(TAB_TESTING)}
            >
              Testing
            </button>
            <button
              className={activeTab === TAB_DESIGN ? "active" : ""}
              onClick={() => setActiveTab(TAB_DESIGN)}
            >
              Diseño
            </button>
            <button
              className={activeTab === TAB_DEVELOPER ? "active" : ""}
              onClick={() => setActiveTab(TAB_DEVELOPER)}
            >
              Desarrollador
            </button>
          </div>
          <div className="form-scroll-container">
            {activeTab === TAB_GENERAL && (
              <form onSubmit={handleSubmit}>
                <div className="form-group-1">
                  <div>
                    <label>ID:</label>
                    <input
                      type="text"
                      value={Id}
                      onChange={handleIdChange}
                      required
                      disabled={!isIdEditable}
                      className={!isIdEditable ? 'input-disabled' : ''}
                    />
                    {showIdExistsError && (
                      <p className="form-error">
                        El ID ya existe en la hoja. Por favor, elige otro ID único.
                      </p>
                    )}
                  </div>
                  <div>
                    <label>Título:</label>
                    <input
                      type="text"
                      value={Titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Descripción:</label>
                    <ReactQuill
                      value={Descripcion}
                      onChange={(value) => SetDescripcion(value)}
                      required
                    />
                  </div>
                  <div>
                    <label>Estado:</label>
                    <select
                      value={Estado}
                      onChange={(event) => setEstado(event.target.value)}
                      required
                    >
                      <option value="">Seleccione un estado</option>
                      <option value="Nuevo">Por hacer</option>
                      <option value="En progreso">En progreso</option>
                      <option value="Hecho">Hecho</option>
                    </select>
                  </div>
                  <div>
                    <label>Usuario Asignado:</label>
                    <select
                      value={UsuarioAsignado}
                      onChange={(e) => setUsuarioAsignado(e.target.value)}
                    >
                      <option value="">Seleccione un usuario</option>
                      {userList.map((user) => (
                        <option key={user} value={user}>
                          {user}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Prioridad:</label>
                    <select
                      value={Prioridad}
                      onChange={(e) => setPrioridad(e.target.value)}
                      required
                    >
                      <option value="">Seleccione una prioridad</option>
                      {priorityList.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>Sprint:</label>
                    <select
                      value={Sprint}
                      onChange={(e) => setSprint(e.target.value)}
                    >
                      <option value="">Seleccione un Sprint</option>
                      {sprintList.map((sprint) => (
                        <option key={sprint} value={sprint}>
                          {sprint}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="tag-general">
                    <label>Tags:</label>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />
                  </div>
                </div>
                <div className="tag-container">
                  {tags.map((tag, index) => (
                    <div key={index} className="tag">
                      {tag}
                      <button
                        className="tag-remove"
                        onClick={() => removeTag(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="form-group-2">
                  <button type="submit">Guardar</button>
                  {item && (
                    <button
                      type="button"
                      className="form-delete"
                      onClick={handleDelete}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </form>
            )}
            {activeTab === TAB_TESTING && (
              <form onSubmit={handleSubmit}>
                {/* Campos para la gestión de testing */}
                {/* ... (agrega los campos para la gestión de testing) */}
              </form>
            )}
            {activeTab === TAB_DESIGN && (
              <form onSubmit={handleSubmit}>
                {/* Campos para la gestión del diseño */}
                {/* ... (agrega los campos para la gestión del diseño) */}
              </form>
            )}
            {activeTab === TAB_DEVELOPER && (
              <form onSubmit={handleSubmit}>
                {/* Campos para la gestión del desarrollador */}
                {/* ... (agrega los campos para la gestión del desarrollador) */}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  export default Form;