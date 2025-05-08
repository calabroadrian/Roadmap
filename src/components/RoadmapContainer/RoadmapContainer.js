// src/components/RoadmapContainer.js
import React, { useState } from 'react';
import RoadmapDataSheet from '../Roadmap/RoadmapDataSheet';
import Modal from '../Modal/Modal';
import Form from '../Form/Form';
import { Slide, Fab, Box, Tooltip } from '@mui/material';
import { Assignment, Add } from '@mui/icons-material';

function RoadmapContainer({ onAddSprint }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [items, setItems] = useState([]);

  const refreshRoadmap = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleAddItem = () => {
    setIsAddingItem(true);
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleSelectItem = (item) => {
    setIsAddingItem(false);
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeselectItem = () => {
    setSelectedItem(null);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
  };

  const handleDeleteItem = (itemToDelete) => {
    setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
  };

  return (
    <>
      <RoadmapDataSheet
        refreshTrigger={refreshTrigger}
        items={items}
        onSelectItem={handleSelectItem}
        onDeselectItem={handleDeselectItem}
        onEditItem={handleSelectItem}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form
          item={selectedItem}
          onAddItem={handleAddItem}
          onDeselectItem={handleDeselectItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onCloseModal={() => setIsModalOpen(false)}
          isAddingItem={isAddingItem}
          onRefresh={refreshRoadmap}
        />
      </Modal>

      {/* Botones flotantes: Crear tarea y Crear sprint */}
      <Slide direction="up" in mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Tooltip title="Crear tarea">
            <Fab color="secondary" aria-label="add task" onClick={handleAddItem}>
              <Assignment />
            </Fab>
          </Tooltip>

          <Tooltip title="Crear sprint">
            <Fab color="primary" aria-label="add sprint" onClick={onAddSprint}>
              <Add />
            </Fab>
          </Tooltip>
        </Box>
      </Slide>
    </>
  );
}

export default RoadmapContainer;