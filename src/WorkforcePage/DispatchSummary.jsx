import React from 'react';
import RevenueDetailsCard from '../pages/RevenueDetailsCard';
import { FaTruckLoading, FaFireAlt, FaTrashRestore, FaBoxes } from 'react-icons/fa';

const DispSumm = ({ data }) => {
  // Calculate the sum of 14 material types dispatched
  const materialFields = [
    'Bhangar Dispatched Today (in tons)',
    'Black Plastic Dispatched Today (in tons)',
    'Carton Dispatched Today (in tons)',
    'Duplex Dispatched Today (in tons)',
    'Glass Dispatched Today (in tons)',
    'Grey board Dispatched Today (in tons)',
    'HD Cloth Dispatched Today (in tons)',
    'LD Dispatched Today (in tons)',
    'HM Dispatched Today (in tons)',
    'Record Dispatched Today (in tons)',
    'Sole Dispatched Today (in tons)',
    'Plastic Dispatched Today (in tons)',
    'Aluminium Dispatched Today (in tons)',
    'Aluminium can Dispatched Today (in tons)',
    'Pet bottle Dispatched Today (in tons)',
    'Milk Pouch Dispatched Today (in tons)',
  ];

  const totalMaterialDispatched = data
    ? materialFields.reduce((sum, field) => sum + (data[field] || 0), 0)
    : 0;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-2xl w-full h-full border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-5">
        Dispatch Summary Metrics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* RDF Dispatch */}
        <RevenueDetailsCard
          icon={FaTruckLoading}
          value={data ? `${data['RDF Dispatched Today  (in tons)']} T` : 'N/A'}
          label="RDF Dispatch"
          color="text-green-600"
          bgColor="bg-green-100"
        />

        {/* AFR Dispatch */}
        <RevenueDetailsCard
          icon={FaFireAlt}
          value={data ? `${data['AFR Dispatched Today (in tons)']} T` : 'N/A'}
          label="AFR Dispatch"
          color="text-red-600"
          bgColor="bg-red-100"
        />

        {/* Inert Dispatch */}
        <RevenueDetailsCard
          icon={FaTrashRestore}
          value={data ? `${data['Inert (in tons)']} T` : 'N/A'}
          label="Inert Dispatch"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />

        {/* Total Material Types */}
        <RevenueDetailsCard
          icon={FaBoxes}
          value={data ? `${totalMaterialDispatched} T` : 'N/A'}
          label="Sum of 14 Material Dispatched"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>
    </div>
  );
};

export default DispSumm;