import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Truck, MapPin, User, FileText, Printer, ArrowLeft, 
    CheckCircle2, Phone, Package, XCircle, Search, 
    RefreshCcw, Loader2, ExternalLink, Zap, Navigation, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; 
import { toast } from 'react-toastify';

const LogisticsSummary: React.FC = () => {
    const [activeTab, setActiveTab] = useState('ALL');
    const [shipments, setShipments] = useState<any[]>([]);
    const [counts, setCounts] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // ✨ Comprehensive Intelligence Tabs
    const tabs = [
        { id: 'ORDERS', label: 'New Orders', icon: Package },
        { id: 'MANIFESTED', label: 'Manifested', icon: FileText },
        { id: 'PICKUP', label: 'Pending Pickup', icon: Truck },
        { id: 'IN_TRANSIT', label: 'In Transit', icon: Zap },
        { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Navigation },
        { id: 'DELIVERED', label: 'Delivered', icon: Home },
        { id: 'CANCELLATIONS', label: 'Cancellations', icon: XCircle },
        { id: 'RTO', label: 'RTO / Return', icon: RefreshCcw },
        { id: 'ALL', label: 'Global View', icon: Search },
    ];

    /**
     * ✨ Sync Dashboard Data
     */
    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.orderService.getAllAdminOrders();
            
            // Calculate real-time counts for every possible lifecycle status
            const newCounts = {
                ALL: data.length,
                ORDERS: data.filter((o: any) => o.status === 'PAID').length,
                CANCELLATIONS: data.filter((o: any) => o.status === 'CANCELLED').length,
                MANIFESTED: data.filter((o: any) => o.status === 'DISPATCHED').length,
                PICKUP: data.filter((o: any) => o.status === 'PENDING').length,
                IN_TRANSIT: data.filter((o: any) => o.status === 'SHIPPED').length,
                OUT_FOR_DELIVERY: data.filter((o: any) => o.status === 'OUT_FOR_DELIVERY').length,
                DELIVERED: data.filter((o: any) => o.status === 'DELIVERED').length,
                RTO: data.filter((o: any) => o.status.includes('RETURN') || o.status.includes('RTO')).length,
            };
            setCounts(newCounts);

            // Filter logic based on active tab
            let filtered = data;
            if (activeTab !== 'ALL') {
                const statusMap: Record<string, string> = {
                    ORDERS: 'PAID',
                    MANIFESTED: 'DISPATCHED',
                    PICKUP: 'PENDING',
                    IN_TRANSIT: 'SHIPPED',
                    OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
                    DELIVERED: 'DELIVERED',
                    CANCELLATIONS: 'CANCELLED'
                };

                if (activeTab === 'RTO') {
                    filtered = data.filter((o: any) => o.status.includes('RETURN') || o.status.includes('RTO'));
                } else if (statusMap[activeTab]) {
                    filtered = data.filter((o: any) => o.status === statusMap[activeTab]);
                }
            }

            setShipments(filtered);
        } catch (err) {
            console.error("Logistics sync failed:", err);
            toast.error("Failed to sync logistics manifest");
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

    const getEDDStatus = (status: string, eddDate?: string) => {
        if (status === 'DELIVERED') return { label: 'Completed', color: 'text-green-500' };
        if (!eddDate) return { label: 'EDD Pending', color: 'text-amber-500' };
        
        const now = new Date();
        const edd = new Date(eddDate);
        if (edd < now) return { label: `Delayed`, color: 'text-red-500' };
        return { label: 'On Track', color: 'text-blue-500' };
    };

    const handlePrint = () => window.print();

    const displayedShipments = shipments.filter(s => 
        s.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen p-8 print:bg-white print:p-0 text-left">
            <div className="max-w-[1600px] mx-auto">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 print:hidden">
                    <div>
                        <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#2D4A73] mb-2 transition-colors">
                            <ArrowLeft size={14} /> Back to Command Center
                        </button>
                        <h1 className="text-4xl font-black text-[#2D4A73] tracking-tighter uppercase italic">
                            Logistics <span className="text-blue-600">Intelligence</span>
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-grow md:flex-grow-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input 
                                type="text" 
                                placeholder="Tracking / Email / Order ID..."
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

                {/* ✨ Scrolling Tab Bar for 9 Statuses */}
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

                {/* Data Table */}
                <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decoding Carrier Manifests...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <th className="px-8 py-6">Waybill / Order</th>
                                        <th className="px-8 py-6">Customer / Email</th>
                                        <th className="px-8 py-6">Logistics Status</th>
                                        <th className="px-8 py-6">Current Location</th>
                                        <th className="px-8 py-6">Timeline</th>
                                        <th className="px-8 py-6 print:hidden text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {displayedShipments.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-20 text-center text-gray-300 font-bold uppercase text-xs font-black">
                                                No shipments found in {activeTab}
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedShipments.map((s) => (
                                            <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="font-black text-[#2D4A73] font-mono">{s.trackingId || 'AWB PENDING'}</div>
                                                    <div className="text-[9px] font-bold text-gray-300 uppercase italic">Order ID: #{s.orderId}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-black text-gray-700">{s.userEmail}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold truncate max-w-[200px]">{s.shippingAddress}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                        s.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                        s.status === 'OUT_FOR_DELIVERY' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                        s.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-amber-50 text-amber-600 border-amber-100'
                                                    }`}>
                                                        {s.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                        <MapPin size={12} className="text-pink-500" />
                                                        {s.status === 'DELIVERED' ? 'Customer Doorstep' : s.status === 'OUT_FOR_DELIVERY' ? 'Local Delivery Van' : 'Logistics Hub'}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="text-xs font-bold text-gray-700">
                                                        {new Date(s.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-tighter ${getEDDStatus(s.status, s.estimatedDelivery).color}`}>
                                                        {getEDDStatus(s.status, s.estimatedDelivery).label}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 print:hidden text-right">
                                                    {s.trackingId ? (
                                                        <a 
                                                            href={`https://shiprocket.co/tracking/${s.trackingId}`}
                                                            target="_blank" rel="noreferrer"
                                                            className="inline-flex p-3 bg-gray-50 text-gray-400 hover:bg-[#2D4A73] hover:text-white rounded-xl transition-all"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </a>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-gray-200">NO TRACKING</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
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