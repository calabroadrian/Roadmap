import React, { useState } from 'react';
import './LinkedInLoginButton.css'; // Asegúrate de tener este archivo CSS

const LinkedInLoginButton = ({ onClick }) => {
  const [buttonState, setButtonState] = useState('default'); // 'default', 'hover', 'active'

  // Manejar el mouse sobre el botón
  const handleMouseEnter = () => {
    setButtonState('hover');
  };

  const handleMouseLeave = () => {
    setButtonState('default');
  };

  // Manejar el click del botón
  const handleMouseDown = () => {
    setButtonState('active');
  };

  const handleMouseUp = () => {
    setButtonState('hover');
  };

  return (
    <button
      className={`linkedin-login-button ${buttonState}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
    </button>
  );
};

export default LinkedInLoginButton;
