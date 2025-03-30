    import { useState } from 'react';
    import RoadmapDataSheet from '../Roadmap/RoadmapDataSheet';
    import Form from '../Form/Form';

    function RoadmapContainer() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const refreshRoadmap = () => {
        // Cambia el valor para forzar que RoadmapDataSheet vuelva a ejecutar su useEffect
        setRefreshTrigger(prev => prev + 1);
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
