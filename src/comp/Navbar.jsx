import React, { useState } from 'react';
import logo from '../assets/logo.png';
import { Menu, X, CalendarDays } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Navbar = ({ setSelectedDate }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedDate, setLocalSelectedDate] = useState(new Date());
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Handle date change and format as DD/MM/YYYY
  const handleDateChange = (date) => {
    if (!date) {
      console.log('No date selected');
      return;
    }
    setLocalSelectedDate(date);
    // Format date to DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    console.log('Navbar selected date:', formattedDate); // Debug log
    setSelectedDate(formattedDate);
  };

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`hover:underline ${
        location.pathname === path ? 'font-bold underline' : ''
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-4 shadow-md fixed w-full z-10 top-0 left-0">
      <div className="flex justify-between items-start md:items-center">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-3">
          <img src={logo} alt="WastePro Logo" className="h-8 w-8 rounded" />
          <span className="text-xl font-bold">WastePro</span>
        </div>

        {/* Right: Calendar & Links */}
        <div className="flex items-center space-x-6">
          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6 text-sm md:text-base">
            {navLink('/revenue', 'Revenue')}
            {navLink('/workforce', 'Workforce')}
            {navLink('/waste-processing', 'Waste Processing')}
            {navLink('/current-stock', 'Current Stock')}
          </nav>

          {/* Date Picker */}
          <div className="hidden md:flex items-center bg-white/20 px-3 py-1 rounded-md shadow-md space-x-2 hover:bg-white/30 transition duration-300 backdrop-blur-md border border-white/30">
            <CalendarDays size={18} className="text-white" />
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="bg-transparent text-white text-sm outline-none cursor-pointer w-[110px]"
              popperPlacement="bottom-end"
              calendarClassName="bg-white rounded-xl p-2 shadow-xl border border-gray-200"
              dayClassName={() =>
                'text-gray-700 hover:bg-blue-100 transition duration-150 rounded-full'
              }
              minDate={new Date('2025-01-01')} // Match datestring range
              maxDate={new Date('2075-05-02')}
            />
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-4">
          {/* Date Picker */}
          <div className="flex items-center bg-white/20 px-3 py-2 rounded-md shadow-md space-x-2 border border-white/30 backdrop-blur-md">
            <CalendarDays size={18} className="text-white" />
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="bg-transparent text-white text-sm outline-none cursor-pointer w-[110px]"
              popperPlacement="bottom-start"
              calendarClassName="bg-white rounded-xl p-2 shadow-xl border border-gray-200"
              dayClassName={() =>
                'text-gray-700 hover:bg-blue-100 transition duration-150 rounded-full'
              }
              minDate={new Date('2025-01-01')} // Match datestring range
              maxDate={new Date('2075-05-02')}
            />
          </div>

          <div className="flex flex-col space-y-2">
            {navLink('/revenue', 'Revenue')}
            {navLink('/workforce', 'Workforce')}
            {navLink('/waste-processing', 'Waste Processing')}
            {navLink('/current-stock', 'Current Stock')}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;