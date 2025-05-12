import React from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const COLORS = ['#b388eb', '#cfd8dc'];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-700 shadow-md">
        {name}: {value}%
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-sm text-gray-700 shadow-md">
        {name}: {value} tons
      </div>
    );
  }
  return null;
};

const ProcessingBreakdown = ({ data }) => {
  // Calculate pie chart data
  const totalWaste = data ? data['Waste Received (in tons)'] || 0 : 0;
  const processed = data ? data['Waste Processed (in tons)'] || 0 : 0;
  const remaining = totalWaste > 0 ? totalWaste - processed : 0;
  const processedPercent = totalWaste > 0 ? Math.round((processed / totalWaste) * 100) : 0;
  const remainingPercent = totalWaste > 0 ? 100 - processedPercent : 0;

  const pieData = [
    { name: 'Processed', value: processedPercent },
    { name: 'Remaining', value: remainingPercent },
  ];

  // Bar chart data
  const barData = [
    { name: 'RDF', value: data ? data['RDF Processed (in tons)'] || 0 : 0 },
    { name: 'AFR', value: data ? data['AFR Processed (in tons)'] || 0 : 0 },
    { name: 'Inert', value: data ? data['Inert Processed (in tons)'] || 0 : 0 },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Processing Breakdown</h3>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Donut Chart with Tooltip */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <PieChart width={220} height={220}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <text
              x={110}
              y={110}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold fill-gray-700"
            >
              {processedPercent}%
            </text>
            <text
              x={110}
              y={135}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm fill-gray-500"
            >
              Processed
            </text>
          </PieChart>
        </div>

        {/* Bar Chart with Tooltip and Animation */}
        <div className="w-full lg:w-1/2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip content={<CustomBarTooltip />} cursor={false} />
              <Bar
                dataKey="value"
                fill="#9fa8da"
                radius={[6, 6, 0, 0]}
                barSize={30}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProcessingBreakdown;