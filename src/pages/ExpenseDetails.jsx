import React, { useState } from 'react';
import RevenueDetailsCard from './RevenueDetailsCard';
import { FaGasPump, FaBolt, FaTools, FaReceipt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseDetails = ({ data }) => {
  const [showOtherDetails, setShowOtherDetails] = useState(false);

  const toggleDetails = () => {
    setShowOtherDetails(!showOtherDetails);
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0.00';
    return `₹${Number(value).toFixed(2)}`;
  };

  const parseBifurcation = () => {
    const remarks = data ? data['Bifurcation of expenses (Remarks)'] || '' : '';
    const transportation = data ? data['Transportation Expenses'] || 0 : 0;
    const items = [];

    if (remarks) {
      const remarkItems = remarks.split(',').map((item) => item.trim());
      remarkItems.forEach((item) => {
        const match = item.match(/^(\d+\.?\d*|-)\/?-?\s*(.*)$/);
        if (match) {
          const amount = parseFloat(match[1]);
          const description = match[2] || 'Miscellaneous';
          if (!isNaN(amount)) {
            items.push({ description, amount });
          }
        }
      });
    }

    if (transportation > 0) {
      items.push({ description: 'Transportation Expenses', amount: transportation });
    }

    return items;
  };

  const bifurcationItems = parseBifurcation();
  const otherExpensesTotal = data ? data['Any other'] || 0 : 0;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg w-full h-full">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Expense Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <RevenueDetailsCard
          icon={FaGasPump}
          value={formatCurrency(data ? data['Diesel Cost'] : 0)}
          label="Diesel Cost"
          color="text-red-500"
          bgColor="bg-red-100"
        />
        <RevenueDetailsCard
          icon={FaBolt}
          value={formatCurrency(data ? data['Electricity Cost'] : 0)}
          label="Electricity Cost"
          color="text-yellow-500"
          bgColor="bg-yellow-100"
        />
        <RevenueDetailsCard
          icon={FaTools}
          value={formatCurrency(data ? data['Maintenance Cost'] : 0)}
          label="Maintenance Cost"
          color="text-blue-500"
          bgColor="bg-blue-100"
        />
        <div className="bg-purple-100 p-4 rounded-xl shadow-md flex flex-col items-start justify-between">
          <div className="flex items-center mb-2">
            <FaReceipt className="text-purple-500 text-2xl mr-3" />
            <div>
              <div className="text-gray-700 font-semibold text-base">Other Expenses</div>
              <div className="text-gray-800 font-bold text-lg">{formatCurrency(otherExpensesTotal)}</div>
            </div>
          </div>
          <button
            onClick={toggleDetails}
            className="text-purple-600 text-sm font-medium hover:underline focus:outline-none mt-2"
          >
            {showOtherDetails ? 'Hide Details ▲' : 'View More ▼'}
          </button>
          <AnimatePresence>
            {showOtherDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-3 overflow-hidden text-gray-600 text-sm space-y-2"
              >
                {bifurcationItems.length > 0 ? (
                  bifurcationItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.description}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div>No additional expense details available</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;