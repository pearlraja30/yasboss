import React, { useState } from 'react';
import { Download, FileSpreadsheet, Calendar, Loader2, Filter, FileText, Table } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

type ExportFormat = 'excel' | 'pdf' | 'csv';

const ReportsPanel: React.FC = () => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [downloading, setDownloading] = useState<string | null>(null);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');

    const handleDownload = async (reportType: 'sales' | 'gst_orders') => {
        if (!dateRange.start || !dateRange.end) {
            toast.error("Please select a date range");
            return;
        }

        try {
            setDownloading(reportType);
            
            // Calling the backend endpoint with the extra 'format' parameter
            const response = await api.adminService.downloadReport(
                reportType, 
                dateRange.start, 
                dateRange.end, 
                selectedFormat
            );
            
            // Define MIME types based on selection
            const mimeTypes = {
                excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                pdf: 'application/pdf',
                csv: 'text/csv'
            };

            const extensions = { excel: 'xlsx', pdf: 'pdf', csv: 'csv' };

            // Create a download link for the browser
            const blob = new Blob([response.data], { type: mimeTypes[selectedFormat] });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}_${dateRange.start}_to_${dateRange.end}.${extensions[selectedFormat]}`);
            
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success(`${selectedFormat.toUpperCase()} Report generated!`);
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to generate report. Check if data exists for these dates.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="p-8 bg-white rounded-[3rem] shadow-sm border border-gray-100">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-[#2D4A73] rounded-2xl">
                        <FileSpreadsheet size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-[#2D4A73] tracking-tighter uppercase italic">Financial Console</h2>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">GST Compliant Exports & Analytics</p>
                    </div>
                </div>

                {/* ✨ Format Selector */}
                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                    {(['excel', 'pdf', 'csv'] as ExportFormat[]).map((fmt) => (
                        <button
                            key={fmt}
                            onClick={() => setSelectedFormat(fmt)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                selectedFormat === fmt 
                                ? 'bg-white text-[#2D4A73] shadow-sm' 
                                : 'text-gray-400 hover:text-[#2D4A73]'
                            }`}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Range Picker */}
            <div className="grid md:grid-cols-3 gap-8 items-end bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Start Date</label>
                    <input 
                        type="date" 
                        className="bg-white border-none rounded-2xl p-4 font-bold text-[#2D4A73] focus:ring-2 focus:ring-[#2D4A73]"
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">End Date</label>
                    <input 
                        type="date" 
                        className="bg-white border-none rounded-2xl p-4 font-bold text-[#2D4A73] focus:ring-2 focus:ring-[#2D4A73]"
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs italic pb-4">
                    <Filter size={14} /> <span className="font-medium">Filter by Invoice Date</span>
                </div>
            </div>

            {/* Report Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-10">
                {/* Sales Summary Card */}
                <div className="p-8 border-2 border-gray-50 rounded-[2.5rem] hover:border-[#2D4A73]/20 transition-all bg-white">
                    <div className="mb-6">
                        <div className="w-10 h-10 bg-blue-50 text-[#2D4A73] rounded-xl flex items-center justify-center mb-4">
                            <Table size={20} />
                        </div>
                        <h3 className="font-black text-xl text-[#2D4A73] uppercase tracking-tight">Sales Overview</h3>
                        <p className="text-gray-500 text-sm font-medium">B2C Sales summary, revenue tracking, and order volumes.</p>
                    </div>
                    <button 
                        onClick={() => handleDownload('sales')}
                        disabled={!!downloading}
                        className="w-full bg-[#2D4A73] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
                    >
                        {downloading === 'sales' ? <Loader2 className="animate-spin" /> : <Download size={18} />}
                        Export {selectedFormat.toUpperCase()}
                    </button>
                </div>

                {/* GST Details Card */}
                <div className="p-8 border-2 border-gray-50 rounded-[2.5rem] hover:border-pink-200 transition-all bg-white">
                    <div className="mb-6">
                        <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4">
                            <FileText size={20} />
                        </div>
                        <h3 className="font-black text-xl text-[#2D4A73] uppercase tracking-tight">GST B2B Report</h3>
                        <p className="text-gray-500 text-sm font-medium">Full tax breakdown: HSN, CGST, SGST, IGST & Invoice values.</p>
                    </div>
                    <button 
                        onClick={() => handleDownload('gst_orders')}
                        disabled={!!downloading}
                        className="w-full bg-pink-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all disabled:opacity-50"
                    >
                        {downloading === 'gst_orders' ? <Loader2 className="animate-spin" /> : <FileSpreadsheet size={18} />}
                        Generate {selectedFormat.toUpperCase()}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportsPanel;