import React from 'react';
import RevenueDetailsCard from '../pages/RevenueDetailsCard';
import { FaUserTie, FaGasPump, FaBolt, FaTachometerAlt } from 'react-icons/fa';

const WorkforceCard = ({ data }) => {
  const format = (val, suffix = '') =>
    typeof val === 'number' ? `${val.toFixed(2)}${suffix}` : 'N/A';

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl w-full h-full border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Workforce & Resource Metrics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <RevenueDetailsCard
          icon={FaUserTie}
          value={data ? `${data['Number of Workers Present Today']}` : 'N/A'}
          label="Workers Present"
          color="text-indigo-600"
          bgColor="bg-indigo-100"
        />
        <RevenueDetailsCard
          icon={FaGasPump}
          value={format(data?.['Diesel Consumption (in liters)'], ' L')}
          label="Diesel Consumption"
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
        <RevenueDetailsCard
          icon={FaBolt}
          value={format(data?.['Electricity Consumption (in Units)'], ' kWh')}
          label="Electricity Used"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <RevenueDetailsCard
          icon={FaTachometerAlt}
          value={format(data?.['Power Factor'], ' PF')}
          label="Power Factor Efficiency"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>
    </div>
  );
};

export default WorkforceCard;
