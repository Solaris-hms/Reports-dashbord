import React from 'react';

// Helper function to format the date object into "2 July 2025"
const formatDate = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  // Using Intl.DateTimeFormat for robust, localized date formatting
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const IncidentMaintenanceCard = ({ data }) => {
  const incidentData = [
    { label: 'Machine Issues', value: data ? data['Any Machine Issues Today?'] : 'N/A' },
    { label: 'Safety Incidents', value: data ? data['Any Safety Incident Today?'] : 'N/A' },
    { label: 'VIP Visits', value: data ? data['Any VIP Visit Today?'] : 'N/A' },
    { label: 'Maintenance Performed', value: data ? data['Equipment Maintenance Performed Today?'] : 'N/A' },
  ];

  // This helper renders the final JSX, handling different data types
  const renderValue = (value) => {
    // Case 1: Value is an array of objects (from a date range)
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-600">N/A</span>;
      
      return (
        <div className="space-y-4">
          {value.map((entry, index) => {
              const formattedDate = formatDate(entry.date);
              return (
                <div key={index}>
                  {formattedDate && <strong className="font-bold text-gray-900 block mb-1">{formattedDate}</strong>}
                  <p className="text-gray-800">{entry.text}</p>
                </div>
              );
          })}
        </div>
      );
    }

    // Case 2: Value is a simple string (from a single day view)
    const text = String(value).trim();
    if (text && text.toLowerCase() !== 'no' && text.toLowerCase() !== 'na' && text.toLowerCase() !== 'n/a') {
      return <p className="text-gray-800">{text}</p>;
    }

    // Default case for empty or "N/A" strings
    return <span className="text-gray-600">N/A</span>;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full flex flex-col">
      <h3 className="text-2xl font-semibold text-gray-700 mb-5">Incidents & Maintenance Report</h3>
      <div className="space-y-5 overflow-y-auto flex-grow pr-2">
        {incidentData.map((item, idx) => (
          <div key={idx} className="flex flex-col text-base">
            <span className="font-semibold text-gray-600 text-lg">{item.label}:</span>
            <div className="pl-2 mt-2">
              {renderValue(item.value)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentMaintenanceCard;