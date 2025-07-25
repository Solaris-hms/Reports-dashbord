import React from 'react';

// Helper function to format the date object into "2 July 2025"
const formatDate = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const PriorityTasksCard = ({ data }) => {
  const taskValue = data ? data['Priority Tasks for Tomorrow'] : 'N/A';

  const renderTasks = (value) => {
    // Case 1: Value is an array of objects (from a date range)
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-600">N/A</span>;

      return (
        <div className="space-y-4">
          {value.map((task, index) => {
            const formattedDate = formatDate(task.date);
            return (
              <div key={index}>
                {formattedDate && <strong className="font-bold text-gray-900 block mb-1">Tasks from {formattedDate}:</strong>}
                <div className="flex items-start">
                  <span className="mr-2 mt-1 text-blue-500 font-bold">•</span>
                  <p className="text-gray-800">{task.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Case 2: Value is a single string (from a single day view)
    const text = String(value).trim();
    if (text && text.toLowerCase() !== 'no' && text.toLowerCase() !== 'na' && text.toLowerCase() !== 'n/a') {
      return (
        <div className="flex items-start">
          <span className="mr-2 mt-1 text-blue-500 font-bold">•</span>
          <p className="text-gray-800">{text}</p>
        </div>
      );
    }

    // Default case
    return <span className="text-gray-600">N/A</span>;
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full flex flex-col">
      <h3 className="text-2xl font-semibold text-gray-700 mb-5">Priority Tasks for Tomorrow</h3>
      <div className="text-base font-medium overflow-y-auto flex-grow pr-2">
        {renderTasks(taskValue)}
      </div>
    </div>
  );
};

export default PriorityTasksCard;