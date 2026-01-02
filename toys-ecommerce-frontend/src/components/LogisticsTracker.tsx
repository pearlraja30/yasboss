import React, { useState, useEffect } from 'react';
import { Package, XCircle, FileText, Truck, MapPin, CheckCircle, List } from 'lucide-react';
import api from '../services/api';
import { RefreshCcw } from 'lucide-react';

const LogisticsTracker = () => {
    const [activeTab, setActiveTab] = useState('IN_TRANSIT');
    const [shipments, setShipments] = useState([]);
    const [counts, setCounts] = useState<any>({});

    const tabs = [
        { id: 'ORDERS', label: 'Orders', icon: Package },
        { id: 'CANCELLATIONS', label: 'Cancellations', icon: XCircle },
        { id: 'MANIFESTED', label: 'Manifested', icon: FileText },
        { id: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', icon: Truck },
        { id: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
        { id: 'RTO', label: 'RTO', icon: RefreshCcw },
        { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
        { id: 'ALL', label: 'All Shipments', icon: List }
    ];

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* ✨ TAB NAVIGATION */}
            <div className="flex overflow-x-auto gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                            activeTab === tab.id ? 'bg-[#2D4A73] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-blue-400 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {counts[tab.id] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* ✨ DATA TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <th className="px-8 py-6">Waybill / Order</th>
                            <th className="px-8 py-6">Carrier</th>
                            <th className="px-8 py-6">Route</th>
                            <th className="px-8 py-6">Weight</th>
                            <th className="px-8 py-6">Status</th>
                            <th className="px-8 py-6">EDD Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {shipments.map((s: any) => (
                            <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                                <td className="px-8 py-6">
                                    <p className="font-black text-[#2D4A73]">{s.waybillNumber}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">Order ID: {s.orderId}</p>
                                </td>
                                <td className="px-8 py-6 font-bold text-gray-600">{s.carrier}</td>
                                <td className="px-8 py-6">
                                    <p className="text-xs font-bold text-gray-700">{s.fromCity}</p>
                                    <p className="text-[10px] text-gray-400">{s.toCity}</p>
                                </td>
                                <td className="px-8 py-6 text-xs text-gray-500">{s.deadWeight} kg</td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase">
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right font-bold text-xs">
                                    <p className="text-gray-400">{s.shipDate}</p>
                                    <p className="text-red-500 uppercase text-[9px]">2 Days Over EDD</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogisticsTracker;