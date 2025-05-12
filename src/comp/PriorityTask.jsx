import React from 'react';

const PriorityTasksCard = ({ data }) => {
  const task = data ? data['Priority Tasks for Tomorrow'] : 'N/A';

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full overflow-hidden">
      <h3 className="text-2xl font-semibold text-gray-700 mb-5">Priority Task for Tomorrow</h3>
      <div className="text-base text-gray-800 font-medium">
        • {task}
      </div>
    </div>
  );
};

export default PriorityTasksCard;