import React, { useEffect, useState } from 'react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import { 
    FileText, Loader2, Search, Truck, Phone, ShieldAlert, 
    RefreshCw, RotateCcw, ExternalLink, PackageCheck, Zap,
    Navigation, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // ✨ Updated status options to include the full logistics lifecycle
    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: 'bg-orange-50 text-orange-600 ring-orange-100' },
        { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-50 text-blue-600 ring-blue-100' },
        { value: 'DISPATCHED', label: 'Ready to Ship', color: 'bg-cyan-50 text-cyan-600 ring-cyan-100' },
        { value: 'SHIPPED', label: 'Shipped (In Transit)', color: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
        { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-purple-50 text-purple-600 ring-purple-100' },
        { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-50 text-green-600 ring-green-100' },
        { value: 'CANCELLED', label: 'Canceled', color: 'bg-red-50 text-red-600 ring-red-100' }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await api.orderService.getAllAdminOrders();
            setOrders(data);
        } catch (err) {
            toast.error("Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * ✨ Updated handleStatusChange
     * This handles standard status updates and specifically maps 
     * the new logistics transitions for Out for Delivery and Delivered.
     */
    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            // Check if we need to call a specific endpoint for delivery/out-for-delivery
            // or use the general updateStatus endpoint
            await api.orderService.updateStatus(orderId, newStatus);
            
            toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}! ✨`);
            
            // Contextual feedback
            if (newStatus === 'DISPATCHED') toast.info("AWB & Label Ready 🏷️");
            if (newStatus === 'OUT_FOR_DELIVERY') toast.info("Delivery notification sent! 🚚");
            if (newStatus === 'DELIVERED') toast.success("Order Complete. Return window starts today.");

            fetchOrders(); // Refresh the list to reflect data changes
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to update status.";
            toast.error(errorMsg);
        }
    };

    const handleAdminForceSupport = async (orderId: string, type: 'RETURN' | 'REPLACEMENT') => {
        if (!window.confirm(`Force raise a ${type} for this order?`)) return;
        try {
            await api.orderService.requestSupport(orderId, type as any);
            toast.success(`Admin Override: ${type} Request Created`);
            fetchOrders();
        } catch (err) {
            toast.error("Failed to execute override.");
        }
    };

    const handleDownloadInvoice = async (id: number, orderIdStr: string) => {
        try {
            toast.info("Generating GST Invoice...");
            const blob = await api.orderService.downloadInvoice(id);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${orderIdStr || id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err) {
            toast.error("Could not download invoice.");
        }
    };

    const filteredOrders = orders.filter(order => 
        (order.orderId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.phone?.includes(searchTerm))
    );

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-[#2D4A73]" size={40} />
        </div>
    );

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen text-left">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-[#2D4A73] tracking-tighter italic uppercase">Order Dispatch Hub</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
                            <ShieldAlert size={12} className="text-pink-500" /> Administrative Console: Full Logistics Control
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Order ID, Email, or Phone..."
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none font-bold text-sm shadow-sm outline-none focus:ring-2 focus:ring-blue-100"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                    <th className="p-6">Order Identity</th>
                                    <th className="p-6">Customer & Policy</th>
                                    <th className="p-6">Logistics Flow</th>
                                    <th className="p-6 text-right">Admin Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map(order => {
                                    const currentStatus = statusOptions.find(s => s.value === order.status) || statusOptions[0];
                                    const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                                    const isPolicyExpired = diffDays > 7;

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-[#2D4A73] font-mono">{order.orderId || `#YB-${order.id}`}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-gray-700 text-sm">{order.userEmail}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${
                                                            isPolicyExpired ? 'text-red-500 border-red-100 bg-red-50' : 'text-green-600 border-green-100 bg-green-50'
                                                        }`}>
                                                            {diffDays} Days {isPolicyExpired ? '• Expired' : '• In Window'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-3">
                                                    <select 
                                                        className={`border-none p-3 rounded-xl font-black text-[10px] uppercase cursor-pointer outline-none ring-1 transition-all ${currentStatus.color}`}
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    >
                                                        {statusOptions.map(option => (
                                                            <option key={option.value} value={option.value}>{option.label}</option>
                                                        ))}
                                                    </select>
                                                    
                                                    {order.trackingId && (
                                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                                            <PackageCheck size={14} /> 
                                                            <span className="font-mono">{order.trackingId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleAdminForceSupport(order.orderId, 'RETURN')} className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                                                        <RotateCcw size={18} />
                                                    </button>
                                                    <button onClick={() => handleAdminForceSupport(order.orderId, 'REPLACEMENT')} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                        <RefreshCw size={18} />
                                                    </button>
                                                    <div className="w-px h-8 bg-gray-100 mx-2" />
                                                    <button onClick={() => handleDownloadInvoice(order.id, order.orderId)} className="p-3 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all">
                                                        <FileText size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminOrders;