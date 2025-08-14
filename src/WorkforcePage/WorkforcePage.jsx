import React from 'react';
import WorkforceCard from './WorkforceCard';
import DispSumm from './DispatchSummary';
import DispatchBreakdown from './Disbrakdown';
import { Download } from 'lucide-react'; // <-- Import icon
import * as XLSX from 'xlsx'; // <-- Import xlsx library

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
  
  // --- NEW: Excel Export Functionality ---
  const handleExport = () => {
      if (!filteredData) {
          alert("No data available to export.");
          return;
      }
      const wb = XLSX.utils.book_new();

      // Sheet 1: Workforce & Resource Metrics
      const workforceMetrics = [
          { Metric: "Workers Present", Value: filteredData['Number of Workers Present Today'] || 'N/A' },
          { Metric: "Diesel Consumption (Liters)", Value: (filteredData['Diesel Consumption (in liters)'] || 0).toFixed(2) },
          { Metric: "Electricity Used (kWh)", Value: (filteredData['Electricity Consumption (in Units)'] || 0).toFixed(2) },
          { Metric: "Power Factor Efficiency", Value: (filteredData['Power Factor'] || 0) },
      ];
      const ws1 = XLSX.utils.json_to_sheet(workforceMetrics);
      XLSX.utils.book_append_sheet(wb, ws1, "Workforce Metrics");

      // Sheet 2: Dispatch Summary
      const totalMaterialDispatched = [
          'Bhangar Dispatched Today (in tons)', 'Black Plastic Dispatched Today (in tons)', 'Carton Dispatched Today (in tons)',
          'Duplex Dispatched Today (in tons)', 'Glass Dispatched Today (in tons)', 'Grey board Dispatched Today (in tons)',
          'HD Cloth Dispatched Today (in tons)', 'LD Dispatched Today (in tons)', 'HM Dispatched Today (in tons)',
          'Record Dispatched Today (in tons)', 'Sole Dispatched Today (in tons)', 'Plastic Dispatched Today (in tons)',
          'Aluminium Dispatched Today (in tons)', 'Aluminium can Dispatched Today (in tons)', 'Pet bottle Dispatched Today (in tons)',
          'Milk Pouch Dispatched Today (in tons)',
      ].reduce((sum, field) => sum + (filteredData[field] || 0), 0);

      const dispatchSummary = [
          { Metric: "RDF Dispatch (Tons)", Value: (filteredData['RDF Dispatched Today  (in tons)'] || 0).toFixed(2) },
          { Metric: "AFR Dispatch (Tons)", Value: (filteredData['AFR Dispatched Today (in tons)'] || 0).toFixed(2) },
          { Metric: "Inert Dispatch (Tons)", Value: (filteredData['Inert (in tons)'] || 0).toFixed(2) },
          { Metric: "Total Material Dispatch (Tons)", Value: totalMaterialDispatched.toFixed(2) },
      ];
      const ws2 = XLSX.utils.json_to_sheet(dispatchSummary);
      XLSX.utils.book_append_sheet(wb, ws2, "Dispatch Summary");

      // Sheet 3: Material Dispatch Breakdown
      const materialBreakdown = [
          { name: 'Bhangar', key: 'Bhangar Dispatched Today (in tons)' },
          { name: 'Black Plastic', key: 'Black Plastic Dispatched Today (in tons)' },
          { name: 'Carton', key: 'Carton Dispatched Today (in tons)' },
          { name: 'Duplex', key: 'Duplex Dispatched Today (in tons)' },
          { name: 'Glass', key: 'Glass Dispatched Today (in tons)' },
          { name: 'Grey Board', key: 'Grey board Dispatched Today (in tons)' },
          { name: 'HD Cloth', key: 'HD Cloth Dispatched Today (in tons)' },
          { name: 'LD', key: 'LD Dispatched Today (in tons)' },
          { name: 'HM', key: 'HM Dispatched Today (in tons)' },
          { name: 'Record', key: 'Record Dispatched Today (in tons)' },
          { name: 'Sole', key: 'Sole Dispatched Today (in tons)' },
          { name: 'Plastic', key: 'Plastic Dispatched Today (in tons)' },
          { name: 'Aluminium', key: 'Aluminium Dispatched Today (in tons)' },
          { name: 'Aluminium Can', key: 'Aluminium can Dispatched Today (in tons)' },
          { name: 'PET Bottle', key: 'Pet bottle Dispatched Today (in tons)' },
          { name: 'Milk Pouch', key: 'Milk Pouch Dispatched Today (in tons)' },
      ].map(field => ({
          "Material": field.name,
          "Dispatched (Tons)": (filteredData[field.key] || 0).toFixed(2)
      }));
      const ws3 = XLSX.utils.json_to_sheet(materialBreakdown);
      XLSX.utils.book_append_sheet(wb, ws3, "Material Dispatch");
      
      XLSX.writeFile(wb, `Workforce_Report_${selectedDate.replace(/\//g, '-')}.xlsx`);
  };

  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-white drop-shadow-md">
            {isSingleDate ? 'Daily Workforce Summary' : 'Workforce Summary for Range'}
            </h2>
            <span className="text-sm text-white mt-2 md:mt-0 block">
            {isSingleDate ? 'Report Date' : 'Date Range'}: {displayDate}
            </span>
        </div>
        <button 
            onClick={handleExport}
            className="mt-4 md:mt-0 px-4 py-2 bg-white/20 text-white rounded-lg shadow-md hover:bg-white/30 backdrop-blur-md transition duration-300 flex items-center gap-2"
        >
            <Download size={18} />
            Export to Excel
        </button>
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