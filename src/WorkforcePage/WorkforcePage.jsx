import React from 'react';
import WorkforceCard from './WorkforceCard';
import DispSumm from './DispatchSummary';
import DispatchBreakdown from './Disbrakdown';

const Workforce = ({ workforceData, selectedDate, dateRange }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const isSingleDate = !selectedDate.includes(' to ');
  let filteredData = null;

  if (isSingleDate) {
    filteredData = workforceData?.find(
      (item) => formatTimestamp(item.Timestamp) === selectedDate
    ) || null;
  } else {
    filteredData = workforceData?.reduce((acc, item) => {
      const itemDate = normalizeDate(new Date(item.Timestamp));
      const startDate = normalizeDate(dateRange.start);
      const endDate = normalizeDate(dateRange.end);

      if (itemDate >= startDate && itemDate <= endDate) {
        const sumFields = [
          'Number of Workers Present Today',
          'Diesel Consumption (in liters)',
          'Electricity Consumption (in Units)',
          'RDF Dispatched Today  (in tons)',
          'AFR Dispatched Today (in tons)',
          'Inert (in tons)',
          'Power Factor',
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

        sumFields.forEach((field) => {
          const val = parseFloat(item[field]);
          acc[field] = (acc[field] || 0) + (isNaN(val) ? 0 : val);
        });

        acc._pfCount = (acc._pfCount || 0) + (item['Power Factor'] ? 1 : 0);
      }
      return acc;
    }, {}) || null;

    if (filteredData) {
      filteredData['Power Factor'] = filteredData._pfCount
        ? (filteredData['Power Factor'] / filteredData._pfCount).toFixed(2)
        : 0;
      delete filteredData._pfCount;
    }
  }

  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">
          {isSingleDate ? 'Daily Workforce Summary' : 'Workforce Summary for Range'}
        </h2>
        <span className="text-sm text-white mt-2 md:mt-0">
          {isSingleDate ? 'Report Date' : 'Date Range'}: {displayDate}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <WorkforceCard data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <DispSumm data={filteredData} />
        </div>
      </div>

      <div className="mb-6">
        <DispatchBreakdown data={filteredData} />
      </div>
    </div>
  );
};

export default Workforce;
