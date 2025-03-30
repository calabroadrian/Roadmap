import { useState } from 'react';
import Form from './Form';
import RoadmapDataSheet from './RoadmapDataSheet';

function RoadmapContainer() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const refreshRoadmap = () => {
    // Cambia el valor para forzar que RoadmapDataSheet vuelva a ejecutar su useEffect
    setRefreshTrigger(prev => prev + 1);
  };

  // Aquí puedes manejar también la apertura/cierre del formulario, etc.

  return (
    <div>
      <Form 
        /* otros props */
        onRefresh={refreshRoadmap} 
      />
      <RoadmapDataSheet 
        /* otros props */
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}

export default RoadmapContainer;
