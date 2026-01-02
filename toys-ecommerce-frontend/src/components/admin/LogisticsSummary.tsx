import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Truck, MapPin, User, FileText, Printer, ArrowLeft, 
    CheckCircle2, Phone, Package, XCircle, Search, 
    RefreshCcw, Loader2, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { shipmentService } from '../../services/api'; 
import { toast } from 'react-toastify';

const LogisticsSummary: React.FC = () => {
    const [activeTab, setActiveTab] = useState('ALL');
    const [shipments, setShipments] = useState<any[]>([]);
    const [counts, setCounts] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // The 8 Intelligence Tabs
    const tabs = [
        { id: 'ORDERS', label: 'Orders', icon: Package },
        { id: 'CANCELLATIONS', label: 'Cancellations', icon: XCircle },
        { id: 'MANIFESTED', label: 'Manifested', icon: FileText },
        { id: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', icon: Truck },
        { id: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
        { id: 'RTO', label: 'RTO', icon: RefreshCcw },
        { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
        { id: 'ALL', label: 'All Shipments', icon: Search },
    ];

    /**
     * ✨ Sync Dashboard Data
     * Fetches status counts and filtered shipments based on active tab.
     */
    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [countData, shipmentData] = await Promise.all([
                shipmentService.getCounts(),
                shipmentService.getFilteredShipments(activeTab)
            ]);
            setCounts(countData);
            setShipments(shipmentData);
        } catch (err) {
            console.error("Logistics sync failed:", err);
            toast.error("Failed to sync logistics manifest");
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

    /**
     * ✨ EDD Logic: Check for delays
     */
    const getEDDStatus = (eddDate: string) => {
        if (!eddDate) return { label: 'No EDD Set', color: 'text-gray-400' };
        const now = new Date();
        const edd = new Date(eddDate);
        if (edd < now) {
            const diffDays = Math.ceil((now.getTime() - edd.getTime()) / (1000 * 3600 * 24));
            return { label: `${diffDays} Days Over EDD`, color: 'text-red-500' };
        }
        return { label: 'On Track', color: 'text-green-500' };
    };

    const handlePrint = () => window.print();

    return (
        <div className="bg-[#F8F9FA] min-h-screen p-8 print:bg-white print:p-0">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header Controls */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 print:hidden">
                    <div>
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#2D4A73] mb-2 transition-colors">
                            <ArrowLeft size={14} /> Back to Command Center
                        </button>
                        <h1 className="text-4xl font-black text-[#2D4A73] tracking-tighter uppercase italic">
                            Shipment <span className="text-blue-600">Intelligence</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search Waybill / Order ID..."
                                className="w-full md:w-80 pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={handlePrint} className="bg-[#2D4A73] text-white p-4 rounded-2xl shadow-xl hover:bg-black transition-all">
                            <Printer size={20} />
                        </button>
                    </div>
                </header>

                {/* ✨ Advanced Multi-Tab Bar */}
                <div className="flex overflow-x-auto gap-2 mb-8 p-2 bg-white rounded-[2rem] shadow-sm border border-gray-50 no-scrollbar print:hidden">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                ? 'bg-[#2D4A73] text-white shadow-lg -translate-y-1' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            <span className={`ml-2 px-2 py-0.5 rounded-md ${
                                activeTab === tab.id ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {counts[tab.id] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ✨ Intelligence Table */}
                <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scanning Carrier Networks...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <th className="px-8 py-6">Waybill / Order ID</th>
                                        <th className="px-8 py-6">Carrier / Route</th>
                                        <th className="px-8 py-6">Weight (Dead/Vol)</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6">Current Location</th>
                                        <th className="px-8 py-6">EDD Status</th>
                                        <th className="px-8 py-6 print:hidden">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    <AnimatePresence mode='popLayout'>
                                        {shipments.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-20 text-center text-gray-300 font-bold uppercase text-xs">
                                                    No active shipments found in this category.
                                                </td>
                                            </tr>
                                        ) : (
                                            shipments.map((s) => (
                                                <motion.tr 
                                                    key={s.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="hover:bg-blue-50/30 transition-colors group"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="font-black text-[#2D4A73]">{s.waybillNumber || 'UNASSIGNED'}</div>
                                                        <div className="text-[9px] font-bold text-gray-300 uppercase">Order ID: #{s.orderId}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-xs font-black text-gray-700">{s.carrier || 'Delhivery'}</div>
                                                        <div className="text-[10px] text-gray-400 font-bold">{s.fromCity} → {s.toCity}</div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-xs font-bold text-gray-600">{s.deadWeight || '0.00'} kg <span className="text-[10px] text-gray-300">(D)</span></div>
                                                        <div className="text-[10px] text-gray-400">{s.volWeight || '0.00'} kg <span className="text-[10px] text-gray-300">(V)</span></div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                            s.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                            s.status === 'IN_TRANSIT' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                            'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                            <MapPin size={12} className="text-pink-500" />
                                                            {s.currentLocation || 'Processing Hub'}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="text-xs font-bold text-gray-700">
                                                            {s.edd ? new Date(s.edd).toLocaleDateString() : 'Pending'}
                                                        </div>
                                                        <div className={`text-[9px] font-black uppercase tracking-tighter ${getEDDStatus(s.edd).color}`}>
                                                            {getEDDStatus(s.edd).label}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 print:hidden">
                                                        <button className="p-3 bg-gray-50 rounded-xl hover:bg-[#2D4A73] hover:text-white transition-all">
                                                            <ChevronRight size={16} />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogisticsSummary;