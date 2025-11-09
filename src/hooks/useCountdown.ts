import { useState, useEffect } from 'react';

export function useCountdown(targetHours: number = 13, targetMinutes: number = 21, targetSeconds: number = 7) {
  const calculateTimeData = () => {
    const total = targetHours * 3600 + targetMinutes * 60 + targetSeconds;
    const now = Math.floor(Date.now() / 1000);
    const start = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const elapsed = now - start;
    const remaining = total - (elapsed % total);
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    return {
      display: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      seconds,
    };
  };

  const [timeData, setTimeData] = useState(calculateTimeData());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(calculateTimeData());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeData.display;
}
