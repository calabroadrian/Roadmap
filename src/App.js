import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext/AuthContext'; // Importa el AuthProvider y useAuth
import Login from './components/Login/Login';
import RoadmapDataSheet from './components/Roadmap/RoadmapDataSheet';
import Form from './components/Form/Form';
import Modal from './components/Modal/Modal';
import SprintForm from './components/SprintForm/SprintForm';
import './App.css';

function App() {
  const { user, login, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSprintFormOpen, setIsSprintFormOpen] = useState(false);

  // Utilizamos useEffect para cargar los datos del usuario desde LocalStorage al iniciar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      login(parsedUser); // Establecemos el usuario almacenado en el contexto de autenticación
    }
  }, [login]); // Ejecutamos este efecto solo cuando la función de login cambia

  // Utilizamos useEffect para almacenar los datos del usuario en LocalStorage al cambiar el estado del usuario
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]); // Ejecutamos este efecto solo cuando el estado del usuario cambia

  const handleAddItem = () => {
    setIsAddingItem(true);
    setSelectedItem(null);
    setIsModalOpen(true);
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

  if (!user) {
    return <Login onLogin={login} />;
  }

    // Función para cerrar sesión
    const handleLogout = () => {
      logout(); // Llamamos a la función logout del contexto de autenticación
    };
  

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">roadDOmap</h1>
        <button className="app-add-button" onClick={handleLogout}>
          Cerrar sesión
        </button>
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
        onSelectItem={handleSelectItem}
        onDeselectItem={handleDeselectItem}
        onEditItem={handleSelectItem}
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
        />
      </Modal>
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
