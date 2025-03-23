import React from 'react';
import { Button, Container, Typography, Box } from '@mui/material';
import { useAuth } from '../AuthContext/AuthContext';
import LinkedInLoginButton from '../LinkedInLoginButton/LinkedInLoginButton'; // Botón personalizado de LinkedIn

const Login = () => {
  const { loginWithLinkedIn } = useAuth(); // Mantén solo loginWithLinkedIn para la autenticación

  const handleLinkedInLogin = () => {
    loginWithLinkedIn();
  };

  return (
    <Box
      sx={{
        height: '100vh', // Ocupa todo el alto de la pantalla
        display: 'flex',  // Usa flexbox
        justifyContent: 'center', // Centra horizontalmente
        alignItems: 'center', // Centra verticalmente
      }}
    >
      <Container maxWidth="xs">
        <Box 
          sx={{
            boxShadow: 3,
            p: 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
            Welcome to roadDOmap
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            Please login with your LinkedIn account to continue.
          </Typography>

          {/* Botón de autenticación con LinkedIn */}
          <LinkedInLoginButton onClick={handleLinkedInLogin} style={{ marginBottom: '20px' }} />


        </Box>
      </Container>
    </Box>
  );
};

export default Login;
