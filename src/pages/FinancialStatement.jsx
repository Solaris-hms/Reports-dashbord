import React, { useState, useMemo } from 'react';

// === CONFIGURATION: Define salaries, rates, and FIXED employee counts here ===
// Worker data comes from the API. Other roles have a fixed daily count.
const ELECTRICITY_RATE_PER_UNIT = 7.68;
const ROYALTY_NAGAR_NIGAM_PER_DAY = 5500; // New constant daily expense

const SALARY_CONFIG = {
    // Dynamic Role
    WORKER: { salaryPerDay: 400, label: "Rag Picker" },

    // Static Roles (define their fixed daily count here)
    SECURITY_GUARD: { count: 3, salaryPerDay: 550, label: "Security Guard" },
    HR_EXECUTIVE: { count: 1, salaryPerDay: 1200, label: "HR Executive" },
    ACCOUNTANT: { count: 1, salaryPerDay: 1350, label: "Accountant" },
    PLANT_SUPERVISOR: { count: 2, salaryPerDay: 900, label: "Plant Supervisor" },
};

// === DUMMY DATA: Restored for the detailed Bank Statement Modal ===
// This data is static and will not change with the date picker.
const DUMMY_BANK_DATA = {
    bankAccount: { currentBalance: 540350.75 },
    bankStatementHistory: [
        { id: 1, date: "28/06/2025", description: "Credit from XYZ Corp", amount: 150000.00 },
        { id: 2, date: "28/06/2025", description: "Diesel Fuel Purchase - IOCL", amount: -25500.00 },
        { id: 3, date: "27/06/2025", description: "Sale of Recyclables Batch #7", amount: 45200.50 },
        { id: 4, date: "27/06/2025", description: "Vendor Payment - ABC Haulers", amount: -18500.00 },
        { id: 5, date: "26/06/2025", description: "Electricity Bill Payment", amount: -9540.75 },
        { id: 6, date: "25/06/2025", description: "AFR Revenue Deposit", amount: 125000.00 },
        { id: 7, date: "25/06/2025", description: "Salary Advance - R. Kumar", amount: -5000.00 },
        { id: 8, date: "24/06/2025", description: "Maintenance Spares - Local P.", amount: -12300.00 },
    ]
};

