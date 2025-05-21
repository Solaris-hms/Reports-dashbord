import React from 'react';
import WasteOverview from './WasteOverview';
import ProcessingBreakdown from './ProcessingBreakdown';
import OperationalMetrics from './OperationaMetric';
import MaterialRecovery from './MaterialRecovery';
import IncidentMaintenanceCard from './incidents';
import PriorityTasksCard from './PriorityTask';

const Dashboard = ({ plantData, selectedDate, dateRange }) => {
  // Utility to format timestamp to DD/MM/YYYY
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  // Normalize a date to midnight UTC
  const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  };

  // Determine if it's a single date or a range
  const isSingleDate = !selectedDate.includes(' to ');

  let filteredData = null;

  if (isSingleDate) {
    // Filter for a single date
    filteredData = plantData
      ? plantData.find((item) => formatTimestamp(item.Timestamp) === selectedDate)
      : null;

    // If no data for the exact date, create an empty object
    if (!filteredData) {
      filteredData = {
        'Waste Received (in tons)': 0,
        'Waste Processed (in tons)': 0,
        'Waste Reject (in tons )': 0,
        'Waste Unprocessed (in tons)': 0,
        'RDF Processed (in tons)': 0,
        'AFR Processed (in tons)': 0,
        'Inert Processed (in tons)': 0,
        'Ragpicker Count Present Today': 0,
        'Machine Down Time Today (In Hours)': 0,
        'Sorting Accuracy Today (In Percent )': 0,
        'Machine Up Time Today (In Hours)': 0,
        'Bhangar (in tons)': 0,
        'Black Plastic (in tons)': 0,
        'Carton (in tons)': 0,
        'Duplex (in tons)': 0,
        'Glass (in tons)': 0,
        'Grey Board (in tons)': 0,
        'HD Cloth (in tons)': 0,
        'LD  (in tons)': 0,
        'HM (in tons)': 0,
        'Record (in tons)': 0,
        'Sole (in tons)': 0,
        'Plastic (in tons)': 0,
        'Aluminium (in tons)': 0,
        'Aluminium can (in tons)': 0,
        'Pet Bottle  (in tons)': 0,
        'Milk Pouch  (in tons)': 0,
        'Any Machine Issues Today?': 'N/A',
        'Any Safety Incident Today?': 'N/A',
        'Any VIP Visit Today?': 'N/A',
        'Equipment Maintenance Performed Today?': 'N/A',
        'Priority Tasks for Tomorrow': 'N/A',
      };
    }
  } else {
    // Aggregate data for the date range
    filteredData = plantData
      ? plantData.reduce((acc, item) => {
          const itemDate = normalizeDate(new Date(item.Timestamp));
          const startDate = normalizeDate(dateRange.start);
          const endDate = normalizeDate(dateRange.end);
          if (itemDate >= startDate && itemDate <= endDate) {
            // Numerical fields to sum
            acc['Waste Received (in tons)'] = (acc['Waste Received (in tons)'] || 0) + (Number(item['Waste Received (in tons)']) || 0);
            acc['Waste Processed (in tons)'] = (acc['Waste Processed (in tons)'] || 0) + (Number(item['Waste Processed (in tons)']) || 0);
            acc['Waste Reject (in tons )'] = (acc['Waste Reject (in tons )'] || 0) + (Number(item['Waste Reject (in tons )']) || 0);
            acc['Waste Unprocessed (in tons)'] = (acc['Waste Unprocessed (in tons)'] || 0) + (Number(item['Waste Unprocessed (in tons)']) || 0);
            acc['RDF Processed (in tons)'] = (acc['RDF Processed (in tons)'] || 0) + (Number(item['RDF Processed (in tons)']) || 0);
            acc['AFR Processed (in tons)'] = (acc['AFR Processed (in tons)'] || 0) + (Number(item['AFR Processed (in tons)']) || 0);
            acc['Inert Processed (in tons)'] = (acc['Inert Processed (in tons)'] || 0) + (Number(item['Inert Processed (in tons)']) || 0);
            acc['Ragpicker Count Present Today'] = (acc['Ragpicker Count Present Today'] || 0) + (Number(item['Ragpicker Count Present Today']) || 0);
            acc['Machine Down Time Today (In Hours)'] = (acc['Machine Down Time Today (In Hours)'] || 0) + (Number(item['Machine Down Time Today (In Hours)']) || 0);
            acc['Machine Up Time Today (In Hours)'] = (acc['Machine Up Time Today (In Hours)'] || 0) + (Number(item['Machine Up Time Today (In Hours)']) || 0);
            // Average for Sorting Accuracy
            if (item['Sorting Accuracy Today (In Percent )']) {
              acc['Sorting Accuracy Today (In Percent )_sum'] = (acc['Sorting Accuracy Today (In Percent )_sum'] || 0) + (Number(item['Sorting Accuracy Today (In Percent )']) || 0);
              acc['Sorting Accuracy Today (In Percent )_count'] = (acc['Sorting Accuracy Today (In Percent )_count'] || 0) + 1;
            }
            // Material recovery fields
            const materialFields = [
              'Bhangar (in tons)', 'Black Plastic (in tons)', 'Carton (in tons)', 'Duplex (in tons)', 'Glass (in tons)',
              'Grey Board (in tons)', 'HD Cloth (in tons)', 'LD  (in tons)', 'HM (in tons)', 'Record (in tons)',
              'Sole (in tons)', 'Plastic (in tons)', 'Aluminium (in tons)', 'Aluminium can (in tons)',
              'Pet Bottle  (in tons)', 'Milk Pouch  (in tons)',
            ];
            materialFields.forEach((field) => {
              acc[field] = (acc[field] || 0) + (Number(item[field]) || 0);
            });
            // Text fields to concatenate
            if (item['Any Machine Issues Today?'] && item['Any Machine Issues Today?'] !== 'No') {
              acc['Any Machine Issues Today?'] = (acc['Any Machine Issues Today?'] || '') + `${formatTimestamp(item.Timestamp)}: ${item['Any Machine Issues Today?']}; `;
            }
            if (item['Any Safety Incident Today?'] && item['Any Safety Incident Today?'] !== 'No') {
              acc['Any Safety Incident Today?'] = (acc['Any Safety Incident Today?'] || '') + `${formatTimestamp(item.Timestamp)}: ${item['Any Safety Incident Today?']}; `;
            }
            if (item['Any VIP Visit Today?'] && item['Any VIP Visit Today?'] !== 'No') {
              acc['Any VIP Visit Today?'] = (acc['Any VIP Visit Today?'] || '') + `${formatTimestamp(item.Timestamp)}: ${item['Any VIP Visit Today?']}; `;
            }
            if (item['Equipment Maintenance Performed Today?'] && item['Equipment Maintenance Performed Today?'] !== 'No') {
              acc['Equipment Maintenance Performed Today?'] = (acc['Equipment Maintenance Performed Today?'] || '') + `${formatTimestamp(item.Timestamp)}: ${item['Equipment Maintenance Performed Today?']}; `;
            }
            if (item['Priority Tasks for Tomorrow']) {
              acc['Priority Tasks for Tomorrow'] = (acc['Priority Tasks for Tomorrow'] || '') + `${formatTimestamp(item.Timestamp)}: ${item['Priority Tasks for Tomorrow']}; `;
            }
          }
          return acc;
        }, {})
      : null;

    // If no data in range, provide default empty object
    if (!filteredData) {
      filteredData = {
        'Waste Received (in tons)': 0,
        'Waste Processed (in tons)': 0,
        'Waste Reject (in tons )': 0,
        'Waste Unprocessed (in tons)': 0,
        'RDF Processed (in tons)': 0,
        'AFR Processed (in tons)': 0,
        'Inert Processed (in tons)': 0,
        'Ragpicker Count Present Today': 0,
        'Machine Down Time Today (In Hours)': 0,
        'Sorting Accuracy Today (In Percent )': 0,
        'Machine Up Time Today (In Hours)': 0,
        'Bhangar (in tons)': 0,
        'Black Plastic (in tons)': 0,
        'Carton (in tons)': 0,
        'Duplex (in tons)': 0,
        'Glass (in tons)': 0,
        'Grey Board (in tons)': 0,
        'HD Cloth (in tons)': 0,
        'LD  (in tons)': 0,
        'HM (in tons)': 0,
        'Record (in tons)': 0,
        'Sole (in tons)': 0,
        'Plastic (in tons)': 0,
        'Aluminium (in tons)': 0,
        'Aluminium can (in tons)': 0,
        'Pet Bottle  (in tons)': 0,
        'Milk Pouch  (in tons)': 0,
        'Any Machine Issues Today?': 'N/A',
        'Any Safety Incident Today?': 'N/A',
        'Any VIP Visit Today?': 'N/A',
        'Equipment Maintenance Performed Today?': 'N/A',
        'Priority Tasks for Tomorrow': 'N/A',
      };
    } else {
      // Compute average for Sorting Accuracy
      if (filteredData['Sorting Accuracy Today (In Percent )_count']) {
        filteredData['Sorting Accuracy Today (In Percent )'] = filteredData['Sorting Accuracy Today (In Percent )_sum'] / filteredData['Sorting Accuracy Today (In Percent )_count'];
      } else {
        filteredData['Sorting Accuracy Today (In Percent )'] = 0;
      }
      // Clean up temporary fields
      delete filteredData['Sorting Accuracy Today (In Percent )_sum'];
      delete filteredData['Sorting Accuracy Today (In Percent )_count'];
    }
  }

  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">
          {isSingleDate ? 'Daily Waste Processing Summary' : 'Waste Processing Summary for Range'}
        </h2>
        <span className="text-sm text-white mt-2 md:mt-0">
          {isSingleDate ? 'Report Date' : 'Date Range'}: {displayDate}
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <WasteOverview data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <ProcessingBreakdown data={filteredData} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <OperationalMetrics data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <MaterialRecovery data={filteredData} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-6 items-stretch">
        <div className="w-full lg:w-1/2">
          <IncidentMaintenanceCard data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <PriorityTasksCard data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;