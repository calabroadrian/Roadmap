import { useState } from 'react';
import RoadmapDataSheet from './components/Roadmap/RoadmapDataSheet';
import Form from './components/Form/Form';
import Modal from './components/Modal/Modal';
import './App.css';
import AddButton from './components/AddButton/AddButton';

function App() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

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
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(updatedItems);
  };

  const handleDeleteItem = (itemToDelete) => {
    const updatedItems = items.filter((item) => item.id !== itemToDelete.id);
    setItems(updatedItems);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Backlog</h1>
        <button className="app-add-button" onClick={handleAddItem}>
          Agregar
        </button>
      </header>
      <RoadmapDataSheet
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
        />
      </Modal>
    </div>
  );
}

export default App;
