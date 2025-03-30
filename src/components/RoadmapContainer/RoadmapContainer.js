    import { useState } from 'react';
    import RoadmapDataSheet from '../Roadmap/RoadmapDataSheet';
    import Form from '../components/Form/Form';

    function RoadmapContainer() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const refreshRoadmap = () => {
        // Cambia el valor para forzar que RoadmapDataSheet vuelva a ejecutar su useEffect
        setRefreshTrigger(prev => prev + 1);
    };
    const [items, setItems] = useState([]);

    // Aquí puedes manejar también la apertura/cierre del formulario, etc.

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
        <div>
        <RoadmapDataSheet 
            /* otros props */
            refreshTrigger={refreshTrigger}
        />

<   Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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

    export default RoadmapContainer;
