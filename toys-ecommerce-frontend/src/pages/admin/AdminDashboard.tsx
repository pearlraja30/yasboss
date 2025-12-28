import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, RefreshCcw, ExternalLink, AlertTriangle, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import InventoryAlerts from '../../components/admin/InventoryAlerts';
import QuizManager from './QuizManager';

// --- NEW: Stock Alerts Sub-Component ---
const StockAlerts = () => {
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                // threshold=5 identifies products with 5 or fewer items left
                const res = await axios.get('http://localhost:8080/api/products/low-stock?threshold=5');
                setLowStockItems(res.data);
            } catch (err) {
                console.error("Could not fetch stock alerts");
            } finally {
                setLoading(false);
            }
        };
        fetchLowStock();
    }, []);

    if (loading || lowStockItems.length === 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex flex-wrap items-center justify-between gap-6 shadow-sm"
        >
            <div className="flex items-center gap-6">
                <div className="bg-amber-500 p-4 rounded-2xl text-white shadow-lg shadow-amber-200 animate-pulse">
                    <AlertTriangle size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-amber-900 tracking-tight">Inventory Alert</h3>
                    <p className="text-amber-700 font-medium text-sm">
                        {lowStockItems.length} products are running critically low on stock.
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 bg-white/50 p-2 rounded-3xl pr-6 border border-white">
                    <div className="flex -space-x-3 overflow-hidden p-1">
                        {lowStockItems.slice(0, 4).map((item, i) => (
                            <img 
                                key={i} 
                                src={item.imageUrl} 
                                className="inline-block h-12 w-12 rounded-full ring-4 ring-amber-50 object-cover bg-white border border-gray-100" 
                                title={`${item.name}: Only ${item.stock} left!`}
                            />
                        ))}
                        {lowStockItems.length > 4 && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-200 text-xs font-black text-amber-700 ring-4 ring-amber-50">
                                +{lowStockItems.length - 4}
                            </div>
                        )}
                    </div>
                    <div className="text-[10px] font-black text-amber-800 uppercase tracking-widest ml-2">
                        Restock Needed
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/admin/inventory')}
                    className="p-4 bg-amber-900 text-white rounded-2xl hover:bg-black transition-all flex items-center gap-2 group"
                >
                    <span className="text-xs font-black uppercase">Manage</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <QuizManager />
                <InventoryAlerts /> {/* Displays the new component here */}
            </div>
        </motion.div>
    );
};

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:8080/api/orders/all');
            setOrders(res.data);
        } catch (err) {
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllOrders(); }, []);

    const updateStatus = async (orderId: string, newStatus: string) => {
        try {
            await axios.put(`http://localhost:8080/api/orders/${orderId}/status?status=${newStatus}`);
            toast.success(`Order #${orderId} marked as ${newStatus}`);
            fetchAllOrders(); 
        } catch (err) {
            toast.error("Status update failed");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-[#2D4A73] animate-pulse">Syncing Admin Command Center...</div>;

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black text-[#2D4A73] tracking-tighter">Command Center</h1>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Order Management & Logistics</p>
                    </div>
                    <button 
                        onClick={fetchAllOrders} 
                        className="p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all text-[#2D4A73] border border-gray-100"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </header>

                {/* --- Stock Alerts Widget --- */}
                <StockAlerts />

                <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                <th className="px-10 py-8">Order ID</th>
                                <th className="px-10 py-8">Customer Detail</th>
                                <th className="px-10 py-8">Total Amount</th>
                                <th className="px-10 py-8">Fulfillment</th>
                                <th className="px-10 py-8 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.map((order) => (
                                <tr key={order.orderId} className="hover:bg-gray-50/40 transition-colors group">
                                    <td className="px-10 py-8 font-black text-[#2D4A73] text-lg tracking-tighter">#{order.orderId}</td>
                                    <td className="px-10 py-8">
                                        <div className="text-sm text-gray-800 font-bold">{order.userEmail}</div>
                                        <div className="text-[10px] text-gray-400 uppercase font-bold">{new Date().toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-10 py-8 font-black text-[#2D4A73] text-xl">₹{order.totalAmount}</td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex justify-end gap-3">
                                            {order.status === 'PENDING' && (
                                                <button onClick={() => updateStatus(order.orderId, 'SHIPPED')} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="Dispatch Order">
                                                    <Truck size={20} />
                                                </button>
                                            )}
                                            {order.status === 'SHIPPED' && (
                                                <button onClick={() => updateStatus(order.orderId, 'DELIVERED')} className="p-3 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Confirm Delivery">
                                                    <CheckCircle size={20} />
                                                </button>
                                            )}
                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-200 transition-all">
                                                <ExternalLink size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && (
                        <div className="py-20 text-center">
                            <Package className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-bold">No active orders found in database.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;