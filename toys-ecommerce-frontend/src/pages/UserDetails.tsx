import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { toast } from 'react-toastify';
// Import 'motion' to fix the "Cannot find name 'motion'" error
import { motion, AnimatePresence } from 'framer-motion'; 
import { Edit3, Save, X, Loader2, User, Phone, MapPin, Mail } from 'lucide-react';

const UserDetails: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({ 
        fullName: '', 
        phone: '',
        address: '' 
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await api.userService.getProfile(); 
            setUser(data);
            setFormData({ 
                fullName: data.fullName || '', 
                phone: data.phone || '',
                address: data.address || '' 
            });
        } catch (err: any) {
            console.error("Profile Fetch Error:", err);
            toast.error(err.response?.status === 403 
                ? "Session expired. Please login again." 
                : "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const updatedUser = await api.userService.updateProfile({
                fullName: formData.fullName,
                phone: formData.phone,
                address: formData.address 
            });

            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setIsEditing(false);
            toast.success("Profile updated successfully!");
            window.dispatchEvent(new Event("storage"));
        } catch (err) {
            toast.error("Update failed. Please try again.");
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#2D4A73]" size={32} />
        </div>
    );

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-black text-[#2D4A73]">Account Details</h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage your identity and shipping info</p>
                </div>
                <button 
                    onClick={() => {
                        if(isEditing) fetchProfile(); 
                        setIsEditing(!isEditing);
                    }}
                    className={`p-3 rounded-2xl transition-all ${isEditing ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'}`}
                >
                    {isEditing ? <X size={20} /> : <Edit3 size={20} />}
                </button>
            </div>

            <div className="space-y-6">
                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Full Name</label>
                    <div className="relative mt-2">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                            type="text" 
                            disabled={!isEditing}
                            className={`w-full pl-12 pr-4 py-5 rounded-2xl border-none outline-none font-bold transition-all ${isEditing ? 'bg-gray-50 ring-2 ring-blue-100' : 'bg-white text-gray-700'}`}
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Mobile Number</label>
                    <div className="relative mt-2">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                            type="tel" 
                            disabled={!isEditing}
                            placeholder="Add phone for delivery tracking"
                            className={`w-full pl-12 pr-4 py-5 rounded-2xl border-none outline-none font-bold transition-all ${isEditing ? 'bg-gray-50 ring-2 ring-blue-100' : 'bg-white text-gray-700'}`}
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </div>

                <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Shipping Address</label>
                    <div className="relative mt-2">
                        <MapPin className="absolute left-4 top-6 text-gray-300" size={18} />
                        <textarea 
                            disabled={!isEditing}
                            placeholder="Add your full delivery address"
                            className={`w-full pl-12 pr-4 py-5 rounded-2xl border-none outline-none font-bold transition-all min-h-[120px] resize-none ${isEditing ? 'bg-gray-50 ring-2 ring-blue-100' : 'bg-white text-gray-700'}`}
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] ml-2">Email (Login ID)</label>
                    <div className="relative mt-2">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <div className="w-full pl-12 pr-4 py-5 bg-gray-50/50 rounded-2xl text-gray-400 font-bold">
                            {user?.email}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <motion.button 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleUpdate}
                        className="w-full py-5 bg-[#2D4A73] text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-[#1e334f] transition-all"
                    >
                        <Save size={20} /> Save New Profile
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default UserDetails;