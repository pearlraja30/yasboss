import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Truck, Package, Search, ExternalLink, Calendar, MapPin, Loader2, XCircle, FileText, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShipmentHub: React.FC = () => {
    const [allData, setAllData] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('ORDERS');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogisticsData();
    }, []);

    const fetchLogisticsData = async () => {
        try {
            setLoading(true);
            // Fetching all orders to categorize them into shipment tabs
            const data = await api.orderService.getAllAdminOrders();
            setAllData(data);
        } catch (err) {
            console.error("Failed to load shipments");
        } finally {
            setLoading(false);
        }
    };

    // Categorization logic for the tabs shown in your screenshot
    const getFilteredData = () => {
        switch(activeTab) {
            case 'CANCELLATIONS': return allData.filter(o => o.status === 'CANCELLED');
            case 'MANIFESTED': return allData.filter(o => o.status === 'SHIPPED' || o.status === 'DISPATCHED');
            case 'PICKUP': return allData.filter(o => o.status === 'PENDING');
            default: return allData.filter(o => ['PENDING', 'SHIPPED', 'DISPATCHED', 'DELIVERED'].includes(o.status));
        }
    };

    const filtered = getFilteredData().filter(s => 
        s.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                activeTab === id ? 'bg-[#2D4A73] text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-50'
            }`}
        >
            <Icon size={14} /> {label}
            <span className="ml-2 bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[9px]">
                {allData.filter(o => id === 'ORDERS' ? true : o.status.includes(id)).length}
            </span>
        </button>
    );

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#2D4A73]" size={40} /></div>;

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen text-left">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black text-[#2D4A73] uppercase italic">Logistics Hub</h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Real-time carrier & manifest synchronization</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Waybill or Order..." 
                        className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none shadow-sm font-bold text-sm outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Navigation Tabs (Missing in your screenshot) */}
            <div className="flex flex-wrap gap-4 mb-10">
                <TabButton id="ORDERS" label="All Orders" icon={Box} />
                <TabButton id="CANCELLATIONS" label="Cancellations" icon={XCircle} />
                <TabButton id="MANIFESTED" label="Manifested" icon={FileText} />
                <TabButton id="PICKUP" label="Pickup" icon={Truck} />
            </div>

            {/* Shipment Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-400 text-[9px] font-black uppercase tracking-widest border-b border-gray-100">
                            <th className="p-6">Waybill / Order</th>
                            <th className="p-6">Carrier / Route</th>
                            <th className="p-6">Weight / Amount</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length > 0 ? filtered.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-6">
                                    <p className="font-black text-[#2D4A73]">#{item.orderId}</p>
                                    <p className="text-[10px] font-bold text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <Truck size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-600">ShipRocket Standard</p>
                                            <p className="text-[9px] font-black text-gray-300 uppercase">Primary Route</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <p className="text-xs font-black text-gray-600">0.5 kg</p>
                                    <p className="text-[10px] font-bold text-pink-500">₹{item.totalAmount}</p>
                                </td>
                                <td className="p-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                                        item.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-6 text-right">
                                    {item.trackingId ? (
                                        <a href={`https://shiprocket.co/tracking/${item.trackingId}`} target="_blank" className="inline-flex p-3 bg-gray-50 text-gray-400 hover:text-[#2D4A73] rounded-xl transition-all">
                                            <ExternalLink size={16} />
                                        </a>
                                    ) : (
                                        <span className="text-[9px] font-black text-gray-300 uppercase">No Waybill</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <Package size={48} className="text-gray-200" />
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No matching shipments found in this tab</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShipmentHub;