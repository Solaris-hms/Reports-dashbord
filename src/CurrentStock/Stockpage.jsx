import React from 'react';
import Totalstock from './Stockchart';

const Stock = ({ stockData, selectedDate }) => {
  const formatStockData = (data) => {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    const selectedData = data.find((item) => item.datestring === selectedDate);

    if (!selectedData) {
      return [];
    }

    const formattedData = [
      { name: 'Bhangar', stock: selectedData['Bhangar (in tons)'] },
      { name: 'Black Plastic', stock: selectedData['Black Plastic (in tons)'] },
      { name: 'Carton', stock: selectedData['Carton (in tons)'] },
      { name: 'Duplex', stock: selectedData['Duplex (in tons)'] },
      { name: 'Glass', stock: selectedData['Glass (in tons)'] },
      { name: 'Grey Board', stock: selectedData['Grey Board (in tons)'] },
      { name: 'HD Cloth', stock: selectedData['HD Cloth (in tons)'] },
      { name: 'LD', stock: selectedData['LD  (in tons)'] },
      { name: 'HM', stock: selectedData['HM (in tons)'] },
      { name: 'Record', stock: selectedData['Record (in tons)'] },
      { name: 'Sole', stock: selectedData['Sole (in tons)'] },
      { name: 'Plastic', stock: selectedData['Plastic (in tons)'] },
      { name: 'Aluminium Can', stock: selectedData['Aluminium can (in tons)'] },
      { name: 'Pet Bottle', stock: selectedData['Pet Bottle  (in tons)'] },
      { name: 'Milk Pouch', stock: selectedData['Milk Pouch  (in tons)'] },
    ].filter((item) => item.stock >= 0); // Remove negative values

    return formattedData;
  };

  const chartData = formatStockData(stockData);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
          Daily Stock Summary
        </h2>
        <span className="text-xs sm:text-sm text-white mt-2 md:mt-0">
          Report Date: {selectedDate}
        </span>
      </div>

      {chartData.length === 0 && (
        <p className="text-white text-center text-sm sm:text-base">
          No stock data available for {selectedDate}
        </p>
      )}

      <div className="mb-6">
        <Totalstock data={chartData} selectedDate={selectedDate} />
      </div>
    </div>
  );
};

export default Stock;
