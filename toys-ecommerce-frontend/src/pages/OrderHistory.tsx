import React, { useEffect, useState, useCallback } from 'react';
import { Package, Truck, Loader2, ShoppingBag, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchHistory = useCallback(async () => {
        const storedEmail = localStorage.getItem('userEmail');
        const storedToken = localStorage.getItem('jwtToken');

        /**
         * ✨ RECTIFIED VALIDATION
         * Ensures we don't fire an API call if the token is a "ghost" string (null/undefined).
         */
        const hasValidSession = storedToken && 
                               storedToken !== "null" && 
                               storedToken !== "undefined" &&
                               storedToken.length > 20 &&
                               storedEmail;

        if (!hasValidSession) {
            console.warn("📦 OrderHistory: Invalid session. Halting fetch.");
            setLoading(false);
            return; // App.tsx Route Guard will handle the redirect
        }

        try {
            setLoading(true);
            // GET /api/orders/user/{email}
            const data = await api.orderService.getOrderHistory(storedEmail);
            console.log("📦 Order Data Received:", data);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("❌ History Fetch Error:", err);
            
            /**
             * ✨ 403 FORBIDDEN RECOVERY
             * If the backend rejects the token, clear it and force a login refresh.
             */
            if (err.response?.status === 403 || err.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
                localStorage.removeItem('jwtToken');
                window.dispatchEvent(new Event('storage')); // Notify App.tsx
                navigate('/login', { replace: true });
            } else {
                toast.error("Could not load your order history.");
            }
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
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Transaction History</span>
                    </div>
                    <h1 className="text-5xl font-black text-[#2D4A73] tracking-tighter">My Orders</h1>
                </div>
            </header>

            <div className="space-y-6">
                {orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-100 shadow-sm">
                        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
                        <p className="text-[#2D4A73] font-black text-2xl tracking-tight mb-2">The box is empty!</p>
                        <p className="text-gray-400 font-medium mb-8">No magical toy sequences found in your history.</p>
                        <button 
                            onClick={() => navigate('/products')}
                            className="bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                        >
                            Start Exploring
                        </button>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id || order.orderId} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-gray-50/50 px-8 py-5 flex justify-between items-center border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-black text-[#2D4A73] uppercase tracking-tighter">Order #YB-{order.id || order.orderId}</span>
                                    <span className="text-[10px] font-bold text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</span>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    order.status === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-100' :
                                    order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                    {order.status || 'PROCESSING'}
                                </span>
                            </div>
                            
                            <div className="p-8">
                                <div className="space-y-6">
                                    {(order.items || []).map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] p-2 border border-gray-100 flex items-center justify-center">
                                                <img 
                                                    src={item.product?.imageUrl || 'https://placehold.co/100x100?text=Toy'} 
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-contain mix-blend-multiply"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=No+Image';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-[#2D4A73] text-lg leading-none mb-2">{item.product?.name || 'Magical Toy Item'}</h4>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                    Qty: {item.quantity} • <span className="text-blue-600">₹{item.priceAtPurchase || item.price}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Truck size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Track Shipment</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-300 uppercase mb-1">Total Valuation</p>
                                        <p className="text-2xl font-black text-[#2D4A73]">₹{order.totalAmount || order.total}</p>
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