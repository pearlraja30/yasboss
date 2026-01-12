import React, { useState, useEffect } from 'react';
import { 
    Megaphone, Plus, Trash2, Power, PowerOff, Loader2, 
    Info, Truck, Sparkles, Zap, Star, ArrowRight, Eye, RefreshCw, Calendar 
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementManager: React.FC = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ✨ Updated Form State with Scheduling
    const [formData, setFormData] = useState({
        text: '',
        iconType: 'STAR',
        color: 'text-white',
        targetLink: '',
        active: true,
        startTime: '', 
        endTime: ''    
    });

    const getIcon = (type: string) => {
        switch(type) {
            case 'TRUCK': return <Truck size={14} />;
            case 'SPARKLES': return <Sparkles size={14} />;
            case 'ZAP': return <Zap size={14} />;
            default: return <Star size={14} />;
        }
    };

    // ✨ Logic to determine the current status of a scheduled message
    const getStatusInfo = (item: any) => {
        const now = new Date();
        const start = item.startTime ? new Date(item.startTime) : null;
        const end = item.endTime ? new Date(item.endTime) : null;

        if (!item.active) return { label: 'Paused', color: 'bg-slate-400', pulse: false };
        if (start && now < start) return { label: 'Scheduled', color: 'bg-blue-400', pulse: false };
        if (end && now > end) return { label: 'Expired', color: 'bg-red-400', pulse: false };
        return { label: 'Live', color: 'bg-green-500', pulse: true };
    };

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            // Using the admin-specific "all" endpoint we discussed
            const data = await api.announcementService.getAllForAdmin(); 
            setAnnouncements(data);
        } catch (err) {
            toast.error("Failed to sync broadcasts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.announcementService.create(formData);
            toast.success("Broadcast successfully scheduled!");
            setFormData({ 
                text: '', iconType: 'STAR', color: 'text-white', 
                targetLink: '', active: true, startTime: '', endTime: '' 
            });
            fetchAnnouncements();
        } catch (err) {
            toast.error("Network error: Failed to broadcast");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.announcementService.updateStatus(id, !currentStatus);
            fetchAnnouncements();
            toast.info(`Announcement ${!currentStatus ? 'activated' : 'paused'}`);
        } catch (err) {
            toast.error("Toggle failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("This will permanently remove the ticker message. Continue?")) return;
        try {
            await api.announcementService.delete(id);
            toast.success("Message purged");
            fetchAnnouncements();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-10 pb-20 max-w-6xl mx-auto">
            
            {/* 📢 BROADCAST CREATOR CARD */}
            <div className="bg-[#1A2E4C] rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-pink-500 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <Megaphone size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Broadcast Center</h2>
                            <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.2em]">Smart Scheduling Active</p>
                        </div>
                    </div>
                    <button onClick={fetchAnnouncements} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 ml-2">Display Message</label>
                            <input 
                                type="text" placeholder="e.g. FLASH SALE: 40% OFF" 
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold focus:bg-white/10 focus:border-pink-500 outline-none transition-all"
                                value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 ml-2">Action Link (Optional)</label>
                            <input 
                                type="text" placeholder="/products/sale" 
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold focus:bg-white/10 focus:border-pink-500 outline-none transition-all"
                                value={formData.targetLink} onChange={(e) => setFormData({...formData, targetLink: e.target.value})}
                            />
                        </div>
                    </div>

                    {/* ✨ NEW: Scheduling Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-black/20 p-8 rounded-[2.5rem] border border-white/5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-pink-400 ml-2 flex items-center gap-2">
                                <Calendar size={12} /> Auto-Start (Optional)
                            </label>
                            <input 
                                type="datetime-local" 
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold focus:border-pink-500 outline-none transition-all text-white"
                                value={formData.startTime} onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-pink-400 ml-2 flex items-center gap-2">
                                <Calendar size={12} /> Auto-End (Optional)
                            </label>
                            <input 
                                type="datetime-local" 
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold focus:border-pink-500 outline-none transition-all text-white"
                                value={formData.endTime} onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 ml-2">Visual Icon</label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:border-pink-500 outline-none"
                                value={formData.iconType} onChange={(e) => setFormData({...formData, iconType: e.target.value})}
                            >
                                <option value="STAR" className="bg-[#1A2E4C]">Standard Star</option>
                                <option value="TRUCK" className="bg-[#1A2E4C]">Truck (Shipping)</option>
                                <option value="SPARKLES" className="bg-[#1A2E4C]">Sparkles (New)</option>
                                <option value="ZAP" className="bg-[#1A2E4C]">Zap (Flash Sale)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-300 ml-2">Accent Color</label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:border-pink-500 outline-none"
                                value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}
                            >
                                <option value="text-white" className="bg-[#1A2E4C]">Pure White</option>
                                <option value="text-yellow-400" className="bg-[#1A2E4C]">Gold Deal</option>
                                <option value="text-pink-400" className="bg-[#1A2E4C]">Pink Magic</option>
                                <option value="text-green-400" className="bg-[#1A2E4C]">Eco Green</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" disabled={saving || !formData.text}
                                className="w-full bg-white text-[#1A2E4C] py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Schedule Broadcast
                            </motion.button>
                        </div>
                    </div>
                </form>

                {/* REAL-TIME PREVIEW SECTION */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye size={14} className="text-pink-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Real-time Ticker Preview</span>
                    </div>
                    
                    <div className="w-full bg-[#122136] rounded-2xl py-5 overflow-hidden border border-white/5 relative flex justify-center items-center shadow-inner">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={formData.text + formData.iconType + formData.color}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 px-10"
                            >
                                <div className={formData.color}>{getIcon(formData.iconType)}</div>
                                <span className={`text-[11px] font-black uppercase tracking-[0.25em] whitespace-nowrap ${formData.color}`}>
                                    {formData.text || "Awaiting message content..."}
                                </span>
                            </motion.div>
                        </AnimatePresence>
                        <motion.div 
                            animate={{ x: ["-100%", "300%"] }}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/4 -skew-x-12 pointer-events-none"
                        />
                    </div>
                </div>
            </div>

            {/* 📋 BROADCAST QUEUE */}
            <div className="bg-white rounded-[3.5rem] p-12 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-2xl font-black text-[#1A2E4C] flex items-center gap-3 tracking-tighter">
                        <div className="w-2 h-8 bg-[#1A2E4C] rounded-full" /> Ticker Queue
                    </h3>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="animate-spin text-slate-200" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {announcements.map((item) => {
                            const status = getStatusInfo(item);
                            return (
                                <motion.div 
                                    layout
                                    key={item.id} 
                                    className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all ${item.active ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-transparent opacity-60'}`}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${status.color} ${status.pulse ? 'animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.4)]' : ''}`} />
                                            <span className="text-[8px] font-black uppercase text-slate-400 mt-1">{status.label}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <div className={item.color}>{getIcon(item.iconType)}</div>
                                                <p className="font-black uppercase text-sm text-[#1A2E4C] tracking-tight">{item.text}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-7">
                                                {item.startTime && <span>Starts: {new Date(item.startTime).toLocaleString()}</span>}
                                                {item.endTime && <span>Ends: {new Date(item.endTime).toLocaleString()}</span>}
                                                {!item.startTime && !item.endTime && <span>Permanent Loop</span>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => toggleStatus(item.id, item.active)} 
                                            className={`p-4 rounded-2xl transition-all ${item.active ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#1A2E4C] text-white shadow-lg shadow-slate-200'}`}
                                        >
                                            {item.active ? <PowerOff size={18} /> : <Power size={18} />}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)} 
                                            className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementManager;