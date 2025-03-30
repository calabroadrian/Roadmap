// src/App.js
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext/AuthContext';
import Login from './components/Login/Login';
import LinkedInAuthCallback from './components/LinkedInAuthCallback/LinkedInAuthCallback';
import RoadmapDataSheet from './components/Roadmap/RoadmapDataSheet';
import Modal from './components/Modal/Modal';
import Form from './components/Form/Form';
import SprintForm from './components/SprintForm/SprintForm';
import './App.css';

function App() {
  const { user, login, logout, loginWithLinkedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSprintFormOpen, setIsSprintFormOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  // Estado para refrescar el roadmap
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('user');
    if (token) {
      login(token);
    }
  }, [login]);

  useEffect(() => {
    if (user && user.accessToken) {
      localStorage.setItem('accessToken', user.accessToken);
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

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

  // Función para refrescar el roadmap (se incrementa refreshTrigger)
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return <Login onLogin={loginWithLinkedIn} />;
  }

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

      {/* Se pasa refreshTrigger para que RoadmapDataSheet refresque la data al cambiar */}
      <RoadmapDataSheet
        items={items}
        onSelectItem={handleSelectItem}
        onDeselectItem={handleDeselectItem}
        onEditItem={handleSelectItem}
        refreshTrigger={refreshTrigger}
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
          onRefresh={handleRefresh}  {/* Llama a la función para refrescar el roadmap */}
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

const AppWithAuthProvider = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/linkedin/callback" element={<LinkedInAuthCallback />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default AppWithAuthProvider;
