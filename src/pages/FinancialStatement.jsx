import React, { useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom'; // <-- Import Link for navigation

// === CONFIGURATION: Define salaries, rates, and FIXED employee counts here ===
// Worker data comes from the API. Other roles have a fixed daily count.
const ELECTRICITY_RATE_PER_UNIT = 7.68;
const ROYALTY_NAGAR_NIGAM_PER_DAY = 5500; // New constant daily expense
const DIESEL_RATE_PER_LITER = 92; // New constant for diesel rate

const SALARY_CONFIG = {
    // Dynamic Role
    WORKER: { salaryPerDay: 400, label: "Rag Picker" },
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

// Accept `splitwiseData` as a prop
const FinancialStatement = ({ revenueData, workforceData, salesData, splitwiseData, selectedDate, dateRange }) => {

    // --- DYNAMIC CALCULATIONS from API data for the main page ---
    const calculations = useMemo(() => {
        const normalizeDate = (date) => { if (!date) return null; const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };
        const startDate = normalizeDate(dateRange.start);
        const endDate = normalizeDate(dateRange.end);
        const numberOfDays = getDaysInRange(startDate, endDate);

        if (!workforceData || !salesData || !startDate || !endDate) return { reportDateString: selectedDate, totalIncome: 0, totalExpenses: 0, netResult: 0, incomes: {}, operatingExpenses: {}, employeeBreakdown: [], totalEmployeeSalary: 0 };

        const filteredWorkforce = workforceData.filter(item => { const itemDate = normalizeDate(new Date(item.Timestamp)); return itemDate >= startDate && itemDate <= endDate; });
        const filteredSales = salesData.filter(item => {
            const itemDateObj = new Date(item.date);
            if (!item.date || isNaN(itemDateObj.getTime())) return false;
            const itemDate = normalizeDate(itemDateObj);
            return itemDate.getTime() >= startDate.getTime() && itemDate.getTime() <= endDate.getTime();
        });

        // Filter Splitwise data for the selected date range
        const filteredSplitwise = splitwiseData?.data?.filter(item => {
            const itemDate = normalizeDate(new Date(item.Date));
            return itemDate >= startDate && itemDate <= endDate;
        }) || [];

        // --- CORRECTED INCOME CALCULATION ---
        let recyclablesRevenue = 0;
        let rdfRevenue = 0;
        let afrRevenue = 0;

        filteredSales.forEach(item => {
            const amount = Number(item.amount) || 0;
            if (item.type === 'Segregated') {
                recyclablesRevenue += amount;
            } else if (item.type === 'RDF/AFR') {
                const material = (item.material || '').toUpperCase();
                if (material.includes('RDF')) {
                    rdfRevenue += amount;
                } else if (material.includes('AFR')) {
                    afrRevenue += amount;
                }
            }
        });

        const totalIncome = recyclablesRevenue + rdfRevenue + afrRevenue;

        // --- EXPENSE CALCULATIONS ---
        const operationalTotals = filteredWorkforce.reduce((acc, item) => {
            acc.totalDieselLiters += Number(item['Diesel Consumption (in liters)']) || 0;
            acc.totalElectricityUnits += Number(item['Electricity Consumption (in Units)']) || 0;
            return acc;
        }, { totalDieselLiters: 0, totalElectricityUnits: 0 });

        const transportationExpenses = filteredSales.reduce((sum, item) => {
            if (item.type === 'RDF/AFR') {
                return sum + (Number(item.FrightAmt) || 0);
            }
            return sum;
        }, 0);
        
        // Calculate total Splitwise expenses
        const totalSplitwiseExpenses = filteredSplitwise.reduce((sum, item) => sum + (Number(item['Total Cost']) || 0), 0);

        const calculatedElectricityCost = operationalTotals.totalElectricityUnits * ELECTRICITY_RATE_PER_UNIT;
        const calculatedDieselCost = operationalTotals.totalDieselLiters * DIESEL_RATE_PER_LITER;
        const totalRoyaltyCost = ROYALTY_NAGAR_NIGAM_PER_DAY * numberOfDays;

        let totalEmployeeSalary = 0;
        const employeeBreakdown = [];
        const totalWorkersPresent = filteredWorkforce.reduce((sum, item) => sum + (Number(item['Number of Workers Present Today']) || 0), 0);
        const workerSalary = totalWorkersPresent * SALARY_CONFIG.WORKER.salaryPerDay;
        totalEmployeeSalary += workerSalary;
        employeeBreakdown.push({ label: SALARY_CONFIG.WORKER.label, displayCount: `${totalWorkersPresent}x`, totalSalary: workerSalary });

        const totalOperatingExpenses = transportationExpenses + calculatedDieselCost + calculatedElectricityCost + totalRoyaltyCost + totalSplitwiseExpenses;
        const totalExpenses = totalOperatingExpenses + totalEmployeeSalary;
        const netResult = totalIncome - totalExpenses;

        const operatingExpensesData = {
            "Transportation Expenses": transportationExpenses,
            "Diesel Cost": calculatedDieselCost,
            "Electricity Cost": calculatedElectricityCost,
            "Royalty (Nagar Nigam)": totalRoyaltyCost,
            "Splitwise Expenses": totalSplitwiseExpenses, // <-- Add Splitwise expenses here
        };

        return {
            reportDateString: selectedDate,
            totalIncome,
            totalExpenses,
            netResult,
            incomes: {
                "Recyclables Revenue": recyclablesRevenue,
                "RDF Revenue": rdfRevenue,
                "AFR Revenue": afrRevenue,
            },
            operatingExpenses: operatingExpensesData,
            totalEmployeeSalary,
            employeeBreakdown,
        };
    }, [workforceData, salesData, splitwiseData, dateRange, selectedDate]); // <-- Add splitwiseData to dependencies

    // Export to Excel function with amazing formatting - ENHANCED VERSION
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Helper function to create consistent borders
        const createBorder = (style = "thin", color = "000000") => ({
            top: { style, color: { rgb: color } },
            bottom: { style, color: { rgb: color } },
            left: { style, color: { rgb: color } },
            right: { style, color: { rgb: color } }
        });

        // Helper function to format currency for Excel
        const formatExcelCurrency = (amount) => {
            return typeof amount === 'number' ? amount : 0;
        };

        // ================ FINANCIAL SUMMARY SHEET - ENHANCED UI REPLICA ================
        const summaryData = [];
        let currentRow = 0;

        // Create header section with company-like styling
        summaryData.push(['', '', 'FINANCIAL STATEMENT REPORT', '', '']);
        summaryData.push(['', '', `Report Period: ${calculations.reportDateString}`, '', '']);
        summaryData.push(['', '', `Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, '', '']);
        summaryData.push(['', '', '', '', '']); // Empty row
        summaryData.push(['', '', '', '', '']); // Empty row

        const headerRows = 5;
        currentRow = headerRows;

        // Create the main table structure exactly like UI
        summaryData.push(['', 'INCOME (CREDITS)', '', 'EXPENSES (DEBITS)', '']);
        summaryData.push(['', 'Description', 'Amount (₹)', 'Description', 'Amount (₹)']);
        
        // Get income and expense entries
        const incomeEntries = Object.entries(calculations.incomes);
        const expenseEntries = Object.entries(calculations.operatingExpenses);
        
        // Find max rows needed
        const maxRows = Math.max(incomeEntries.length + 1, expenseEntries.length + calculations.employeeBreakdown.length + 3);
        
        // Add income and expense rows side by side
        for (let i = 0; i < maxRows; i++) {
            const row = ['', '', '', '', ''];
            
            // Income side
            if (i < incomeEntries.length) {
                row[1] = incomeEntries[i][0];
                row[2] = formatExcelCurrency(incomeEntries[i][1]);
            } else if (i === incomeEntries.length) {
                // Total income row
                row[1] = 'TOTAL INCOME';
                row[2] = formatExcelCurrency(calculations.totalIncome);
            }
            
            // Expense side
            if (i < expenseEntries.length) {
                row[3] = expenseEntries[i][0];
                row[4] = formatExcelCurrency(expenseEntries[i][1]);
            } else if (i === expenseEntries.length) {
                row[3] = 'Employee Salaries';
                row[4] = '';
            } else if (i === expenseEntries.length + 1 && calculations.employeeBreakdown.length > 0) {
                row[3] = `  ${calculations.employeeBreakdown[0].displayCount} ${calculations.employeeBreakdown[0].label}`;
                row[4] = formatExcelCurrency(calculations.employeeBreakdown[0].totalSalary);
            } else if (i === expenseEntries.length + 2) {
                row[3] = 'TOTAL EXPENSES';
                row[4] = formatExcelCurrency(calculations.totalExpenses);
            }
            
            summaryData.push(row);
        }

        // Add final summary section
        summaryData.push(['', '', '', '', '']);
        summaryData.push(['', 'FINANCIAL SUMMARY', '', '', '']);
        summaryData.push(['', 'Total Income', formatExcelCurrency(calculations.totalIncome), '', '']);
        summaryData.push(['', 'Total Expenses', formatExcelCurrency(calculations.totalExpenses), '', '']);
        summaryData.push(['', 'NET PROFIT / LOSS', formatExcelCurrency(calculations.netResult), '', '']);

        // Create worksheet from array
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

        // Apply enhanced styling
        const range = XLSX.utils.decode_range(summaryWs['!ref']);

        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!summaryWs[cellAddress]) continue;

                const cellValue = summaryWs[cellAddress].v;
                if (!summaryWs[cellAddress].s) summaryWs[cellAddress].s = {};

                // Header section styling (rows 0-2)
                if (R >= 0 && R <= 2 && C === 2) {
                    const fontSize = R === 0 ? 20 : 12;
                    const isBold = true;
                    summaryWs[cellAddress].s = {
                        font: { bold: isBold, color: { rgb: "FFFFFF" }, sz: fontSize, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: "1F2937" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("thin", "000000")
                    };
                }
                
                // Main table headers (row with INCOME/EXPENSES)
                else if (R === headerRows && (C === 1 || C === 3)) {
                    const bgColor = C === 1 ? "10B981" : "DC2626"; // Green for income, red for expenses
                    summaryWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: bgColor } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("medium", "000000")
                    };
                }
                
                // Column headers (Description, Amount)
                else if (R === headerRows + 1 && (C === 1 || C === 2 || C === 3 || C === 4)) {
                    const bgColor = (C === 1 || C === 2) ? "34D399" : "F87171"; // Lighter green/red
                    summaryWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: bgColor } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("thin", "000000")
                    };
                }
                
                // Data rows
                else if (R > headerRows + 1 && R < range.e.r - 4) {
                    const isIncomeColumn = C === 1 || C === 2;
                    const isExpenseColumn = C === 3 || C === 4;
                    const isAmountColumn = C === 2 || C === 4;
                    const isTotalRow = typeof cellValue === 'string' && cellValue.includes('TOTAL');
                    
                    if (isIncomeColumn || isExpenseColumn) {
                        let bgColor = "FFFFFF";
                        let textColor = "374151";
                        let isBold = false;
                        
                        if (isTotalRow) {
                            bgColor = isIncomeColumn ? "065F46" : "991B1B";
                            textColor = "FFFFFF";
                            isBold = true;
                        } else if (cellValue && cellValue !== '') {
                            bgColor = isIncomeColumn ? "ECFDF5" : "FEF2F2";
                            if (typeof cellValue === 'string' && cellValue.includes('Employee')) {
                                bgColor = isExpenseColumn ? "FEF3C7" : bgColor;
                                isBold = true;
                            }
                            if (typeof cellValue === 'string' && cellValue.startsWith('  ')) {
                                bgColor = isExpenseColumn ? "FEF9E7" : bgColor;
                                textColor = "6B7280";
                            }
                        }
                        
                        summaryWs[cellAddress].s = {
                            font: { bold: isBold, color: { rgb: textColor }, sz: 11, name: "Calibri" },
                            fill: { patternType: "solid", fgColor: { rgb: bgColor } },
                            alignment: { 
                                horizontal: isAmountColumn ? "right" : "left", 
                                vertical: "center",
                                indent: (typeof cellValue === 'string' && cellValue.startsWith('  ')) ? 1 : 0
                            },
                            border: createBorder("thin", "D1D5DB")
                        };
                        
                        if (isAmountColumn && typeof cellValue === 'number') {
                            summaryWs[cellAddress].s.numFmt = '₹#,##0.00';
                        }
                    }
                }
                
                // Final summary section
                else if (R >= range.e.r - 4) {
                    const isSummaryHeader = typeof cellValue === 'string' && cellValue.includes('FINANCIAL SUMMARY');
                    const isNetProfitRow = typeof cellValue === 'string' && cellValue.includes('NET PROFIT');
                    const isSummaryData = R > range.e.r - 4 && (C === 1 || C === 2);
                    
                    if (isSummaryHeader) {
                        summaryWs[cellAddress].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14, name: "Calibri" },
                            fill: { patternType: "solid", fgColor: { rgb: "1F2937" } },
                            alignment: { horizontal: "center", vertical: "center" },
                            border: createBorder("medium", "000000")
                        };
                    } else if (isNetProfitRow) {
                        const netColor = calculations.netResult >= 0 ? "059669" : "DC2626";
                        summaryWs[cellAddress].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14, name: "Calibri" },
                            fill: { patternType: "solid", fgColor: { rgb: netColor } },
                            alignment: { horizontal: C === 2 ? "right" : "left", vertical: "center" },
                            border: createBorder("thick", "000000")
                        };
                        if (C === 2) summaryWs[cellAddress].s.numFmt = '₹#,##0.00';
                    } else if (isSummaryData && cellValue && cellValue !== '') {
                        summaryWs[cellAddress].s = {
                            font: { bold: true, color: { rgb: "374151" }, sz: 12, name: "Calibri" },
                            fill: { patternType: "solid", fgColor: { rgb: "F9FAFB" } },
                            alignment: { horizontal: C === 2 ? "right" : "left", vertical: "center" },
                            border: createBorder("thin", "D1D5DB")
                        };
                        if (C === 2 && typeof cellValue === 'number') summaryWs[cellAddress].s.numFmt = '₹#,##0.00';
                    }
                }
            }
        }

        // Set column widths for better presentation
        summaryWs['!cols'] = [
            { wch: 2 },   // Column A - spacer
            { wch: 25 },  // Column B - Income descriptions
            { wch: 18 },  // Column C - Income amounts
            { wch: 25 },  // Column D - Expense descriptions  
            { wch: 18 }   // Column E - Expense amounts
        ];

        // Add merges for headers and sections
        summaryWs['!merges'] = [
            // Header merges
            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Title
            { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Date
            { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // Generated on
            
            // Main section headers
            { s: { r: headerRows, c: 1 }, e: { r: headerRows, c: 2 } }, // Income header
            { s: { r: headerRows, c: 3 }, e: { r: headerRows, c: 4 } }, // Expenses header
            
            // Summary section
            { s: { r: range.e.r - 4, c: 1 }, e: { r: range.e.r - 4, c: 2 } } // Financial Summary header
        ];

        XLSX.utils.book_append_sheet(wb, summaryWs, '💰 Financial Statement');

        // ================ DETAILED ANALYSIS SHEET ================
        const analysisData = [];
        
        // Enhanced Analysis Sheet with KPIs and Charts data
        analysisData.push(['COMPREHENSIVE FINANCIAL ANALYSIS', '', '', '']);
        analysisData.push(['', '', '', '']);
        analysisData.push(['Report Period:', calculations.reportDateString, 'Generated:', new Date().toLocaleString('en-IN')]);
        analysisData.push(['', '', '', '']);
        
        // Key Performance Indicators
        analysisData.push(['KEY PERFORMANCE INDICATORS', '', '', '']);
        analysisData.push(['Metric', 'Value', 'Status', 'Benchmark']);
        
        const profitMargin = calculations.totalIncome > 0 ? ((calculations.netResult / calculations.totalIncome) * 100) : 0;
        const expenseRatio = calculations.totalIncome > 0 ? ((calculations.totalExpenses / calculations.totalIncome) * 100) : 0;
        const daysInRange = getDaysInRange(dateRange.start, dateRange.end);
        const dailyRevenue = calculations.totalIncome / daysInRange;
        const dailyExpenses = calculations.totalExpenses / daysInRange;
        
        analysisData.push(['Profit Margin (%)', profitMargin, profitMargin > 10 ? 'EXCELLENT' : profitMargin > 5 ? 'GOOD' : profitMargin > 0 ? 'FAIR' : 'POOR', '10%+']);
        analysisData.push(['Expense Ratio (%)', expenseRatio, expenseRatio < 80 ? 'EXCELLENT' : expenseRatio < 90 ? 'GOOD' : 'HIGH', '<80%']);
        analysisData.push(['Daily Revenue (₹)', dailyRevenue, dailyRevenue > 50000 ? 'HIGH' : dailyRevenue > 25000 ? 'MEDIUM' : 'LOW', '50,000+']);
        analysisData.push(['Daily Expenses (₹)', dailyExpenses, dailyExpenses < 40000 ? 'CONTROLLED' : 'HIGH', '<40,000']);
        analysisData.push(['Break-even Status', calculations.netResult >= 0 ? 'PROFITABLE' : 'LOSS', calculations.netResult >= 0 ? '✓' : '✗', 'Positive']);
        
        analysisData.push(['', '', '', '']);
        
        // Revenue Breakdown
        analysisData.push(['REVENUE BREAKDOWN', '', '', '']);
        analysisData.push(['Source', 'Amount (₹)', 'Percentage', 'Trend']);
        Object.entries(calculations.incomes).forEach(([source, amount]) => {
            const percentage = calculations.totalIncome > 0 ? ((amount / calculations.totalIncome) * 100) : 0;
            analysisData.push([source, amount, `${percentage.toFixed(1)}%`, percentage > 40 ? 'MAJOR' : percentage > 20 ? 'SIGNIFICANT' : 'MINOR']);
        });
        
        analysisData.push(['', '', '', '']);
        
        // Expense Breakdown
        analysisData.push(['EXPENSE BREAKDOWN', '', '', '']);
        analysisData.push(['Category', 'Amount (₹)', 'Percentage', 'Impact']);
        
        Object.entries(calculations.operatingExpenses).forEach(([category, amount]) => {
            const percentage = calculations.totalExpenses > 0 ? ((amount / calculations.totalExpenses) * 100) : 0;
            analysisData.push([category, amount, `${percentage.toFixed(1)}%`, percentage > 30 ? 'HIGH' : percentage > 15 ? 'MEDIUM' : 'LOW']);
        });
        
        const salaryPercentage = calculations.totalExpenses > 0 ? ((calculations.totalEmployeeSalary / calculations.totalExpenses) * 100) : 0;
        analysisData.push(['Employee Salaries', calculations.totalEmployeeSalary, `${salaryPercentage.toFixed(1)}%`, salaryPercentage > 40 ? 'HIGH' : salaryPercentage > 25 ? 'MEDIUM' : 'LOW']);

        const analysisWs = XLSX.utils.aoa_to_sheet(analysisData);
        const analysisRange = XLSX.utils.decode_range(analysisWs['!ref']);

        // Style the analysis sheet
        for (let R = analysisRange.s.r; R <= analysisRange.e.r; ++R) {
            for (let C = analysisRange.s.c; C <= analysisRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!analysisWs[cellAddress]) continue;

                const cellValue = analysisWs[cellAddress].v;
                if (!analysisWs[cellAddress].s) analysisWs[cellAddress].s = {};

                // Main title
                if (R === 0) {
                    analysisWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: "1F2937" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("medium", "000000")
                    };
                }
                
                // Section headers
                else if (typeof cellValue === 'string' && (cellValue.includes('INDICATORS') || cellValue.includes('BREAKDOWN'))) {
                    const sectionColor = cellValue.includes('INDICATORS') ? "0F172A" : 
                                        cellValue.includes('REVENUE') ? "059669" : "DC2626";
                    analysisWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: sectionColor } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("medium", "000000")
                    };
                }
                
                // Table headers
                else if ((R === 5 && cellValue) || 
                        (R === 14 && cellValue && cellValue !== '') ||
                        (R === 20 && cellValue && cellValue !== '')) {
                    analysisWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: "4B5563" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("thin", "000000")
                    };
                }
                
                // Data cells
                else if (cellValue && cellValue !== '') {
                    let bgColor = "FFFFFF";
                    let textColor = "374151";
                    let isBold = false;
                    
                    // Status indicators
                    if (typeof cellValue === 'string') {
                        if (cellValue === 'EXCELLENT' || cellValue === 'PROFITABLE' || cellValue === '✓') {
                            bgColor = "DCFCE7"; textColor = "059669"; isBold = true;
                        } else if (cellValue === 'GOOD' || cellValue === 'MEDIUM' || cellValue === 'CONTROLLED') {
                            bgColor = "FEF3C7"; textColor = "D97706"; isBold = true;
                        } else if (cellValue === 'POOR' || cellValue === 'HIGH' || cellValue === 'LOSS' || cellValue === '✗') {
                            bgColor = "FEE2E2"; textColor = "DC2626"; isBold = true;
                        } else if (cellValue === 'FAIR' || cellValue === 'LOW') {
                            bgColor = "E0E7FF"; textColor = "3730A3"; isBold = true;
                        }
                    }
                    
                    analysisWs[cellAddress].s = {
                        font: { bold: isBold, color: { rgb: textColor }, sz: 11, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: bgColor } },
                        alignment: { 
                            horizontal: typeof cellValue === 'number' ? "right" : 
                                       typeof cellValue === 'string' && (cellValue.includes('%') || cellValue.includes('₹')) ? "right" : "left",
                            vertical: "center" 
                        },
                        border: createBorder("thin", "D1D5DB")
                    };
                    
                    // Number formatting
                    if (typeof cellValue === 'number') {
                        if (C === 1 && (R >= 7 && R <= 11)) { // KPI values
                            if (R === 7 || R === 8) { // Percentages
                                analysisWs[cellAddress].s.numFmt = '0.00"%"';
                            } else { // Currency
                                analysisWs[cellAddress].s.numFmt = '₹#,##0.00';
                            }
                        } else { // Other amounts
                            analysisWs[cellAddress].s.numFmt = '₹#,##0.00';
                        }
                    }
                }
            }
        }

        analysisWs['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
        
        // Add merges for headers
        analysisWs['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, // Title
            { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } }, // KPI header
            { s: { r: 13, c: 0 }, e: { r: 13, c: 3 } }, // Revenue header
            { s: { r: 19, c: 0 }, e: { r: 19, c: 3 } }  // Expense header
        ];

        XLSX.utils.book_append_sheet(wb, analysisWs, '📊 Detailed Analysis');

        // ================ SALES DATA SHEET (if available) ================
        if (salesData && salesData.length > 0) {
            const normalizeDate = (date) => { if (!date) return null; const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };
            const startDate = normalizeDate(dateRange.start);
            const endDate = normalizeDate(dateRange.end);
            const filteredSales = salesData.filter(item => {
                const itemDateObj = new Date(item.date);
                if (!item.date || isNaN(itemDateObj.getTime())) return false;
                const itemDate = normalizeDate(itemDateObj);
                return itemDate.getTime() >= startDate.getTime() && itemDate.getTime() <= endDate.getTime();
            });

            if (filteredSales.length > 0) {
                // Create enhanced sales data with better formatting
                const salesTableData = [];
                
                // Add title and headers
                salesTableData.push(['SALES TRANSACTION REPORT', '', '', '', '', '']);
                salesTableData.push([`Period: ${calculations.reportDateString}`, '', '', '', '', '']);
                salesTableData.push(['', '', '', '', '', '']);
                
                // Add table headers
                const headers = Object.keys(filteredSales[0]);
                salesTableData.push(headers);
                
                // Add data rows
                filteredSales.forEach(item => {
                    const row = headers.map(header => item[header] || '');
                    salesTableData.push(row);
                });
                
                // Add summary row
                salesTableData.push(['']);
                const totalAmount = filteredSales.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
                const summaryRow = new Array(headers.length).fill('');
                summaryRow[0] = 'TOTAL';
                const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
                if (amountIndex !== -1) summaryRow[amountIndex] = totalAmount;
                salesTableData.push(summaryRow);

                const salesWs = XLSX.utils.aoa_to_sheet(salesTableData);
                const salesRange = XLSX.utils.decode_range(salesWs['!ref']);

                // Apply enhanced styling to sales sheet
                for (let R = salesRange.s.r; R <= salesRange.e.r; ++R) {
                    for (let C = salesRange.s.c; C <= salesRange.e.c; ++C) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!salesWs[cellAddress]) continue;

                        const cellValue = salesWs[cellAddress].v;
                        if (!salesWs[cellAddress].s) salesWs[cellAddress].s = {};

                        if (R === 0) { // Title row
                            salesWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: "1E40AF" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: createBorder("medium", "000000")
                            };
                        } else if (R === 1) { // Period row
                            salesWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: "1E40AF" }, sz: 12, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: "EFF6FF" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: createBorder("thin", "3B82F6")
                            };
                        } else if (R === 3) { // Header row
                            salesWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: "3B82F6" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: createBorder("thin", "000000")
                            };
                        } else if (R === salesRange.e.r) { // Total row
                            salesWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: "1E40AF" } },
                                alignment: { horizontal: typeof cellValue === 'number' ? "right" : "center", vertical: "center" },
                                border: createBorder("medium", "000000")
                            };
                            if (typeof cellValue === 'number') salesWs[cellAddress].s.numFmt = '₹#,##0.00';
                        } else if (R > 3 && R < salesRange.e.r - 1) { // Data rows
                            const isAlternate = (R - 4) % 2 === 0;
                            const bgColor = isAlternate ? "F1F5F9" : "FFFFFF";
                            
                            // Special formatting for different types
                            let specialBg = bgColor;
                            if (typeof cellValue === 'string') {
                                if (cellValue === 'Segregated') specialBg = "ECFDF5";
                                else if (cellValue === 'RDF/AFR') specialBg = "FEF3C7";
                            }
                            
                            salesWs[cellAddress].s = {
                                font: { color: { rgb: "374151" }, sz: 10, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: specialBg } },
                                alignment: { horizontal: typeof cellValue === 'number' ? "right" : "left", vertical: "center" },
                                border: createBorder("thin", "CBD5E1")
                            };

                            if (typeof cellValue === 'number' && headers[C] && headers[C].toLowerCase().includes('amount')) {
                                salesWs[cellAddress].s.numFmt = '₹#,##0.00';
                            }
                        }
                    }
                }

                // Set column widths
                salesWs['!cols'] = headers.map(() => ({ wch: 15 }));
                
                // Add merges for title and period
                salesWs['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
                    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }
                ];

                XLSX.utils.book_append_sheet(wb, salesWs, '💹 Sales Transactions');
            }
        }

        // ================ WORKFORCE DATA SHEET ================
        if (workforceData && workforceData.length > 0) {
            const normalizeDate = (date) => { if (!date) return null; const d = new Date(date); d.setHours(0, 0, 0, 0); return d; };
            const startDate = normalizeDate(dateRange.start);
            const endDate = normalizeDate(dateRange.end);
            const filteredWorkforce = workforceData.filter(item => {
                const itemDate = normalizeDate(new Date(item.Timestamp));
                return itemDate >= startDate && itemDate <= endDate;
            });

            if (filteredWorkforce.length > 0) {
                const workforceTableData = [];
                
                // Add title and headers
                workforceTableData.push(['WORKFORCE & OPERATIONS REPORT', '', '', '', '', '']);
                workforceTableData.push([`Period: ${calculations.reportDateString}`, '', '', '', '', '']);
                workforceTableData.push(['', '', '', '', '', '']);
                
                // Add table headers
                const wfHeaders = Object.keys(filteredWorkforce[0]);
                workforceTableData.push(wfHeaders);
                
                // Add data rows
                filteredWorkforce.forEach(item => {
                    const row = wfHeaders.map(header => item[header] || '');
                    workforceTableData.push(row);
                });
                
                // Add summary rows
                workforceTableData.push(['']);
                const totalWorkers = filteredWorkforce.reduce((sum, item) => sum + (Number(item['Number of Workers Present Today']) || 0), 0);
                const totalDiesel = filteredWorkforce.reduce((sum, item) => sum + (Number(item['Diesel Consumption (in liters)']) || 0), 0);
                const totalElectricity = filteredWorkforce.reduce((sum, item) => sum + (Number(item['Electricity Consumption (in Units)']) || 0), 0);
                
                workforceTableData.push(['SUMMARY', '', '', '', '', '']);
                workforceTableData.push(['Total Workers', totalWorkers, '', '', '', '']);
                workforceTableData.push(['Total Diesel (L)', totalDiesel, '', '', '', '']);
                workforceTableData.push(['Total Electricity (Units)', totalElectricity, '', '', '', '']);

                const workforceWs = XLSX.utils.aoa_to_sheet(workforceTableData);
                const workforceRange = XLSX.utils.decode_range(workforceWs['!ref']);

                // Apply enhanced styling to workforce sheet
                for (let R = workforceRange.s.r; R <= workforceRange.e.r; ++R) {
                    for (let C = workforceRange.s.c; C <= workforceRange.e.c; ++C) {
                        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                        if (!workforceWs[cellAddress]) continue;

                        const cellValue = workforceWs[cellAddress].v;
                        if (!workforceWs[cellAddress].s) workforceWs[cellAddress].s = {};

                        if (R === 0) { // Title row
                            workforceWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: "7C3AED" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: createBorder("medium", "000000")
                            };
                        } else if (R === 1) { // Period row
                            workforceWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: "7C3AED" }, sz: 12, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: "F5F3FF" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: createBorder("thin", "A855F7")
                            };
                        } else if (R === 3) { // Header row
                            workforceWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: "A855F7" } },
                                alignment: { horizontal: "center", vertical: "center" },
                                border: createBorder("thin", "000000")
                            };
                        } else if (R >= workforceRange.e.r - 4) { // Summary rows
                            const isSummaryHeader = typeof cellValue === 'string' && cellValue === 'SUMMARY';
                            workforceWs[cellAddress].s = {
                                font: { bold: true, color: { rgb: isSummaryHeader ? "FFFFFF" : "7C3AED" }, sz: 12, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: isSummaryHeader ? "7C3AED" : "EDE9FE" } },
                                alignment: { horizontal: typeof cellValue === 'number' ? "right" : "left", vertical: "center" },
                                border: createBorder(isSummaryHeader ? "medium" : "thin", "000000")
                            };
                            if (typeof cellValue === 'number') workforceWs[cellAddress].s.numFmt = '#,##0.00';
                        } else if (R > 3 && R < workforceRange.e.r - 4) { // Data rows
                            const isAlternate = (R - 4) % 2 === 0;
                            const bgColor = isAlternate ? "FAF5FF" : "FFFFFF";
                            
                            workforceWs[cellAddress].s = {
                                font: { color: { rgb: "374151" }, sz: 10, name: "Calibri" },
                                fill: { patternType: "solid", fgColor: { rgb: bgColor } },
                                alignment: { horizontal: typeof cellValue === 'number' ? "right" : "left", vertical: "center" },
                                border: createBorder("thin", "D8B4FE")
                            };

                            if (typeof cellValue === 'number') {
                                workforceWs[cellAddress].s.numFmt = '#,##0.00';
                            }
                        }
                    }
                }

                // Set column widths
                workforceWs['!cols'] = wfHeaders.map(() => ({ wch: 18 }));
                
                // Add merges for title and period
                workforceWs['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: wfHeaders.length - 1 } },
                    { s: { r: 1, c: 0 }, e: { r: 1, c: wfHeaders.length - 1 } },
                    { s: { r: workforceRange.e.r - 4, c: 0 }, e: { r: workforceRange.e.r - 4, c: wfHeaders.length - 1 } }
                ];

                XLSX.utils.book_append_sheet(wb, workforceWs, '👷‍♂️ Workforce Operations');
            }
        }

        // ================ EXECUTIVE DASHBOARD SHEET ================
        const dashboardData = [];
        
        // Executive Summary
        dashboardData.push(['EXECUTIVE DASHBOARD', '', '', '', '']);
        dashboardData.push([`${calculations.reportDateString}`, '', '', '', '']);
        dashboardData.push(['', '', '', '', '']);
        
        // Quick Stats
        dashboardData.push(['QUICK PERFORMANCE METRICS', '', '', '', '']);
        dashboardData.push(['', '', '', '', '']);
        
        // Financial Overview Table
        dashboardData.push(['Financial Overview', 'Current Period', 'Target', 'Variance', 'Status']);
        dashboardData.push(['Total Revenue', calculations.totalIncome, 100000, calculations.totalIncome - 100000, calculations.totalIncome >= 100000 ? '✓ On Target' : '⚠ Below Target']);
        dashboardData.push(['Total Expenses', calculations.totalExpenses, 80000, calculations.totalExpenses - 80000, calculations.totalExpenses <= 80000 ? '✓ Within Budget' : '⚠ Over Budget']);
        dashboardData.push(['Net Profit', calculations.netResult, 20000, calculations.netResult - 20000, calculations.netResult >= 20000 ? '✓ Profitable' : calculations.netResult >= 0 ? '⚠ Low Profit' : '✗ Loss']);
        
        dashboardData.push(['', '', '', '', '']);
        
        // Operational Metrics
        dashboardData.push(['Operational Metrics', 'Value', 'Unit', 'Efficiency', 'Grade']);
        // The next line was the problem. It is now removed.
        // const daysInRange = getDaysInRange(dateRange.start, dateRange.end);
        dashboardData.push(['Daily Revenue', calculations.totalIncome / daysInRange, '₹/day', calculations.totalIncome / daysInRange > 15000 ? 'High' : 'Medium', calculations.totalIncome / daysInRange > 15000 ? 'A' : 'B']);
        dashboardData.push(['Daily Expenses', calculations.totalExpenses / daysInRange, '₹/day', calculations.totalExpenses / daysInRange < 12000 ? 'Controlled' : 'High', calculations.totalExpenses / daysInRange < 12000 ? 'A' : 'C']);
        dashboardData.push(['Profit Margin', profitMargin, '%', profitMargin > 15 ? 'Excellent' : profitMargin > 5 ? 'Good' : 'Poor', profitMargin > 15 ? 'A+' : profitMargin > 5 ? 'B' : 'D']);
        
        dashboardData.push(['', '', '', '', '']);
        
        // Top Revenue Sources
        dashboardData.push(['Revenue Sources', 'Amount', 'Share', 'Growth Potential', '']);
        const sortedIncomes = Object.entries(calculations.incomes).sort((a, b) => b[1] - a[1]);
        sortedIncomes.forEach(([source, amount]) => {
            const share = calculations.totalIncome > 0 ? ((amount / calculations.totalIncome) * 100) : 0;
            const potential = share > 50 ? 'Dominant' : share > 25 ? 'Major' : share > 10 ? 'Moderate' : 'Minor';
            dashboardData.push([source, amount, `${share.toFixed(1)}%`, potential, '']);
        });
        
        dashboardData.push(['', '', '', '', '']);
        
        // Action Items
        dashboardData.push(['RECOMMENDED ACTIONS', '', '', '', '']);
        dashboardData.push(['Priority', 'Action Item', 'Expected Impact', 'Timeline', 'Owner']);
        
        // Generate dynamic recommendations
        if (calculations.netResult < 0) {
            dashboardData.push(['HIGH', 'Implement cost reduction measures', 'Improve profitability', '1-2 weeks', 'Operations Manager']);
        }
        if (profitMargin < 10) {
            dashboardData.push(['MEDIUM', 'Optimize revenue streams', 'Increase profit margin', '2-4 weeks', 'Sales Team']);
        }
        if (calculations.totalEmployeeSalary / calculations.totalExpenses > 0.4) {
            dashboardData.push(['LOW', 'Review workforce efficiency', 'Optimize labor costs', '1 month', 'HR Manager']);
        }

        const dashboardWs = XLSX.utils.aoa_to_sheet(dashboardData);
        const dashboardRange = XLSX.utils.decode_range(dashboardWs['!ref']);

        // Apply premium styling to dashboard
        for (let R = dashboardRange.s.r; R <= dashboardRange.e.r; ++R) {
            for (let C = dashboardRange.s.c; C <= dashboardRange.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!dashboardWs[cellAddress]) continue;

                const cellValue = dashboardWs[cellAddress].v;
                if (!dashboardWs[cellAddress].s) dashboardWs[cellAddress].s = {};

                // Main title
                if (R === 0) {
                    dashboardWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 20, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: "0F172A" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("thick", "000000")
                    };
                }
                
                // Section headers
                else if (typeof cellValue === 'string' && (
                    cellValue.includes('PERFORMANCE') || 
                    cellValue.includes('ACTIONS') ||
                    cellValue === 'Financial Overview' ||
                    cellValue === 'Operational Metrics' ||
                    cellValue === 'Revenue Sources'
                )) {
                    let headerColor = "1E40AF";
                    if (cellValue.includes('PERFORMANCE')) headerColor = "059669";
                    if (cellValue.includes('ACTIONS')) headerColor = "DC2626";
                    
                    dashboardWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: headerColor } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("medium", "000000")
                    };
                }
                
                // Table headers
                else if (R === 6 || R === 11 || R === 16 || R === 24) {
                    dashboardWs[cellAddress].s = {
                        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: "4B5563" } },
                        alignment: { horizontal: "center", vertical: "center" },
                        border: createBorder("thin", "000000")
                    };
                }
                
                // Data cells with conditional formatting
                else if (cellValue && cellValue !== '') {
                    let bgColor = "FFFFFF";
                    let textColor = "374151";
                    let isBold = false;
                    
                    // Status-based coloring
                    if (typeof cellValue === 'string') {
                        if (cellValue.includes('✓') || cellValue === 'Profitable' || cellValue === 'A+' || cellValue === 'A') {
                            bgColor = "DCFCE7"; textColor = "059669"; isBold = true;
                        } else if (cellValue.includes('⚠') || cellValue === 'B' || cellValue === 'Good') {
                            bgColor = "FEF3C7"; textColor = "D97706"; isBold = true;
                        } else if (cellValue.includes('✗') || cellValue === 'D' || cellValue === 'Poor' || cellValue === 'Loss') {
                            bgColor = "FEE2E2"; textColor = "DC2626"; isBold = true;
                        } else if (cellValue === 'HIGH') {
                            bgColor = "FEE2E2"; textColor = "DC2626"; isBold = true;
                        } else if (cellValue === 'MEDIUM') {
                            bgColor = "FEF3C7"; textColor = "D97706"; isBold = true;
                        } else if (cellValue === 'LOW') {
                            bgColor = "E0E7FF"; textColor = "3730A3"; isBold = true;
                        }
                    }
                    
                    // Alternate row coloring for data tables
                    if (R >= 7 && R <= 9) bgColor = bgColor === "FFFFFF" ? "F8FAFC" : bgColor;
                    if (R >= 12 && R <= 14) bgColor = bgColor === "FFFFFF" ? "F0FDF4" : bgColor;
                    if (R >= 17 && R <= 19) bgColor = bgColor === "FFFFFF" ? "FEF7ED" : bgColor;
                    
                    dashboardWs[cellAddress].s = {
                        font: { bold: isBold, color: { rgb: textColor }, sz: 10, name: "Calibri" },
                        fill: { patternType: "solid", fgColor: { rgb: bgColor } },
                        alignment: { 
                            horizontal: typeof cellValue === 'number' ? "right" : "left", 
                            vertical: "center" 
                        },
                        border: createBorder("thin", "D1D5DB")
                    };
                    
                    // Number formatting
                    if (typeof cellValue === 'number') {
                        if (C === 1 && (R >= 7 && R <= 9)) { // Financial amounts
                            dashboardWs[cellAddress].s.numFmt = '₹#,##0.00';
                        } else if (C === 3 && (R >= 7 && R <= 9)) { // Variance
                            dashboardWs[cellAddress].s.numFmt = '₹#,##0.00';
                        } else if (C === 1 && R === 14) { // Profit margin percentage
                            dashboardWs[cellAddress].s.numFmt = '0.00"%"';
                        } else if (typeof cellValue === 'number') {
                            dashboardWs[cellAddress].s.numFmt = '₹#,##0.00';
                        }
                    }
                }
            }
        }

        dashboardWs['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];
        
        // Add comprehensive merges
        dashboardWs['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Main title
            { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Date
            { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }, // Performance metrics header
            { s: { r: 10, c: 0 }, e: { r: 10, c: 4 } }, // Operational metrics header
            { s: { r: 15, c: 0 }, e: { r: 15, c: 4 } }, // Revenue sources header
            { s: { r: 21, c: 0 }, e: { r: 21, c: 4 } }  // Action items header
        ];

        XLSX.utils.book_append_sheet(wb, dashboardWs, '🎯 Executive Dashboard');

        // Generate filename with date and time
        const now = new Date();
        const filename = `Financial_Report_${calculations.reportDateString.replace(/[/]/g, '_')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    const LineItem = ({ label, amount, to }) => {
        const content = (
            <div className="flex justify-between items-baseline text-base leading-relaxed">
                <span className="text-gray-600 pr-4">{label}</span>
                <div className="flex items-center">
                    <span className="font-medium whitespace-nowrap">{formatCurrency(Math.abs(amount))}</span>
                </div>
            </div>
        );

        if (to) {
            return (
                <Link to={to} className="hover:bg-gray-100 p-2 rounded-md transition-colors duration-200 block">
                    {content}
                </Link>
            );
        }

        return content;
    };

    return (
        <div className="financial-gradient-bg min-h-screen p-6 sm:p-12">
            <div className="ledger-sheet max-w-7xl mx-auto bg-white/85 backdrop-blur-xl p-6 sm:p-12 rounded-xl border border-white/20 shadow-2xl">

                <header className="text-center border-b-2 border-gray-800 pb-6 mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <div></div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-wide text-gray-900">Financial Statement</h1>
                            <h2 className="text-lg font-normal text-gray-600 mt-2">Report for: {calculations.reportDateString}</h2>
                        </div>
                        <button
                            onClick={exportToExcel}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Export to Excel
                        </button>
                    </div>
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
                            {Object.entries(calculations.operatingExpenses).map(([label, amount]) => (
                                <LineItem 
                                    key={label} 
                                    label={label} 
                                    amount={amount || 0} 
                                    // Add a link to the Splitwise Expenses page
                                    to={label === 'Splitwise Expenses' ? '/splitwise-expenses' : undefined}
                                />
                            ))}
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
            </div>
        </div>
    );
};

export default FinancialStatement;