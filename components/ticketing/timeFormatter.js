function formatTime12Hour(timeStr) {
  if (!timeStr) return "";

  const [hour, minute] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(hour, 10), parseInt(minute, 10), 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default formatTime12Hour;
