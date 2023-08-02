import { useState, useEffect } from 'react';
import { AuthProvider } from './components/AuthContext/AuthContext'; // Importa el AuthProvider
import { useAuth } from './components/AuthContext/AuthContext';
import Login from './components/Login/Login';
import RoadmapDataSheet from './components/Roadmap/RoadmapDataSheet';
import Form from './components/Form/Form';
import Modal from './components/Modal/Modal';
import SprintForm from './components/SprintForm/SprintForm';
import './App.css';
import config from './config/config';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const API_KEY = config.API_KEY;
const CLIENT_ID = config.CLIENT_ID;

function App() {
  const { user, login, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSprintFormOpen, setIsSprintFormOpen] = useState(false);
  const [statuses, setStatuses] = useState([]); // Agrega la declaración de statuses
  const [sprints, setSprints] = useState([]); // Agrega la declaración de sprints

  useEffect(() => {
    console.log('fetchData al montar el componente');
  }, []); // Llamar fetchData al montar el componente

 
  const handleAddItem = () => {
    setIsAddingItem(true);
    setSelectedItem(null);
    setIsModalOpen(true);
    console.log('fetchData al montar el componente');
  };


  const handleSelectItem = (item) => {
    setIsAddingItem(false);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeselectItem = () => {
    setSelectedItem(null);
  };

  const handleUpdateItem = (updatedItem) => {
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(updatedItems);
  };

  const handleDeleteItem = (itemToDelete) => {
    const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
    setItems(updatedItems);
  };

  const handleOpenSprintForm = () => {
    setIsSprintFormOpen(true);
  };

    const handleUpdateList = (updatedItem) => {
      console.log('handleUpdateList called');
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(updatedItems);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">roadDOmap</h1>
        {/* Agregar la funcionalidad de inicio de sesión aquí */}
        {user ? (
          <button className="app-add-button" onClick={logout}>
            Cerrar sesión
          </button>
        ) : (
          <button className="app-add-button" onClick={() => login({ /* Datos de inicio de sesión */ })}>
            Iniciar sesión
          </button>
        )}
      </header>

      <div className="functions-container">
      <button className="app-add-button" onClick={handleAddItem}>
          Agregar
        </button>
        <button className="app-add-button" onClick={handleOpenSprintForm}>
          Sprint
        </button>
          </div>

      <RoadmapDataSheet
        items={items}
        statuses={statuses} // Pasa las variables statuses como propiedad
        sprints={sprints} // Pasa las variables sprints como propiedad
        onSelectItem={handleSelectItem}
        onDeselectItem={handleDeselectItem}
        onEditItem={handleSelectItem}
        setStatuses={setStatuses}
        setSprints={setSprints}
      />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form
          item={selectedItem}
          onAddItem={handleAddItem}
          onDeselectItem={handleDeselectItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onCloseModal={() => setIsModalOpen(false)}
          isAddingItem={isAddingItem}
          onUpdateList={handleUpdateList}
        />
      </Modal >
      {isSprintFormOpen && (
        <Modal isOpen={isSprintFormOpen} onClose={() => setIsSprintFormOpen(false)}>
          <SprintForm onCloseModal={() => setIsSprintFormOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

// Envuelve el componente App con el AuthProvider
const AppWithAuthProvider = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithAuthProvider;
