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

const MaterialRecovery = ({ data }) => {
  const [isDesktop, setIsDesktop] = useState(true);

  const materialFields = [
    { name: 'Bhangar', key: 'Bhangar (in tons)' },
    { name: 'Black Plastic', key: 'Black Plastic (in tons)' },
    { name: 'Carton', key: 'Carton (in tons)' },
    { name: 'Duplex', key: 'Duplex (in tons)' },
    { name: 'Glass', key: 'Glass (in tons)' },
    { name: 'Grey Board', key: 'Grey Board (in tons)' },
    { name: 'HD Cloth', key: 'HD Cloth (in tons)' },
    { name: 'LD', key: 'LD  (in tons)' },
    { name: 'HM', key: 'HM (in tons)' },
    { name: 'Record', key: 'Record (in tons)' },
    { name: 'Sole', key: 'Sole (in tons)' },
    { name: 'Plastic', key: 'Plastic (in tons)' },
    { name: 'Aluminium', key: 'Aluminium (in tons)' },
    { name: 'Aluminium Can', key: 'Aluminium can (in tons)' },
    { name: 'PET Bottle', key: 'Pet Bottle  (in tons)' },
    { name: 'Milk Pouch', key: 'Milk Pouch  (in tons)' },
  ];

  const chartData = materialFields.map((field) => ({
    name: field.name,
    value: data ? data[field.key] || 0 : 0,
  }));

  const maxValue = data ? Math.max(...chartData.map((item) => item.value), 0.1) : 0.1;
  const yAxisDomain = [0, Math.ceil(maxValue * 1.2)];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white shadow-md rounded-md px-3 py-2 border border-gray-200 text-sm">
          <strong>{label}</strong>: {payload[0].value.toFixed(3)} tons
        </div>
      );
    }
    return null;
  };

  // Responsive check
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Material Recovery</h2>
      {isDesktop ? (
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
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
              <Tooltip content={<CustomTooltip />} cursor={false} />
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
                  formatter={(val) => `${val.toFixed(3)}T`}
                  style={{ fontSize: 10, fill: '#333' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-lg">
            <thead className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 text-white">
              <tr>
                <th className="py-3 px-6 text-left rounded-tl-xl">Material</th>
                <th className="py-3 px-6 text-right rounded-tr-xl">Recovered (tons)</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-green-50 transition-all`}
                >
                  <td className="py-3 px-6 font-medium text-gray-700">{item.name}</td>
                  <td className="py-3 px-6 text-right text-green-600 font-semibold">
                    {item.value.toFixed(3)} T
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

export default MaterialRecovery;
