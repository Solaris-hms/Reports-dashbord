import React from 'react';

const PriorityTasksCard = ({ data }) => {
  const task = data ? data['Priority Tasks for Tomorrow'] : 'N/A';

  // Helper function to format task data
  const formatTasks = (text) => {
    if (text === 'N/A' || !text) return 'N/A';
    // Split concatenated tasks by semicolon and filter out empty entries
    const tasks = text.split(';').map(item => item.trim()).filter(item => item);
    if (tasks.length === 0) return 'N/A';
    // Format as a list with date prefix
    return tasks.map(task => `• ${task}`).join('\n');
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full overflow-hidden">
      <h3 className="text-2xl font-semibold text-gray-700 mb-5">Priority Tasks for Tomorrow</h3>
      <div className="text-base text-gray-800 font-medium whitespace-pre-wrap">
        {formatTasks(task)}
      </div>
    </div>
  );
};

export default PriorityTasksCard;