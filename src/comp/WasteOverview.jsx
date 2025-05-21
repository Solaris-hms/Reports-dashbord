import React from 'react';
import WasteOverviewCard from './WasteOverviewCard';
import { FaTruck, FaTimesCircle, FaCheckCircle, FaBan } from 'react-icons/fa';

const WasteOverview = ({ data }) => {
  const formatValue = (val) =>
    typeof val === 'number' ? `${val.toFixed(2)} Tons` : 'N/A';

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Waste Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <WasteOverviewCard
          icon={FaTruck}
          value={formatValue(data?.['Waste Received (in tons)'])}
          label={`Total Collected\n${formatValue(data?.['Waste Received (in tons)'])}`}
          color="text-orange-500"
          bgColor="bg-orange-100"
        />
        <WasteOverviewCard
          icon={FaTimesCircle}
          value={formatValue(data?.['Waste Reject (in tons )'])}
          label={`Rejected\n${formatValue(data?.['Waste Reject (in tons )'])}`}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <WasteOverviewCard
          icon={FaCheckCircle}
          value={formatValue(data?.['Waste Processed (in tons)'])}
          label={`Processed\n${formatValue(data?.['Waste Processed (in tons)'])}`}
          color="text-blue-500"
          bgColor="bg-blue-100"
        />
        <WasteOverviewCard
          icon={FaBan}
          value={formatValue(data?.['Waste Unprocessed (in tons)'])}
          label={`Unprocessed\n${formatValue(data?.['Waste Unprocessed (in tons)'])}`}
          color="text-red-500"
          bgColor="bg-red-100"
        />
      </div>
    </div>
  );
};

export default WasteOverview;
