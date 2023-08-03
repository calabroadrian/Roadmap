import React from 'react';
import { ReactComponent as FaceSvg } from './Login.svg';
import './Login.css';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { sha256 } from 'js-sha256';
import config from '../../config/config';

const SPREADSHEET_ID = config.SPREADSHEET_ID;
const CLIENT_EMAIL = config.CLIENT_EMAIL;
const PRIVATE_KEY = config.PRIVATE_KEY;

const Login = ({ onLogin }) => {
  const [resetPasswordError, setResetPasswordError] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [resetPassword, setResetPassword] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [passwordReset, setPasswordReset] = React.useState(false);
  const [loginError, setLoginError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setPasswordReset(false);
    setResetPasswordError('');

    if (resetPassword) {
      await resetUserPassword();
    } else {
      const loginData = await fetchLoginData();
      if (loginData) {
        const { NombreUsuario, ClaveUsuarioHash } = loginData;
        const enteredPasswordHash = sha256(password);
        if (username === NombreUsuario && enteredPasswordHash === ClaveUsuarioHash) {
          onLogin({ username });
        } else {
          setLoginError('Credenciales incorrectas. Por favor, verifique su nombre de usuario y contraseña.');
        }
      } else {
        setLoginError('Error al obtener los datos de inicio de sesión. Por favor, intente nuevamente más tarde.');
      }
    }
  };

  const fetchLoginData = async () => {
    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[1];
      const rows = await sheet.getRows();
      const userRow = rows.find((row) => row.NombreUsuario === username);

      return userRow
        ? {
            NombreUsuario: userRow.NombreUsuario,
            ClaveUsuarioHash: userRow.ClaveUsuarioHash,
          }
        : null;
    } catch (error) {
      console.error('Error al obtener los datos de inicio de sesión:', error);
      return null;
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setPasswordReset(false);

    if (!newPassword) {
      console.error('Por favor, ingrese una nueva contraseña.');
      return;
    }

    await resetUserPassword();
  };

  const resetUserPassword = async () => {
    const hashedPassword = sha256(newPassword);

    try {
      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({
        client_email: CLIENT_EMAIL,
        private_key: PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsByIndex[1];
      const rows = await sheet.getRows();
      const userRow = rows.find((row) => row.NombreUsuario === username);

      if (userRow) {
        userRow.ClaveUsuarioHash = hashedPassword;
        await userRow.save();
        console.log('Contraseña restablecida exitosamente.');
        setPasswordReset(true);
      } else {
        console.error('Usuario no encontrado.');
        setResetPasswordError('Usuario no encontrado. Por favor, verifique su nombre de usuario.');
      }
    } catch (error) {
      console.error('Error al restablecer la contraseña:', error);
    }
  };

  const handleLogout = () => {
    // Lógica para cerrar sesión y redirigir al usuario a la pantalla de inicio de sesión
    // Aquí puedes agregar cualquier lógica adicional necesaria, como eliminar tokens de sesión o cookies, etc.
    setLoginError('');
    setPasswordReset(false);
    setResetPasswordError('');
    setUsername('');
    setPassword('');
    setResetPassword(false);
    setNewPassword('');
    onLogin(null); // Llama a la función onLogin con null para cerrar sesión
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <FaceSvg />
        <h2>roadDOmap</h2>
      </div>
      <div className="login-form">
        <h2>Iniciar Sesión</h2>
        {resetPassword ? (
          <form onSubmit={handleResetPasswordSubmit}>
            {/* Resto del código para el formulario de restablecimiento de contraseña */}
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Resto del código para el formulario de inicio de sesión normal */}
          </form>
        )}
        {/* Mostrar mensajes de error y éxito */}
      </div>
    </div>
  );
};

export default Login;
