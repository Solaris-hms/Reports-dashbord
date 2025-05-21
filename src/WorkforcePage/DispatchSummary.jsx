import React from 'react';
import RevenueDetailsCard from '../pages/RevenueDetailsCard';
import { FaTruckLoading, FaFireAlt, FaTrashRestore, FaBoxes } from 'react-icons/fa';

const DispSumm = ({ data }) => {
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

  const format = (val) =>
    typeof val === 'number' ? `${val.toFixed(2)} T` : '0.00 T';

  const totalMaterialDispatched = data
    ? materialFields.reduce((sum, field) => sum + (data[field] || 0), 0)
    : 0;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-2xl w-full h-full border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-5">
        Dispatch Summary Metrics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <RevenueDetailsCard
          icon={FaTruckLoading}
          value={format(data?.['RDF Dispatched Today  (in tons)'])}
          label="RDF Dispatch"
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <RevenueDetailsCard
          icon={FaFireAlt}
          value={format(data?.['AFR Dispatched Today (in tons)'])}
          label="AFR Dispatch"
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <RevenueDetailsCard
          icon={FaTrashRestore}
          value={format(data?.['Inert (in tons)'])}
          label="Inert Dispatch"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <RevenueDetailsCard
          icon={FaBoxes}
          value={`${totalMaterialDispatched.toFixed(2)} T`}
          label="Sum of 14 Material Dispatched"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>
    </div>
  );
};

export default DispSumm;
