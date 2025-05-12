import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const MaterialRevenue = ({ data }) => {
  const [isDesktop, setIsDesktop] = useState(true);

  const materialFields = [
    { name: 'Bhangar', key: 'Bhangar' },
    { name: 'Black Plastic', key: 'Black plastic' },
    { name: 'Carton', key: 'Carton' },
    { name: 'Duplex', key: 'Duplex' },
    { name: 'Glass', key: 'Glass' },
    { name: 'Grey Board', key: 'Grey board' },
    { name: 'HD Cloth', key: 'HD cloth' },
    { name: 'LD', key: 'LD' },
    { name: 'Record', key: 'Record' },
    { name: 'Sole', key: 'Sole' },
    { name: 'Plastic', key: 'Plastic' },
    { name: 'Bear Cane', key: 'Bear cane' },
    { name: 'PET Bottle', key: 'Pet Bottle' },
    { name: 'Milk Pouch', key: 'Milk pouch' },
  ];

  const chartData = materialFields.map((field) => ({
    name: field.name,
    value: data ? data[field.key] || 0 : 0,
  }));

  const maxValue = data ? Math.max(...chartData.map((item) => item.value), 1) : 1;
  const yAxisDomain = [0, Math.ceil(maxValue * 1.2)];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white shadow-md rounded-md px-3 py-2 border border-gray-200 text-sm pointer-events-none">
          <strong>{label}</strong>: ₹{payload[0].value.toFixed(2)}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg w-full h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-5">Material Revenue Breakdown</h2>
      
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
                label={{
                  value: 'Revenue (₹)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -10,
                }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
                wrapperStyle={{ pointerEvents: 'none' }}
              />
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
                  formatter={(val) => `₹${val.toFixed(2)}`}
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
                <th className="py-3 px-6 text-right rounded-tr-xl">Revenue (₹)</th>
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
                    ₹{item.value.toFixed(2)}
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

export default MaterialRevenue;
