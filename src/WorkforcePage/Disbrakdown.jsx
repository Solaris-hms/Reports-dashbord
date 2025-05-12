import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const DispatchBreakdown = ({ data }) => {
  const [isDesktop, setIsDesktop] = useState(true);

  const materialFields = [
    { name: 'Bhangar', key: 'Bhangar Dispatched Today (in tons)' },
    { name: 'Black Plastic', key: 'Black Plastic Dispatched Today (in tons)' },
    { name: 'Carton', key: 'Carton Dispatched Today (in tons)' },
    { name: 'Duplex', key: 'Duplex Dispatched Today (in tons)' },
    { name: 'Glass', key: 'Glass Dispatched Today (in tons)' },
    { name: 'Grey Board', key: 'Grey board Dispatched Today (in tons)' },
    { name: 'HD Cloth', key: 'HD Cloth Dispatched Today (in tons)' },
    { name: 'LD', key: 'LD Dispatched Today (in tons)' },
    { name: 'HM', key: 'HM Dispatched Today (in tons)' },
    { name: 'Record', key: 'Record Dispatched Today (in tons)' },
    { name: 'Sole', key: 'Sole Dispatched Today (in tons)' },
    { name: 'Plastic', key: 'Plastic Dispatched Today (in tons)' },
    { name: 'Aluminium', key: 'Aluminium Dispatched Today (in tons)' },
    { name: 'Aluminium Can', key: 'Aluminium can Dispatched Today (in tons)' },
    { name: 'PET Bottle', key: 'Pet bottle Dispatched Today (in tons)' },
    { name: 'Milk Pouch', key: 'Milk Pouch Dispatched Today (in tons)' },
  ];

  const chartData = materialFields.map((field) => ({
    name: field.name,
    value: data ? data[field.key] || 0 : 0,
  }));

  const maxValue = Math.max(...chartData.map((item) => item.value), 1);
  const yAxisDomain = [0, Math.ceil(maxValue * 1.2)];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white shadow-md rounded-md px-3 py-2 border border-gray-200 text-sm pointer-events-none">
          <strong>{label}</strong>: {payload[0].value} tons
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg w-full h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Material Dispatch Breakdown</h2>

      {isDesktop ? (
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 30, right: 30, bottom: 80, left: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                domain={yAxisDomain}
                label={{ value: 'Tons', angle: -90, position: 'insideLeft', offset: -10 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ pointerEvents: 'none' }} />
              <Bar
                dataKey="value"
                fill="#7C83FD"
                radius={[6, 6, 0, 0]}
                barSize={18}
                isAnimationActive={true}
                animationDuration={1200}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(val) => `${val}T`}
                  style={{ fontSize: 12, fill: '#333' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-lg">
            <thead className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
              <tr>
                <th className="py-3 px-6 text-left rounded-tl-xl">Material</th>
                <th className="py-3 px-6 text-right rounded-tr-xl">Dispatched (Tons)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-indigo-50 transition-all`}
                >
                  <td className="py-3 px-6 font-medium text-gray-700">{item.name}</td>
                  <td className="py-3 px-6 text-right text-indigo-600 font-semibold">
                    {item.value.toFixed(2)} T
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DispatchBreakdown;
