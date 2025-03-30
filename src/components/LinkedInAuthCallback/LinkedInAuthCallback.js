import React, { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LinkedInAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

  const fetchAccessToken = useCallback(async (code, state) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/linkedin/callback?code=${code}&state=${state}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }

      const data = await response.json();
      console.log('Access token:', data.accessToken);
      localStorage.setItem('user', data.accessToken);
      navigate('/');
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  }, [API_BASE_URL, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state === 'foobar') {
      fetchAccessToken(code, state);
    }
  }, [location, fetchAccessToken]);

  return (
    <div>
      <h2>Autenticando...</h2>
    </div>
  );
};

export default LinkedInAuthCallback;
