import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
    Truck, Package, Search, ExternalLink, Calendar, 
    MapPin, Loader2, XCircle, FileText, Box 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShipmentAll: React.FC = () => {
    const [allOrders, setAllOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogisticsData();
    }, []);

    const fetchLogisticsData = async () => {
        try {
            setLoading(true);
            // Fetch all admin orders to categorize them properly across tabs
            const data = await api.orderService.getAllAdminOrders();
            setAllOrders(data);
        } catch (err) {
            console.error("Logistics fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    // ✨ Logic to categorize data based on your Dashboard Summary Tabs
    const getFilteredData = () => {
        const matchesSearch = allOrders.filter(s => 
            s.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        switch(activeTab) {
            case 'CANCELLATIONS': 
                return matchesSearch.filter(o => o.status === 'CANCELLED');
            case 'MANIFESTED': 
                return matchesSearch.filter(o => ['SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(o.status));
            case 'PICKUP': 
                return matchesSearch.filter(o => o.status === 'PENDING' || o.status === 'PAID');
            default: 
                return matchesSearch;
        }
    };

    const filtered = getFilteredData();

    // Utility to get counts for tab badges
    const getCount = (tab: string) => {
        if (tab === 'ALL') return allOrders.length;
        if (tab === 'CANCELLATIONS') return allOrders.filter(o => o.status === 'CANCELLED').length;
        if (tab === 'MANIFESTED') return allOrders.filter(o => ['SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(o.status)).length;
        if (tab === 'PICKUP') return allOrders.filter(o => o.status === 'PENDING' || o.status === 'PAID').length;
        return 0;
    };

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                activeTab === id 
                ? 'bg-[#2D4A73] text-white shadow-xl scale-105' 
                : 'bg-white text-gray-400 hover:bg-gray-50 border border-gray-100'
            }`}
        >
            <Icon size={14} /> 
            {label}
            <span className={`ml-2 px-2 py-0.5 rounded-md text-[9px] ${activeTab === id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {getCount(id)}
            </span>
        </button>
    );

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#2D4A73] mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Logistics...</p>
        </div>
    );

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen text-left">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-[#2D4A73] uppercase italic">Shipment Command Center</h1>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                            Requirement #7: Store Operations & Delivery tracking
                        </p>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Waybill, Email or Order ID..." 
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                {/* Logistics Tabs */}
                <div className="flex flex-wrap gap-4 mb-10">
                    <TabButton id="ALL" label="All Shipments" icon={Box} />
                    <TabButton id="MANIFESTED" label="Manifested" icon={FileText} />
                    <TabButton id="PICKUP" label="Pending Pickup" icon={Truck} />
                    <TabButton id="CANCELLATIONS" label="Cancellations" icon={XCircle} />
                </div>

                {/* Shipment Cards */}
                <div className="grid grid-cols-1 gap-6">
                    {filtered.length > 0 ? (
                        filtered.map((shipment) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={shipment.orderId} 
                                className={`bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-8 hover:shadow-md transition-all ${shipment.status === 'CANCELLED' ? 'opacity-60 grayscale' : ''}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`p-5 rounded-[2rem] ${
                                        shipment.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 
                                        shipment.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        <Truck size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-black text-[#2D4A73] text-lg">#{shipment.orderId}</h3>
                                            <span className="text-[9px] font-black bg-gray-50 text-gray-400 px-2 py-0.5 rounded uppercase">
                                                {shipment.paymentMethod || 'Prepaid'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mt-1">
                                            <Calendar size={12} /> {new Date(shipment.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-[250px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Destination & Customer</p>
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-[#2D4A73]">{shipment.userEmail}</p>
                                        <div className="flex items-start gap-2 text-xs font-bold text-gray-500">
                                            <MapPin size={14} className="text-pink-500 shrink-0 mt-0.5" />
                                            <span className="leading-tight">{shipment.shippingAddress}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="min-w-[150px]">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">ShipRocket AWB</p>
                                    {shipment.trackingId ? (
                                        <a 
                                            href={`https://shiprocket.co/tracking/${shipment.trackingId}`}
                                            target="_blank" rel="noreferrer"
                                            className="flex items-center gap-2 text-blue-600 font-black text-xs hover:underline group"
                                        >
                                            {shipment.trackingId} <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-2 text-gray-300 italic text-xs font-bold">
                                            <Loader2 size={12} className="animate-spin" /> Awaiting Waybill
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Status</p>
                                    <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        shipment.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 
                                        shipment.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {shipment.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="py-32 text-center bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100">
                            <Box size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">No logistics records found for "{activeTab}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipmentAll;