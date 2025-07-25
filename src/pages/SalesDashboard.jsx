import React, { useMemo, useState } from 'react';
import { IndianRupee, Scale, Users, TrendingUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, LabelList, CartesianGrid } from 'recharts';
import { Chart as ChartJS, ArcElement, Tooltip as ChartJsTooltip, Legend as ChartJsLegend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Using your original, correct import path
import { Card, CardHeader, CardTitle, CardContent } from '@/comp/dashboard-ui';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/comp/dashboard-ui';
import { Input } from '@/comp/dashboard-ui';
import { Button } from '@/comp/dashboard-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/comp/dashboard-ui';

ChartJS.register(ArcElement, ChartJsTooltip, ChartJsLegend);

// --- START: Data Transformation Function ---
const transformApiDataToDashboardFormat = (apiData) => {
    const processSheet = (data, type) => {
        if (!data || !Array.isArray(data)) return [];

        return data
            .filter(row => row && row['S.N'])
            .map((row, index) => {
                const cleanRow = {};
                for (const key in row) {
                    cleanRow[key.trim()] = row[key];
                }
                
                if (type === 'segregated') {
                    return {
                        id: `seg-${cleanRow['S.N'] || index}`,
                        date: cleanRow.DATE,
                        partyName: cleanRow["PARTY NAME"]?.trim() || 'Unknown Party',
                        vehicleNo: cleanRow["VEHICLE NO"],
                        material: cleanRow["MATERIAL NAME"]?.trim() || 'N/A',
                        netWeightKg: Number(cleanRow["NET WEIGHT"]) || 0,
                        rate: Number(cleanRow.RATE) || 0,
                        amount: Number(cleanRow.AMOUNT) || 0,
                        paymentMode: cleanRow["MODE OF PAYMENT"]?.trim() || 'N/A',
                    };
                } else { // RDF/AFR
                    return {
                        id: `rdf-${cleanRow['S.N'] || index}`,
                        date: cleanRow.Date,
                        partyName: cleanRow["Party Name"]?.trim() || 'Unknown Party',
                        vehicleNo: cleanRow["Vehicle No."],
                        material: cleanRow["Material Name"]?.trim() || 'N/A',
                        netWeightKg: (Number(cleanRow["Net Weight"]) || 0) * 1000,
                        rate: Number(cleanRow.Rate) || 0,
                        amount: Number(cleanRow["Biling Amount"]) || Number(cleanRow.Amount) || 0,
                        paymentMode: 'bill',
                    };
                }
            });
    };
    
    if (!apiData) return [];
    
    const segregated = processSheet(apiData["SEGRIGATE SALE"], 'segregated');
    const rdfAfr = processSheet(apiData[" RDF AFR Record all location "], 'rdfAfr');

    return [...segregated, ...rdfAfr];
};
// --- END: Data Transformation Function ---

// --- START: Helper Functions ---
const formatCurrency = (value, fractionDigits = 0) => {
    const num = Number(value);
    if (isNaN(num)) return '₹0';
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}`;
};

const formatToK = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '₹0';
    if (num >= 100000) { // Lakhs
        return `₹${(num / 100000).toFixed(2)}L`;
    }
    if (num >= 1000) { // Thousands
        return `₹${(num / 1000).toFixed(1)}k`;
    }
    return `₹${num}`;
};

const formatToDDMMYYYY = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
          <p className="font-bold text-gray-800">{label}</p>
          <p className="text-blue-600">Revenue: <span className="font-semibold">{formatCurrency(payload[0].value)}</span></p>
        </div>
      );
    }
    return null;
};
// --- END: Helper Functions ---


// --- START: Dashboard Widget Components ---
const MetricCard = ({ title, value, icon }) => (
    <Card>
      <div className="p-5 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start text-gray-500">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
      </div>
    </Card>
);

const SalesTrendChart = ({ data }) => (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend Over Time - Daily Performance Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.75rem', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [formatCurrency(value), 'Sales']}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 7, stroke: '#fff', strokeWidth: 3 }} />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
);

const TopPerformers = ({ parties, materials }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle className="text-base">Top Performing Parties</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {parties.map((party) => (
                        <div key={party.name} className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{party.name}</p>
                                <p className="text-xs text-gray-500">{party.count} transactions</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="font-bold text-gray-900 text-sm">{formatCurrency(party.total)}</p>
                                <p className="text-xs text-gray-500">Avg: {formatCurrency(party.avg)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="text-base">Top Materials by Revenue</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {materials.map((mat) => (
                        <div key={mat.name} className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{mat.name}</p>
                                <p className="text-xs text-gray-500">{mat.weight.toLocaleString('en-IN')} kg • {mat.count} orders</p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="font-bold text-gray-900 text-sm">{formatCurrency(mat.total)}</p>
                                <p className="text-xs text-gray-500">{formatCurrency(mat.avgRate, 2)}/kg</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);


const OverviewCharts = ({ partyData, materialData }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Parties by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partyData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="partyGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    width={120}
                    interval={0}
                  />
                  <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }} content={<CustomBarTooltip />} />
                  <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={20} fill="url(#partyGradient)">
                    <LabelList 
                      dataKey="total" 
                      position="right" 
                      formatter={(value) => formatToK(value)} 
                      style={{ fontSize: '12px', fill: '#475569', fontWeight: 'bold' }} 
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
   
        <Card>
          <CardHeader>
            <CardTitle>Top Materials by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialData} margin={{ top: 25, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id="materialGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                    <XAxis 
                        dataKey="name" 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 12, fill: '#64748b' }} 
                        interval={0}
                    />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'rgba(236, 252, 241, 0.5)' }} content={<CustomBarTooltip />} />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={40} fill="url(#materialGradient)">
                        <LabelList 
                            dataKey="total" 
                            position="top" 
                            formatter={(value) => formatToK(value)} 
                            style={{ fontSize: '12px', fill: '#475569', fontWeight: 'bold' }} 
                        />
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
};
  
const RecentTransactions = ({ transactions }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParty, setSelectedParty] = useState('All Parties'); 
    const [selectedPayment, setSelectedPayment] = useState('All Payments');
    const [selectedMaterial, setSelectedMaterial] = useState('All Materials');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const { filteredData, uniqueParties, uniqueMaterials, uniquePaymentModes } = useMemo(() => {
        const uniquePartiesSet = new Set(['All Parties']);
        const uniqueMaterialsSet = new Set(['All Materials']); 
        const uniquePaymentModesSet = new Set(['All Payments']);
        
        const filtered = transactions.filter(item => {
            uniquePartiesSet.add(item.partyName || 'Unknown Party');
            uniqueMaterialsSet.add(item.material || 'N/A'); 
            uniquePaymentModesSet.add(item.paymentMode || 'N/A');
            
            const lowerSearch = searchTerm.toLowerCase(); 
            const searchCorpus = `${item.partyName || ''} ${item.material || ''} ${item.vehicleNo || ''}`.toLowerCase();
            const searchMatch = searchCorpus.includes(lowerSearch);
            const partyMatch = selectedParty === 'All Parties' || (item.partyName || 'Unknown Party') === selectedParty;
            const paymentMatch = selectedPayment === 'All Payments' || (item.paymentMode || 'N/A') === selectedPayment;
            const materialMatch = selectedMaterial === 'All Materials' || (item.material || 'N/A') === selectedMaterial;
            
            return searchMatch && partyMatch && paymentMatch && materialMatch;
        });
        
        return { 
            filteredData: filtered, 
            uniqueParties: Array.from(uniquePartiesSet),
            uniqueMaterials: Array.from(uniqueMaterialsSet), 
            uniquePaymentModes: Array.from(uniquePaymentModesSet), 
        };
    }, [transactions, searchTerm, selectedParty, selectedPayment, selectedMaterial]); 
    
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const getPaymentBadgeClass = (mode) => {
        const payment = (mode || 'N/A').toLowerCase();
        if (payment === 'bill') return 'bg-blue-100 text-blue-800';
        if (payment === 'cash') return 'bg-emerald-100 text-emerald-800';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>
                <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
                    <div className="relative flex-grow w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                        <Input 
                            placeholder="Search by party, material, vehicle..." 
                            value={searchTerm} 
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                            className="pl-10 text-sm" 
                        />
                    </div>
                    <Select value={selectedParty} onValueChange={value => { setSelectedParty(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[180px] text-gray-700">
                            <SelectValue placeholder="All Parties"/>
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueParties.map(party => 
                                <SelectItem key={party} value={party}>{party}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <Select value={selectedMaterial} onValueChange={value => { setSelectedMaterial(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[180px] text-gray-700">
                            <SelectValue placeholder="All Materials"/>
                        </SelectTrigger>
                        <SelectContent>
                            {uniqueMaterials.map(mat => 
                                <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <Select value={selectedPayment} onValueChange={value => { setSelectedPayment(value); setCurrentPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[180px] text-gray-700">
                            <SelectValue placeholder="All Payments"/>
                        </SelectTrigger>
                        <SelectContent>
                            {uniquePaymentModes.map(mode => 
                                <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {['S.N', 'Date', 'Party Name', 'Material', 'Net Weight', 'Rate', 'Amount', 'Payment Mode'].map(h => 
                                <TableHead key={h}>{h}</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((item, index) => (
                           <TableRow key={item.id || index}>
                               <TableCell className="font-medium text-gray-500">
                                   {(currentPage - 1) * itemsPerPage + index + 1}
                               </TableCell>
                               <TableCell>{formatToDDMMYYYY(item.date)}</TableCell>
                               <TableCell className="font-semibold text-gray-800">{item.partyName}</TableCell>
                               <TableCell>{item.material || 'N/A'}</TableCell>
                               <TableCell>{(item.netWeightKg || 0).toFixed(2)} kg</TableCell>
                               <TableCell>{formatCurrency(item.rate)}</TableCell>
                               <TableCell className="font-bold text-gray-900">{formatCurrency(item.amount)}</TableCell>
                               <TableCell>
                                   <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getPaymentBadgeClass(item.paymentMode)}`}>
                                       {item.paymentMode || 'N/A'}
                                   </span>
                               </TableCell>
                           </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {paginatedData.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No transactions found for the current filters.
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600 gap-4">
                    <div className="text-gray-500">
                        Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredData.length)}</strong> of <strong>{filteredData.length}</strong> entries
                    </div>
                    <div className="flex items-center gap-1">
                       <Button 
                           variant="outline" 
                           size="icon" 
                           onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                           disabled={currentPage === 1}
                       >
                           <ChevronLeft size={16}/>
                       </Button>
                       <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
                       <Button 
                           variant="outline" 
                           size="icon" 
                           onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                           disabled={currentPage === totalPages}
                       >
                           <ChevronRight size={16}/>
                       </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};
