// src/App.js
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Reemplaza Switch por Routes
import { AuthProvider, useAuth } from './components/AuthContext/AuthContext';
import Login from './components/Login/Login';
import LinkedInAuthCallback from './components/LinkedInAuthCallback/LinkedInAuthCallback';
import Modal from './components/Modal/Modal';
import SprintForm from './components/SprintForm/SprintForm';
import RoadmapContainer from './components/RoadmapContainer/RoadmapContainer';
import './App.css';

function App() {
  const { user, login, logout, loginWithLinkedIn } = useAuth();
  const [isSprintFormOpen, setIsSprintFormOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('user'); // Busca el token en localStorage
    if (token) {
      // Aquí podrías realizar alguna validación adicional o simplemente loguear
      login(token); // Inicia sesión con el token
    }
  }, [login]);
  

  useEffect(() => {
    if (user && user.accessToken) {
      localStorage.setItem('accessToken', user.accessToken); // Guarda el accessToken
    } else {
      localStorage.removeItem('user'); // Elimina el accessToken si no hay usuario
    }
  }, [user]);
  

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  if (!user) {
    return <Login onLogin={loginWithLinkedIn} />;
  }


  const handleOpenSprintForm = () => {
    setIsSprintFormOpen(true);
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
        <button className="app-add-button" onClick={handleOpenSprintForm}>
          Sprint
        </button>
      </div>

      <RoadmapContainer/>
      
      {isSprintFormOpen && (
        <Modal isOpen={isSprintFormOpen} onClose={() => setIsSprintFormOpen(false)}>
          <SprintForm onCloseModal={() => setIsSprintFormOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

// Cambia Switch por Routes y ajusta las rutas
const AppWithAuthProvider = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/linkedin/callback" element={<LinkedInAuthCallback />} />
        <Route path="/" element={<App />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default AppWithAuthProvider;