import React from 'react';
import MetricCard from './MetricCard';
import { FaUserCog, FaClock, FaPercentage, FaCheckCircle } from 'react-icons/fa';

const OperationalMetrics = ({ data }) => {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-6 shadow-md w-full h-full">
      <h2 className="text-base font-semibold text-gray-700 mb-4">Operational Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={FaUserCog}
          label="Number of Ragpickers"
          value={data ? `${data['Ragpicker Count Present Today']}` : 'N/A'}
          iconColor="text-blue-600"
        />
        <MetricCard
          icon={FaClock}
          label="Machine Downtime"
          value={data ? `${data['Machine Down Time Today (In Hours)']} hrs` : 'N/A'}
          iconColor="text-red-500"
        />
        <MetricCard
          icon={FaPercentage}
          label="Sorting Accuracy"
          value={data ? `${data['Sorting Accuracy Today (In Percent )']}%` : 'N/A'}
          iconColor="text-yellow-500"
        />
        <MetricCard
          icon={FaCheckCircle}
          label="Machine Uptime"
          value={data ? `${data['Machine Up Time Today (In Hours)']} hrs` : 'N/A'}
          iconColor="text-green-600"
        />
      </div>
    </div>
  );
};

export default OperationalMetrics;