import React, { useState, useEffect } from 'react';
import { 
    Megaphone, Plus, Trash2, Power, PowerOff, Loader2, 
    Info, Truck, Sparkles, Zap, Star, ArrowRight, Eye 
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementManager: React.FC = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        text: '',
        iconType: 'STAR',
        color: 'text-white',
        targetLink: '',
        active: true
    });

    // Helper to render icons in the Live Preview
    const getIcon = (type: string) => {
        switch(type) {
            case 'TRUCK': return <Truck size={14} />;
            case 'SPARKLES': return <Sparkles size={14} />;
            case 'ZAP': return <Zap size={14} />;
            default: return <Star size={14} />;
        }
    };

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const data = await api.announcementService.getActive();
            setAnnouncements(data);
        } catch (err) {
            toast.error("Failed to load announcements");
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
            toast.success("New announcement broadcasted!");
            setFormData({ text: '', iconType: 'STAR', color: 'text-white', targetLink: '', active: true });
            fetchAnnouncements();
        } catch (err) {
            toast.error("Broadcast failed");
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await api.announcementService.updateStatus(id, !currentStatus);
            fetchAnnouncements();
            toast.info("Status updated");
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Remove this announcement permanently?")) return;
        try {
            await api.announcementService.delete(id);
            toast.success("Announcement deleted");
            fetchAnnouncements();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* ✨ CREATION & LIVE PREVIEW CARD */}
            <div className="bg-[#2D4A73] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-pink-500 rounded-2xl shadow-lg">
                        <Megaphone size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter italic">Live Ticker Control</h2>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Broadcast news to all shoppers instantly</p>
                    </div>
                </div>

                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                    <input 
                        type="text" placeholder="Message Text (e.g. 20% OFF ALL TOYS)" 
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl text-sm focus:outline-none focus:border-white transition-all col-span-1 md:col-span-2"
                        value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})} required
                    />
                    <select 
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl text-sm focus:outline-none"
                        value={formData.iconType} onChange={(e) => setFormData({...formData, iconType: e.target.value})}
                    >
                        <option value="STAR" className="text-black">Star Icon</option>
                        <option value="TRUCK" className="text-black">Truck (Shipping)</option>
                        <option value="SPARKLES" className="text-black">Sparkles (New)</option>
                        <option value="ZAP" className="text-black">Zap (Sale)</option>
                    </select>
                    <select 
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl text-sm focus:outline-none"
                        value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}
                    >
                        <option value="text-white" className="text-black">Standard White</option>
                        <option value="text-yellow-400" className="text-black">Gold (Deals)</option>
                        <option value="text-pink-400" className="text-black">Pink (Featured)</option>
                        <option value="text-green-400" className="text-black">Green (Eco)</option>
                    </select>
                    <input 
                        type="text" placeholder="Target Link (Optional)" 
                        className="bg-white/10 border border-white/20 p-4 rounded-2xl text-sm focus:outline-none col-span-1 md:col-span-3"
                        value={formData.targetLink} onChange={(e) => setFormData({...formData, targetLink: e.target.value})}
                    />
                    <button 
                        type="submit" disabled={saving || !formData.text}
                        className="bg-white text-[#2D4A73] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-xl"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Create
                    </button>
                </form>

                {/* ✨ REAL-TIME PREVIEW SECTION */}
                <div className="mt-10 border-t border-white/10 pt-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-4 flex items-center gap-2">
                        <Eye size={12} /> Storefront Preview
                    </p>
                    
                    <div className="w-full bg-[#1e3352] rounded-2xl py-4 overflow-hidden border border-white/5 relative">
                        <div className="flex justify-center items-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={formData.text + formData.iconType + formData.color}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className={formData.color}>{getIcon(formData.iconType)}</div>
                                    <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${formData.color}`}>
                                        {formData.text || "Enter text to preview..."}
                                    </span>
                                    {formData.targetLink && (
                                        <div className="flex items-center gap-1 text-white/30 text-[9px] font-bold uppercase tracking-tighter">
                                            Click to view <ArrowRight size={10} />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        {/* Animated background shine */}
                        <motion.div 
                            animate={{ x: ["-100%", "300%"] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-1/3 -skew-x-12"
                        />
                    </div>
                </div>
            </div>

            {/* QUEUE LIST SECTION */}
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-[#2D4A73] mb-6 flex items-center gap-2">
                    <Info size={20} className="text-blue-500" /> Active Queue
                </h3>
                {loading ? (
                    <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-300" /></div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-md transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-300'}`} />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={item.color.replace('text-', 'text-')}>
                                                {getIcon(item.iconType)}
                                            </span>
                                            <p className="font-black uppercase text-sm text-gray-900">{item.text}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            Link: <span className="text-blue-400">{item.targetLink || 'None'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => toggleStatus(item.id, item.active)} 
                                        title={item.active ? "Deactivate" : "Activate"}
                                        className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors"
                                    >
                                        {item.active ? <Power size={18} /> : <PowerOff size={18} />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)} 
                                        className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {announcements.length === 0 && (
                            <div className="text-center py-10 text-gray-400 italic">No announcements in the queue.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementManager;