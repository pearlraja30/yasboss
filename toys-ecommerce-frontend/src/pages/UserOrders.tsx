import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Truck, CheckCircle2, ChevronRight, 
    Loader2, ShoppingBag, Calendar, MapPin, FileText 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const userEmail = localStorage.getItem('userEmail');
            if (userEmail) {
                const data = await api.orderService.getUserOrders(userEmail);
                setOrders(data);
            }
        } catch (err) {
            toast.error("Failed to load your orders");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async (id: number, orderIdStr: string) => {
        try {
            setDownloadingId(id);
            const blob = await api.orderService.downloadInvoice(id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Receipt_${orderIdStr || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            toast.success("Receipt downloaded! 📄");
        } catch (err) {
            toast.error("Could not download receipt");
        } finally {
            setDownloadingId(null);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#2D4A73]" size={32} />
        </div>
    );

    return (
        <div className="space-y-6 text-left">
            <h2 className="text-3xl font-black text-[#2D4A73] px-4">My Orders</h2>
            
            {orders.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] text-center border border-gray-100">
                    <ShoppingBag size={48} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No orders found yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50 hover:shadow-md transition-all"
                        >
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-300 font-mono">#{order.orderId}</span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-500 mb-4">
                                        <div className="flex items-center gap-1"><Calendar size={14}/> {new Date(order.createdAt).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-1"><MapPin size={14}/> {order.shippingAddress}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[180px]">
                                    {['DISPATCHED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status) && (
                                        <button 
                                            onClick={() => navigate(`/track/${order.orderId}`)}
                                            className="w-full bg-[#2D4A73] text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                                        >
                                            <Truck size={14} /> Track Order
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={() => handleDownloadInvoice(order.id, order.orderId)}
                                        disabled={downloadingId === order.id}
                                        className="w-full bg-gray-50 text-gray-500 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-50 hover:text-pink-600 transition-all"
                                    >
                                        {downloadingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                                        Receipt
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserOrders;