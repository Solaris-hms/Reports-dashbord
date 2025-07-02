import React from 'react';
import Totalstock from './Stockchart'; // Make sure this path is correct

const Stock = ({ stockData, selectedDate }) => {
  // Utility function to get today's date in DD/MM/YYYY format
  const getTodayString = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  // Find index of the selected date using the correct 'datestring' key
  const selectedIndex = stockData.findIndex(item => item.datestring === selectedDate);
  
  // Data for the day before the selected date is the "Opening Stock"
  const openingData = selectedIndex > 0 ? stockData[selectedIndex - 1] : null;

  // Data for the selected date is the "Closing Stock"
  const closingData = selectedIndex !== -1 ? stockData[selectedIndex] : null;

  // Show a message if no data exists for the selected date
  if (!closingData) {
    const message = selectedDate === getTodayString()
      ? "Today's stock report has not been generated yet. It is usually available after 9 PM."
      : `No stock data is available for the selected date: ${selectedDate}`;

    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99f] flex items-center justify-center">
        <div className="text-white text-center bg-black bg-opacity-25 p-8 rounded-2xl shadow-xl backdrop-blur-sm max-w-md">
          <h3 className="text-2xl font-bold mb-2">Data Not Found</h3>
          <p className="text-base">{message}</p>
        </div>
      </div>
    );
  }

  // If data exists, format it for the chart
  const formatCombinedData = (opening, closing) => {
    const materials = [
      'Bhangar (in tons)', 'Black Plastic (in tons)', 'Carton (in tons)', 'Duplex (in tons)', 'Glass (in tons)',
      'Grey Board (in tons)', 'HD Cloth (in tons)', 'LD  (in tons)', 'HM (in tons)', 'Record (in tons)',
      'Sole (in tons)', 'Plastic (in tons)', 'Aluminium can (in tons)', 'Pet Bottle  (in tons)', 'Milk Pouch  (in tons)',
    ];

    return materials.map(name => ({
      name: name.replace(/ \(in tons\)| {2}/g, ''), // Regex to remove " (in tons)" and extra spaces
      opening: opening && typeof opening[name] === 'number' ? opening[name] : 0,
      closing: closing && typeof closing[name] === 'number' ? closing[name] : 0,
    }));
  };

  const chartData = formatCombinedData(openingData, closingData);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99f]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">Daily Stock Summary</h2>
        <span className="text-xs sm:text-sm text-white mt-2 md:mt-0">Report Date: {selectedDate}</span>
      </div>
      <div className="mb-6">
        <Totalstock data={chartData} selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default Stock;