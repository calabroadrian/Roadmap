import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Fab,
  Container,
  useTheme
} from '@mui/material';
import { Add, Brightness4, Brightness7, Logout } from '@mui/icons-material';
import { AuthProvider, useAuth } from './components/AuthContext/AuthContext';
import Login from './components/Login/Login';
import LinkedInAuthCallback from './components/LinkedInAuthCallback/LinkedInAuthCallback';
import Modal from './components/Modal/Modal';
import SprintForm from './components/SprintForm/SprintForm';
import RoadmapContainer from './components/RoadmapContainer/RoadmapContainer';
import { useColorMode } from './theme/ColorModeContext';

function App() {
  const { user, login, logout, loginWithLinkedIn } = useAuth();
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const [isSprintFormOpen, setIsSprintFormOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('user');
    if (token) login(token);
  }, [login]);

  useEffect(() => {
    if (user?.accessToken) {
      localStorage.setItem('accessToken', user.accessToken);
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  if (!user) {
    return <Login onLogin={loginWithLinkedIn} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(8px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            roadDOmap
          </Typography>
          <Box>
            <IconButton onClick={toggleColorMode} sx={{ mr: 1 }}>
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <IconButton onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ flexGrow: 1, py: 2 }}>
        <RoadmapContainer />
      </Container>

      <Fab
        color="primary"
        aria-label="add sprint"
        onClick={() => setIsSprintFormOpen(true)}
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
      >
        <Add />
      </Fab>

      <Modal isOpen={isSprintFormOpen} onClose={() => setIsSprintFormOpen(false)}>
        <SprintForm onCloseModal={() => setIsSprintFormOpen(false)} />
      </Modal>
    </Box>
  );
}

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
