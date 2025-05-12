import React from 'react';
import WorkforceCard from './WorkforceCard';
import DispSumm from './DispatchSummary';
import DispatchBreakdown from './Disbrakdown';

const Workforce = ({ workforceData, selectedDate }) => {
  // Utility to format timestamp to DD/MM/YYYY
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter workforce data for the selected date
  const filteredData = workforceData
    ? workforceData.find((item) => formatTimestamp(item.Timestamp) === selectedDate)
    : null;

  // Format the selected date for display (e.g., "23/04/2025")
  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">
          Daily Workforce Summary
        </h2>
        <span className="text-sm text-white mt-2 md:mt-0">
          Report Date: {displayDate} 
        </span>
      </div>

      {/* Revenue & Expense Cards */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <WorkforceCard data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <DispSumm data={filteredData} />
        </div>
      </div>

      {/* Material Revenue Breakdown */}
      <div className="mb-6">
        <DispatchBreakdown data={filteredData} />
      </div>
    </div>
  );
};

export default Workforce;