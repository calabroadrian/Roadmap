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
        </div>
    );
    }

    export default RoadmapContainer;
