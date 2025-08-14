import React, { useState, useEffect, useMemo, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Download } from 'lucide-react'; // <-- Import icon
import * as XLSX from 'xlsx'; // <-- Import xlsx library

// Converts "DD/MM/YYYY" to "YYYY-MM-DD" for filtering
const convertAppDateToFilterDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.includes(' to ')) {
        return null; 
    }
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
};

const BeltDashboard = ({ beltData, selectedDate }) => {
    const [operator, setOperator] = useState('all');
    const barChartRef = useRef(null);
    const pieChartRef = useRef(null);
    const allRecords = beltData || [];

    const filteredData = useMemo(() => {
        const filterDate = convertAppDateToFilterDate(selectedDate);
        if (!filterDate) return [];
        return allRecords.filter(record => 
            record.timestamp.startsWith(filterDate) &&
            (operator === 'all' || record.safai_saathi === operator)
        );
    }, [allRecords, selectedDate, operator]);

    // --- NEW: Excel Export Functionality ---
    const handleExport = () => {
        const totalWeight = filteredData.reduce((sum, r) => sum + r.quantity_tons, 0).toFixed(3);
        const totalEntries = filteredData.length;
        const topMaterial = Object.entries(filteredData.reduce((acc, r) => {
            acc[r.material] = (acc[r.material] || 0) + r.quantity_tons;
            return acc;
        }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Sheet 1: Summary
        const summaryData = [
            { Metric: "Selected Date", Value: selectedDate },
            { Metric: "Selected Operator", Value: operator },
            { Metric: "Total Weight (Tons)", Value: totalWeight },
            { Metric: "Total Entries", Value: totalEntries },
            { Metric: "Top Material", Value: topMaterial }
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);

        // Sheet 2: Detailed Log
        const logData = filteredData
            .sort((a,b) => b.quantity_tons - a.quantity_tons)
            .map(r => ({
                "Belt": r.belt,
                "Operator": r.safai_saathi || 'N/A',
                "Material": r.material || 'N/A',
                "Quantity (Tons)": r.quantity_tons.toFixed(4),
                "Timestamp": r.timestamp
            }));
        const logSheet = XLSX.utils.json_to_sheet(logData);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
        XLSX.utils.book_append_sheet(wb, logSheet, "Detailed Log");
        XLSX.writeFile(wb, `Belt_Performance_Report_${selectedDate.replace(/\//g, '-')}.xlsx`);
    };

    useEffect(() => {
        const materialTotals = filteredData.reduce((acc, r) => {
            acc[r.material] = (acc[r.material] || 0) + r.quantity_tons;
            return acc;
        }, {});
        const sorted = Object.entries(materialTotals).sort((a, b) => b[1] - a[1]);
        const labels = sorted.map(item => item[0]);
        const quantities = sorted.map(item => item[1]);
        
        const VIBRANT_CHART_COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];
        
        if (barChartRef.current) barChartRef.current.destroy();
        if (pieChartRef.current) pieChartRef.current.destroy();

        const barCanvas = document.getElementById('bar-chart');
        if (barCanvas) {
            barChartRef.current = new Chart(barCanvas, {
                type: 'bar',
                data: { labels, datasets: [{ label: 'Weight (Tons)', data: quantities, backgroundColor: 'var(--accent-color, #3b82f6)', borderRadius: 4, barPercentage: 0.6, categoryPercentage: 0.7 }] },
                options: getChartOptions(false)
            });
        }
        
        const pieCanvas = document.getElementById('pie-chart');
        if (pieCanvas) {
            pieChartRef.current = new Chart(pieCanvas, {
                type: 'doughnut',
                data: {
                    labels,
                    datasets: [{
                        data: quantities,
                        backgroundColor: VIBRANT_CHART_COLORS,
                        borderColor: 'var(--bg-card, #ffffff)',
                        borderWidth: 2 
                    }]
                },
                options: getChartOptions(true)
            });
        }

        const topMat = sorted[0];
        document.getElementById('total-weight').textContent = filteredData.reduce((sum, r) => sum + r.quantity_tons, 0).toFixed(3);
        document.getElementById('total-entries').textContent = filteredData.length;
        document.getElementById('top-material').textContent = topMat ? topMat[0] : 'N/A';

        return () => {
            if (barChartRef.current) barChartRef.current.destroy();
            if (pieChartRef.current) pieChartRef.current.destroy();
        }
    }, [filteredData]);

    const getChartOptions = (isPie = false) => ({
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: isPie, position: 'bottom', labels: { color: 'var(--text-secondary)', padding: 15, font: { family: "'Poppins', sans-serif" }} },
            tooltip: { backgroundColor: '#1f2937', titleFont: { weight: 'bold' }, callbacks: { label: (c) => ` ${c.dataset.label || c.label}: ${c.raw.toFixed(4)}` } }
        },
        scales: isPie ? {} : {
            y: { grid: { color: 'var(--border-color)' }, ticks: { color: 'var(--text-secondary)'} },
            x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)'} }
        }
    });

    const operatorOptions = useMemo(() => [...new Set(allRecords.map(r => r.safai_saathi))].sort(), [allRecords]);
    
    return (
        <>
            {/* The elegant layout styles remain the same */}
            <style>{`
                :root { --font-main: 'Poppins', sans-serif; --bg-body: #f8f9fa; --bg-card: #ffffff; --border-color: #e5e7eb; --text-primary: #111827; --text-secondary: #6b7280; --accent-color: #3b82f6; --shadow-soft: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05); }
                .belt-dashboard-container { max-width: 1400px; margin: 0 auto; padding: 2rem; background-color: var(--bg-body); color: var(--text-primary); }
                .belt-dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
                .belt-dashboard-header-text { text-align: left; }
                .belt-dashboard-header h1 { font-size: 1.75rem; font-weight: 600; margin-bottom: 0.5rem; }
                .belt-dashboard-header p { color: var(--text-secondary); font-size: 1rem; }
                
                .card { background: var(--bg-card); border-radius: 0.75rem; border: 1px solid var(--border-color); padding: 1.5rem; box-shadow: var(--shadow-soft); }
                .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .card-header h2 { margin-bottom: 0; font-size: 1.125rem; font-weight: 600; }
                
                .filter-group { display: flex; align-items: center; gap: 0.5rem; }
                .filter-group label { font-weight: 500; color: var(--text-secondary); font-size: 0.875rem; }
                .filter-group select { padding: 0.375rem 0.75rem; background-color: #f9fafb; border: 1px solid var(--border-color); border-radius: 0.375rem; }
                
                .content-grid { display: grid; gap: 1.5rem; }
                .kpi-card { display: flex; align-items: center; gap: 1rem; }
                .kpi-icon { flex-shrink: 0; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background-color: #e0e7ff; color: var(--accent-color); }
                .kpi-icon svg { width: 24px; height: 24px; }
                .kpi-info h3 { font-weight: 500; color: var(--text-secondary); font-size: 0.875rem; }
                .kpi-info .value { font-size: 1.75rem; font-weight: 600; line-height: 1.2; }
                .two-column-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
                .table-wrapper { max-height: 400px; overflow-y: auto; }
                #data-table { width: 100%; border-collapse: collapse; }
                #data-table th, #data-table td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--border-color); }
                #data-table th { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
                #data-table tbody tr:hover { background-color: #f9fafb; }
                .export-button { padding: 0.5rem 1rem; background-color: var(--accent-color); color: white; border: none; border-radius: 0.375rem; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background-color 0.2s; }
                .export-button:hover { background-color: #2563eb; }
                @media (min-width: 1024px) { .two-column-grid { grid-template-columns: 2fr 1fr; } }
            `}</style>
            
            <div className="belt-dashboard-container">
                <header className="belt-dashboard-header">
                    <div className="belt-dashboard-header-text">
                        <h1>Segregation Belts Overview</h1>
                        <p>Daily performance metrics for waste segregation belts.</p>
                    </div>
                    <button onClick={handleExport} className="export-button">
                        <Download size={18} />
                        Export to Excel
                    </button>
                </header>

                <main className="content-grid">
                    <section className="card content-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                        <div className="kpi-card">
                            <div className="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8.5C5 7.7 5.7 7 6.5 7h11c.8 0 1.5.7 1.5 1.5v7c0 .8-.7 1.5-1.5 1.5h-11c-.8 0-1.5-.7-1.5-1.5v-7Z"/><path d="M8 7v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M12 12h.01"/></svg></div>
                            <div className="kpi-info"><h3>Total Weight (Tons)</h3><p className="value" id="total-weight">0.000</p></div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg></div>
                            <div className="kpi-info"><h3>Total Entries</h3><p className="value" id="total-entries">0</p></div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                            <div className="kpi-info"><h3>Top Material</h3><p className="value" id="top-material" style={{ fontSize: '1.5rem' }}>N/A</p></div>
                        </div>
                    </section>
                    
                    <section className="two-column-grid">
                        <div className="card"><h2>Material Volume (Tons)</h2><div style={{ height: '350px' }}><canvas id="bar-chart"></canvas></div></div>
                        <div className="card"><h2>Material Share</h2><div style={{ height: '350px' }}><canvas id="pie-chart"></canvas></div></div>
                    </section>

                    <section className="card">
                        <div className="card-header">
                            <h2>Performance Log</h2>
                            <div className="filter-group">
                                <label htmlFor="saathi-picker">Operator:</label>
                                <select id="saathi-picker" value={operator} onChange={(e) => setOperator(e.target.value)}>
                                    <option value="all">All Operators</option>
                                    {operatorOptions.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="table-wrapper">
                            <table id="data-table">
                                <thead><tr><th>Belt</th><th>Operator</th><th>Material</th><th>Quantity (Tons)</th></tr></thead>
                                <tbody>{filteredData.length > 0 ? (filteredData.sort((a,b) => b.quantity_tons - a.quantity_tons).map((record, index) => (<tr key={index}><td>{record.belt}</td><td>{record.safai_saathi || 'N/A'}</td><td>{record.material || 'N/A'}</td><td>{record.quantity_tons.toFixed(4)}</td></tr>))) : (<tr><td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem' }}>No entries found for this date.</td></tr>)}</tbody>
                            </table>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
};

export default BeltDashboard;