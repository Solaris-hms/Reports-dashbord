import React from 'react';

const IncidentMaintenanceCard = ({ data }) => {
  const incidentData = [
    { label: 'Machine Issues', value: data ? data['Any Machine Issues Today?'] : 'N/A' },
    { label: 'Safety Incidents', value: data ? data['Any Safety Incident Today?'] : 'N/A' },
    { label: 'VIP Visits', value: data ? data['Any VIP Visit Today?'] : 'N/A' },
    { label: 'Maintenance Performed', value: data ? data['Equipment Maintenance Performed Today?'] : 'N/A' },
  ];

  // Helper function to format text data
  const formatText = (text) => {
    if (text === 'N/A' || !text) return 'N/A';
    // Split concatenated text by semicolon and filter out empty entries
    const items = text.split(';').map(item => item.trim()).filter(item => item);
    if (items.length === 0) return 'N/A';
    // Join with newlines for display
    return items.join('\n');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full overflow-hidden">
      <h3 className="text-2xl font-semibold text-gray-700 mb-5">Incidents & Maintenance Report</h3>
      <div className="space-y-4">
        {incidentData.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-start sm:gap-4 text-base text-gray-800 break-words"
          >
            <span className="font-medium text-gray-700 min-w-[160px]">{item.label}:</span>
            <span className="whitespace-pre-wrap break-words overflow-hidden">
              {formatText(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentMaintenanceCard;