import React from 'react';
import RevenueDetailsCard from '../pages/RevenueDetailsCard';
import { FaUserTie, FaGasPump, FaBolt, FaTachometerAlt } from 'react-icons/fa';

const WorkforceCard = ({ data }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl w-full h-full border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Workforce & Resource Metrics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Workers Present */}
        <RevenueDetailsCard
          icon={FaUserTie}
          value={data ? `${data['Number of Workers Present Today']}` : 'N/A'}
          label="Workers Present"
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />

        {/* Diesel Consumption */}
        <RevenueDetailsCard
          icon={FaGasPump}
          value={data ? `${data['Diesel Consumption (in liters)']} L` : 'N/A'}
          label="Diesel Consumption"
          color="text-amber-600"
          bgColor="bg-amber-100"
        />

        {/* Electricity Consumption */}
        <RevenueDetailsCard
          icon={FaBolt}
          value={data ? `${data['Electricity Consumption (in Units)']} kWh` : 'N/A'}
          label="Electricity Used"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />

        {/* Power Factor */}
        <RevenueDetailsCard
          icon={FaTachometerAlt}
          value={data ? `${data['Power Factor']} PF` : 'N/A'}
          label="Power Factor Efficiency"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>
    </div>
  );
};

export default WorkforceCard;