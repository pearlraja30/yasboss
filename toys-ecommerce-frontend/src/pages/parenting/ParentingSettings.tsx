import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Baby, Calendar, Save, Heart } from 'lucide-react';
import { toast } from 'react-toastify';

const ParentingSettings = () => {
    const [profile, setProfile] = useState({ babyName: '', birthDate: '', gender: '' });
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.parentingService.getBabyProfile(user.id);
                if (res.data) setProfile(res.data);
            } catch (e) { console.log("No profile yet"); }
        };
        fetchProfile();
    }, [user.id]);

    const handleSave = async () => {
        try {
            await api.parentingService.saveBabyProfile({ ...profile, userId: user.id });
            toast.success("Profile updated! 🍼");
        } catch (e) { toast.error("Failed to save settings"); }
    };

    return (
        <div className="max-w-2xl mx-auto p-10 pt-32 min-h-screen text-left">
            <h1 className="text-4xl font-black text-[#2D4A73] italic uppercase mb-2">
                Parenting <span className="text-pink-500">Settings</span>
            </h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-12">
                Customize your journey
            </p>

            <div className="space-y-8 bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#2D4A73] uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Baby size={14} /> Baby's Name
                    </label>
                    <input 
                        type="text" 
                        className="w-full p-5 bg-white rounded-2xl outline-none font-bold text-[#2D4A73] shadow-sm"
                        value={profile.babyName}
                        onChange={e => setProfile({...profile, babyName: e.target.value})}
                        placeholder="Enter name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#2D4A73] uppercase tracking-widest ml-2 flex items-center gap-2">
                        <Calendar size={14} /> Date of Birth
                    </label>
                    <input 
                        type="date" 
                        className="w-full p-5 bg-white rounded-2xl outline-none font-bold text-[#2D4A73] shadow-sm"
                        value={profile.birthDate}
                        onChange={e => setProfile({...profile, birthDate: e.target.value})}
                    />
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full py-5 bg-[#2D4A73] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-pink-500 transition-all flex items-center justify-center gap-3"
                >
                    <Save size={18} /> Save Settings
                </button>
            </div>
        </div>
    );
};

export default ParentingSettings;