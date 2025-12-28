import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Home, MapPin, Loader2 } from 'lucide-react';
import api from '../services/api';

const SavedAddresses: React.FC = () => {
    const [userAddress, setUserAddress] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAddress = async () => {
            try {
                // Identify user via JWT token
                const profile = await api.userService.getProfile();
                setUserAddress(profile.address || "No address saved yet.");
            } catch (err) {
                console.error("Failed to load address");
            } finally {
                setLoading(false);
            }
        };
        fetchAddress();
    }, []);

    if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

    return (
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black text-[#2D4A73]">My Address</h2>
                <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-5 py-2 rounded-xl font-bold text-sm">
                    <MapPin size={16} /> Update Location
                </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-100 p-8 rounded-[2rem] bg-gray-50/50">
                <div className="flex items-start gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <Home className="text-pink-600" size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered Address</span>
                        <p className="text-xl font-bold text-[#2D4A73] mt-1">
                            {userAddress}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavedAddresses;