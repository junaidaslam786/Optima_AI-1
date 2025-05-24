"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

// register Chart.js pieces
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

export function HealthScoreChart() {
  const data = {
    labels: ["Aug 2023", "Nov 2023", "Feb 2024", "Apr 2024", "Jun 2024"],
    datasets: [
      {
        label: "Health Score",
        data: [51, 57, 69, 74, 105],
        fill: false,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 4,
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        min: 50,
        max: 110,
        ticks: {
          stepSize: 20,
          color: "#374151",
          font: { size: 12 },
        },
        grid: { color: "#E5E7EB" },
      },
      x: {
        ticks: {
          color: "#374151",
          font: { size: 12 },
        },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-medium text-gray-800 mb-4">Health Score</h2>
      <Line data={data} options={options} />
    </div>
  );
}
