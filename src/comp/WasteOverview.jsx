import React from 'react';
import WasteOverviewCard from './WasteOverviewCard';
import { FaTruck, FaTimesCircle, FaCheckCircle, FaBan } from 'react-icons/fa';

const WasteOverview = ({ data }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Waste Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <WasteOverviewCard
          icon={FaTruck}
          value={data ? `${data['Waste Received (in tons)']}` : 'N/A'}
          label={`Total Collected\n${data ? data['Waste Received (in tons)'] : 0} tons`}
          color="text-orange-500"
          bgColor="bg-orange-100"
        />
        <WasteOverviewCard
          icon={FaTimesCircle}
          value={data ? `${data['Waste Reject (in tons )']} Tons` : 'N/A'}
          label={`Rejected\n${data ? data['Waste Reject (in tons )'] : 0} tons`}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <WasteOverviewCard
          icon={FaCheckCircle}
          value={data ? `${data['Waste Processed (in tons)']} Tons` : 'N/A'}
          label={`Processed\n${data ? data['Waste Processed (in tons)'] : 0} tons`}
          color="text-blue-500"
          bgColor="bg-blue-100"
        />
        <WasteOverviewCard
          icon={FaBan}
          value={data ? `${data['Waste Unprocessed (in tons)']} Tons` : 'N/A'}
          label={`Unprocessed\n${data ? data['Waste Unprocessed (in tons)'] : 0} tons`}
          color="text-red-500"
          bgColor="bg-red-100"
        />
      </div>
    </div>
  );
};

export default WasteOverview;