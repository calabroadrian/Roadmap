import React, { useMemo, useEffect, useRef, useState } from "react";
import { GSTC } from "gantt-schedule-timeline-calendar";
import "gantt-schedule-timeline-calendar/dist/style.css";

const GSTCTimeline = ({ config }) => {
  const gstcRef = useRef(null);
  const [gstcInstance, setGstcInstance] = useState(null);

  // Memoized configuration
  const memoizedConfig = useMemo(() => config, [config]);

  useEffect(() => {
    if (!gstcRef.current) return;

    const instance = GSTC({ element: gstcRef.current, state: GSTC.api.state(memoizedConfig) });
    setGstcInstance(instance);

    return () => {
      if (gstcInstance) {
        gstcInstance.destroy();
      }
    };
  }, [memoizedConfig]);

  return <div ref={gstcRef} style={{ width: "100%", height: "500px" }} />;
};

export default GSTCTimeline;