const StatusBadge = ({ status }) => {
  const colors = {
    cart: "bg-gray-300 text-gray-800",

    // Grouped as "Pending"
    payment_pending: "bg-yellow-300 text-yellow-900",
    assigned: "bg-yellow-300 text-yellow-900",
    accepted: "bg-yellow-300 text-yellow-900",
    confirmed: "bg-yellow-300 text-yellow-900",

    in_progress: "bg-purple-200 text-purple-900",
    completed: "bg-green-200 text-green-900",
    cancelled: "bg-red-200 text-red-900",
    refunded: "bg-teal-200 text-teal-900",
  };

  const colorClass = colors[status] || "bg-gray-200 text-gray-800";

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-semibold capitalize ${colorClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

export default StatusBadge;
