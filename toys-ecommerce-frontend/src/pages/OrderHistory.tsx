import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Calendar, ChevronRight, CheckCircle2, Clock, Truck, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';

const OrderHistory = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        if (userEmail) fetchHistory();
    }, [userEmail]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/orders/history', {
                headers: { 'X-User-Email': userEmail }
            });
            setOrders(res.data);
        } catch (err) {
            toast.error("Could not load order history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-700 border-green-200';
            case 'SHIPPED': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-orange-100 text-orange-700 border-orange-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 md:p-12 min-h-screen bg-[#F8FAFC]">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-[#2D4A73] font-serif tracking-tight">My Orders</h1>
                <p className="text-gray-400 mt-2 font-medium">Track and manage your toy collection history</p>
            </header>

            <div className="space-y-8">
                {orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] text-center border shadow-sm">
                        <Package size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium text-lg">No orders found yet. Time to shop!</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                            {/* Order Header Bar */}
                            <div className="bg-gray-50/50 px-8 py-6 border-b flex flex-wrap justify-between items-center gap-4">
                                <div className="flex gap-8">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order Placed</p>
                                        <p className="text-sm font-bold text-gray-700">{new Date(order.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Amount</p>
                                        <p className="text-sm font-black text-[#2D4A73]">₹{order.totalAmount}</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order ID</p>
                                        <p className="text-sm font-bold text-gray-700">#YB-{order.id}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-tighter ${getStatusStyle(order.status)}`}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Order Items List */}
                            <div className="p-8">
                                <div className="space-y-6">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-6 group">
                                            <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 border flex items-center justify-center shrink-0">
                                                <img src={`http://localhost:8080${item.product.imageUrl}`} className="max-h-full object-contain" alt="" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{item.product.name}</h4>
                                                <p className="text-xs text-gray-400 font-medium">Qty: {item.quantity} • Unit Price: ₹{item.priceAtPurchase}</p>
                                            </div>
                                            <button className="hidden md:flex items-center gap-2 text-[#2D4A73] font-black text-xs uppercase tracking-widest hover:underline">
                                                Buy Again
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Tracking Footer */}
                                <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <Truck size={18} className="text-blue-500" />
                                        <span>Delivering to <b>Chennai, Tamil Nadu</b></span>
                                    </div>
                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button className="flex-1 md:flex-none bg-[#2D4A73] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-[#1e334f] transition-all">
                                            Track Package
                                        </button>
                                        <button className="flex-1 md:flex-none border border-gray-200 px-8 py-3 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all">
                                            View Details
                                        </button>
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