import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './comp/Navbar';
import Workforce from './WorkforcePage/WorkforcePage';
import Dash from './comp/Dash';
import Revenue from './pages/Revenue';
import Stock from './CurrentStock/Stockpage';
import FinancialStatement from './pages/FinancialStatement';
import BeltDashboard from './BeltDashboard';
import SalesDashboard from './pages/SalesDashboard';
import SplitwiseExpenses from './pages/SplitwiseExpenses'; // <-- Imported the new page

// Import all data fetching functions, including the new one for Splitwise
import { stockapidata, workapidata, plantdata, revdata, beltapidata, salesapidata, splitwiseapidata } from './FetchData';

import { Mirage } from 'ldrs/react';
import 'ldrs/react/Mirage.css';

const formatDateToDDMMYYYY = (date) => {
  if (!date || isNaN(date.getTime())) return null;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function App() {
  const [stockData, setStockData] = useState(null);
  const [workforceData, setWorkforceData] = useState(null);
  const [plantData, setPlantData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [beltData, setBeltData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [splitwiseData, setSplitwiseData] = useState(null); 

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
        const [stockResponse, workforceResponse, plantResponse, revenueResponse, beltResponse, salesResponse, splitwiseResponse] = await Promise.all([
          stockapidata(),
          workapidata(),
          plantdata(),
          revdata(),
          beltapidata(),
          salesapidata(),
          splitwiseapidata(),
        ]);

        if (!stockResponse || !workforceResponse || !plantResponse || !revenueResponse || !beltResponse || !salesResponse || !splitwiseResponse) {
          throw new Error('One or more API requests failed.');
        }

        setStockData(stockResponse);
        setWorkforceData(workforceResponse);
        setPlantData(plantResponse);
        setRevenueData(revenueResponse);
        setBeltData(beltResponse);
        setSalesData(salesResponse);
        setSplitwiseData(splitwiseResponse); 

        // === THE FIX FOR THE DATE PROBLEM ===
        // 1. Find the latest date from the new sales data
        let latestSalesDate = null;
        if (salesResponse && salesResponse.length > 0) {
            const salesDates = salesResponse
                .map(item => item.date ? new Date(item.date) : null)
                .filter(date => date && !isNaN(date.getTime()));

            if (salesDates.length > 0) {
                latestSalesDate = new Date(Math.max.apply(null, salesDates));
            }
        }

        // 2. Find latest stock date (as before)
        let maxStockDate = null;
        if (stockResponse && stockResponse.length > 0) {
          const dates = stockResponse
            .map(item => {
              if (!item.datestring) return null;
              const parts = item.datestring.split('/');
              return parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : null;
            })
            .filter(date => date && !isNaN(date.getTime()));

          if (dates.length > 0) {
            maxStockDate = new Date(Math.max.apply(null, dates));
            setLatestStockDate(formatDateToDDMMYYYY(maxStockDate));
          }
        }

        // 3. Determine the most recent date from all data sources
        let finalLatestDate = latestSalesDate;
        if (maxStockDate && (!finalLatestDate || maxStockDate > finalLatestDate)) {
            finalLatestDate = maxStockDate;
        }

        // 4. Set the initial selected date to the most recent data point
        const initialDateToSet = finalLatestDate ? formatDateToDDMMYYYY(finalLatestDate) : formatDateToDDMMYYYY(new Date());
        setSelectedDate(initialDateToSet);
        // === END OF DATE FIX ===

      } catch (err) {
        console.error(err);
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
    return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-red-500">{error}</p></div>;
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
          <Route path="/" element={<Navigate to="/sales-record" replace />} />
          <Route path="/waste-processing" element={<Dash plantData={plantData} selectedDate={selectedDate} dateRange={dateRange} />} />
          <Route path="/segregation-belts" element={<BeltDashboard beltData={beltData} selectedDate={selectedDate} />} />
          <Route path="/revenue" element={<Revenue revenueData={revenueData} selectedDate={selectedDate} dateRange={dateRange} />} />
          <Route path="/workforce" element={<Workforce workforceData={workforceData} selectedDate={selectedDate} dateRange={dateRange} />} />
          <Route path="/current-stock" element={<Stock stockData={stockData} selectedDate={selectedDate} />} />
          <Route
            path="/sales-record"
            element={ salesData ? <SalesDashboard salesData={salesData} selectedDate={selectedDate} dateRange={dateRange}/> : <div>Loading Sales Dashboard...</div> }
          />
          {/* Pass `splitwiseData` to the FinancialStatement component */}
          <Route path="/financials" element={<FinancialStatement revenueData={revenueData} workforceData={workforceData} salesData={salesData} splitwiseData={splitwiseData} selectedDate={selectedDate} dateRange={dateRange} />} />
          <Route path="/splitwise-expenses" element={<SplitwiseExpenses splitwiseData={splitwiseData} dateRange={dateRange} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;