import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Truck, CheckCircle, RefreshCcw, ExternalLink, 
    Layers, DollarSign, Activity, User, Phone, FileText 
} from 'lucide-react'; // ✨ Added FileText to imports
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/api'; 

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, pending: 0, fulfillmentRate: 0 });
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token || token === "null") {
            toast.error("Unauthorized. Please login as Admin.");
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const res = await adminService.getAllOrders();
            const orderData = res.data;
            setOrders(orderData);
            
            const revenue = orderData.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
            const pending = orderData.filter((o: any) => o.status === 'PENDING').length;
            const rate = orderData.length ? ((orderData.filter((o: any) => o.status === 'DELIVERED').length / orderData.length) * 100).toFixed(0) : 0;
            
            setStats({ totalRevenue: revenue, pending: pending, fulfillmentRate: Number(rate) });
        } catch (err: any) {
            console.error("403 Check:", err);
            toast.error(err.response?.status === 403 ? "Access Denied: Admin Rights Required" : "Failed to load Command Center");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

   const updateStatus = async (orderId: string, newStatus: string, agentName: string = "", agentPhone: string = "") => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus, agentName, agentPhone);
            toast.success(`Order #${orderId} updated to ${newStatus}`);
            fetchDashboardData(); 
        } catch (err) {
            toast.error("Update failed. Check Admin permissions.");
        }
    };

    const handleDispatch = (orderId: string) => {
        const name = prompt("Enter Delivery Agent Name:");
        const phone = prompt("Enter Agent Phone Number:");
        
        if (name && phone) {
            updateStatus(orderId, 'SHIPPED', name, phone);
        } else {
            toast.warn("Agent details are required for dispatch.");
        }
    };

    const handleDeliver = (orderId: string) => {
        if (window.confirm("Confirm successful delivery?")) {
            updateStatus(orderId, 'DELIVERED', "", "");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Activity className="animate-spin text-[#2D4A73] mx-auto mb-4" size={48} />
                <h2 className="text-xl font-black text-[#2D4A73] uppercase tracking-tighter">Decrypting Logistics...</h2>
            </div>
        </div>
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen p-4 md:p-12">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-2 w-12 bg-pink-600 rounded-full" />
                            <span className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em]">Live Intelligence</span>
                        </div>
                        <h1 className="text-6xl font-black text-[#2D4A73] tracking-tighter leading-none">Command<br/>Center</h1>
                    </div>
                    
                    <div className="flex gap-4">
                        {/* ✨ NEW: Link to Logistics Manifest */}
                        <button 
                            onClick={() => navigate('/admin/logistics-summary')} 
                            className="flex items-center gap-3 p-5 bg-[#2D4A73] text-white rounded-3xl shadow-xl shadow-blue-200 hover:bg-black transition-all border border-[#2D4A73]"
                        >
                            <FileText size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Dispatch Manifest</span>
                        </button>

                        <button onClick={fetchDashboardData} className="p-5 bg-white rounded-3xl shadow-xl shadow-gray-200/50 hover:scale-105 transition-all text-[#2D4A73] border border-white">
                            <RefreshCcw size={24} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                        { label: 'Gross Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
                        { label: 'Pending Action', value: stats.pending, icon: Layers, color: 'text-amber-600' },
                        { label: 'Fulfillment', value: `${stats.fulfillmentRate}%`, icon: CheckCircle, color: 'text-blue-600' }
                    ].map((card, i) => (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden group">
                            <card.icon className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-5 group-hover:scale-110 transition-transform ${card.color}`} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
                            <h3 className={`text-4xl font-black tracking-tighter ${card.color}`}>{card.value}</h3>
                        </motion.div>
                    ))}
                </div>

                <div className="bg-white rounded-[4rem] shadow-2xl shadow-gray-200/40 border border-white overflow-hidden">
                    <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xl font-black text-[#2D4A73]">Recent Logistics</h3>
                        <span className="px-4 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {orders.length} Total Sequences
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50">
                                    <th className="px-10 py-6">Reference</th>
                                    <th className="px-10 py-6">Customer / Agent</th>
                                    <th className="px-10 py-6">Value</th>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-8 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map((order) => (
                                    <tr key={order.orderId} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-10 py-8 font-black text-[#2D4A73] text-lg">#{order.orderId}</td>
                                        <td className="px-10 py-8">
                                            <div className="text-sm text-gray-800 font-bold">{order.email}</div>
                                            {order.deliveryAgentName && (
                                                <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-xl inline-flex">
                                                    <User size={12} className="text-blue-600" />
                                                    <span className="text-[9px] font-black text-blue-600 uppercase">{order.deliveryAgentName}</span>
                                                    <Phone size={10} className="text-gray-400 ml-1" />
                                                    <span className="text-[9px] font-bold text-gray-400">{order.deliveryAgentPhone}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-10 py-8 font-black text-[#2D4A73] text-xl">₹{order.totalAmount}</td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                                                order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex justify-end gap-3">
                                                {order.status === 'PENDING' && (
                                                    <button onClick={() => handleDispatch(order.orderId)} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                                                        <Truck size={18} />
                                                        <span className="text-[9px] font-black uppercase">Dispatch</span>
                                                    </button>
                                                )}
                                                {order.status === 'SHIPPED' && (
                                                    <button onClick={() => handleDeliver(order.orderId)} className="p-4 bg-green-600 text-white rounded-2xl hover:bg-black transition-all shadow-lg shadow-green-200 flex items-center gap-2">
                                                        <CheckCircle size={18} />
                                                        <span className="text-[9px] font-black uppercase">Deliver</span>
                                                    </button>
                                                )}
                                                <button className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-white hover:text-[#2D4A73] border border-transparent hover:border-gray-200 transition-all">
                                                    <ExternalLink size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;