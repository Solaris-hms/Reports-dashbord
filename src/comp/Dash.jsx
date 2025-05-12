import React from 'react';
import WasteOverview from './WasteOverview';
import ProcessingBreakdown from './ProcessingBreakdown';
import OperationalMetrics from './OperationaMetric';
import MaterialRecovery from './MaterialRecovery';
import IncidentMaintenanceCard from './incidents';
import PriorityTasksCard from './PriorityTask';

const Dashboard = ({ plantData, selectedDate }) => {
  // Utility to format timestamp to DD/MM/YYYY
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filter plant data for the selected date
  const filteredData = plantData
    ? plantData.find((item) => formatTimestamp(item.Timestamp) === selectedDate)
    : null;

  // Format the selected date for display
  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">
          Daily Waste Processing Summary
        </h2>
        <span className="text-sm text-white mt-2 md:mt-0">
          Report Date: {displayDate} 
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <WasteOverview data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <ProcessingBreakdown data={filteredData} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <OperationalMetrics data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <MaterialRecovery data={filteredData} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch">
        <div className="w-full lg:w-1/2">
          <IncidentMaintenanceCard data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <PriorityTasksCard data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;