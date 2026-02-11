import React, { useEffect, useState } from 'react';
import { 
    ShoppingBag, 
    UserPlus, 
    RefreshCcw, 
    Package, 
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Activity {
    id: number;
    type: 'ORDER' | 'USER' | 'INVENTORY' | 'SYSTEM';
    message: string;
    timestamp: string;
    status: 'success' | 'warning' | 'info';
}

const ActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivity = async () => {
        try {
            // Mapping to your adminService or a new audit service
            const response = await api.adminService.getRecentActivities();
            setActivities(response.data || []);
        } catch (error) {
            console.error("Activity sync failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivity();
        const interval = setInterval(fetchActivity, 30000); // Sync every 30s
        return () => clearInterval(interval);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'ORDER': return <ShoppingBag size={16} className="text-emerald-500" />;
            case 'USER': return <UserPlus size={16} className="text-blue-500" />;
            case 'INVENTORY': return <Package size={16} className="text-pink-500" />;
            default: return <AlertCircle size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-black text-[#2D4A73] uppercase tracking-tighter italic">Live Feed</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Events • Real-time</p>
                </div>
                <button onClick={fetchActivity} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <RefreshCcw size={18} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {activities.map((item, index) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-4 relative"
                        >
                            {/* Connector Line */}
                            {index !== activities.length - 1 && (
                                <div className="absolute left-[17px] top-8 bottom-[-24px] w-[2px] bg-slate-50" />
                            )}

                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
                                {getIcon(item.type)}
                            </div>

                            <div className="flex-grow pt-1">
                                <p className="text-xs font-bold text-[#2D4A73] leading-tight">
                                    {item.message}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock size={10} className="text-slate-300" />
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                            
                            {item.status === 'success' && <CheckCircle2 size={14} className="text-emerald-400 mt-1" />}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ActivityFeed;