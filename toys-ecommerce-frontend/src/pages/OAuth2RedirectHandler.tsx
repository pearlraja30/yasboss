import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api'; // Changed to your centralized api import
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchAndSyncUser = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (token) {
                // 1. Save the JWT Token immediately
                localStorage.setItem('jwtToken', token);
                
                try {
                    // 2. Fetch the full user profile using the new token
                    // Using your centralized api service structure
                    const user = await api.userService.getProfile();
                    
                    // 3. Store user details for the Milestone Tracker and Parenting Hub
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('userEmail', user.email);
                    
                    // 4. Trigger global events to update Header/Nav components
                    window.dispatchEvent(new Event("user-login"));
                    window.dispatchEvent(new Event("storage"));
                    
                    toast.success(`Welcome back, ${user.fullName || 'Parent'}! ✨`);
                    
                    // 5. Redirect to the Parenting Hub as the primary landing spot
                    navigate('/parenting');
                } catch (error) {
                    console.error("Profile Sync Error:", error);
                    toast.error("Failed to sync your profile. Please login manually.");
                    localStorage.removeItem('jwtToken');
                    navigate('/login');
                }
            } else {
                toast.error("Social authentication failed.");
                navigate('/login');
            }
        };

        fetchAndSyncUser();
    }, [navigate, location]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            {/* Using your project's Loader2 icon for brand consistency */}
            <Loader2 className="animate-spin text-pink-500 mb-4" size={48} />
            <h2 className="text-xl font-black text-[#2D4A73] italic uppercase tracking-widest animate-pulse">
                Syncing your memories...
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">
                Connecting to YasBoss Parenting Securely
            </p>
        </div>
    );
};

export default OAuth2RedirectHandler;