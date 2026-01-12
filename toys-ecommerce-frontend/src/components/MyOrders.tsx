import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Truck, CheckCircle, Clock, ChevronRight, 
    ShoppingBag, Phone, MapPin, User, Info, Calendar, 
    Activity, Gift, RotateCcw, RefreshCw, CreditCard, XCircle, ExternalLink, Zap
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../services/api'; 

interface Order {
    orderId: string;
    createdAt: string; 
    totalAmount: number;
    status: 'PAID' | 'PENDING' | 'DISPATCHED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'REPLACEMENT_REQUESTED' | 'RETURNED';
    refundStatus?: 'NONE' | 'PENDING' | 'COMPLETED';
    isGift?: boolean;
    items: any[];
    deliveryAgentName?: string;
    deliveryAgentPhone?: string;
    customerNotes?: string;
    estimatedDelivery?: string;
    shippingAddress?: string;
    billingAddress?: string;
    trackingId?: string; 
}

const OrderTracker: React.FC<{ order: Order; onSupportReq: any; onCancel: any }> = ({ order, onSupportReq, onCancel }) => {
    const steps = ['PAID', 'PENDING', 'SHIPPED', 'DELIVERED'];
    const currentStepIndex = steps.indexOf(order.status === 'DISPATCHED' ? 'SHIPPED' : order.status);

    // ✨ Logic: Calculate if 7 days have passed
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';
    const canRaiseRequest = diffDays <= 7 || isAdmin;

    return (
        <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            className="mt-6 border-t border-gray-100 pt-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Logistics Timeline</h4>
                        {/* ✨ LIVE BADGE FOR SHIPROCKET */}
                        {(order.status === 'SHIPPED' || order.status === 'DISPATCHED') && (
                            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span className="text-[9px] font-black text-blue-600 uppercase">Live Tracking</span>
                            </div>
                        )}
                    </div>
                    
                    {order.status === 'CANCELLED' ? (
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
                            <XCircle className="text-red-500" />
                            <p className="text-xs font-black text-red-600 uppercase">This order was cancelled</p>
                        </div>
                    ) : (
                        <div className="relative pl-8 space-y-8">
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100" />
                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                return (
                                    <div key={step} className="relative flex items-center gap-4">
                                        <div className={`absolute -left-[30px] w-6 h-6 rounded-full border-4 border-white z-10 transition-colors ${
                                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                                        } ${isCurrent ? 'ring-4 ring-green-100' : ''}`} />
                                        <p className={`text-xs font-black uppercase tracking-tighter ${isCompleted ? 'text-gray-900' : 'text-gray-300'}`}>
                                            {step.replace('_', ' ')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                        {(order.status === 'PAID' || order.status === 'PENDING') && (
                            <button onClick={() => onCancel(order.orderId)} className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">
                                <XCircle size={14} /> Cancel Order
                            </button>
                        )}

                        {(order.status === 'SHIPPED' || order.status === 'DISPATCHED') && order.trackingId && (
                            <a href={`https://shiprocket.co/tracking/${order.trackingId}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#2D4A73] text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                                <ExternalLink size={14} /> Track via ShipRocket
                            </a>
                        )}

                        {order.status === 'DELIVERED' && (
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <button 
                                        disabled={!canRaiseRequest}
                                        onClick={() => onSupportReq(order.orderId, 'RETURN')} 
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${canRaiseRequest ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                    >
                                        <RotateCcw size={14} /> Return
                                    </button>
                                    <button 
                                        disabled={!canRaiseRequest}
                                        onClick={() => onSupportReq(order.orderId, 'REPLACEMENT')} 
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${canRaiseRequest ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                                    >
                                        <RefreshCw size={14} /> Replace
                                    </button>
                                </div>
                                {!canRaiseRequest && (
                                    <p className="text-[9px] text-center font-bold text-red-400 uppercase">Support window closed (Max 7 days from delivery)</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6 text-left">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address Details</h4>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Truck size={16} className="text-[#2D4A73] mt-1" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase">Shipping To</p>
                                <p className="text-sm font-bold text-gray-600 leading-tight">{order.shippingAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const navigate = useNavigate();

    const { handleRaiseReturn } = useOutletContext<{ handleRaiseReturn: any }>();

    const fetchOrders = async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;
        try {
            const res = await api.orderService.getUserOrders(userEmail);
            setOrders(res); 
        } catch (error) {
            toast.error("Failed to load toy history");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        if (!window.confirm("Do you want to cancel this order? Reward points used will be refunded.")) return;
        try {
            await api.orderService.requestSupport(orderId, 'CANCEL' as any);
            toast.success("Order cancelled successfully");
            fetchOrders();
        } catch (error) {
            toast.error("Cancellation failed.");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="h-96 flex items-center justify-center">
            <Activity className="animate-spin text-[#2D4A73]" size={40} />
        </div>
    );

    return (
        <div className="space-y-10 text-left">
            <header>
                <h1 className="text-4xl font-black text-[#2D4A73] tracking-tighter mb-2">My Toy Log</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Managing {orders.length} Deliveries</p>
            </header>
            
            <div className="grid grid-cols-1 gap-8">
                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No orders found yet</p>
                        <Link to="/products" className="text-[#2D4A73] font-black text-sm underline mt-4 block">Start Shopping</Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <motion.div key={order.orderId} className={`bg-white rounded-[3rem] border border-gray-100 shadow-sm p-8 relative overflow-hidden ${order.status === 'CANCELLED' ? 'opacity-60' : ''}`}>
                            <div className="flex flex-wrap justify-between items-start gap-6 mb-8 border-b border-gray-50 pb-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-4 rounded-2xl text-[#2D4A73]">
                                        <Package size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {order.orderId}</p>
                                        <p className="text-xs font-bold text-gray-500">{new Date(order.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                                        order.status.includes('RETURN') ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-[#2D4A73]'
                                    }`}>
                                        {order.status}
                                    </div>
                                    {/* LIVE BADGE ON MAIN CARD */}
                                    {(order.status === 'SHIPPED' || order.status === 'DISPATCHED') && (
                                        <Zap className="text-yellow-400 animate-pulse" size={16} />
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex -space-x-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="w-12 h-12 rounded-xl border-2 border-white overflow-hidden bg-gray-50 shadow-sm">
                                            <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:8080${item.imageUrl}`} className="w-full h-full object-contain" alt="toy" />
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setExpandedOrder(expandedOrder === order.orderId ? null : order.orderId)}
                                    className="text-xs font-black text-[#2D4A73] uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all"
                                >
                                    {expandedOrder === order.orderId ? 'Collapse' : 'Manage Order'}
                                    <ChevronRight size={16} />
                                </button>
                            </div>

                            <AnimatePresence>
                                {expandedOrder === order.orderId && (
                                    <OrderTracker order={order} onSupportReq={handleRaiseReturn} onCancel={handleCancelOrder} />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrders;