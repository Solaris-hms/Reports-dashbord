import React from 'react';

const RevenueDetailsCard = ({ icon: Icon, value, label, color, bgColor }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md ${bgColor} text-center w-full`}>
      <div className={`text-3xl p-3 rounded-full ${color} mb-2`}>
        <Icon />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
      <p className="text-sm text-gray-600 text-center">{label}</p>
    </div>
  );
};

export default RevenueDetailsCard;