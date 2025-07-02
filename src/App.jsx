import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './comp/Navbar';
import Workforce from './WorkforcePage/WorkforcePage';
import Dash from './comp/Dash';
import Revenue from './pages/Revenue';
import Stock from './CurrentStock/Stockpage';
import FinancialStatement from './pages/FinancialStatement';
import { stockapidata, workapidata, plantdata, revdata } from './FetchData';
import { Mirage } from 'ldrs/react';
import 'ldrs/react/Mirage.css';

// --- DATE HELPER FUNCTIONS ---

// Formats a Date object to a 'DD/MM/YYYY' string (App's standard format)
const formatDateToDDMMYYYY = (date) => {
  if (!date || isNaN(date.getTime())) return null; // Guard against invalid dates
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Formats a Date object to an 'MMDDYYYY' string for matching the 'id' field
const formatDateToMMDDYYYY = (date) => {
  if (!date || isNaN(date.getTime())) return null; // Guard against invalid dates
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}${day}${year}`;
};

function App() {
  const [stockData, setStockData] = useState(null);
  const [workforceData, setWorkforceData] = useState(null);
  const [plantData, setPlantData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Start as null, will be set after fetch
  const [latestStockDate, setLatestStockDate] = useState(null); // *** NEW STATE: Stores the latest date from stock data
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [stockResponse, workforceResponse, plantResponse, revenueResponse] = await Promise.all([
          stockapidata(),
          workapidata(),
          plantdata(),
          revdata(),
        ]);

        if (!stockResponse || !workforceResponse || !plantResponse || !revenueResponse) {
          throw new Error('One or more API requests failed.');
        }

        // --- Set state for all data first ---
        setStockData(stockResponse);
        setWorkforceData(workforceResponse);
        setPlantData(plantResponse);
        setRevenueData(revenueResponse);

        // *** NEW LOGIC: Find the most recent date in the stock data ***
        if (stockResponse && stockResponse.length > 0) {
          const dates = stockResponse
            .map(item => {
              if (!item.datestring) return null;
              const parts = item.datestring.split('/'); // Assumes DD/MM/YYYY
              if (parts.length === 3) {
                // Return new Date(year, monthIndex, day)
                return new Date(parts[2], parts[1] - 1, parts[0]);
              }
              return null;
            })
            .filter(date => date && !isNaN(date.getTime())); // Filter out any invalid dates

          if (dates.length > 0) {
            const maxDate = new Date(Math.max.apply(null, dates));
            setLatestStockDate(formatDateToDDMMYYYY(maxDate));
          }
        }
        
        // --- CORRECTED INITIAL DATE LOGIC ---
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const todayDDMMYYYY = formatDateToDDMMYYYY(today);
        const todayMMDDYYYY = formatDateToMMDDYYYY(today);

        const hasTodayDataInStock = stockResponse.some(item => item.datestring === todayDDMMYYYY);
        const hasTodayDataInPlant = plantResponse.some(item => item.id === todayMMDDYYYY);
        const hasTodayDataInRevenue = revenueResponse.some(item => item.id === todayMMDDYYYY);
        const hasTodayDataInWorkforce = workforceResponse.some(item => item.id === todayMMDDYYYY);
        
        // This logic correctly sets the initial date for the entire app
        let initialDateToSet;
        if (hasTodayDataInStock || hasTodayDataInPlant || hasTodayDataInRevenue || hasTodayDataInWorkforce) {
          initialDateToSet = todayDDMMYYYY;
        } else {
          initialDateToSet = formatDateToDDMMYYYY(yesterday);
        }
        
        setSelectedDate(initialDateToSet);

      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setSelectedDate(formatDateToDDMMYYYY(new Date())); // Fallback to today on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    if (selectedDate.includes(' to ')) {
      const [start, end] = selectedDate.split(' to ');
      const parse = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };
      setDateRange({ start: parse(start), end: parse(end) });
    } else {
      const [day, month, year] = selectedDate.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      setDateRange({ start: date, end: date });
    }
  }, [selectedDate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-red-500">{error}</p></div>
    );
  }

  // Pass selectedDate to the loading Navbar as well
  if (loading || !selectedDate) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-100 pt-16">
          <Navbar setSelectedDate={setSelectedDate} selectedDate={selectedDate} latestStockDate={latestStockDate} />
          <div className="flex items-center justify-center h-screen"><Mirage size="60" speed="2.5" color="black" aria-label="Loading data" /></div>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 pt-16">
        {/* *** UPDATED: Pass both dates to Navbar *** */}
        <Navbar setSelectedDate={setSelectedDate} selectedDate={selectedDate} latestStockDate={latestStockDate} />
        <Routes>
          <Route path="/" element={<Navigate to="/waste-processing" replace />} />
          <Route path="/waste-processing" element={plantData ? <Dash plantData={plantData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No plant data available</div>} />
          <Route path="/revenue" element={revenueData ? <Revenue revenueData={revenueData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No revenue data available</div>} />
          <Route path="/workforce" element={workforceData ? <Workforce workforceData={workforceData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No workforce data available</div>} />
          <Route path="/current-stock" element={stockData ? <Stock stockData={stockData} selectedDate={selectedDate} /> : <div>No stock data available</div>} />
          <Route path="/financials" element={revenueData && workforceData ? <FinancialStatement revenueData={revenueData} workforceData={workforceData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No financial data available.</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;