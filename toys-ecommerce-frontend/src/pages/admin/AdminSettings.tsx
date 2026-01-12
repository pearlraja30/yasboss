import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Settings, Save, Clock, Truck, Loader2, Landmark, Percent } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSettings: React.FC = () => {
    // ✨ State now includes TAX_PERCENTAGE with fallback
    const [settings, setSettings] = useState<Record<string, string>>({
        RETURN_WINDOW_DAYS: '7',
        FREE_DELIVERY_THRESHOLD: '500',
        TAX_PERCENTAGE: '18' 
    });
    
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await api.adminService.getGlobalSettings();
            
            // Merge with local state to ensure we don't lose local keys
            setSettings(prev => ({ ...prev, ...data }));
        } catch (err) {
            console.error("Settings Load Error:", err);
            toast.error("Failed to load store configurations");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: string) => {
        if (!value || value === "") {
            toast.error("Value cannot be empty!");
            return;
        }

        setSavingKey(key); 
        try {
            await api.adminService.updateGlobalSetting(key, value);
            toast.success(`${key.replace(/_/g, ' ')} updated successfully! ✨`);
        } catch (err) {
            toast.error("Failed to save setting.");
        } finally {
            setSavingKey(null);
        }
    };

    if (loading) return (
        <div className="flex h-96 flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#2D4A73]" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Loading Configurations...</p>
        </div>
    );

    return (
        <div className="p-8 bg-[#F8F9FA] min-h-screen text-left">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-[#2D4A73] italic uppercase tracking-tighter flex items-center gap-3">
                        <Settings className="text-pink-500" /> Global Store Settings
                    </h1>
                    <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">
                        Manage your toys-ecommerce business logic
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    
                    {/* 🕒 Return & Replacement Window */}
                    <motion.div 
                        whileHover={{ y: -5 }} 
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className="p-4 bg-orange-50 text-orange-600 rounded-3xl">
                                <Clock size={32} />
                            </div>
                            <div>
                                <h3 className="font-black text-[#2D4A73] uppercase text-sm tracking-tight">Return & Replacement Window</h3>
                                <p className="text-xs text-gray-400 font-medium">Policy window for customer support requests (in days)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-24 p-4 bg-gray-50 border-none rounded-2xl font-black text-center text-[#2D4A73] focus:ring-2 focus:ring-orange-200 outline-none"
                                    value={settings.RETURN_WINDOW_DAYS}
                                    onChange={(e) => setSettings({...settings, RETURN_WINDOW_DAYS: e.target.value})}
                                />
                                <span className="absolute -top-2 -right-2 bg-[#2D4A73] text-white text-[8px] font-black px-2 py-1 rounded-md uppercase">Days</span>
                            </div>
                            <button 
                                onClick={() => handleUpdate('RETURN_WINDOW_DAYS', settings.RETURN_WINDOW_DAYS)}
                                disabled={savingKey === 'RETURN_WINDOW_DAYS'}
                                className="p-4 bg-[#2D4A73] text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
                            >
                                {savingKey === 'RETURN_WINDOW_DAYS' ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            </button>
                        </div>
                    </motion.div>

                    {/* 🚚 Free Delivery Threshold */}
                    <motion.div 
                        whileHover={{ y: -5 }} 
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
                                <Truck size={32} />
                            </div>
                            <div>
                                <h3 className="font-black text-[#2D4A73] uppercase text-sm tracking-tight">Free Delivery Threshold</h3>
                                <p className="text-xs text-gray-400 font-medium">Cart total required to remove shipping charges</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-300 italic">₹</span>
                                <input 
                                    type="number" 
                                    className="w-32 pl-8 p-4 bg-gray-50 border-none rounded-2xl font-black text-[#2D4A73] focus:ring-2 focus:ring-blue-200 outline-none"
                                    value={settings.FREE_DELIVERY_THRESHOLD}
                                    onChange={(e) => setSettings({...settings, FREE_DELIVERY_THRESHOLD: e.target.value})}
                                />
                            </div>
                            <button 
                                onClick={() => handleUpdate('FREE_DELIVERY_THRESHOLD', settings.FREE_DELIVERY_THRESHOLD)}
                                disabled={savingKey === 'FREE_DELIVERY_THRESHOLD'}
                                className="p-4 bg-[#2D4A73] text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
                            >
                                {savingKey === 'FREE_DELIVERY_THRESHOLD' ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            </button>
                        </div>
                    </motion.div>

                    {/* 🏛️ Tax & GST Settings */}
                    <motion.div 
                        whileHover={{ y: -5 }} 
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className="p-4 bg-pink-50 text-pink-600 rounded-3xl">
                                <Landmark size={32} />
                            </div>
                            <div>
                                <h3 className="font-black text-[#2D4A73] uppercase text-sm tracking-tight">Standard GST / Tax (%)</h3>
                                <p className="text-xs text-gray-400 font-medium">Global tax percentage applied to product base prices</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            <div className="relative">
                                <input 
                                    type="number" 
                                    className="w-24 p-4 pr-10 bg-gray-50 border-none rounded-2xl font-black text-center text-[#2D4A73] focus:ring-2 focus:ring-pink-200 outline-none"
                                    value={settings.TAX_PERCENTAGE}
                                    onChange={(e) => setSettings({...settings, TAX_PERCENTAGE: e.target.value})}
                                />
                                <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                            </div>
                            <button 
                                onClick={() => handleUpdate('TAX_PERCENTAGE', settings.TAX_PERCENTAGE)}
                                disabled={savingKey === 'TAX_PERCENTAGE'}
                                className="p-4 bg-[#2D4A73] text-white rounded-2xl hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-pink-100"
                            >
                                {savingKey === 'TAX_PERCENTAGE' ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            </button>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-10 p-6 bg-blue-50/50 rounded-3xl border border-dashed border-blue-200">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center leading-relaxed">
                        Note: These changes take effect immediately for all customers across the platform. <br/>
                        Tax updates will only apply to new orders.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;