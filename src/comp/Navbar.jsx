import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { Menu, X, CalendarDays } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Navbar = ({ setSelectedDate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownValue, setDropdownValue] = useState('');
  const [prevDropdownValue, setPrevDropdownValue] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [focusedDate, setFocusedDate] = useState(null);
  const location = useLocation();

  const isCurrentStock = location.pathname === '/current-stock';

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (isCurrentStock) {
      const today = new Date();
      setFocusedDate(today);
      setSelectedDate(formatDate(today));
      setDropdownValue('');
    }
  }, [isCurrentStock]);

  const handleDateChange = (date) => {
    if (!date || isNaN(date)) return;
    setFocusedDate(date);
    setSelectedDate(formatDate(date));
    setDropdownValue(''); // Reset dropdown to "Range"
  };

  const handleRangeChange = (e) => {
    const value = e.target.value;
    const today = new Date();
    let startDate = new Date();

    if (value === 'Custom Range') {
      setPrevDropdownValue(dropdownValue);
      setDropdownValue('Custom Range');
      setShowCustomPicker(true);
      return;
    }

    switch (value) {
      case 'Today':
        setDropdownValue(value);
        setSelectedDate(formatDate(today));
        setFocusedDate(null);
        return;
      case 'Last 7 Days':
        startDate.setDate(today.getDate() - 6);
        break;
      case 'Last 1 Month':
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(startDate.getDate() + 1);
        break;
      case 'Last 3 Months':
        startDate.setMonth(today.getMonth() - 3);
        startDate.setDate(startDate.getDate() + 1);
        break;
      case 'Last 6 Months':
        startDate.setMonth(today.getMonth() - 6);
        startDate.setDate(startDate.getDate() + 1);
        break;
      case 'Last 1 Year':
        startDate.setFullYear(today.getFullYear() - 1);
        startDate.setDate(startDate.getDate() + 1);
        break;
      default:
        return;
    }

    setDropdownValue(value);
    setPrevDropdownValue(value);
    setFocusedDate(null);
    setSelectedDate(`${formatDate(startDate)} to ${formatDate(today)}`);
    setShowCustomPicker(false);
  };

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`hover:underline ${location.pathname === path ? 'font-bold underline' : ''}`}
    >
      {label}
    </Link>
  );

  const Dropdown = () => (
    <select
      value={dropdownValue}
      onChange={handleRangeChange}
      className="bg-white/20 text-white text-sm rounded-md px-3 py-1 border border-white/30 backdrop-blur-md shadow-md hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white transition duration-300 cursor-pointer"
    >
      {!dropdownValue && <option value="" hidden>Range</option>}
      <option className="text-black" value="Today">Today</option>
      <option className="text-black" value="Last 7 Days">Last 7 Days</option>
      <option className="text-black" value="Last 1 Month">Last 1 Month</option>
      <option className="text-black" value="Last 3 Months">Last 3 Months</option>
      <option className="text-black" value="Last 6 Months">Last 6 Months</option>
      <option className="text-black" value="Last 1 Year">Last 1 Year</option>
      <option className="text-black" value="Custom Range">Custom Range</option>
    </select>
  );

  const renderDatePicker = () => {
    const isToday = dropdownValue === 'Today';
    const selected =
      isToday || !focusedDate
        ? isToday
          ? new Date()
          : null
        : focusedDate instanceof Date && !isNaN(focusedDate)
        ? focusedDate
        : null;

    const placeholderText = isToday ? formatDate(new Date()) : 'Pick a particular date';

    return (
      <DatePicker
        selected={selected}
        onChange={handleDateChange}
        placeholderText={placeholderText}
        dateFormat="dd/MM/yyyy"
        className="bg-transparent text-white text-sm outline-none cursor-pointer w-[150px]"
        popperPlacement="bottom-end"
        calendarClassName="bg-white rounded-xl p-2 shadow-xl border border-gray-200"
        dayClassName={() =>
          'text-gray-700 hover:bg-blue-100 transition duration-150 rounded-full'
        }
        minDate={new Date('2025-01-01')}
        maxDate={new Date('2075-05-02')}
      />
    );
  };

  return (
    <header className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 shadow-md fixed w-full z-10 top-0 left-0">
      <div className="flex justify-between items-start md:items-center">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Solaris Logo" className="h-10 w-10 rounded" />
          <span className="text-xl font-bold">Solaris</span>
        </div>

        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex space-x-6 text-sm md:text-base">
            {navLink('/revenue', 'Revenue')}
            {navLink('/workforce', 'Workforce')}
            {navLink('/waste-processing', 'Waste Processing')}
            {navLink('/current-stock', 'Current Stock')}
          </nav>

          <div className="hidden md:flex items-center space-x-2">
            <div className="flex items-center bg-white/20 px-3 py-1 rounded-md shadow-md space-x-2 hover:bg-white/30 transition duration-300 backdrop-blur-md border border-white/30">
              <CalendarDays size={18} className="text-white" />
              {renderDatePicker()}
            </div>
            {!isCurrentStock && <Dropdown />}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden mt-4 space-y-4">
          <div className="flex items-center bg-white/20 px-3 py-2 rounded-md shadow-md space-x-2 border border-white/30 backdrop-blur-md">
            <CalendarDays size={18} className="text-white" />
            {renderDatePicker()}
          </div>

          {!isCurrentStock && <Dropdown />}

          <div className="flex flex-col space-y-2">
            {navLink('/revenue', 'Revenue')}
            {navLink('/workforce', 'Workforce')}
            {navLink('/waste-processing', 'Waste Processing')}
            {navLink('/current-stock', 'Current Stock')}
          </div>
        </div>
      )}

      {showCustomPicker && (
        <div className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center transition-opacity duration-300 ease-out">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md space-y-5 animate-fadeInScale">
            <h2 className="text-xl font-semibold text-gray-800">Select Custom Date Range</h2>
            <div className="flex flex-col space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Start Date</label>
                <DatePicker
                  selected={customStartDate}
                  onChange={(date) => setCustomStartDate(date)}
                  selectsStart
                  startDate={customStartDate}
                  endDate={customEndDate}
                  maxDate={new Date()}
                  placeholderText="Select start date"
                  className="w-full border px-3 py-2 rounded-md text-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">End Date</label>
                <DatePicker
                  selected={customEndDate}
                  onChange={(date) => setCustomEndDate(date)}
                  selectsEnd
                  startDate={customStartDate}
                  endDate={customEndDate}
                  minDate={customStartDate}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  className="w-full border px-3 py-2 rounded-md text-gray-800"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setDropdownValue(prevDropdownValue);
                  setShowCustomPicker(false);
                  setCustomStartDate(null);
                  setCustomEndDate(null);
                }}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    const rangeText = `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
                    setSelectedDate(rangeText);
                    setFocusedDate(null);
                    setShowCustomPicker(false);
                    setPrevDropdownValue('Custom Range');
                    setDropdownValue('Custom Range');
                  }
                }}
                disabled={!customStartDate || !customEndDate}
                className={`px-4 py-2 rounded text-sm ${
                  customStartDate && customEndDate
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-blue-200 text-white cursor-not-allowed'
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeInScale {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-fadeInScale {
            animation: fadeInScale 0.3s ease-out;
          }
        `}
      </style>
    </header>
  );
};

export default Navbar;
