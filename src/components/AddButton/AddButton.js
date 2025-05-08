import React from 'react';
import styled from 'styled-components';

const Button = styled.button`
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 10px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 5px;
`;

const AddButton = ({ onClick }) => {
  return (
    <Button onClick={onClick}>Agrega</Button>
  );
};

export default AddButton;
