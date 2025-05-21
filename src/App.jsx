import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './comp/Navbar';
import Workforce from './WorkforcePage/WorkforcePage';
import Dash from './comp/Dash';
import Revenue from './pages/Revenue';
import Stock from './CurrentStock/Stockpage';
import { stockapidata, workapidata, plantdata, revdata } from './FetchData';
import { Mirage } from 'ldrs/react';
import 'ldrs/react/Mirage.css';

const getFormattedToday = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

function App() {
  const [stockData, setStockData] = useState(null);
  const [workforceData, setWorkforceData] = useState(null);
  const [plantData, setPlantData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getFormattedToday());
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

        setStockData(stockResponse);
        setWorkforceData(workforceResponse);
        setPlantData(plantResponse);
        setRevenueData(revenueResponse);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Parse selectedDate to determine if it's a single date or a range
    if (selectedDate.includes(' to ')) {
      const [start, end] = selectedDate.split(' to ');
      const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };
      setDateRange({
        start: parseDate(start),
        end: parseDate(end),
      });
    } else {
      const [day, month, year] = selectedDate.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      setDateRange({ start: date, end: date });
    }
  }, [selectedDate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-100 pt-16">
          <Navbar setSelectedDate={setSelectedDate} />
          <div className="flex items-center justify-center h-screen">
            <Mirage size="60" speed="2.5" color="black" aria-label="Loading data" />
          </div>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 pt-16">
        <Navbar setSelectedDate={setSelectedDate} />
        <Routes>
          <Route path="/" element={<Navigate to="/waste-processing" replace />} />
          <Route
            path="/waste-processing"
            element={plantData ? <Dash plantData={plantData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No plant data available</div>}
          />
          <Route
            path="/revenue"
            element={revenueData ? <Revenue revenueData={revenueData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No revenue data available</div>}
          />
          <Route
            path="/workforce"
            element={workforceData ? <Workforce workforceData={workforceData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No workforce data available</div>}
          />
          <Route
            path="/current-stock"
            element={stockData ? <Stock stockData={stockData} selectedDate={selectedDate} dateRange={dateRange} /> : <div>No stock data available</div>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;