const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Importa el paquete cors

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? 'https://roadflow.netlify.app'
    : 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions)); // Usa la configuración de CORS

// Ruta para manejar la callback de LinkedIn
app.get('/linkedin/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  try {
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: process.env.REACT_APP_LINKEDIN_REDIRECT_URI, // Cambia esto por tu URI
        client_id: '780h542vy6ljrw', // Tu Client ID
        client_secret: 'acXNvf8Kjak9ya3L', // Tu Client Secret
      },
    });

    const accessToken = response.data.access_token;
    // Aquí puedes hacer lo que necesites con el accessToken
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: 'Error exchanging authorization code for access token' });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
