import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
    Package, Truck, Home, CheckCircle2, MapPin, 
    ArrowLeft, Loader2, Calendar, Phone, Zap, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderTracking: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const data = await api.orderService.getOrderById(orderId!);
            setOrder(data);
        } catch (err) {
            console.error("Tracking fetch failed");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 'PAID', label: 'Order Confirmed', icon: CheckCircle2, color: 'text-green-500' },
        { id: 'DISPATCHED', label: 'Packed & Ready', icon: Package, color: 'text-blue-500' },
        { id: 'SHIPPED', label: 'In Transit', icon: Truck, color: 'text-indigo-500' },
        { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Zap, color: 'text-purple-500' },
        { id: 'DELIVERED', label: 'Delivered', icon: Home, color: 'text-green-600' }
    ];

    const getCurrentStepIndex = () => {
        return steps.findIndex(step => step.id === order?.status);
    };

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Locating your package...</p>
        </div>
    );

    const isDelivered = order?.status === 'DELIVERED';

    return (
        <div className="bg-[#F8F9FA] min-h-screen pt-32 pb-20 px-6 text-left">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 hover:text-[#2D4A73]">
                    <ArrowLeft size={14} /> Back to My Orders
                </button>

                {/* Tracking Header */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 mb-8 overflow-hidden relative">
                    {isDelivered && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-5 right-5"
                        >
                            <div className="bg-green-100 text-green-600 p-2 rounded-xl">
                                <CheckCircle2 size={24} />
                            </div>
                        </motion.div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                isDelivered ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {order?.status.replace(/_/g, ' ')}
                            </span>
                            <h1 className="text-4xl font-black text-[#2D4A73] tracking-tighter mt-4 italic">
                                Order <span className="text-pink-500">#{order?.orderId}</span>
                            </h1>
                        </div>
                        
                        {/* ✨ NEW: Rate this Toy Button ✨ */}
                        <AnimatePresence>
                            {isDelivered && (
                                <motion.button 
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    onClick={() => navigate(`/reviews/add/${order?.orderId}`)}
                                    className="flex items-center gap-3 bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-500 shadow-xl shadow-blue-100 transition-all"
                                >
                                    <Star size={16} fill="white" /> Rate this Toy
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Live Progress Stepper */}
                    <div className="mt-16 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(getCurrentStepIndex() / (steps.length - 1)) * 100}%` }}
                            className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full z-10"
                        />
                        
                        <div className="relative z-20 flex justify-between">
                            {steps.map((step, index) => {
                                const isActive = index <= getCurrentStepIndex();
                                return (
                                    <div key={step.id} className="flex flex-col items-center">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                            isActive ? 'bg-white shadow-xl scale-110 border-2 border-blue-500 text-blue-500' : 'bg-white border border-gray-100 text-gray-300'
                                        }`}>
                                            <step.icon size={20} className={isActive && step.id === order?.status ? "animate-bounce" : ""} />
                                        </div>
                                        <p className={`mt-4 text-[9px] font-black uppercase tracking-tighter text-center max-w-[80px] ${
                                            isActive ? 'text-[#2D4A73]' : 'text-gray-300'
                                        }`}>
                                            {step.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <MapPin className="text-pink-500" size={20} />
                            <h3 className="font-black text-[#2D4A73] uppercase text-xs">Delivered To</h3>
                        </div>
                        <p className="text-gray-500 font-bold text-sm leading-relaxed">{order?.shippingAddress}</p>
                    </div>

                    <div className="bg-blue-50 p-8 rounded-[3rem] border border-blue-100 flex flex-col justify-center">
                        <h3 className="text-lg font-black text-[#2D4A73] uppercase italic mb-2">Need Help?</h3>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Support available 24/7</p>
                        <button className="bg-white text-[#2D4A73] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                            Chat with Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;