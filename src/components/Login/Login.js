import React from 'react';
import { ReactComponent as FaceSvg } from './Login.svg'; // Use ReactComponent here
import './Login.css'; // Importa el CSS que definimos anteriormente
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { sha256 } from 'js-sha256'; // Importa la librería para el hash SHA-256

const SPREADSHEET_ID = '1FLc7zZF5jLw_yZv6QU-3T-2yxmFyfxgueqr6GMTJPuc';
const CLIENT_EMAIL = 'prueba-sheet@test-agent-assist-351420.iam.gserviceaccount.com';
const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCSJdebGa6rEI/Z\nnbX2nbbUXgun9Q8UOs88Rqetl6D03sBxFITnM57karPgWKaeUxpH2RU4HpEYLadg\npdnVPgKcAQ1Cb1P4f8uv3Anj6JqmFIwNTq1tVuF/jCHoBnI+AqcFrTH7c83awcmu\nfyXyBIi7xZ1epsz9bymjWoCfVmAhxEABIhSzf54d77xPTDOFssTl6lo+ijjTvEX5\nozM8W4FGAAIIhr7rxSYwFtBt4lTKw0YBG3TNuyKOJjxoeCWnWp2X7n6t5W8d0brN\n5xb68MY+hwqjOEItliDXVf3/TDQNGKZR6bKF64DHeMuoAIsPyPp0y/2tsRTQzBAw\n+OINuyCtAgMBAAECggEAAlhURJNDASXaTQwHCgPqAFqES4e23CSnw8hAHgdfaDZ1\nIOC1qOO5kmGKQoNhpGDh0dJ6+5l1S2Lw0IVGFhzGhsbMi0BFOROh4CVCzQhOh54v\nnhy2Uy6687nlpwxdbmnKpiBrO3qWTG2MxShEoq9txeeL7iN1NBbXH0gkkAn0hRjT\nwfGXDopGKiU4p3cmjWEaLk8lQP5vSSlXrvJHTqQRKX4z/eKU+VnHqB8tdNTkMupw\n6htX4pJ/HLw4vmVAAqEW+yiZI3a9Tbat9aQT7XQBccUxDRdQfZyOUfOMnX9yYQ4P\nuuhLMGSsjHgp49wO0dyihuGatCNhFhyrMN2dBWotSQKBgQDC789BeCCOvDi029Kd\n3XzRFYQfpQaIT9UnHfPc7/3DAxbpbyhq29/xiga6EA7nLDWrR6uHE2gCkIwz77co\n2p9VCY32JsHCs7//mEedTsla+s4XtXY2790uTMTR3EVK7m2mxDgZfFVL8lJN975G\nV8r6synGzJoNrfFbNyDltho0iQKBgQC/7ZhJiJVwnbC/lxCoFy7RKlUsLq2tFWja\nLXh10swcdX+MF0/L9B8kpV9za458ajMBBPadeSbLN1u3igT94lAPjOrbpfwcIBEf\nAPL6ynVi1tR7KtqsLLC/dQivue0IxFMglo2lcrTAkwEI+PWZ7D3uBZAOpvfaZ953\nqSEbWqTKBQKBgQCBofQTt4z/HpAfRafUL3xXlpVcbePgNiarcrG/FSGN07oi1jbs\niPdtqro6dX9ToAS4uFqK4w7h1bpGt3z4ABrA9C+hp7hmgB6IHH5TUBd7FxqCjbvl\nYLGXnpmsbWzvHYtxwT8FQ7d9X9H34253XN6wxQBdIaa4vhmo7QpFeEoI8QKBgBEk\nyfuXhbG/hDA48DXzjC0G2QDPUpgpV2pVsXLk13KbVD9RPcF8FuQRGYuXyex3GAM5\nTEYYskxor3qfi36aHoilD717ACALBTx9uzaHqyCfC+/Mjife/hK8A4Ce3PtxffNl\nP1XN/zNMbkU858NOBOIkARAt/em2aXrK0rg8yod5AoGAO0BT7XCpMAeU5k4ELsON\nier5IyjYWWkSr6S3Ut82mo4V7qvI1YFgJFpQ/qG/ayY+2w/ybyPXf7LjwitXUaka\nyuQiJ8TMnKvVKB//nyJu9RNeDe0VvWOfjPFzsiFHs7UDfNCNKldu4Mdoamp3Dn1m\nWH4ubYBRXKIBLniMaIOYQss=\n-----END PRIVATE KEY-----\n';
const Login = ({ onLogin }) => {
    // Variables de estado para almacenar los datos del formulario
    const [resetPasswordError, setResetPasswordError] = React.useState('')
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [resetPassword, setResetPassword] = React.useState(false); // Estado para controlar si se está reseteando la contraseña
    const [newPassword, setNewPassword] = React.useState(''); // Estado para almacenar la nueva contraseña
    // Variable de estado para indicar si la contraseña se restableció con éxito
    const [passwordReset, setPasswordReset] = React.useState(false);
    // Variable de estado para controlar el mensaje de error
    const [loginError, setLoginError] = React.useState('');
  
    // Función para manejar el envío del formulario de inicio de sesión
    const handleSubmit = async (e) => {
      e.preventDefault();

      setLoginError('');
      setPasswordReset(false);
      setResetPasswordError('');
  
      if (resetPassword) {
        // Restablecer contraseña
        await resetUserPassword();
      } else {
        // Autenticación normal
        const loginData = await fetchLoginData();
        if (loginData) {
          const { NombreUsuario, ClaveUsuarioHash } = loginData;
          const enteredPasswordHash = sha256(password);
          if (username === NombreUsuario && enteredPasswordHash === ClaveUsuarioHash) {
            // Autenticación exitosa
            onLogin({ username });
          } else {
            // Autenticación fallida - Mostrar mensaje de error
            setLoginError('Credenciales incorrectas. Por favor, verifique su nombre de usuario y contraseña.');
          }
        } else {
          // Error al obtener los datos de inicio de sesión - Mostrar mensaje de error
          setLoginError('Error al obtener los datos de inicio de sesión. Por favor, intente nuevamente más tarde.');
        }
      }
    };
      
  
    const fetchLoginData = async () => {
      try {
        // Conectarse a la hoja de Google Sheets
        const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
        await doc.useServiceAccountAuth({
          client_email: CLIENT_EMAIL,
          private_key: PRIVATE_KEY,
        });
        await doc.loadInfo();
  
        // Obtener la hoja donde están almacenados los datos de inicio de sesión (suponemos que es la segunda hoja)
        const sheet = doc.sheetsByIndex[1];
        const rows = await sheet.getRows();
  
        // Buscar el usuario ingresado en el formulario
        const userRow = rows.find(row => row.NombreUsuario === username);
  
        // Si se encuentra el usuario, devolver sus datos (incluyendo el hash de la contraseña)
        return userRow
          ? {
              NombreUsuario: userRow.NombreUsuario,
              ClaveUsuarioHash: userRow.ClaveUsuarioHash,
              // Otros datos del usuario si los necesitas
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
      // Aquí se realiza el envío del formulario de restablecimiento de contraseña
      // Verificamos que se haya ingresado una nueva contraseña antes de continuar
      if (!newPassword) {
        console.error('Por favor, ingrese una nueva contraseña.');
        return;
      }
      // Realiza aquí la lógica para restablecer la contraseña
      await resetUserPassword();
    };
  
    const resetUserPassword = async () => {
        // Hasheamos la nueva contraseña antes de guardarla en el sheet
        const hashedPassword = sha256(newPassword);
      
        try {
          // Conectarse a la hoja de Google Sheets
          const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
          await doc.useServiceAccountAuth({
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
          });
          await doc.loadInfo();
      
          // Obtener la hoja donde están almacenados los datos de inicio de sesión (suponemos que es la segunda hoja)
          const sheet = doc.sheetsByIndex[1];
          const rows = await sheet.getRows();
      
          // Buscar el usuario ingresado en el formulario
          const userRow = rows.find((row) => row.NombreUsuario === username);
      
          if (userRow) {
            userRow.ClaveUsuarioHash = hashedPassword;
            await userRow.save();
            console.log('Contraseña restablecida exitosamente.');
            // Establece la variable de estado para indicar que la contraseña se restableció con éxito
            setPasswordReset(true);
          } else {
            console.error('Usuario no encontrado.');
            setResetPasswordError('Usuario no encontrado. Por favor, verifique su nombre de usuario.');

          }
        } catch (error) {
          console.error('Error al restablecer la contraseña:', error);
        }
      };
      
      
  
      return (
        <div className="login-container">
          <div className="login-logo">
            {/* Usamos el SVG aquí */}
            <FaceSvg />
            <h2>Roadmap DO</h2>
          </div>
          <div className="login-form">
            <h2>Iniciar Sesión</h2>
            {resetPassword ? (
              // Mostrar formulario de restablecimiento de contraseña
              <form onSubmit={handleResetPasswordSubmit}>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Nueva Contraseña" // Agregamos un input para la nueva contraseña
                  value={newPassword} // Usamos el estado newPassword
                  onChange={(e) => setNewPassword(e.target.value)} // Manejamos el cambio de la nueva contraseña
                />
                <button type="submit">Restablecer Contraseña</button>
                <button type="button" onClick={() => setResetPassword(false)}>Volver al inicio de sesión</button>
                {/* Mostrar mensaje de error para el restablecimiento de contraseña */}
            {resetPasswordError && <div className="error-message">{resetPasswordError}</div>}
              </form>
            ) : (
              // Mostrar formulario de inicio de sesión normal
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Iniciar Sesión</button>
                <button type="button" onClick={() => setResetPassword(true)}>Olvidé mi contraseña</button>
              </form>
            )}
                    {/* Mostrar mensaje de error */}
        {loginError && <div className="error-message">{loginError}</div>}
            {/* Si la contraseña se restableció con éxito, mostrar mensaje de éxito y volver al inicio de sesión */}
            {passwordReset && (
              <div>
                <p>Contraseña restablecida exitosamente.</p>
              </div>
            )}
            
          </div>
        </div>
      );
  };
  
  export default Login;