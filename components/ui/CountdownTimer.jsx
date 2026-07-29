import React, { useState, useEffect, useCallback } from "react";
import { Timer, AlertCircle } from "lucide-react";

const CountdownTimer = ({
  timeoutMs,
  onTimeout,
  className = "",
  showProgress = false,
  prefix = "",
}) => {
  const [remainingTime, setRemainingTime] = useState(timeoutMs);
  const [isExpired, setIsExpired] = useState(false);

  const formatTime = useCallback((ms) => {
    if (ms <= 0) return "0s";

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }, []);

  useEffect(() => {
    if (timeoutMs <= 0) {
      setIsExpired(true);
      onTimeout?.();
      return;
    }

    setRemainingTime(timeoutMs);

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        const newTime = prev - 1000;

        if (newTime <= 0) {
          setIsExpired(true);
          onTimeout?.();
          clearInterval(interval);
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeoutMs, onTimeout]);

  if (isExpired) {
    return null; // Component hides itself when expired
  }

  const progressPercentage = showProgress
    ? (remainingTime / timeoutMs) * 100
    : 0;
  const isUrgent = remainingTime <= 30000; // Last 30 seconds
  const isCritical = remainingTime <= 10000; // Last 10 seconds

  const getTimerIcon = () => {
    if (isCritical) {
      return <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />;
    }
    return (
      <Timer
        className={`h-4 w-4 ${isUrgent ? "text-orange-500" : "text-blue-500"}`}
      />
    );
  };

  const getTextColor = () => {
    if (isCritical) return "text-red-600 font-semibold";
    if (isUrgent) return "text-orange-600 font-medium";
    return "text-blue-600 font-medium";
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {getTimerIcon()}
      <span
        className={`text-sm ${getTextColor()} ${
          isCritical ? "animate-pulse" : ""
        }`}
      >
        {prefix && <span className="mr-1">{prefix}</span>}
        {formatTime(remainingTime)}
      </span>

      {showProgress && (
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full transition-all duration-1000 ${
              isCritical
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : isUrgent
                ? "bg-gradient-to-r from-orange-500 to-orange-600"
                : "bg-gradient-to-r from-blue-500 to-blue-600"
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
