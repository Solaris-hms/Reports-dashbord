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

// Custom tooltip showing opening and closing values side by side
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: '#2d3436',
        padding: '12px 16px',
        borderRadius: 8,
        color: '#fff',
        fontFamily: 'Poppins, sans-serif',
        fontSize: 14,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(5px)',
      }}>
        <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.fill, margin: 0 }}>
            {entry.name}: {Number(entry.value).toFixed(2)} tons
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Formatter to show value with "tons"
const formatLabel = (value) => `${Number(value).toFixed(2)} tons`;

// Legend component
const Legend = ({ openingColor, closingColor }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 30,
        marginBottom: 20,
        fontFamily: 'Poppins, sans-serif',
        fontSize: 14,
        color: '#2d3436',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 18,
            height: 18,
            backgroundColor: openingColor,
            borderRadius: 4,
          }}
        />
        <span>Opening Stock</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 18,
            height: 18,
            backgroundColor: closingColor,
            borderRadius: 4,
          }}
        />
        <span>Closing Stock</span>
      </div>
    </div>
  );
};

// Main Chart Component
const Stockchart = ({ data, selectedDate }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const openingColor = '#e91e63'; // Pink for opening stock bars
  const closingColor = '#4a90e2'; // Blue for closing stock bars

  if (!data || data.length === 0) {
    return <p className="no-data">No stock data available for {selectedDate}</p>;
  }

  return (
    <>
      <style jsx="true">{`
        .custom-tooltip {
          font-family: 'Poppins', sans-serif;
        }
        .recharts-label {
          fill: #2d3436;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
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
        @media (max-width: 767px) {
          .legend {
            display: none;
          }
        }
      `}</style>

      <div className="chart-wrapper">
        <h2 className="chart-title">Current Stock Levels for {selectedDate}</h2>

        {/* Legend only visible on desktop */}
        {!isMobile && <Legend openingColor={openingColor} closingColor={closingColor} />}

        {isMobile ? (
          <div className="table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Opening Stock (tons)</th>
                  <th>Closing Stock (tons)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={entry.name} style={{ '--row-index': index }}>
                    <td>{entry.name}</td>
                    <td>{Number(entry.opening).toFixed(2)}</td>
                    <td>{Number(entry.closing).toFixed(2)}</td>
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
                barCategoryGap="20%"
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
                  dataKey="opening"
                  fill={openingColor}
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                  name="Opening Stock"
                >
                  <LabelList
                    dataKey="opening"
                    position="top"
                    formatter={formatLabel}
                    className="recharts-label"
                  />
                </Bar>
                <Bar
                  dataKey="closing"
                  fill={closingColor}
                  radius={[8, 8, 0, 0]}
                  barSize={20}
                  name="Closing Stock"
                >
                  <LabelList
                    dataKey="closing"
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
