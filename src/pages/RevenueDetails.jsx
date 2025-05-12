import React from 'react';
import RevenueDetailsCard from './RevenueDetailsCard';
import { FaMoneyBillWave, FaCoins, FaRecycle, FaPiggyBank } from 'react-icons/fa';

const RevenueDetails = ({ data }) => {
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0.00';
    return `₹${Number(value).toFixed(2)}`;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-md w-full h-full">
      <h2 className="text-base font-semibold text-gray-700 mb-3">Revenue Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <RevenueDetailsCard
          icon={FaMoneyBillWave}
          value={formatCurrency(data ? data['RDF Revenue ( in ₹ )'] : 0)}
          label="RDF Revenue"
          color="text-green-500"
          bgColor="bg-green-100"
        />
        <RevenueDetailsCard
          icon={FaCoins}
          value={formatCurrency(data ? data['AFR Revenue (in ₹)'] : 0)}
          label="AFR Revenue"
          color="text-yellow-500"
          bgColor="bg-yellow-100"
        />
        <RevenueDetailsCard
          icon={FaRecycle}
          value={formatCurrency(data ? data['Total Recyclables Revenue ( in ₹ )'] : 0)}
          label="Recyclables Revenue"
          color="text-blue-500"
          bgColor="bg-blue-100"
        />
        <RevenueDetailsCard
          icon={FaPiggyBank}
          value={formatCurrency(data ? data['Total Amount Credited in Bank Today'] : 0)}
          label="Bank Amount Credited Today"
          color="text-purple-500"
          bgColor="bg-purple-100"
        />
      </div>
    </div>
  );
};

export default RevenueDetails;