import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Star, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ProfileOverview: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Securely fetch using JWT token via the verified api.ts method
                const data = await api.userService.getProfile();
                setProfile(data);
                
                // Update local storage to keep points and info synced across the app
                localStorage.setItem('user', JSON.stringify(data));
                window.dispatchEvent(new Event("storage"));
            } catch (err) {
                console.error("Profile sync error:", err);
                toast.error("Could not sync profile details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    if (loading) return (
        <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#2D4A73]" size={32} />
        </div>
    );

    return (
        <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-50 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-10 -mt-10 z-0" />
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#2D4A73] to-[#1e334f] rounded-3xl flex items-center justify-center text-white shadow-lg">
                        <User size={40} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-black text-[#2D4A73]">{profile?.fullName}</h2>
                            {profile?.role === 'ADMIN' && (
                                // FIX: Wrapped in span because Lucide icons don't support 'title' prop
                                <span title="Verified Admin" className="flex items-center">
                                    <ShieldCheck className="text-blue-500" size={20} />
                                </span>
                            )}
                        </div>
                        <p className="text-gray-400 font-bold text-sm">{profile?.email}</p>
                    </div>
                    
                    {/* Reward Points Badge */}
                    <div className="md:ml-auto bg-orange-50 px-6 py-4 rounded-[2rem] border border-orange-100 flex items-center gap-3">
                        <div className="bg-orange-400 p-2 rounded-full text-white">
                            <Star size={18} fill="currentColor" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block leading-none">Reward Balance</span>
                            <span className="text-2xl font-black text-[#2D4A73]">{profile?.rewardPoints || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Detail: Phone */}
                    <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-[2rem] border border-transparent hover:border-blue-100 transition-colors">
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-blue-500">
                            <Phone size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</span>
                            <p className="font-bold text-[#2D4A73]">{profile?.phone || 'Not provided'}</p>
                        </div>
                    </div>

                    {/* Contact Detail: Address */}
                    <div className="flex items-center gap-4 bg-gray-50/50 p-6 rounded-[2rem] border border-transparent hover:border-pink-100 transition-colors">
                        <div className="bg-white p-3 rounded-2xl shadow-sm text-pink-500">
                            <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Address</span>
                            <p className="font-bold text-[#2D4A73] line-clamp-1">{profile?.address || 'No address linked'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;