// --- END: Dashboard Widget Components ---

// --- Main Dashboard Component ---
const SalesDashboard = ({ salesData, dateRange }) => {
    const memoizedData = useMemo(() => {
        const emptyState = { 
            kpis: {}, 
            timeSeries: [], 
            topPartiesList: [], 
            topMaterialsList: [], 
            partyRevenueChart: [], 
            materialRevenueChart: [], 
            transactions: [] 
        };
        
        if (!salesData || !dateRange.start || !dateRange.end) return emptyState;

        const filteredByDate = salesData.filter(item => {
            const itemDate = new Date(item.date);
            const start = new Date(dateRange.start.setHours(0, 0, 0, 0));
            const end = new Date(dateRange.end.setHours(23, 59, 59, 999));
            return !isNaN(itemDate.getTime()) && itemDate >= start && itemDate <= end;
        });

        const totalSales = filteredByDate.reduce((sum, item) => sum + (item.amount || 0), 0);
        const totalWeight = filteredByDate.reduce((sum, item) => sum + (item.netWeightKg || 0), 0);
        const activeParties = new Set(filteredByDate.map(item => item.partyName)).size;
        const avgTransaction = filteredByDate.length > 0 ? totalSales / filteredByDate.length : 0;
        
        const partyDataList = filteredByDate.reduce((acc, { partyName, amount }) => { 
            const name = partyName || 'Unknown'; 
            if (!acc[name]) acc[name] = { total: 0, count: 0 }; 
            acc[name].total += (amount || 0); 
            acc[name].count += 1; 
            return acc; 
        }, {});
        const topPartiesList = Object.entries(partyDataList)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 5)
            .map(([name, data]) => ({ 
                name, 
                ...data, 
                avg: data.count > 0 ? data.total / data.count : 0 
            }));
        
        const materialDataList = filteredByDate.reduce((acc, { material, amount, netWeightKg }) => { 
            const name = material || 'N/A'; 
            if (!acc[name]) acc[name] = { total: 0, weight: 0, count: 0 }; 
            acc[name].total += (amount || 0); 
            acc[name].weight += (netWeightKg || 0); 
            acc[name].count += 1; 
            return acc; 
        }, {});
        const topMaterialsList = Object.entries(materialDataList)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 5)
            .map(([name, data]) => ({ 
                name, 
                ...data, 
                avgRate: data.weight > 0 ? data.total/data.weight : 0
            }));
        
        const dailySales = filteredByDate.reduce((acc, sale) => { 
            const dateStr = new Date(sale.date).toISOString().split('T')[0]; 
            acc[dateStr] = (acc[dateStr] || 0) + (sale.amount || 0); 
            return acc; 
        }, {});
        let currentDate = new Date(dateRange.start); 
        const endDate = new Date(dateRange.end);
        const allDatesInRange = {};
        while (currentDate <= endDate) { 
            allDatesInRange[currentDate.toISOString().split('T')[0]] = 0; 
            currentDate.setDate(currentDate.getDate() + 1); 
        }
        const timeSeriesData = Object.keys({...allDatesInRange, ...dailySales})
            .sort()
            .map(date => ({
                date: formatToDDMMYYYY(date).slice(0, 5), 
                amount: dailySales[date] || 0
            }));
        
        const partyRevenueChart = topPartiesList.map(p => ({
            name: p.name, 
            total: p.total
        }));
        
        const materialRevenueChart = topMaterialsList.map(m => ({
            name: m.name, 
            total: m.total
        }));
       
        const transactions = filteredByDate.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return {
            kpis: { totalSales, totalWeight, activeParties, avgTransaction },
            timeSeries: timeSeriesData, 
            topPartiesList, 
            topMaterialsList, 
            partyRevenueChart, 
            materialRevenueChart, 
            transactions
        };
    }, [salesData, dateRange]);
    
    return (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-[#9b27b0] via-[#2196f3] to-[#f2c99c] min-h-screen font-sans">
            <main className="max-w-7xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-white">Sales Analytics Dashboard</h1>
                    <p className="text-base text-gray-200 mt-1">Comprehensive overview of your business performance.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard 
                        title="Total Sales" 
                        value={formatCurrency(memoizedData.kpis.totalSales)} 
                        icon={<IndianRupee className="text-blue-500" size={20} />} 
                    />
                    <MetricCard 
                        title="Total Weight" 
                        value={`${(memoizedData.kpis.totalWeight || 0).toLocaleString('en-IN')} kg`} 
                        icon={<Scale className="text-emerald-500" size={20}/>} 
                    />
                    <MetricCard 
                        title="Active Parties" 
                        value={memoizedData.kpis.activeParties || 0} 
                        icon={<Users className="text-violet-500" size={20}/>} 
                    />
                    <MetricCard 
                        title="Avg Transaction" 
                        value={formatCurrency(memoizedData.kpis.avgTransaction)} 
                        icon={<TrendingUp className="text-amber-500" size={20}/>} 
                    />
                </div>

                <SalesTrendChart data={memoizedData.timeSeries} />
                
                <OverviewCharts 
                    partyData={memoizedData.partyRevenueChart} 
                    materialData={memoizedData.materialRevenueChart} 
                />

                <TopPerformers parties={memoizedData.topPartiesList} materials={memoizedData.topMaterialsList} />
                
                <RecentTransactions transactions={memoizedData.transactions} />
            </main>
        </div>
    );
};

export { transformApiDataToDashboardFormat };
export default SalesDashboard;