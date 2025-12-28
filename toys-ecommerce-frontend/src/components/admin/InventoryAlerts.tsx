import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, RefreshCcw } from 'lucide-react';
import api from '../../services/api'; // Adjusted path based on folder structure
import { toast } from 'react-toastify';

/**
 * InventoryAlerts Component
 * Requirement #3: Inventory alerts for low stock
 */
const InventoryAlerts: React.FC = () => {
    const [lowStockItems, setLowStockItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAlerts = async () => {
            try {
                // Using the centralized inventory service
                const data = await api.inventoryService.getLowStockAlerts();
                setLowStockItems(data);
            } catch (err) {
                console.error("Failed to load inventory alerts");
                toast.error("Could not fetch stock alerts");
            } finally {
                setLoading(false);
            }
        };
        loadAlerts();
    }, []);

    if (loading) return <div className="p-8 text-center font-bold text-gray-400">Checking stock levels...</div>;

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-red-50">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-xl text-red-600">
                        <AlertTriangle size={24} />
                    </div>
                    <h2 className="text-xl font-black text-[#2D4A73]">Inventory Alerts</h2>
                </div>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">
                    {lowStockItems.length} Items Low
                </span>
            </div>

            <div className="space-y-4">
                {lowStockItems.length === 0 ? (
                    <p className="text-gray-400 text-sm font-bold">All stock levels are healthy! ✨</p>
                ) : (
                    lowStockItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                    <Package size={20} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#2D4A73]">{item.name}</p>
                                    <p className="text-xs text-red-500 font-black">Only {item.stockQuantity} left!</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => toast.info("Redirecting to restock...")}
                                className="p-2 hover:bg-blue-50 rounded-full transition-colors text-blue-600"
                                title="Update Stock"
                            >
                                <RefreshCcw size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InventoryAlerts;