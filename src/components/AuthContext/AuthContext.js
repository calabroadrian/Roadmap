    import { createContext, useState, useContext } from 'react';

    const AuthContext = createContext();

    export const AuthProvider = ({ children }) => {
        const [user, setUser] = useState(null);
      
        // Función para iniciar sesión (puedes modificarla según tu backend)
        const login = (userData) => {
          // Lógica de autenticación (por ejemplo, enviar datos al servidor y recibir respuesta)
          // Si la autenticación es exitosa, establece el usuario
          setUser(userData);
        };
      
        // Función para cerrar sesión
        const logout = () => {
          // Lógica para cerrar sesión (por ejemplo, eliminar datos de sesión del servidor)
          // Luego, establece el usuario como null
          setUser(null);
          // Eliminar los datos del usuario almacenados en localStorage
          localStorage.removeItem('user');
        };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
    };

    export const useAuth = () => useContext(AuthContext);
