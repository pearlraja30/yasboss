import React, { useState } from 'react';
import { Tag, Ticket, Percent, RotateCcw, Zap } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const OffersManager: React.FC = () => {
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [isApplying, setIsApplying] = useState(false);

    const handleApplyGlobal = async () => {
        if (globalDiscount <= 0 || globalDiscount > 90) {
            toast.error("Please enter a valid percentage (1-90)");
            return;
        }
        setIsApplying(true);
        try {
            await api.adminService.applyGlobalOffer(globalDiscount);
            toast.success(`Seasonal sale of ${globalDiscount}% is now LIVE!`);
        } catch (err) {
            toast.error("Failed to apply offer");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* 🎁 GLOBAL SEASONAL OFFER CARD */}
            <div className="bg-gradient-to-br from-[#1A2E4C] to-[#2D4A73] rounded-[3rem] p-10 text-white shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-4 bg-yellow-400 rounded-2xl text-[#1A2E4C]">
                        <Percent size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Seasonal Campaign</h2>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Apply a discount to every toy in the store</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white/10 p-6 rounded-[2rem] border border-white/10">
                    <div className="flex-grow">
                        <label className="text-[10px] font-black uppercase text-blue-300 ml-2">Discount Percentage (%)</label>
                        <input 
                            type="number" 
                            className="w-full bg-transparent text-4xl font-black outline-none border-none placeholder:text-white/20"
                            placeholder="0"
                            onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                        />
                    </div>
                    <button 
                        onClick={handleApplyGlobal}
                        disabled={isApplying}
                        className="bg-yellow-400 text-[#1A2E4C] px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-xl"
                    >
                        {isApplying ? "Syncing..." : "Go Live"}
                    </button>
                </div>
                
                <button 
                    onClick={() => api.adminService.resetOffers()}
                    className="mt-6 flex items-center gap-2 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <RotateCcw size={14} /> Reset all products to original price
                </button>
            </div>

            {/* 🎟️ COUPON MANAGEMENT */}
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-[#1A2E4C] mb-6 flex items-center gap-2 tracking-tighter uppercase">
                    <Ticket className="text-pink-500" /> Active Promo Codes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-400">
                        <Zap size={32} className="mb-2 opacity-20" />
                        <p className="text-[10px] font-black uppercase tracking-widest">New Coupon Logic Ready</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OffersManager;