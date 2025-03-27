import { useState, useEffect } from 'react';
import React from 'react';

const STORAGE_KEY = 'apiLimit';
const API_LIMIT_PER_MINUTE = 100;

const ApiLimitChecker = ({ children }) => {
  const [apiLimit, setApiLimit] = useState(API_LIMIT_PER_MINUTE);
  const [, setLastUpdateMinute] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('../apilimit.json');
        const data = await response.json();
        const { limit, lastUpdate } = data;
        
        console.log(data.limit);
        // Check if the last update was on a previous minute
        const now = new Date();
        const lastUpdateDate = new Date(lastUpdate);
        if (lastUpdateDate.getMinutes() !== now.getMinutes()) {
          setApiLimit(API_LIMIT_PER_MINUTE);
          setLastUpdateMinute(now.getMinutes());
        } else {
          setApiLimit(limit);
          setLastUpdateMinute(lastUpdateDate.getMinutes());
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const updateApiLimit = async () => {
    const now = new Date();
    const storedData = localStorage.getItem(STORAGE_KEY);
    const { limit, lastUpdate } = storedData ? JSON.parse(storedData) : { limit: API_LIMIT_PER_MINUTE, lastUpdate: null };

    if (!lastUpdate || new Date(lastUpdate).getMinutes() !== now.getMinutes()) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ limit: API_LIMIT_PER_MINUTE, lastUpdate: now }));
      setApiLimit(API_LIMIT_PER_MINUTE);
      setLastUpdateMinute(now.getMinutes());
    } else {
      const updatedLimit = limit - 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ limit: updatedLimit, lastUpdate }));
      setApiLimit(updatedLimit);
    }
  };

  return apiLimit > 0 ? React.cloneElement(children, { updateApiLimit }) : null;
};

export default ApiLimitChecker;
