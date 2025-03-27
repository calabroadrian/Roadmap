const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path'); // Importa path para servir archivos estáticos

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
const corsOptions = {
  origin: 'https://roadmap-uo7v.onrender.com', // Permitir solicitudes desde este origen
  methods: ['GET', 'POST'],
  credentials: true,
};
app.use(cors(corsOptions));

// 🔹 Sirve los archivos estáticos del frontend desde la carpeta "build"
app.use(express.static(path.join(__dirname, 'build')));

// Ruta para manejar la callback de LinkedIn
app.get('/linkedin/callback', async (req, res) => {
  const authorizationCode = req.query.code;

  try {
    const response = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
      params: {
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: process.env.REACT_APP_LINKEDIN_REDIRECT_URI,
        client_id: '780h542vy6ljrw',
        client_secret: 'acXNvf8Kjak9ya3L',
      },
    });

    const accessToken = response.data.access_token;
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: 'Error exchanging authorization code for access token' });
  }
});

// 🔹 Para cualquier otra ruta, devolver "index.html" (para React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
