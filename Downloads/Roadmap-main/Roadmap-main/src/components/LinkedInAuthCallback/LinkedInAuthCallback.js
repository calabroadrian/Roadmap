import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importamos useNavigate

const LinkedInAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state === 'foobar') {
      // Realiza la solicitud para obtener el token de acceso desde tu servidor
      fetchAccessToken(code, state);
    }
  }, [location]);

  const fetchAccessToken = async (code, state) => {
    try {
      const response = await fetch(`http://localhost:3001/linkedin/callback?code=${code}&state=${state}`, {
        method: 'GET',  // Cambia esto a 'GET'
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }

      const data = await response.json();
      console.log('Access token:', data.accessToken);
      // Aquí puedes almacenar el token y realizar más acciones
      localStorage.setItem('user', data.accessToken);
      // Redirige al usuario a la pantalla principal o dashboard
      navigate('/');
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  };



  return (
    <div>
      <h2>Autenticando...</h2>
    </div>
  );
};

export default LinkedInAuthCallback;
