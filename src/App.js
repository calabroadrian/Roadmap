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

  const handleAddItem = (newItem) => {
    setItems(prevItems => [...prevItems, newItem]);
    setIsModalOpen(true);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeselectItem = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleUpdateItem = (updatedItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = (itemToDelete) => {
    setItems(items.filter((item) => item.id !== itemToDelete.id));
    setSelectedItem(null);
    setIsModalOpen(false);
  };
  
  return (
    <div className="app">
      <h1>Backlog</h1>
      <RoadmapDataSheet
        items={items}
        onSelectItem={handleSelectItem}
        onDeselectItem={handleDeselectItem}
        onEditItem={handleSelectItem}
      />
      <AddButton onClick={handleAddItem} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Form item={selectedItem} onAddItem={handleAddItem} onDeselectItem={handleDeselectItem} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} onCloseModal={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}


export default App;
