import React, { useEffect, useState, useCallback } from 'react';
import { Package, Truck, Loader2, ShoppingBag } from 'lucide-react';
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

        // ✨ FIX: Simplified validation to prevent the "Login Loop"
        // We only check if the token exists and isn't a "null" string
        const hasValidSession = storedToken && 
                               storedToken !== "null" && 
                               storedToken !== "undefined" &&
                               storedEmail;

        if (!hasValidSession) {
            console.warn("📦 OrderHistory: Missing session data. Redirecting...");
            setLoading(false);
            navigate('/login', { replace: true });
            return;
        }

        try {
            setLoading(true);
            // Hits backend: GET /api/orders/user/{email}
            const data = await api.orderService.getOrderHistory(storedEmail);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("❌ History Fetch Error:", err);
            // If the server rejects the token (403), then and only then do we redirect
            if (err.response?.status === 403) {
                toast.error("Session expired. Please log in again.");
                localStorage.removeItem('jwtToken');
                navigate('/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'PENDING': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
            <Loader2 className="animate-spin text-[#2D4A73] mb-4" size={48} />
            <p className="text-[#2D4A73] font-black uppercase text-[10px] tracking-widest italic">Checking the toy vault...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 min-h-screen bg-[#F8FAFC]">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-[#2D4A73]">My Orders</h1>
                    <p className="text-gray-400 mt-2">Track your magical toy history</p>
                </div>
            </header>

            <div className="space-y-8">
                {orders.length === 0 && !loading ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center border shadow-sm">
                        <Package size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium text-lg">No orders found yet. Time to shop!</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                            <div className="flex justify-between items-center border-b pb-6 mb-6">
                                <span className="text-sm font-bold text-gray-700">Order #YB-{order.id}</span>
                                <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-black uppercase">
                                    {order.status || 'PENDING'}
                                </span>
                            </div>
                            
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-6 mb-4">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 border">
                                        <img 
                                            src={item.product?.imageUrl?.startsWith('http') 
                                                ? item.product.imageUrl 
                                                : `/images/products/${item.product?.imageUrl}`} 
                                            className="w-full h-full object-contain"
                                            /** ✨ STOP THE INFINITE LOOP **/
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; 
                                                target.src = 'https://placehold.co/100x100/F3F4F6/2D4A73?text=Toy';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800">{item.product?.name}</h4>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity} • ₹{item.priceAtPurchase}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderHistory;