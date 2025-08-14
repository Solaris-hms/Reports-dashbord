import React from 'react';
import WasteOverview from './WasteOverview';
import ProcessingBreakdown from './ProcessingBreakdown';
import OperationalMetrics from './OperationaMetric';
import MaterialRecovery from './MaterialRecovery';
import IncidentMaintenanceCard from './incidents';
import PriorityTasksCard from './PriorityTask';
import { Download } from 'lucide-react'; // <-- Import icon
import * as XLSX from 'xlsx'; // <-- Import xlsx library

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

  // --- NEW: Excel Export Functionality ---
  const handleExport = () => {
    if (!filteredData) {
      alert("No data available to export.");
      return;
    }
    const wb = XLSX.utils.book_new();

    // Helper to format text entries for Excel
    const formatTextEntries = (data) => {
        if (Array.isArray(data)) {
            return data.map(entry => `${entry.date.toLocaleDateString()}: ${entry.text}`).join('\n');
        }
        return data;
    };

    // Sheet 1: Summary
    const summaryData = [
        { "Report Period": selectedDate },
        { "Total Waste Received (Tons)": filteredData['Waste Received (in tons)'].toFixed(2) },
        { "Total Waste Processed (Tons)": filteredData['Waste Processed (in tons)'].toFixed(2) },
        { "Average Sorting Accuracy (%)": Number(filteredData['Sorting Accuracy Today (In Percent )']).toFixed(2) },
    ];
    const ws_summary = XLSX.utils.json_to_sheet(summaryData, { skipHeader: true });
    XLSX.utils.book_append_sheet(wb, ws_summary, "Summary");

    // Sheet 2: Waste Overview
    const wasteOverviewData = [
        { Metric: "Waste Received (Tons)", Value: filteredData['Waste Received (in tons)'].toFixed(2) },
        { Metric: "Waste Processed (Tons)", Value: filteredData['Waste Processed (in tons)'].toFixed(2) },
        { Metric: "Waste Reject (Tons)", Value: filteredData['Waste Reject (in tons )'].toFixed(2) },
        { Metric: "Waste Unprocessed (Tons)", Value: filteredData['Waste Unprocessed (in tons)'].toFixed(2) },
    ];
    const ws_overview = XLSX.utils.json_to_sheet(wasteOverviewData);
    XLSX.utils.book_append_sheet(wb, ws_overview, "Waste Overview");

    // Sheet 3: Processing Breakdown
    const processingBreakdownData = [
        { Metric: "RDF Processed (Tons)", Value: filteredData['RDF Processed (in tons)'].toFixed(2) },
        { Metric: "AFR Processed (Tons)", Value: filteredData['AFR Processed (in tons)'].toFixed(2) },
        { Metric: "Inert Processed (Tons)", Value: filteredData['Inert Processed (in tons)'].toFixed(2) },
    ];
    const ws_processing = XLSX.utils.json_to_sheet(processingBreakdownData);
    XLSX.utils.book_append_sheet(wb, ws_processing, "Processing Breakdown");

    // Sheet 4: Operational Metrics
    const operationalMetricsData = [
        { Metric: "Ragpickers Present", Value: filteredData['Ragpicker Count Present Today'] },
        { Metric: "Machine Downtime (Hours)", Value: filteredData['Machine Down Time Today (In Hours)'].toFixed(2) },
        { Metric: "Machine Uptime (Hours)", Value: filteredData['Machine Up Time Today (In Hours)'].toFixed(2) },
        { Metric: "Sorting Accuracy (%)", Value: Number(filteredData['Sorting Accuracy Today (In Percent )']).toFixed(2) },
    ];
    const ws_ops = XLSX.utils.json_to_sheet(operationalMetricsData);
    XLSX.utils.book_append_sheet(wb, ws_ops, "Operational Metrics");

    // Sheet 5: Material Recovery
    const materialRecoveryData = [
        { Material: 'Bhangar', Tons: filteredData['Bhangar (in tons)'].toFixed(3) },
        { Material: 'Black Plastic', Tons: filteredData['Black Plastic (in tons)'].toFixed(3) },
        { Material: 'Carton', Tons: filteredData['Carton (in tons)'].toFixed(3) },
        { Material: 'Duplex', Tons: filteredData['Duplex (in tons)'].toFixed(3) },
        { Material: 'Glass', Tons: filteredData['Glass (in tons)'].toFixed(3) },
        { Material: 'Grey Board', Tons: filteredData['Grey Board (in tons)'].toFixed(3) },
        { Material: 'HD Cloth', Tons: filteredData['HD Cloth (in tons)'].toFixed(3) },
        { Material: 'LD', Tons: filteredData['LD  (in tons)'].toFixed(3) },
        { Material: 'HM', Tons: filteredData['HM (in tons)'].toFixed(3) },
        { Material: 'Record', Tons: filteredData['Record (in tons)'].toFixed(3) },
        { Material: 'Sole', Tons: filteredData['Sole (in tons)'].toFixed(3) },
        { Material: 'Plastic', Tons: filteredData['Plastic (in tons)'].toFixed(3) },
        { Material: 'Aluminium', Tons: filteredData['Aluminium (in tons)'].toFixed(3) },
        { Material: 'Aluminium Can', Tons: filteredData['Aluminium can (in tons)'].toFixed(3) },
        { Material: 'PET Bottle', Tons: filteredData['Pet Bottle  (in tons)'].toFixed(3) },
        { Material: 'Milk Pouch', Tons: filteredData['Milk Pouch  (in tons)'].toFixed(3) },
    ];
    const ws_recovery = XLSX.utils.json_to_sheet(materialRecoveryData);
    XLSX.utils.book_append_sheet(wb, ws_recovery, "Material Recovery");

    // Sheet 6: Incidents & Tasks
    const incidentsTasksData = [
        { Category: "Machine Issues", Details: formatTextEntries(filteredData['Any Machine Issues Today?']) },
        { Category: "Safety Incidents", Details: formatTextEntries(filteredData['Any Safety Incident Today?']) },
        { Category: "VIP Visits", Details: formatTextEntries(filteredData['Any VIP Visit Today?']) },
        { Category: "Maintenance Performed", Details: formatTextEntries(filteredData['Equipment Maintenance Performed Today?']) },
        { Category: "Priority Tasks for Tomorrow", Details: formatTextEntries(filteredData['Priority Tasks for Tomorrow']) },
    ];
    const ws_incidents = XLSX.utils.json_to_sheet(incidentsTasksData);
    XLSX.utils.book_append_sheet(wb, ws_incidents, "Incidents & Tasks");

    XLSX.writeFile(wb, `Waste_Processing_Report_${selectedDate.replace(/\//g, '-')}.xlsx`);
  };

  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white drop-shadow-md">
            {isSingleDate ? 'Daily Waste Processing Summary' : 'Waste Processing Summary for Range'}
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