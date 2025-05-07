import React, { useState } from 'react';
import { Container, Typography, Box, Avatar, Fade, useTheme, Button, CircularProgress, Backdrop, IconButton } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useAuth } from '../AuthContext/AuthContext';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Login = ({ toggleColorMode }) => {
  const { loginWithLinkedIn } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleLinkedInLogin = async () => {
    setLoading(true);
    try {
      await loginWithLinkedIn();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        color: 'text.primary',
        position: 'relative',
        p: 2,
      }}
    >
      {/* Theme toggle button */}
      <IconButton
        onClick={toggleColorMode}
        sx={{ position: 'absolute', top: 16, right: 16 }}
      >
        {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>

      <Fade in timeout={800}>
        <Container maxWidth="xs">
          <Box
            sx={{
              position: 'relative',
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(8px)',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
              boxShadow: theme.shadows[3],
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              transition: 'background-color 0.3s ease',
            }}
          >
            {/* Subtle floating effect */}
            <Box
              sx={{
                position: 'absolute',
                top: '-20px',
                width: 80,
                height: 4,
                bgcolor: 'primary.main',
                borderRadius: 2,
                opacity: 0.7,
                transform: 'rotate(15deg)',
              }}
            />

            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
              <LinkedInIcon fontSize="large" />
            </Avatar>

            <Typography variant="h5" component="h1" fontWeight={600}>
              roadDOmap
            </Typography>

            <Typography variant="body2" sx={{ maxWidth: 240 }}>
              Sign in with LinkedIn to continue exploring insights.
            </Typography>

            <Button
              variant="contained"
              startIcon={<LinkedInIcon />}
              onClick={handleLinkedInLogin}
              disabled={loading}
              sx={{
                textTransform: 'none',
                px: 4,
                py: 1.5,
                fontWeight: 500,
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Continue with LinkedIn'}
            </Button>
          </Box>
        </Container>
      </Fade>
    </Box>
  );
};

export default Login;
