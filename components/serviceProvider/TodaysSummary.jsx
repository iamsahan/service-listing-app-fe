const TodaysSummary = ({ stats: { completed, pending, cancelled } }) => {
  const summaryItems = [
    { label: "Completed", count: completed, color: "bg-green-500" },
    { label: "Pending", count: pending, color: "bg-yellow-400" },
    { label: "Cancelled", count: cancelled, color: "bg-red-500" },
  ];

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Today's Summary</h3>

      <div className="bg-gray-50 rounded-md p-4 mb-4">
        <div className="space-y-2 text-sm">
          {summaryItems.map(({ label, count, color }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${color}`}></span>
                {label}
              </span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodaysSummary;
