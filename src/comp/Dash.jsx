import React from 'react';
import WasteOverview from './WasteOverview';
import ProcessingBreakdown from './ProcessingBreakdown';
import OperationalMetrics from './OperationaMetric';
import MaterialRecovery from './MaterialRecovery';
import IncidentMaintenanceCard from './incidents';
import PriorityTasksCard from './PriorityTask';

// --- DATE HELPER FUNCTIONS (required for filtering by ID) ---

// Converts a MMDDYYYY id string into a Date object
const parseIdToDate = (idStr) => {
    if (typeof idStr !== 'string' || idStr.length !== 8) return null;
    const month = parseInt(idStr.substring(0, 2), 10);
    const day = parseInt(idStr.substring(2, 4), 10);
    const year = parseInt(idStr.substring(4, 8), 10);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
    // JavaScript months are 0-indexed
    return new Date(year, month - 1, day);
};

const Dashboard = ({ plantData, selectedDate, dateRange }) => {
  
  // Converts DD/MM/YYYY to MMDDYYYY for ID matching
  const convertDateToId = (dateStr) => {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;
      // Format is MM DD YYYY
      return `${parts[1]}${parts[0]}${parts[2]}`;
  };

  const isSingleDate = !selectedDate.includes(' to ');

  let filteredData = null;

  // This is the default empty state for when no data is found
  const defaultEmptyData = {
    'Waste Received (in tons)': 0, 'Waste Processed (in tons)': 0, 'Waste Reject (in tons )': 0, 'Waste Unprocessed (in tons)': 0,
    'RDF Processed (in tons)': 0, 'AFR Processed (in tons)': 0, 'Inert Processed (in tons)': 0, 'Ragpicker Count Present Today': 0,
    'Machine Down Time Today (In Hours)': 0, 'Sorting Accuracy Today (In Percent )': 0, 'Machine Up Time Today (In Hours)': 0,
    'Bhangar (in tons)': 0, 'Black Plastic (in tons)': 0, 'Carton (in tons)': 0, 'Duplex (in tons)': 0, 'Glass (in tons)': 0,
    'Grey Board (in tons)': 0, 'HD Cloth (in tons)': 0, 'LD  (in tons)': 0, 'HM (in tons)': 0, 'Record (in tons)': 0,
    'Sole (in tons)': 0, 'Plastic (in tons)': 0, 'Aluminium (in tons)': 0, 'Aluminium can (in tons)': 0,
    'Pet Bottle  (in tons)': 0, 'Milk Pouch  (in tons)': 0, 'Any Machine Issues Today?': 'N/A',
    'Any Safety Incident Today?': 'N/A', 'Any VIP Visit Today?': 'N/A', 'Equipment Maintenance Performed Today?': 'N/A', 'Priority Tasks for Tomorrow': 'N/A',
  };


  if (isSingleDate) {
    const selectedId = convertDateToId(selectedDate);
    // Find a SINGLE record matching the ID.
    filteredData = plantData.find((item) => item.id === selectedId) || { ...defaultEmptyData };

  } else {
    // Logic for date range
    const rangeData = plantData.filter(item => {
        const itemDate = parseIdToDate(item.id);
        if (!itemDate) return false;
        // Normalize dates to midnight to ensure correct comparison
        const itemDateNormalized = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        const startDateNormalized = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), dateRange.start.getDate());
        const endDateNormalized = new Date(dateRange.end.getFullYear(), dateRange.end.getMonth(), dateRange.end.getDate());
        
        return itemDateNormalized >= startDateNormalized && itemDateNormalized <= endDateNormalized;
    });

    if (rangeData.length > 0) {
      filteredData = rangeData.reduce((acc, item) => {
          // Sum up all numerical fields
          Object.keys(defaultEmptyData).forEach(key => {
            if (typeof defaultEmptyData[key] === 'number') {
              acc[key] = (acc[key] || 0) + (Number(item[key]) || 0);
            }
          });

          // Handle Sorting Accuracy separately for averaging
          const accuracy = Number(item['Sorting Accuracy Today (In Percent )']);
          if (!isNaN(accuracy)) {
              acc.sortingAccuracySum = (acc.sortingAccuracySum || 0) + accuracy;
              acc.sortingAccuracyCount = (acc.sortingAccuracyCount || 0) + 1;
          }

          // ** [THE FIX] **
          // Aggregate text fields into arrays of objects for organized display
          const textFields = ['Any Machine Issues Today?', 'Any Safety Incident Today?', 'Any VIP Visit Today?', 'Equipment Maintenance Performed Today?', 'Priority Tasks for Tomorrow'];
          textFields.forEach(field => {
              const textValue = item[field] ? item[field].trim() : '';
              if (textValue && textValue.toLowerCase() !== 'no' && textValue.toLowerCase() !== 'na' && textValue.toLowerCase() !== 'n/a') {
                  const itemDate = parseIdToDate(item.id);
                  // Create an object with separate date and text properties
                  const newEntry = { date: itemDate, text: textValue };

                  // If the accumulator is still a string, initialize it as an array
                  if (!Array.isArray(acc[field])) {
                      acc[field] = [newEntry];
                  } else {
                      // Otherwise, push the new object
                      acc[field].push(newEntry);
                  }
              }
          });
          return acc;
      }, { ...defaultEmptyData, sortingAccuracySum: 0, sortingAccuracyCount: 0 }); 
      
      // Calculate the final average for Sorting Accuracy
      filteredData['Sorting Accuracy Today (In Percent )'] = 
          filteredData.sortingAccuracyCount > 0 
          ? (filteredData.sortingAccuracySum / filteredData.sortingAccuracyCount).toFixed(2)
          : 0;
      
      delete filteredData.sortingAccuracySum;
      delete filteredData.sortingAccuracyCount;

    } else {
      filteredData = { ...defaultEmptyData }; // If no data found, show empty state
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