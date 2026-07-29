const StatBox = ({ title, count }) => (
  <div className="bg-gray-50 rounded-md px-6 pb-6 pt-4 h-32 flex flex-col justify-between">
    <p className="text-sm sm:text-base">{title}</p>
    <p className="text-3xl font-bold">{count}</p>
  </div>
);

export default StatBox;
