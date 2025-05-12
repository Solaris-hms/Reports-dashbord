import React from 'react';

const MetricCard = ({ icon: Icon, label, value, iconColor = 'text-blue-500' }) => {
  return (
    <div className="flex flex-col justify-center items-center text-center gap-3 p-5 h-full rounded-xl bg-white/0 backdrop-blur-md shadow-lg">
      <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-white/80 border ${iconColor}`}>
        <Icon className={`text-2xl ${iconColor}`} />
      </div>
      <div className="text-3xl font-bold text-gray-800">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
    </div>
  );
};

export default MetricCard;