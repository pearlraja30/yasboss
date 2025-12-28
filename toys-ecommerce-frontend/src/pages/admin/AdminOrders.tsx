import React, { useEffect, useState } from 'react';
import api from '../../services/api'; 
import { toast } from 'react-toastify';
import { FileText, Loader2, Search, Truck, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Requirement #7: Define statuses that match the frontend Tracking Progress Bar
    const statusOptions = [
        { value: 'PENDING', label: 'Pending', color: 'bg-orange-50 text-orange-600 ring-orange-100' },
        { value: 'PROCESSING', label: 'Processing', color: 'bg-blue-50 text-blue-600 ring-blue-100' },
        { value: 'SHIPPED', label: 'Shipped', color: 'bg-indigo-50 text-indigo-600 ring-indigo-100' },
        { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-purple-50 text-purple-600 ring-purple-100' },
        { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-50 text-green-600 ring-green-100' },
        { value: 'CANCELED', label: 'Canceled', color: 'bg-red-50 text-red-600 ring-red-100' }
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

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        try {
            // Requirement #7 & #4: Updates DB and triggers point credit if 'DELIVERED'
            await api.orderService.updateStatus(orderId, newStatus);
            
            toast.success(`Status updated: ${newStatus.replace(/_/g, ' ')}`);
            
            if (newStatus === 'DELIVERED') {
                toast.success("Rewards credited to customer account! ✨");
            } else if (newStatus === 'OUT_FOR_DELIVERY') {
                toast.info("Customer tracking bar updated to 'Out for Delivery' 🚚");
            }
            
            fetchOrders(); 
        } catch (err) {
            toast.error("Failed to update status.");
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

    // Filter by Order ID, Email, or Phone
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
        <div className="p-8 bg-[#F8F9FA] min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-[#2D4A73] tracking-tighter">Admin Dispatch Hub</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">
                            Requirement #7: Store Operations & Delivery tracking
                        </p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Order ID, Email, or Phone..."
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none font-bold text-sm shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                                    <th className="p-6">Reference</th>
                                    <th className="p-6">Customer Details</th>
                                    <th className="p-6 text-center">Amount</th>
                                    <th className="p-6">Update Status</th>
                                    <th className="p-6 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map(order => {
                                    const currentStatus = statusOptions.find(s => s.value === order.status) || statusOptions[0];
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                        <Truck size={16} />
                                                    </div>
                                                    <span className="font-mono font-bold text-[#2D4A73]">
                                                        {order.orderId || `#YB-${order.id}`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-gray-700">{order.userEmail}</span>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <Phone size={12} />
                                                        <span className="text-xs font-bold">{order.phone || 'No phone linked'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center font-black text-gray-700">
                                                ₹{order.totalAmount?.toFixed(2)}
                                            </td>
                                            <td className="p-6">
                                                <select 
                                                    className={`border-none p-3 rounded-xl font-black text-[10px] uppercase cursor-pointer outline-none ring-1 transition-all ${currentStatus.color}`}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                >
                                                    {statusOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button 
                                                    onClick={() => handleDownloadInvoice(order.id, order.orderId)}
                                                    className="p-3 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                                                >
                                                    <FileText size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {filteredOrders.length === 0 && (
                            <div className="p-20 text-center">
                                <p className="text-gray-400 font-bold">No orders match your current filter.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminOrders;