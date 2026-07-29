import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart, barElementClasses } from "@mui/x-charts/BarChart";
import { axisClasses } from "@mui/x-charts/ChartsAxis";
import { FcBusinessman } from "react-icons/fc";
import { FcTodoList } from "react-icons/fc";
import { FcBriefcase } from "react-icons/fc";
import { FcSalesPerformance } from "react-icons/fc";

const Overview = () => {
  const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
  const pData = [2400, 1398, 9800, 3908, 4800, 3800, 4300];
  const xLabels = [
    "Page A",
    "Page B",
    "Page C",
    "Page D",
    "Page E",
    "Page F",
    "Page G",
  ];
  const stats = [
    { title: "Total Customers", value: "6,450,500", icon: <FcBusinessman /> },
    {
      title: "Total Service Providers",
      value: "100,500",
      icon: <FcTodoList />,
    },
    { title: "Total Bookings", value: "11,389,400", icon: <FcBriefcase /> },
    { title: "Total Revenue", value: "₹9.7 B", icon: <FcSalesPerformance /> },
  ];
  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-800">
        Overview
      </h1>
      <hr className="mb-6" />

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-4 lg:p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-600 text-sm lg:text-base font-medium">
                {stat.title}
              </h2>
              <span className="bg-gradient-to-r from-purple-100 to-blue-100 p-2 rounded-lg text-xl">
                {stat.icon}
              </span>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section - Responsive */}
      <div className="space-y-8">
        {/* Top Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-4 lg:p-6">
            <h2 className="text-gray-600 font-semibold mb-4 text-base lg:text-lg">
              Monthly Active Users
            </h2>
            <div className="overflow-x-auto">
              <LineChart
                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                series={[
                  {
                    curve: "linear",
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                    color: "#8b5cf6",
                  },
                ]}
                grid={{ horizontal: true, strokeDasharray: "4 4" }}
                leftAxis={{
                  disableLine: true,
                }}
                bottomAxis={{
                  disableLine: true,
                }}
                sx={{
                  ".MuiMarkElement-root": {
                    scale: "1.5",
                    stroke: "#8b5cf6",
                  },
                }}
                width={500}
                height={300}
              />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-4 lg:p-6">
            <h2 className="text-gray-600 font-semibold mb-4 text-base lg:text-lg">
              Monthly Revenue Trend
            </h2>
            <div className="overflow-x-auto">
              <LineChart
                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                series={[
                  {
                    curve: "linear",
                    data: [2, 5.5, 2, 8.5, 1.5, 5],
                    color: "#06b6d4",
                  },
                ]}
                grid={{ horizontal: true }}
                leftAxis={{
                  disableLine: true,
                }}
                bottomAxis={{
                  disableLine: true,
                }}
                sx={{
                  ".MuiMarkElement-root": {
                    scale: "1.5",
                    stroke: "#06b6d4",
                  },
                }}
                width={500}
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Bottom Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-4 lg:p-6">
            <h2 className="text-gray-600 font-semibold mb-4 text-base lg:text-lg">
              Weekly Customer Acquisition
            </h2>
            <div className="overflow-x-auto">
              <BarChart
                width={500}
                height={300}
                series={[{ data: uData, id: "uvId", color: "#10b981" }]}
                xAxis={[{ data: xLabels, scaleType: "band" }]}
                leftAxis={{
                  disableLine: true,
                }}
                bottomAxis={{
                  disableLine: true,
                }}
                grid={{ horizontal: true, vertical: true }}
              />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-4 lg:p-6">
            <h2 className="text-gray-600 font-semibold mb-4 text-base lg:text-lg">
              Weekly Services Used
            </h2>
            <div className="overflow-x-auto">
              <BarChart
                width={500}
                height={300}
                series={[{ data: pData, id: "pvId", color: "#f59e0b" }]}
                xAxis={[{ data: xLabels, scaleType: "band" }]}
                leftAxis={{
                  disableLine: true,
                }}
                bottomAxis={{
                  disableLine: true,
                }}
                grid={{ horizontal: true, vertical: true }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
