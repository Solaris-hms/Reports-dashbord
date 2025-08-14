import React, { useState, useMemo } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ExternalLink, Users, TrendingUp, BarChart2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/comp/dashboard-ui';
import { Input } from '@/comp/dashboard-ui';
import { Button } from '@/comp/dashboard-ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/comp/dashboard-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from 'react-chartjs-2';

const StatCard = ({ title, value, icon, color }) => (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card className="shadow-xl border-gray-200/60 overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                </div>
                <div className={`p-4 rounded-lg bg-${color}-100 text-${color}-500`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    </motion.div>
);

// Accept both `splitwiseData` and `dateRange` as props
const SplitwiseExpenses = ({ splitwiseData, dateRange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const expenses = useMemo(() => {
        if (splitwiseData && splitwiseData.data) {
            return splitwiseData.data.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        }
        return [];
    }, [splitwiseData]);

    const filteredExpenses = useMemo(() => {
        // Normalize start and end dates for accurate comparison
        const startDate = dateRange.start ? new Date(dateRange.start.setHours(0, 0, 0, 0)) : null;
        const endDate = dateRange.end ? new Date(dateRange.end.setHours(23, 59, 59, 999)) : null;

        return expenses.filter(expense => {
            const itemDate = new Date(expense.Date);

            // Date-based filtering logic
            const isDateInRange = startDate && endDate ? (itemDate >= startDate && itemDate <= endDate) : true;

            // Search-based filtering logic
            const searchMatch = expense.Description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense['Paid By'].toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.Category.toLowerCase().includes(searchTerm.toLowerCase());

            return isDateInRange && searchMatch;
        });
    }, [expenses, searchTerm, dateRange]); // <-- Add `dateRange` as a dependency
    
    const paginatedExpenses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredExpenses, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

    const totalCost = useMemo(() =>
        filteredExpenses.reduce((sum, item) => sum + (Number(item['Total Cost']) || 0), 0) // <-- Use filteredExpenses
    , [filteredExpenses]);

    const topSpender = useMemo(() => {
        const spending = filteredExpenses.reduce((acc, curr) => { // <-- Use filteredExpenses
            acc[curr['Paid By']] = (acc[curr['Paid By']] || 0) + (Number(curr['Total Cost']) || 0);
            return acc;
        }, {});
        return Object.entries(spending).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
    }, [filteredExpenses]);
    
    const categorySpending = useMemo(() => {
        const spending = filteredExpenses.reduce((acc, curr) => { // <-- Use filteredExpenses
            acc[curr.Category] = (acc[curr.Category] || 0) + (Number(curr['Total Cost']) || 0);
            return acc;
        }, {});
        return Object.entries(spending).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [filteredExpenses]);

    const handleExport = () => {
        const dataToExport = filteredExpenses.map(e => ({
            'Expense ID': e['Expense ID'],
            'Date': new Date(e.Date).toLocaleDateString(),
            'Description': e.Description,
            'Paid By': e['Paid By'],
            'Total Cost': e['Total Cost'],
            'Currency': e.Currency,
            'Category': e.Category,
            'Is Payment': e['Is Payment'] ? 'Yes' : 'No',
            'Receipt URL': e['Receipt URL']
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Splitwise Expenses");
        XLSX.writeFile(wb, `Splitwise_Expenses_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    if (!splitwiseData) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-100"><p className="text-gray-600 animate-pulse">Loading Your Expense Universe...</p></div>;
    }

    return (
        <div className="p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-blue-100 min-h-screen">
            <header className="mb-10">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl font-extrabold text-gray-800"
                >
                    Expense Command Center
                </motion.h1>
                <p className="text-gray-500 mt-2">A clear vision of your financial transactions.</p>
            </header>

            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
            >
                 <StatCard title="Total Expenses" value={`₹${totalCost.toLocaleString('en-IN')}`} icon={<TrendingUp/>} color="blue" />
                 <StatCard title="Total Transactions" value={filteredExpenses.length} icon={<BarChart2/>} color="green" />
                 <StatCard title="Top Spender" value={topSpender[0]} icon={<Users/>} color="purple" />
                 <StatCard title="Highest Spender Amount" value={`₹${topSpender[1].toLocaleString('en-IN')}`} icon={<Download />} color="red" />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="relative w-full sm:max-w-md">
                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                     <Input
                                        placeholder="Search by description, payer, category..."
                                        value={searchTerm}
                                        onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                                        className="pl-12 h-12 text-lg"
                                     />
                                </div>
                                <Button onClick={handleExport} size="lg" className="w-full sm:w-auto">
                                    <Download size={20} className="mr-2"/>
                                    Export Data
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-1/6">Date</TableHead>
                                        <TableHead className="w-2/5">Description</TableHead>
                                        <TableHead>Payer</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-center">Receipt</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {paginatedExpenses.map((expense, i) => (
                                            <motion.tr 
                                                key={expense['Expense ID']}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <TableCell className="font-medium text-gray-600">{new Date(expense.Date).toLocaleDateString()}</TableCell>
                                                <TableCell className="font-semibold text-gray-800">
                                                    {expense.Description}
                                                    <span className="block text-xs text-gray-400 font-normal">{expense.Category}</span>
                                                </TableCell>
                                                <TableCell>{expense['Paid By']}</TableCell>
                                                <TableCell className="text-right font-bold text-lg text-gray-800">
                                                    ₹{Number(expense['Total Cost']).toLocaleString('en-IN')}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {expense['Receipt URL'] ? (
                                                        <a href={expense['Receipt URL']} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors">
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                         <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4 border-t">
                            <p>Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong>-<strong>{Math.min(currentPage * itemsPerPage, filteredExpenses.length)}</strong> of <strong>{filteredExpenses.length}</strong></p>
                            <div className="flex items-center gap-2">
                               <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                   <ChevronLeft size={16} className="mr-1"/> Previous
                               </Button>
                                <span className="font-medium">Page {currentPage} of {totalPages}</span>
                               <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                   Next <ChevronRight size={16} className="ml-1"/>
                               </Button>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl">Top Spending Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {categorySpending.map(([category, amount]) => (
                                    <div key={category}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{category}</span>
                                            <span className="font-semibold text-gray-800">₹{amount.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <motion.div
                                                className="bg-blue-500 h-2.5 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(amount / totalCost) * 100}%`}}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SplitwiseExpenses;