import React from 'react';
import RevenueDetails from './RevenueDetails';
import MaterialRevenue from './MaterialRevenueBreakdown';
import ExpenseDetails from './ExpenseDetails';

const Revenue = ({ revenueData, selectedDate }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredData = revenueData
    ? revenueData.find((item) => formatTimestamp(item.Timestamp) === selectedDate)
    : null;

  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">
          Daily Revenue Summary
        </h2>
        <span className="text-sm text-white mt-2 md:mt-0">
          Report Date: {displayDate} 
        </span>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <RevenueDetails data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <ExpenseDetails data={filteredData} />
        </div>
      </div>
      <div className="mb-6">
        <MaterialRevenue data={filteredData} />
      </div>
    </div>
  );
};

export default Revenue;