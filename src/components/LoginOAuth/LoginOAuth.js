import React, { useEffect } from 'react';
import { initializeGoogleSignIn } from './googleOAuth';

const LoginOAuth = () => {
  const onSuccessGoogleSignIn = (googleUser) => {
    // Handle successful Google OAuth sign-in
    console.log('Google user:', googleUser);
  };

  const onFailureGoogleSignIn = (error) => {
    // Handle Google OAuth sign-in failure
    console.error('Google sign-in failed:', error);
  };

  useEffect(() => {
    initializeGoogleSignIn(
      'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google client ID
      onSuccessGoogleSignIn,
      onFailureGoogleSignIn
    );
  }, []);

  return (
    <div className="login-container">
      {/* Other JSX elements */}
      <button id="google-signin-button">Iniciar Sesión con Google</button>
      {/* Other JSX elements */}
    </div>
  );
};

export default LoginOAuth;
