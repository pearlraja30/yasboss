import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Truck, CheckCircle, Clock, ChevronRight, 
    ShoppingBag, Phone, MapPin, User, Info, Calendar, 
    Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../services/api'; // ✨ Hardened API service

interface TrackingEvent {
    status: string;
    time: string;
}

interface Order {
    orderId: string;
    createdAt: string; // From backend
    totalAmount: number;
    status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'PAID';
    items: any[];
    deliveryAgentName?: string;
    deliveryAgentPhone?: string;
    customerNotes?: string;
    estimatedDelivery?: string;
    shippingAddress?: string;
}

/**
 * ✨ OrderTracker Component
 * Provides visual feedback on the logistical status of the toy delivery.
 */
const OrderTracker: React.FC<{ order: Order }> = ({ order }) => {
    const steps = ['PAID', 'PENDING', 'SHIPPED', 'DELIVERED'];
    const currentStepIndex = steps.indexOf(order.status);

    return (
        <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            className="mt-6 border-t border-gray-100 pt-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Logistics Timeline */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Logistics Timeline</h4>
                    <div className="relative pl-8 space-y-8">
                        {/* Vertical Progress Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />
                        
                        {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;

                            return (
                                <div key={step} className="relative flex items-center gap-4">
                                    <div className={`absolute -left-[30px] w-6 h-6 rounded-full border-4 border-white z-10 transition-colors ${
                                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`} />
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-tighter ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                            {step.replace('_', ' ')}
                                        </p>
                                        {isCurrent && <p className="text-[10px] text-green-600 font-bold">In Progress</p>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Agent & Delivery Detail */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery Details</h4>
                    
                    {order.deliveryAgentName ? (
                        <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-600">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase">Assigned Agent</p>
                                <p className="text-sm font-black text-[#2D4A73]">{order.deliveryAgentName}</p>
                                <div className="flex items-center gap-1 text-xs font-bold text-gray-500 mt-1">
                                    <Phone size={12} /> {order.deliveryAgentPhone}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                            <p className="text-xs font-bold text-gray-400">Agent assignment in progress...</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-500 text-sm">
                            <Calendar size={16} className="text-pink-600" />
                            <span className="font-bold">Est: {order.estimatedDelivery || 'TBD'}</span>
                        </div>
                        <div className="flex items-start gap-3 text-gray-500 text-sm">
                            <MapPin size={16} className="text-pink-600 mt-1" />
                            <span className="font-medium line-clamp-2">{order.shippingAddress}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Notes Section */}
            {order.customerNotes && (
                <div className="mt-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <Info size={14} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase">Your Instructions</span>
                    </div>
                    <p className="text-sm text-gray-600 italic font-medium">"{order.customerNotes}"</p>
                </div>
            )}
        </motion.div>
    );
};

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('jwtToken'); // ✨ Token check
            const userEmail = localStorage.getItem('userEmail');

            if (!token || !userEmail) {
                toast.error("Please log in to view orders");
                navigate('/login');
                return;
            }

            try {
                // Fetching via authenticated apiClient
                const res = await apiClient.get(`/orders/user/${userEmail}`);
                setOrders(res.data);
            } catch (error) {
                console.error("Order Fetch Error:", error);
                toast.error("Failed to load toy history");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Activity className="animate-spin text-[#2D4A73]" size={40} />
        </div>
    );

    if (orders.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-blue-50 p-12 rounded-[4rem] mb-8">
                    <ShoppingBag size={80} className="text-[#2D4A73]" />
                </motion.div>
                <h2 className="text-5xl font-black text-[#2D4A73] tracking-tighter">No toys here yet!</h2>
                <Link to="/" className="mt-10 bg-[#2D4A73] text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-2xl">
                    Fill the Toy Box
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-24">
            <header className="mb-16">
                <h1 className="text-6xl font-black text-[#2D4A73] tracking-tighter leading-none mb-4">My Magical<br/>Orders</h1>
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Tracking {orders.length} toy sequences</p>
            </header>
            
            <div className="grid grid-cols-1 gap-10">
                {orders.map((order) => (
                    <motion.div 
                        key={order.orderId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all p-8 md:p-12 relative overflow-hidden"
                    >
                        {/* Status Watermark */}
                        <div className="absolute top-[-20px] right-[-20px] text-[120px] font-black opacity-[0.03] select-none uppercase pointer-events-none">
                            {order.status}
                        </div>

                        {/* Order Header */}
                        <div className="flex flex-wrap justify-between items-start gap-8 mb-10 border-b border-gray-50 pb-8">
                            <div className="flex items-center gap-6">
                                <div className="bg-gray-50 p-5 rounded-3xl text-[#2D4A73]">
                                    <Package size={32} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sequence Ref</p>
                                    <p className="text-2xl font-black text-[#2D4A73] tracking-tighter">#{order.orderId}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-8 items-center">
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Value</p>
                                    <p className="text-2xl font-black text-pink-600">₹{order.totalAmount}</p>
                                </div>
                                <div className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' : 
                                    order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    {order.status}
                                </div>
                            </div>
                        </div>

                        {/* Summary Items (Collapsed) */}
                        <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex-shrink-0 w-20 h-20 bg-gray-50 rounded-2xl p-2 border border-gray-100">
                                    <img src={item.imageUrl} className="w-full h-full object-contain" alt={item.productName} title={item.productName} />
                                </div>
                            ))}
                        </div>

                        {/* Footer / Expand Button */}
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-gray-400">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                            <button 
                                onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                                className="flex items-center gap-3 bg-[#2D4A73] text-white px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                            >
                                {expandedOrder === order.orderId ? 'Hide Logs' : 'Track Logistics'}
                                <ChevronRight className={`transition-transform ${expandedOrder === order.orderId ? 'rotate-90' : ''}`} size={16} />
                            </button>
                        </div>

                        {/* OrderTracker Integration */}
                        <AnimatePresence>
                            {expandedOrder === order.orderId && (
                                <OrderTracker order={order} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;