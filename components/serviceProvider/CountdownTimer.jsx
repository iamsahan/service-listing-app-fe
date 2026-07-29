import React, { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";
import { Badge } from "@/components/ui/badge";

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = differenceInSeconds(targetDate, now);

      if (diff > 0) {
        return {
          days: Math.floor(diff / (3600 * 24)),
          hours: Math.floor((diff % (3600 * 24)) / 3600),
          minutes: Math.floor((diff % 3600) / 60),
          seconds: diff % 60,
        };
      }
      return null;
    };

    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      if (time) setTimeLeft(time);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return <div>Service time arrived!</div>;

  return (
    <div className="flex gap-2 items-center">
      {timeLeft.days > 0 && <Badge variant="outline">{timeLeft.days}d</Badge>}
      <Badge variant="outline">{timeLeft.hours}h</Badge>
      <Badge variant="outline">{timeLeft.minutes}m</Badge>
      <Badge variant="outline">{timeLeft.seconds}s</Badge>
    </div>
  );
};

export default React.memo(CountdownTimer);
