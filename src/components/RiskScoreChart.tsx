import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const RiskScoreChart = ({ data }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-md border border-red-500/20">
      <h3 className="text-white font-bold mb-2">📈 Risk Score Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="time" stroke="#ccc" />
          <YAxis domain={[0, 100]} stroke="#ccc" />
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskScoreChart;