// --- HELPER FUNCTIONS ---
const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(num);
const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
const getDaysInRange = (start, end) => {
    if (!start || !end) return 1;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

const FinancialStatement = ({ revenueData, workforceData, selectedDate, dateRange }) => {
    const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    // --- DYNAMIC CALCULATIONS from API data for the main page ---
    const calculations = useMemo(() => {
        const normalizeDate = (date) => { if (!date) return null; const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };
        const startDate = normalizeDate(dateRange.start);
        const endDate = normalizeDate(dateRange.end);
        const numberOfDays = getDaysInRange(startDate, endDate);

        if (!revenueData || !workforceData || !startDate || !endDate) return { reportDateString: selectedDate, totalIncome: 0, totalExpenses: 0, netResult: 0, incomes: {}, operatingExpenses: {}, otherExpenseBreakdown: [], employeeBreakdown: [], totalEmployeeSalary: 0, otherExpensesTotal: 0, bankCredits: [] };

        const filteredRevenue = revenueData.filter(item => { const itemDate = normalizeDate(new Date(item.Timestamp)); return itemDate >= startDate && itemDate <= endDate; });
        const filteredWorkforce = workforceData.filter(item => { const itemDate = normalizeDate(new Date(item.Timestamp)); return itemDate >= startDate && itemDate <= endDate; });

        // MODIFICATION START: Calculate costs from different data sources
        
        // 1. Get revenues and some expenses from the REVENUE data source
        const totals = filteredRevenue.reduce((acc, item) => {
            acc.rdfRevenue += Number(item['RDF Revenue ( in ₹ )']) || 0;
            acc.afrRevenue += Number(item['AFR Revenue (in ₹)']) || 0;
            acc.recyclablesRevenue += Number(item['Total Recyclables Revenue ( in ₹ )']) || 0;
            acc.transportationExpenses += Number(item['Transportation Expenses']) || 0;
            acc.maintenanceCost += Number(item['Maintenance Cost']) || 0;
            acc.otherExpenses += Number(item['Any other']) || 0;
            if (item['Bifurcation of expenses (Remarks)']) acc.otherExpenseBreakdown.push({ date: formatDate(new Date(item.Timestamp)), remark: item['Bifurcation of expenses (Remarks)'] });
            const bankCredit = Number(item['Total Amount Credited in Bank Today']) || 0;
            if (bankCredit > 0) acc.bankCredits.push({ date: formatDate(new Date(item.Timestamp)), amount: bankCredit });
            return acc;
        }, { rdfRevenue: 0, afrRevenue: 0, recyclablesRevenue: 0, transportationExpenses: 0, maintenanceCost: 0, otherExpenses: 0, otherExpenseBreakdown: [], bankCredits: [] });

        // 2. Get operational costs (like electricity) from the WORKFORCE/PLANT data source
        const operationalTotals = filteredWorkforce.reduce((acc, item) => {
            acc.totalDieselLiters += Number(item['Diesel Consumption (in liters)']) || 0; // If you need to calculate diesel cost, you'd do it here
            acc.totalElectricityUnits += Number(item['Electricity Consumption (in Units)']) || 0;
            return acc;
        }, { totalDieselLiters: 0, totalElectricityUnits: 0 });

        // 3. Perform calculations with the gathered data
        const calculatedElectricityCost = operationalTotals.totalElectricityUnits * ELECTRICITY_RATE_PER_UNIT;
        const dieselCostFromRevenue = filteredRevenue.reduce((sum, item) => sum + (Number(item['Diesel Cost']) || 0), 0);
        
        // NEW: Calculate the fixed royalty cost based on the number of days
        const totalRoyaltyCost = ROYALTY_NAGAR_NIGAM_PER_DAY * numberOfDays;

        // MODIFICATION END

        let totalEmployeeSalary = 0;
        const employeeBreakdown = [];
        const totalWorkersPresent = filteredWorkforce.reduce((sum, item) => sum + (Number(item['Number of Workers Present Today']) || 0), 0);
        const workerSalary = totalWorkersPresent * SALARY_CONFIG.WORKER.salaryPerDay;
        totalEmployeeSalary += workerSalary;
        employeeBreakdown.push({ label: SALARY_CONFIG.WORKER.label, displayCount: `${totalWorkersPresent}x`, totalSalary: workerSalary });

        Object.values(SALARY_CONFIG).forEach(role => {
            if (role.count) {
                const salary = role.count * role.salaryPerDay * numberOfDays;
                totalEmployeeSalary += salary;
                employeeBreakdown.push({ label: role.label, displayCount: `${role.count}x`, totalSalary: salary });
            }
        });

        const totalIncome = totals.rdfRevenue + totals.afrRevenue + totals.recyclablesRevenue;
        // UPDATED: Added totalRoyaltyCost to totalOperatingExpenses
        const totalOperatingExpenses = totals.transportationExpenses + dieselCostFromRevenue + calculatedElectricityCost + totals.maintenanceCost + totalRoyaltyCost;
        const totalExpenses = totalOperatingExpenses + totalEmployeeSalary + totals.otherExpenses;
        const netResult = totalIncome - totalExpenses;
        
        // UPDATED: Added Royalty to the operating expenses breakdown
        const operatingExpensesData = {
            "Transportation Expenses": totals.transportationExpenses,
            "Diesel Cost": dieselCostFromRevenue, 
            "Electricity Cost": calculatedElectricityCost,
            "Royalty (Nagar Nigam)": totalRoyaltyCost, // <-- ADDED HERE
            "Maintenance Cost": totals.maintenanceCost
        };

        return { reportDateString: selectedDate, totalIncome, totalExpenses, netResult, incomes: { "RDF Revenue": totals.rdfRevenue, "AFR Revenue": totals.afrRevenue, "Recyclables Revenue": totals.recyclablesRevenue }, operatingExpenses: operatingExpensesData, otherExpenseBreakdown: totals.otherExpenseBreakdown, otherExpensesTotal: totals.otherExpenses, totalEmployeeSalary, employeeBreakdown, bankCredits: totals.bankCredits };
    }, [revenueData, workforceData, dateRange, selectedDate]);

    // --- STATIC CALCULATION from DUMMY data for the bank modal ---
    const bankHistorySummary = useMemo(() => {
        if (!DUMMY_BANK_DATA.bankStatementHistory || DUMMY_BANK_DATA.bankStatementHistory.length === 0) return [];
        const transactionsByDate = DUMMY_BANK_DATA.bankStatementHistory.reduce((acc, tx) => {
            (acc[tx.date] = acc[tx.date] || []).push(tx);
            return acc;
        }, {});
        const sortedDates = Object.keys(transactionsByDate).sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));
        
        let runningBalance = DUMMY_BANK_DATA.bankAccount.currentBalance;
        return sortedDates.map(date => {
            const dayTransactions = transactionsByDate[date];
            const totalCredits = dayTransactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
            const totalDebits = dayTransactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0);
            const closingBalance = runningBalance;
            const openingBalance = closingBalance - totalCredits - totalDebits;
            const summary = { date, openingBalance, totalCredits, totalDebits: Math.abs(totalDebits), closingBalance };
            runningBalance = openingBalance; // Set up for the previous day
            return summary;
        });
    }, []); // Empty dependency array because dummy data is constant


    const LineItem = ({ label, amount }) => ( <div className="flex justify-between items-baseline text-base leading-relaxed"><span className="text-gray-600 pr-4">{label}</span><div className="flex items-center"><span className="font-medium whitespace-nowrap">{formatCurrency(Math.abs(amount))}</span></div></div>);

    return (
        <div className="financial-gradient-bg min-h-screen p-6 sm:p-12">
            <div className="ledger-sheet max-w-7xl mx-auto bg-white/85 backdrop-blur-xl p-6 sm:p-12 rounded-xl border border-white/20 shadow-2xl">
                
                <header className="text-center border-b-2 border-gray-800 pb-6 mb-10">
                    <h1 className="text-3xl font-bold tracking-wide text-gray-900">Financial Statement</h1>
                    <h2 className="text-lg font-normal text-gray-600 mt-2">Report for: {calculations.reportDateString}</h2>
                </header>
                
                <main className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-10">
                    {/* --- DYNAMIC Income Section --- */}
                    <div className="financial-column">
                        <h3 className="text-xl font-bold border-b border-gray-800 pb-3 mb-6 text-gray-900">Income (Credits)</h3>
                        <div className="flex flex-col gap-5">{Object.entries(calculations.incomes).map(([label, amount]) => ( <LineItem key={label} label={label} amount={amount || 0} /> ))}</div>
                        <div className="mt-8 pt-4 border-t border-gray-900 font-bold flex justify-between text-lg"><span>Total Income</span><span>{formatCurrency(calculations.totalIncome || 0)}</span></div>
                    </div>
                    <div className="bg-gray-300 hidden md:block"></div>
                    {/* --- DYNAMIC Expenses Section --- */}
                    <div className="financial-column">
                        <h3 className="text-xl font-bold border-b border-gray-800 pb-3 mb-6 text-gray-900">Expenses (Debits)</h3>
                        <div className="flex flex-col gap-5">
                            {Object.entries(calculations.operatingExpenses).map(([label, amount]) => ( <LineItem key={label} label={label} amount={amount || 0} />))}
                            <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
                                <div className="flex justify-between items-baseline text-base leading-relaxed"><span className="text-gray-600 pr-4">Other Misc Expenses</span><div className="flex items-center"><span className="font-medium whitespace-nowrap">{formatCurrency(Math.abs(calculations.otherExpensesTotal || 0))}</span><button onClick={() => setIsExpensesModalOpen(true)} className="text-blue-700 italic font-medium text-sm ml-2 hover:underline">(view)</button></div></div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
                                <div className="flex justify-between items-baseline mb-2"><span className="font-bold text-base text-gray-900">Employee Salaries</span><span className="font-bold text-base">{formatCurrency(calculations.totalEmployeeSalary || 0)}</span></div>
                                <div className="border-l-2 border-gray-200 pl-5 mt-3 flex flex-col gap-2">{calculations.employeeBreakdown.map(emp => ( <div key={emp.label} className="flex justify-between items-baseline text-sm"><span className="text-gray-600">{emp.displayCount} {emp.label}</span><span className="font-medium text-gray-800">{formatCurrency(emp.totalSalary)}</span></div>))}</div>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-gray-900 font-bold flex justify-between text-lg"><span>Total Expenses</span><span>{formatCurrency(calculations.totalExpenses || 0)}</span></div>
                    </div>
                </main>
                {/* --- DYNAMIC Net Profit/Loss --- */}
                <footer className="mt-12 pt-6 border-t-2 border-gray-900 max-w-2xl ml-auto">
                    <div className="space-y-4">
                        <LineItem label="Total Recorded Income" amount={calculations.totalIncome || 0} />
                        <LineItem label="Total Recorded Expenses" amount={calculations.totalExpenses || 0} />
                        <div className={`mt-4 pt-4 border-t-2 border-double border-gray-900 flex justify-between text-2xl font-bold ${(calculations.netResult || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}><span>Net Profit / Loss</span><span>{formatCurrency(calculations.netResult || 0)}</span></div>
                    </div>
                </footer>
                
                {/* --- BANK SUMMARY & MODAL TRIGGER (Hybrid) --- */}
                <footer className="mt-12 pt-6 border-t border-gray-300 text-center rounded-lg p-4 transition-all duration-300 cursor-pointer hover:bg-gray-100/50 hover:shadow-lg" onClick={() => setIsBankModalOpen(true)}>
                    <h4 className="font-medium text-gray-600 mb-6 text-lg">Bank Account Summary & History</h4>
                    <div className="flex justify-center gap-6 sm:gap-12 text-left flex-wrap">
                        <div><div className="text-sm text-gray-600">Current Bank Balance (Static)</div><div className="text-xl font-medium text-gray-800">{formatCurrency(DUMMY_BANK_DATA.bankAccount.currentBalance)}</div></div>
                        <div><div className="text-sm text-gray-600">Credits (from selected period)</div><div className="text-xl font-medium text-green-600">+ {formatCurrency(calculations.totalIncome)}</div></div>
                        <div><div className="text-sm text-gray-600">Debits (from selected period)</div><div className="text-xl font-medium text-red-600">- {formatCurrency(calculations.totalExpenses)}</div></div>
                    </div>
                     <p className="text-xs text-gray-400 mt-4">(Click to view detailed static history log)</p>
                </footer>
            </div>
            
            {/* --- STATIC Bank Statement Modal --- */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-out ${isBankModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsBankModalOpen(false)}>
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
                <div className={`relative flex flex-col bg-gray-50 rounded-2xl shadow-2xl w-11/12 max-w-3xl transform transition-all duration-300 ease-out ${isBankModalOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                    <div className="flex-shrink-0 p-6 bg-gradient-to-r from-purple-500/95 to-blue-500/95 text-white backdrop-blur-lg rounded-t-2xl"><h3 className="text-2xl font-bold">Bank Statement (Static Demo)</h3><p className="text-sm opacity-80">Daily Transaction Summary</p></div>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {bankHistorySummary.map(day => (
                            <div key={day.date} className="bg-white p-4 rounded-lg shadow-md border border-gray-200"><h4 className="text-lg font-bold text-gray-800 pb-2 mb-3 border-b border-gray-200">{day.date}</h4><div className="space-y-2 text-sm"><div className="flex justify-between items-center"><span className="text-gray-500">Opening Balance</span><span className="font-medium text-gray-700">{formatCurrency(day.openingBalance)}</span></div><div className="flex justify-between items-center text-green-600"><span className="font-semibold">Total Credits</span><span className="font-bold">+ {formatCurrency(day.totalCredits)}</span></div><div className="flex justify-between items-center text-red-600"><span className="font-semibold">Total Debits</span><span className="font-bold">- {formatCurrency(Math.abs(day.totalDebits))}</span></div><div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200"><span className="text-gray-500 font-semibold">Closing Balance</span><span className="font-bold text-lg text-gray-800">{formatCurrency(day.closingBalance)}</span></div></div></div>
                        ))}
                    </div>
                    <div className="flex-shrink-0 p-6 bg-gray-100 border-t border-gray-200 rounded-b-2xl"><button onClick={() => setIsBankModalOpen(false)} className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 active:scale-95 transition-all font-semibold shadow-lg">Close</button></div>
                </div>
            </div>

            {/* --- DYNAMIC "Other Expenses" Modal --- */}
            <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ease-out ${isExpensesModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsExpensesModalOpen(false)}>
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"></div>
                <div className={`relative flex flex-col bg-white rounded-lg shadow-xl max-w-2xl w-11/12 transform transition-all duration-300 ease-out ${isExpensesModalOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
                    <h3 className="flex-shrink-0 text-xl font-bold border-b border-gray-300 p-6 text-gray-900">Other Expenses Remarks</h3>
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {(calculations.otherExpenseBreakdown && calculations.otherExpenseBreakdown.length > 0) ? (calculations.otherExpenseBreakdown.map((item, index) => ( <div key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200"><p className="font-semibold text-gray-700">{item.date}:</p><p className="text-sm text-gray-600 pl-2">{item.remark}</p></div> ))) : ( <p className="text-center text-gray-500 py-8">No remarks found for other expenses.</p>)}
                    </div>
                    <div className="flex-shrink-0 p-4 bg-gray-100 border-t rounded-b-lg"><button onClick={() => setIsExpensesModalOpen(false)} className="w-full py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors">Close</button></div>
                </div>
            </div>
        </div>
    );
};

export default FinancialStatement;