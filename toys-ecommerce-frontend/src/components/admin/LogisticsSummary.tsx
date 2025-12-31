import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, User, FileText, Printer, ArrowLeft, CheckCircle2, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api'; 
import { toast } from 'react-toastify';

const LogisticsSummary: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLogisticsData = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllOrders();
            // Show only active shipments (Pending or Shipped)
            const activeLogistics = res.data.filter((o: any) => o.status !== 'DELIVERED');
            setOrders(activeLogistics);
        } catch (err) {
            toast.error("Failed to load logistics manifest");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogisticsData(); }, []);

    const handlePrint = () => {
        window.print(); // ✨ Browser native print functionality
    };

    if (loading) return <div className="p-20 text-center font-black animate-pulse">Generating Manifest...</div>;

    return (
        <div className="bg-white min-h-screen p-8 md:p-12 print:p-0">
            <div className="max-w-6xl mx-auto">
                {/* Control Header - Hidden during print */}
                <header className="flex justify-between items-center mb-12 print:hidden">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#2D4A73]">
                        <ArrowLeft size={16} /> Command Center
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-3 bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">
                        <Printer size={18} /> Print Manifest
                    </button>
                </header>

                <div className="mb-12 border-b-4 border-[#2D4A73] pb-6">
                    <h1 className="text-4xl font-black text-[#2D4A73] uppercase tracking-tighter">Daily Dispatch Manifest</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">
                        {new Date().toLocaleDateString()} | {orders.length} Active Shipments
                    </p>
                </div>

                {/* Manifest Grid */}
                <div className="grid grid-cols-1 gap-8">
                    {orders.length === 0 ? (
                        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No active shipments for today.</div>
                    ) : (
                        orders.map((order) => (
                            <motion.div 
                                key={order.orderId}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="border-2 border-gray-100 rounded-[2.5rem] p-8 md:p-10 page-break-inside-avoid shadow-sm flex flex-col gap-8"
                            >
                                <div className="flex flex-wrap justify-between items-start border-b border-gray-50 pb-6 gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-50 p-4 rounded-2xl text-[#2D4A73]">
                                            <Truck size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-[#2D4A73]">#{order.orderId}</h3>
                                            <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">{order.status}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Customer</p>
                                        <p className="font-bold text-gray-800">{order.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Route Detail */}
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <MapPin className="text-pink-600 shrink-0" size={20} />
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Shipping Address</p>
                                                <p className="text-sm font-bold text-gray-700 leading-relaxed">{order.shippingAddress || 'Address not found'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                                            <User className="text-[#2D4A73] shrink-0" size={20} />
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Assigned Agent</p>
                                                <p className="text-sm font-black text-[#2D4A73]">
                                                    {order.deliveryAgentName || 'UNASSIGNED'}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                    <Phone size={10} /> {order.deliveryAgentPhone || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logistics Notes */}
                                    <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 flex flex-col h-full">
                                        <div className="flex items-center gap-2 mb-4 text-amber-700">
                                            <FileText size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Delivery Instructions</span>
                                        </div>
                                        <p className="text-sm text-amber-900 italic font-medium leading-relaxed">
                                            {order.customerNotes ? `"${order.customerNotes}"` : "No special instructions provided by customer."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-300">
                                    <span>ToyBox Logistics v2.0</span>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={12} /> Contact support for address verification
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogisticsSummary;