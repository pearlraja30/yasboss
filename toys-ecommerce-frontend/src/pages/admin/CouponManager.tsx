import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Ticket, Calendar, Trash2, Save, Plus, Loader2, Hash, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';

const CouponManager = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state updated to match new Model fields
    const [formData, setFormData] = useState({
        id: null as number | null,
        code: '',
        discountPercent: 0,
        expiryDate: '',
        minOrderValue: 0,
        usageLimit: null as number | null,
        active: true
    });

    const fetchCoupons = async () => {
        try {
            const res = await api.couponService.getAllCoupons();
            // Handling both direct data or axios wrapper
            const data = res.data || res;
            setCoupons(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.couponService.saveCoupon(formData);
            toast.success(formData.id ? "Coupon Updated! ⚡" : "New Coupon Created! ✨");
            resetForm();
            fetchCoupons();
        } catch (err) {
            toast.error("Error saving coupon");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({ id: null, code: '', discountPercent: 0, expiryDate: '', minOrderValue: 0, usageLimit: null, active: true });
    };

    const handleEdit = (coupon: any) => {
        setFormData({
            id: coupon.id,
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            expiryDate: coupon.expiryDate,
            minOrderValue: coupon.minOrderValue,
            usageLimit: coupon.usageLimit,
            active: coupon.active
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteCoupon = async (id: number) => {
        if (!window.confirm("Delete this coupon permanently?")) return;
        try {
            await api.couponService.deleteCoupon(id);
            toast.info("Coupon deleted");
            fetchCoupons();
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" /></div>;

    return (
        <div className="max-w-6xl mx-auto p-8 pt-32 min-h-screen text-left">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-[#2D4A73] italic uppercase leading-tight">
                    Coupon <span className="text-blue-600">Vault</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Inventory of active promo codes</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* --- 🎫 ADD/EDIT FORM --- */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit sticky top-32">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-[#2D4A73] uppercase flex items-center gap-2">
                            {formData.id ? <Edit3 size={16} /> : <Plus size={16} />} 
                            {formData.id ? 'Edit Coupon' : 'Create Coupon'}
                        </h3>
                        {formData.id && (
                            <button onClick={resetForm} className="text-[9px] font-black text-blue-500 uppercase underline">New</button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Promo Code</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold uppercase outline-none focus:ring-2 ring-blue-100 border-none"
                                value={formData.code}
                                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                placeholder="BABY20" required
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Discount %</label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-none"
                                    value={formData.discountPercent}
                                    onChange={e => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Min Order</label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-none"
                                    value={formData.minOrderValue}
                                    onChange={e => setFormData({...formData, minOrderValue: parseInt(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                                    <Calendar size={10} /> Valid Until
                                </label>
                                <input 
                                    type="date" 
                                    className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-none text-xs"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                                    <Hash size={10} /> Usage Limit
                                </label>
                                <input 
                                    type="number" 
                                    className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-none"
                                    value={formData.usageLimit || ''}
                                    onChange={e => setFormData({...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null})}
                                    placeholder="∞"
                                />
                            </div>
                        </div>

                        <button 
                            disabled={isSaving}
                            className="w-full py-5 bg-[#2D4A73] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {formData.id ? "Update Coupon" : "Deploy Coupon"}
                        </button>
                    </form>
                </div>

                {/* --- 📋 COUPON LIST --- */}
                <div className="lg:col-span-2 space-y-4">
                    {coupons.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                            <Ticket className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-bold uppercase text-xs">The vault is empty</p>
                        </div>
                    ) : (
                        coupons.map(coupon => {
                            const isExpired = new Date(coupon.expiryDate) < new Date();
                            const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

                            return (
                                <div key={coupon.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 group hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`p-5 rounded-2xl transition-colors ${
                                            isExpired || isLimitReached ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            <Ticket size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-black text-[#2D4A73] text-xl leading-none">{coupon.code}</h4>
                                                {isLimitReached && <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-1 rounded-md uppercase">Max Used</span>}
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                {coupon.discountPercent}% OFF • MIN. ₹{coupon.minOrderValue}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Redemptions</p>
                                            <p className="text-xs font-black text-[#2D4A73]">
                                                {coupon.usedCount} <span className="text-gray-300">/ {coupon.usageLimit || '∞'}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Status</p>
                                            <p className={`text-xs font-black uppercase ${isExpired ? 'text-red-500' : 'text-green-500'}`}>
                                                {isExpired ? 'Expired' : 'Active'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(coupon)} className="p-3 text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 rounded-xl">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => deleteCoupon(coupon.id)} className="p-3 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-xl">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default CouponManager;