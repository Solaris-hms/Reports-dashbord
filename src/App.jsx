import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './comp/Navbar';
import Workforce from './WorkforcePage/WorkforcePage';
import Dash from './comp/Dash';
import Revenue from './pages/Revenue';
import Stock from './CurrentStock/Stockpage';
import FinancialStatement from './pages/FinancialStatement';
import BeltDashboard from './BeltDashboard'; // Import new component

// *** STEP 1: Import the new beltapidata function ***
import { stockapidata, workapidata, plantdata, revdata, beltapidata } from './FetchData';

import { Mirage } from 'ldrs/react';
import 'ldrs/react/Mirage.css';

// --- DATE HELPER FUNCTIONS ---
const formatDateToDDMMYYYY = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateToMMDDYYYY = (date) => {
  if (!date || isNaN(date.getTime())) return null;
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
  // *** STEP 2: Add state for the new belt data ***
  const [beltData, setBeltData] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [latestStockDate, setLatestStockDate] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // *** STEP 3: Add beltapidata() to the Promise.all call ***
        const [stockResponse, workforceResponse, plantResponse, revenueResponse, beltResponse] = await Promise.all([
          stockapidata(),
          workapidata(),
          plantdata(),
          revdata(),
          beltapidata(), // Fetch belt data concurrently
        ]);

        if (!stockResponse || !workforceResponse || !plantResponse || !revenueResponse || !beltResponse) {
          throw new Error('One or more API requests failed.');
        }
        
        // *** STEP 4: Set the state for the new belt data ***
        setStockData(stockResponse);
        setWorkforceData(workforceResponse);
        setPlantData(plantResponse);
        setRevenueData(revenueResponse);
        setBeltData(beltResponse); // Set the belt data state
        
        // (The rest of the date logic remains the same)
        if (stockResponse && stockResponse.length > 0) {
          const dates = stockResponse
            .map(item => {
              if (!item.datestring) return null;
              const parts = item.datestring.split('/');
              if (parts.length === 3) {
                return new Date(parts[2], parts[1] - 1, parts[0]);
              }
              return null;
            })
            .filter(date => date && !isNaN(date.getTime()));

          if (dates.length > 0) {
            const maxDate = new Date(Math.max.apply(null, dates));
            setLatestStockDate(formatDateToDDMMYYYY(maxDate));
          }
        }
        
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const todayDDMMYYYY = formatDateToDDMMYYYY(today);
        const todayMMDDYYYY = formatDateToMMDDYYYY(today);

        const hasTodayDataInStock = stockResponse.some(item => item.datestring === todayDDMMYYYY);
        const hasTodayDataInPlant = plantResponse.some(item => item.id === todayMMDDYYYY);
        const hasTodayDataInRevenue = revenueResponse.some(item => item.id === todayMMDDYYYY);
        const hasTodayDataInWorkforce = workforceResponse.some(item => item.id === todayMMDDYYYY);
        
        let initialDateToSet;
        if (hasTodayDataInStock || hasTodayDataInPlant || hasTodayDataInRevenue || hasTodayDataInWorkforce) {
          initialDateToSet = todayDDMMYYYY;
        } else {
          initialDateToSet = formatDateToDDMMYYYY(yesterday);
        }
        
        setSelectedDate(initialDateToSet);

      } catch (err) {
        setError('Failed to load data. Please try again later.');
        setSelectedDate(formatDateToDDMMYYYY(new Date()));
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
        <Navbar setSelectedDate={setSelectedDate} selectedDate={selectedDate} latestStockDate={latestStockDate} />
        <Routes>
          <Route path="/" element={<Navigate to="/waste-processing" replace />} />
          <Route path="/waste-processing" element={plantData ? <Dash plantData={plantData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No plant data available</div>} />
          
          {/* *** STEP 5: Pass the new beltData prop to your component *** */}
          <Route path="/segregation-belts" element={beltData ? <BeltDashboard beltData={beltData} selectedDate={selectedDate} /> : <div>Loading belt data...</div>} />
          
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