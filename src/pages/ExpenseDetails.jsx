import React, { useState } from 'react';
import RevenueDetailsCard from './RevenueDetailsCard';
import { FaGasPump, FaBolt, FaTools, FaReceipt, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ExpenseDetails = ({ data }) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
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
      const remarkItems = remarks
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item);
      remarkItems.forEach((item) => {
        const match = item.match(/^(\d+\.?\d*|-)\/?-?\s*(.*)$/);
        if (match) {
          const amount = parseFloat(match[1]);
          const description = match[2] || 'Miscellaneous';
          if (!isNaN(amount)) {
            items.push({ description, amount });
          }
        } else {
          items.push({ description: item, amount: 0 });
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
    <>
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
              onClick={openModal}
              className="text-purple-700 font-semibold text-sm hover:text-purple-900 transition-colors duration-300 focus:outline-none mt-2"
              aria-label="View Breakdown of other expenses"
            >
              View Breakdown
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Blurred background overlay */}
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            {/* Modal content */}
            <motion.div
              className="fixed top-1/2 left-1/2 z-50 w-11/12 max-w-md p-6 bg-white rounded-2xl shadow-lg transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Other Expense Details</h3>
                <button
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto text-gray-600 text-sm">
                {bifurcationItems.length > 0 ? (
                  bifurcationItems.map((item, index) => (
                    <div key={index} className="flex justify-between border-b border-gray-200 pb-1">
                      <span>{item.description}</span>
                      <span>{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div>No additional expense details available</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpenseDetails;
