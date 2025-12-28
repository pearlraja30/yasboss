import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, ArrowRight, PackageSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StockAlert: React.FC = () => {
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/admin/low-stock-items');
                setLowStockItems(res.data);
            } catch (err) {
                console.error("Alert fetch failed");
            }
        };
        fetchAlerts();
    }, []);

    if (lowStockItems.length === 0) return null;

    return (
        <div className="bg-white rounded-[3rem] p-8 border-2 border-red-50 shadow-xl shadow-red-100/20 mb-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-500 text-white rounded-2xl animate-pulse">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#2D4A73]">Critical Stock Alerts</h2>
                        <p className="text-red-400 font-bold text-xs uppercase tracking-widest">Action Required Immediately</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/admin/inventory')}
                    className="flex items-center gap-2 text-gray-400 font-bold hover:text-[#2D4A73] transition-colors"
                >
                    View All Inventory <ArrowRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-black text-[#2D4A73] text-sm leading-tight">{item.name}</p>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase">{item.sku}</span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-md text-[10px] font-black">
                                    ONLY {item.stock} LEFT
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StockAlert;