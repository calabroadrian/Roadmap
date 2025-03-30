    import { useState } from 'react';
    import RoadmapDataSheet from '../Roadmap/RoadmapDataSheet';

    function RoadmapContainer() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const refreshRoadmap = () => {
        // Cambia el valor para forzar que RoadmapDataSheet vuelva a ejecutar su useEffect
        setRefreshTrigger(prev => prev + 1);
    };

    // Aquí puedes manejar también la apertura/cierre del formulario, etc.

    return (
        <div>
        <RoadmapDataSheet 
            /* otros props */
            refreshTrigger={refreshTrigger}
        />
        </div>
    );
    }

    export default RoadmapContainer;
