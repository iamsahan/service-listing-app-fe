import { useEffect, useState } from "react";
import { differenceInSeconds, isValid } from "date-fns";

const Timer = ({ start, end }) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (
      !start ||
      !end ||
      !isValid(new Date(start)) ||
      !isValid(new Date(end))
    ) {
      setRemainingTime(0);
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    const updateTimer = () => {
      const now = new Date();
      const remaining = differenceInSeconds(endDate, now);
      setRemainingTime(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [start, end]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return <span>{formatTime(remainingTime)}</span>;
};

export default Timer;
