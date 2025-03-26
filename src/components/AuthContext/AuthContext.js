// src/components/AuthContext/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

// Crear el contexto
const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Función para iniciar sesión con LinkedIn
  const loginWithLinkedIn = () => {
    // Obtener las variables de entorno del archivo .env
    const clientId = '780h542vy6ljrw';
    const redirectUri = 'https://roadmap-theta.vercel.app/linkedin/callback';
    const state = 'foobar';
    const scope = 'openid profile w_member_social email';

    // Construir la URL de autorización de LinkedIn con las variables del .env
    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

    // Redirigir al usuario a LinkedIn para la autenticación
    window.location.href = linkedInAuthUrl;
  };

  // Función para establecer el estado del usuario autenticado
  const login = (userData) => {
    setUser(userData);
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
  };

  // Proveer los métodos y estado a toda la aplicación
  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithLinkedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para acceder al contexto de autenticación
export const useAuth = () => useContext(AuthContext);
