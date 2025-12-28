import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ChevronRight, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface OrderItem {
    id: number;
    productName: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface Order {
    orderId: string;
    date: string;
    total: number;
    status: 'PENDING' | 'SHIPPED' | 'DELIVERED';
    items: OrderItem[];
}

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            try {
                // Endpoint fetches orders filtered by customer email/ID
                const res = await axios.get(`http://localhost:8080/api/orders/user/${user.email}`);
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle className="text-green-500" />;
            case 'SHIPPED': return <Truck className="text-blue-500" />;
            default: return <Clock className="text-amber-500" />;
        }
    };

    if (loading) return <div className="py-40 text-center font-black text-[#2D4A73]">Tracking your toys...</div>;

    if (orders.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
                <div className="bg-blue-50 p-8 rounded-[3rem] mb-6 text-blue-600">
                    <ShoppingBag size={60} />
                </div>
                <h2 className="text-4xl font-black text-[#2D4A73]">No orders yet!</h2>
                <p className="text-gray-400 mt-4">Your toy box is waiting to be filled.</p>
                <Link to="/" className="mt-8 bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-20">
            <h1 className="text-5xl font-black text-[#2D4A73] mb-12 tracking-tighter">My Orders</h1>
            
            <div className="space-y-8">
                {orders.map((order) => (
                    <motion.div 
                        key={order.orderId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                    >
                        {/* Order Header */}
                        <div className="bg-gray-50/50 px-8 py-6 flex flex-wrap justify-between items-center border-b border-gray-100 gap-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                                <p className="font-bold text-gray-800">#{order.orderId}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Placed</p>
                                <p className="font-bold text-gray-800">{order.date}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                <p className="font-black text-[#2D4A73]">₹{order.total}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                {getStatusIcon(order.status)}
                                <span className="text-xs font-black uppercase tracking-tighter">{order.status}</span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-8 space-y-6">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-gray-50 rounded-2xl p-2 flex-shrink-0">
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-gray-800">{item.productName}</h4>
                                        <p className="text-sm text-gray-400 font-medium">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-black text-gray-900">₹{item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>

                        {/* Order Footer */}
                        <div className="px-8 py-6 bg-white border-t border-gray-50 flex justify-end">
                            <button className="flex items-center gap-2 text-sm font-black text-pink-600 uppercase hover:gap-4 transition-all">
                                Track Order <ChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;