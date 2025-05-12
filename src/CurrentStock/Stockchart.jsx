import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { useMediaQuery } from 'react-responsive';

// Custom tooltip for bar chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        <p className="stock">Stock: {Number(payload[0].value).toFixed(2)} tons</p>
      </div>
    );
  }
  return null;
};

// Formatter for labels to show value with "tons"
const formatLabel = (value) => `${Number(value).toFixed(2)} tons`;

// Main Component
const Stockchart = ({ data, selectedDate }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const barColor = '#4a90e2'; // Keep original color

  return (
    <>
      <style jsx="true">{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        .custom-tooltip {
          background-color: #2d3436;
          padding: 12px 16px;
          border-radius: 8px;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(5px);
        }

        .label {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .stock {
          color: #a8dadc;
        }

        .chart-wrapper {
          background: linear-gradient(145deg, #ffffff, #f0f4f8);
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          max-width: 1200px;
          margin: 40px auto;
          border: 1px solid #e0e0e0;
          font-family: 'Poppins', sans-serif;
        }

        .chart-title {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #2d3436;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          background: linear-gradient(to right, #9b27b0, #2196f3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .recharts-bar-rectangle {
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .recharts-bar-rectangle:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .table-wrapper {
          background: linear-gradient(135deg, #ffffff, #f6f9fc);
          padding: 20px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          max-width: 100%;
          margin: 20px auto;
          font-family: 'Poppins', sans-serif;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }

        .stock-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          overflow: hidden;
        }

        .stock-table thead {
          background: linear-gradient(to right, #9b27b0, #2196f3);
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .stock-table th {
          padding: 16px;
          font-size: 14px;
          text-align: left;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        .stock-table tbody tr {
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
          animation: slideIn 0.5s ease forwards;
          animation-delay: calc(var(--row-index) * 0.1s);
          opacity: 0;
        }

        .stock-table tbody tr:nth-child(even) {
          background: rgba(240, 244, 248, 0.9);
        }

        .stock-table tbody tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          background: linear-gradient(to right, #e0eafc, #cfdef3);
        }

        .stock-table tbody tr:active {
          transform: scale(0.98);
        }

        .stock-table td {
          padding: 14px;
          font-size: 13px;
          color: #2d3436;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .stock-table td:first-child {
          font-weight: 600;
        }

        .stock-table td:last-child {
          text-align: right;
        }

        .color-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
          vertical-align: middle;
          background-color: #4a90e2;
        }

        .no-data {
          text-align: center;
          padding: 20px;
          font-size: 16px;
          color: #e63946;
          font-weight: 500;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animated-chart {
          animation: fadeInUp 1s ease-in-out;
        }

        .recharts-label {
          fill: #2d3436;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
        }

        @media (max-width: 767px) {
          .chart-title {
            font-size: 20px;
          }

          .stock-table th,
          .stock-table td {
            padding: 12px;
            font-size: 12px;
          }
        }
      `}</style>

      <div className="chart-wrapper">
        <h2 className="chart-title">
          Current Stock Levels for {data.length > 0 ? selectedDate : 'No Data'}
        </h2>
        {data.length === 0 ? (
          <p className="no-data">No stock data available for {selectedDate}</p>
        ) : isMobile ? (
          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Stock (tons)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={entry.name} style={{ '--row-index': index }}>
                    <td>
                      <span className="color-indicator" />
                      {entry.name}
                    </td>
                    <td>{Number(entry.stock).toFixed(2)} tons</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="animated-chart">
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                data={data}
                margin={{ top: 40, right: 40, left: 20, bottom: 60 }}
              >
                <CartesianGrid stroke="#dfe6e9" strokeDasharray="5 5" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                  tick={{ fill: '#2d3436', fontSize: 12 }}
                />
                <YAxis
                  label={{
                    value: 'Stock (tons)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#2d3436',
                    fontSize: 14,
                  }}
                  tick={{ fill: '#2d3436', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="stock"
                  fill={barColor}
                  radius={[8, 8, 0, 0]}
                  barSize={30}
                >
                  <LabelList
                    dataKey="stock"
                    position="top"
                    formatter={formatLabel}
                    className="recharts-label"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </>
  );
};

export default Stockchart;
