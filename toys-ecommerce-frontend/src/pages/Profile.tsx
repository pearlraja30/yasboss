import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Trophy, History, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { toast } from 'react-toastify';
import ProfileOverview from '../components/ProfileOverview';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ✨ THE FIX: Check for token BEFORE fetching
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.warn("No token found, redirecting to login...");
            navigate('/login', { replace: true });
            return;
        }
        fetchLatestProfile();
    }, [navigate]);

    const fetchLatestProfile = async () => {
        try {
            setLoading(true);
            const data = await api.userService.getProfile();
            setUserData(data);
            
            localStorage.setItem('user', JSON.stringify(data));
            window.dispatchEvent(new Event("storage"));
        } catch (err: any) {
            console.error("Profile Sync Error:", err);
            // If session is actually invalid, clear and redirect
            if (err.response?.status === 403 || err.response?.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('user');
                toast.error("Session expired. Please login again.");
                navigate('/login', { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    const navLinks = [
        { name: 'Order History', icon: ShoppingBag, to: 'orders' },
        { name: 'Reward Tracker', icon: Trophy, to: 'rewards' },
        { name: 'Account Details', icon: User, to: 'details' },
        { name: 'Saved Addresses', icon: MapPin, to: 'addresses' },
    ];

    const isBaseProfilePath = location.pathname === '/profile' || location.pathname === '/profile/';

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
            <Loader2 className="animate-spin text-[#2D4A73]" size={48} />
        </div>
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-4">
                
                <div className="mb-12">
                    <ProfileOverview />
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-72 flex-shrink-0">
                        <div className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-32">
                            <nav className="space-y-1">
                                {navLinks.map(link => (
                                    <NavLink
                                        key={link.name}
                                        to={link.to}
                                        className={({ isActive }) =>
                                            `flex items-center p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                                isActive 
                                                ? 'bg-[#2D4A73] text-white shadow-lg' 
                                                : 'text-gray-500 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <link.icon size={18} className="mr-3" />
                                        {link.name}
                                    </NavLink>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="flex-1">
                        <motion.div 
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 min-h-[600px]"
                        >
                            {isBaseProfilePath ? (
                                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                                    <div className="w-24 h-24 bg-gray-50 text-[#2D4A73] rounded-full flex items-center justify-center mb-6">
                                        <History size={40} />
                                    </div>
                                    <h3 className="text-3xl font-black text-[#2D4A73]">Ready for an adventure?</h3>
                                    <p className="text-gray-400 mt-3 font-bold uppercase text-[10px] tracking-[0.2em] max-w-xs mx-auto">
                                        Check your recent orders or track your points to unlock new rewards!
                                    </p>
                                    
                                    <div className="mt-10 flex gap-4">
                                        <div className="px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <span className="text-[10px] font-black text-gray-400 block uppercase mb-1">Shipping Status</span>
                                            <span className="text-sm font-bold text-[#2D4A73]">
                                                {userData?.address ? 'Verified ✓' : 'Address Required ✗'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Outlet /> 
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;