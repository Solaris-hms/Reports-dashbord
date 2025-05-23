import React from 'react';
import Totalstock from './Stockchart';

const Stock = ({ stockData, selectedDate }) => {
  // Convert today's date to DD/MM/YYYY to match your API datestring format
  const today = new Date();
  const todayDateString = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    today.getFullYear(),
  ].join('/');

  // Find index of selected date in the data array
  const selectedIndex = stockData.findIndex(item => item.datestring === selectedDate);

  // Get previous date data for opening stock (or null if none)
  const openingData = selectedIndex > 0 ? stockData[selectedIndex - 1] : null;
  // Get selected date data for closing stock (or null if not found)
  const closingData = selectedIndex !== -1 ? stockData[selectedIndex] : null;

  // Show custom message if no closing data available
  if (!closingData) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99f] flex items-center justify-center">
        <p className="text-white text-center text-sm sm:text-base max-w-xs">
          {selectedDate === todayDateString
            ? "Today's reports will be triggered at 9 PM."
            : `No stock data available for ${selectedDate}`}
        </p>
      </div>
    );
  }

  // Prepare combined data with opening and closing values for each material
  const formatCombinedData = (opening, closing) => {
    const materials = [
      'Bhangar (in tons)',
      'Black Plastic (in tons)',
      'Carton (in tons)',
      'Duplex (in tons)',
      'Glass (in tons)',
      'Grey Board (in tons)',
      'HD Cloth (in tons)',
      'LD  (in tons)',
      'HM (in tons)',
      'Record (in tons)',
      'Sole (in tons)',
      'Plastic (in tons)',
      'Aluminium can (in tons)',
      'Pet Bottle  (in tons)',
      'Milk Pouch  (in tons)',
    ];

    return materials.map(name => ({
      name: name.replace(' (in tons)', ''),
      opening: opening ? opening[name] : 0,
      closing: closing[name],
    }));
  };

  const chartData = formatCombinedData(openingData, closingData);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99f]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
          Daily Stock Summary
        </h2>
        <span className="text-xs sm:text-sm text-white mt-2 md:mt-0">
          Report Date: {selectedDate}
        </span>
      </div>

      <div className="mb-6">
        <Totalstock data={chartData} selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default Stock;
