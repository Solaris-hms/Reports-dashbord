import React from 'react';

const WasteOverviewCard = ({ icon: Icon, value, label, color, bgColor }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md ${bgColor} text-center`}>
      <div className={`text-4xl p-3 rounded-full  ${color} mb-2`}>
        <Icon />
      </div>
      <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
      <p className="text-sm text-gray-600 whitespace-pre-line">{label}</p>
    </div>
  );
};

export default WasteOverviewCard;
