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
  useTheme,
  Avatar,
  Slide
} from '@mui/material';
import { Add, Logout } from '@mui/icons-material';
import { AuthProvider, useAuth } from './components/AuthContext/AuthContext';
import Login from './components/Login/Login';
import LinkedInAuthCallback from './components/LinkedInAuthCallback/LinkedInAuthCallback';
import Modal from './components/Modal/Modal';
import SprintForm from './components/SprintForm/SprintForm';
import RoadmapContainer from './components/RoadmapContainer/RoadmapContainer';

function App() {
  const { user, login, logout, loginWithLinkedIn } = useAuth();
  const theme = useTheme();
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
      <AppBar
        position="static"
        sx={{
          bgcolor: theme.palette.background.paper,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>RD</Avatar>
            <Typography variant="h6" fontWeight={600}>
              roadDOmap
            </Typography>
          </Box>
          <IconButton onClick={handleLogout} sx={{ p: 1 }}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ flexGrow: 1, py: 3, overflow: 'auto' }}>
        <RoadmapContainer />
      </Container>

      <Slide direction="up" in mountOnEnter unmountOnExit>
        <Fab
          color="primary"
          aria-label="add sprint"
          onClick={() => setIsSprintFormOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
        >
          <Add />
        </Fab>
      </Slide>

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