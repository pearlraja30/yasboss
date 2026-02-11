import React, { useEffect, useState, useCallback } from 'react';
import { Package, Truck, Loader2, ShoppingBag, CheckCircle2, Circle, MapPin, RefreshCcw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

/**
 * ✨ Replacement Timer Component
 * Calculates and displays the remaining window for replacements.
 */
const ReplacementBadge = ({ order, onRefresh }: { order: any, onRefresh: () => void }) => {
    const [requesting, setRequesting] = useState(false);
    
    // 1. Calculate dynamic window (Max warranty from all items in order)
    const warrantyDays = order.items?.reduce((max: number, item: any) => {
        const itemDays = item.product?.category?.warrantyDays || 7;
        return itemDays > max ? itemDays : max;
    }, 7) || 7;

    const orderDate = new Date(order.orderDate);
    const today = new Date();
    const diffTime = today.getTime() - orderDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = warrantyDays - diffDays;
    
    const isAvailable = daysLeft > 0 && order.status === 'DELIVERED';
    const isRequested = order.status === 'REPLACEMENT_REQUESTED';

    const handleReplacement = async () => {
        if (!window.confirm("Do you want to request a replacement for this order?")) return;
        setRequesting(true);
        try {
            const email = localStorage.getItem('userEmail') || "";
            await api.orderService.requestReplacement(order.id, email);
            toast.success("Replacement request submitted! ✨");
            onRefresh();
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to request replacement");
        } finally {
            setRequesting(false);
        }
    };

    if (isRequested) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <RefreshCcw size={14} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-widest">Replacement Requested</span>
            </div>
        );
    }

    if (!isAvailable && order.status === 'DELIVERED') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100">
                <Clock size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Window Closed</span>
            </div>
        );
    }

    if (isAvailable) {
        return (
            <button 
                onClick={handleReplacement}
                disabled={requesting}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    daysLeft <= 2 
                    ? 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100' 
                    : 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100'
                }`}
            >
                {requesting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                <span className="text-[10px] font-black uppercase tracking-widest">
                    Request Replacement ({daysLeft} days left)
                </span>
            </button>
        );
    }

    return null;
};

// ... OrderTimeline component remains same as your original code ...
const OrderTimeline = ({ status }: { status: string }) => {
    const steps = [
        { label: 'Order Placed', key: 'PENDING' },
        { label: 'Manifested', key: 'MANIFESTED' },
        { label: 'In Transit', key: 'IN_TRANSIT' },
        { label: 'Delivered', key: 'DELIVERED' }
    ];

    const getStatusIndex = (currentStatus: string) => {
        const index = steps.findIndex(step => step.key === currentStatus?.toUpperCase());
        return index === -1 ? 0 : index;
    };

    const currentStepIndex = getStatusIndex(status);

    return (
        <div className="w-full py-6">
            <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                <div 
                    className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-0 transition-all duration-500" 
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                isCompleted 
                                ? 'bg-white border-blue-500 text-blue-500' 
                                : 'bg-white border-gray-100 text-gray-300'
                            }`}>
                                {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={12} fill="currentColor" />}
                            </div>
                            <span className={`text-[9px] font-black uppercase mt-2 tracking-tighter ${
                                isCurrent ? 'text-blue-600' : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const OrderHistory = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHistory = useCallback(async () => {
        const storedEmail = localStorage.getItem('userEmail');
        const storedToken = localStorage.getItem('jwtToken');
        if (!storedToken || !storedEmail) { setLoading(false); return; }

        try {
            setLoading(true);
            const data = await api.orderService.getOrderHistory(storedEmail);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 403) navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-[#2D4A73] mb-4" size={48} />
            <p className="text-[#2D4A73] font-black uppercase text-[10px] tracking-widest italic">Decrypting the vault...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 min-h-screen bg-[#F8FAFC]">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-1 w-8 bg-blue-600 rounded-full" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Adventure Logs</span>
                    </div>
                    <h1 className="text-5xl font-black text-[#2D4A73] tracking-tighter">My Orders</h1>
                </div>
            </header>

            <div className="space-y-8">
                {orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100 shadow-sm">
                        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                        <p className="text-[#2D4A73] font-black text-2xl tracking-tight mb-2">The box is empty!</p>
                        <button onClick={() => navigate('/products')} className="bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all mt-4">
                            Start Exploring
                        </button>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-gray-50/50 px-8 py-5 flex justify-between items-center border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-[#2D4A73] uppercase tracking-tighter">Order #YB-{order.id}</span>
                                    <span className="text-[10px] font-bold text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* ✨ REPLACEMENT BADGE INTEGRATED HERE ✨ */}
                                    <ReplacementBadge order={order} onRefresh={fetchHistory} />
                                    
                                    <div className="flex items-center gap-2">
                                        <Truck size={14} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                            {order.status || 'PROCESSING'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <div className="mb-10 px-4">
                                    <OrderTimeline status={order.status || 'PENDING'} />
                                </div>

                                <div className="space-y-6">
                                    {(order.items || []).map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-6 group">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] p-2 border border-gray-100 flex items-center justify-center transition-transform group-hover:scale-105">
                                                <img 
                                                    src={item.product?.imageUrl} 
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-[#2D4A73] text-lg leading-none mb-2">{item.product?.name}</h4>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                            Qty: {item.quantity} • <span className="text-blue-600">₹{item.priceAtPurchase}</span>
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 px-3 py-1 rounded-lg">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                            {item.product?.category?.warrantyDays || 7} Days Warranty
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Shipping To</p>
                                        <p className="text-xs font-bold text-[#2D4A73]">{order.shippingAddress || 'Default Address'}</p>
                                        {order.waybillNumber && (
                                            <button onClick={() => navigate(`/profile/track/${order.waybillNumber}`)} className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
                                                <MapPin size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4">Track Live Shipment</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Total Paid</p>
                                        <p className="text-3xl font-black text-[#2D4A73]">₹{order.totalAmount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderHistory;