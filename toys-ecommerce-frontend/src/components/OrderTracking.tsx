// src/components/OrderTracking.tsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';

const OrderTracking: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                // Securely fetch orders linked to the user's phone via JWT
                const data = await api.orderService.getMyTracking();
                setOrders(data);
            } catch (err) {
                console.error("Tracking fetch failed");
            } finally {
                setLoading(false);
            }
        };
        fetchTracking();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle className="text-green-500" />;
            case 'SHIPPED': return <Truck className="text-blue-500" />;
            default: return <Clock className="text-orange-500" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-black text-[#2D4A73] mb-8">Track My Packages</h2>
            {orders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl p-8 shadow-sm border mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Order #{order.id}</span>
                            <h3 className="text-xl font-black text-[#2D4A73]">{order.productName}</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                            {getStatusIcon(order.status)}
                            <span className="font-bold text-sm">{order.status}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-100 rounded-full mt-10 mb-4">
                        <div 
                            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-1000"
                            style={{ width: order.status === 'DELIVERED' ? '100%' : order.status === 'SHIPPED' ? '66%' : '33%' }}
                        />
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <span>Placed</span>
                        <span>Shipped</span>
                        <span>Delivered</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderTracking;