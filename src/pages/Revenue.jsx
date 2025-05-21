import React from 'react';
import RevenueDetails from './RevenueDetails';
import MaterialRevenue from './MaterialRevenueBreakdown';
import ExpenseDetails from './ExpenseDetails';

const Revenue = ({ revenueData, selectedDate, dateRange }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Determine if it's a single date or a range
  const isSingleDate = !selectedDate.includes(' to ');

  let filteredData = null;

  if (isSingleDate) {
    // Filter for a single date
    filteredData = revenueData
      ? revenueData.find((item) => formatTimestamp(item.Timestamp) === selectedDate)
      : null;

    // If no data for the exact date, create an empty object to avoid errors
    if (!filteredData) {
      filteredData = {
        'RDF Revenue ( in ₹ )': 0,
        'AFR Revenue (in ₹)': 0,
        'Total Recyclables Revenue ( in ₹ )': 0,
        'Total Amount Credited in Bank Today': 0,
        'Diesel Cost': 0,
        'Electricity Cost': 0,
        'Maintenance Cost': 0,
        'Any other': 0,
        'Transportation Expenses': 0,
        'Bifurcation of expenses (Remarks)': '',
        Bhangar: 0,
        'Black plastic': 0,
        Carton: 0,
        Duplex: 0,
        Glass: 0,
        'Grey board': 0,
        'HD cloth': 0,
        LD: 0,
        Record: 0,
        Sole: 0,
        Plastic: 0,
        'Bear cane': 0,
        'Pet Bottle': 0,
        'Milk pouch': 0,
      };
    }
  } else {
    // Aggregate data for the date range
    filteredData = revenueData
      ? revenueData.reduce((acc, item) => {
          const itemDate = new Date(item.Timestamp);
          if (itemDate >= dateRange.start && itemDate <= dateRange.end) {
            acc['RDF Revenue ( in ₹ )'] = (acc['RDF Revenue ( in ₹ )'] || 0) + (Number(item['RDF Revenue ( in ₹ )']) || 0);
            acc['AFR Revenue (in ₹)'] = (acc['AFR Revenue (in ₹)'] || 0) + (Number(item['AFR Revenue (in ₹)']) || 0);
            acc['Total Recyclables Revenue ( in ₹ )'] =
              (acc['Total Recyclables Revenue ( in ₹ )'] || 0) + (Number(item['Total Recyclables Revenue ( in ₹ )']) || 0);
            acc['Total Amount Credited in Bank Today'] =
              (acc['Total Amount Credited in Bank Today'] || 0) + (Number(item['Total Amount Credited in Bank Today']) || 0);
            acc['Diesel Cost'] = (acc['Diesel Cost'] || 0) + (Number(item['Diesel Cost']) || 0);
            acc['Electricity Cost'] = (acc['Electricity Cost'] || 0) + (Number(item['Electricity Cost']) || 0);
            acc['Maintenance Cost'] = (acc['Maintenance Cost'] || 0) + (Number(item['Maintenance Cost']) || 0);
            acc['Any other'] = (acc['Any other'] || 0) + (Number(item['Any other']) || 0);
            acc['Transportation Expenses'] = (acc['Transportation Expenses'] || 0) + (Number(item['Transportation Expenses']) || 0);

            // Aggregate material revenues
            const materialFields = [
              'Bhangar', 'Black plastic', 'Carton', 'Duplex', 'Glass', 'Grey board',
              'HD cloth', 'LD', 'Record', 'Sole', 'Plastic', 'Bear cane', 'Pet Bottle', 'Milk pouch'
            ];
            materialFields.forEach((field) => {
              acc[field] = (acc[field] || 0) + (Number(item[field]) || 0);
            });

            // Collect bifurcation remarks
            if (item['Bifurcation of expenses (Remarks)']) {
              acc['Bifurcation of expenses (Remarks)'] = (
                acc['Bifurcation of expenses (Remarks)'] || ''
              ) + (item['Bifurcation of expenses (Remarks)'] + ',');
            }
          }
          return acc;
        }, {})
      : null;

    // If no data in range, provide default empty object
    if (!filteredData) {
      filteredData = {
        'RDF Revenue ( in ₹ )': 0,
        'AFR Revenue (in ₹)': 0,
        'Total Recyclables Revenue ( in ₹ )': 0,
        'Total Amount Credited in Bank Today': 0,
        'Diesel Cost': 0,
        'Electricity Cost': 0,
        'Maintenance Cost': 0,
        'Any other': 0,
        'Transportation Expenses': 0,
        'Bifurcation of expenses (Remarks)': '',
        Bhangar: 0,
        'Black plastic': 0,
        Carton: 0,
        Duplex: 0,
        Glass: 0,
        'Grey board': 0,
        'HD cloth': 0,
        LD: 0,
        Record: 0,
        Sole: 0,
        Plastic: 0,
        'Bear cane': 0,
        'Pet Bottle': 0,
        'Milk pouch': 0,
      };
    }
  }

  const displayDate = selectedDate || 'N/A';

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c]">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-md">
          Revenue Summary {isSingleDate ? 'for Date' : 'for Range'}
        </h2>
        <span className="text-sm text-white mt-2 md:mt-0">
          {isSingleDate ? 'Report Date' : 'Date Range'}: {displayDate}
        </span>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="w-full lg:w-1/2">
          <RevenueDetails data={filteredData} />
        </div>
        <div className="w-full lg:w-1/2">
          <ExpenseDetails data={filteredData} />
        </div>
      </div>
      <div className="mb-6">
        <MaterialRevenue data={filteredData} />
      </div>
    </div>
  );
};

export default Revenue;