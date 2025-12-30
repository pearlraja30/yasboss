import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, MapPin, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services/api';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 
    
    const [formData, setFormData] = useState({ 
        email: '', 
        password: '', 
        fullName: '',
        address: '',
        phone: '' 
    });
    
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Prepare Payload correctly based on mode
            const authData = isLogin 
                ? { email: formData.email.trim(), password: formData.password }
                : { ...formData, email: formData.email.trim() };

            // 2. Execute Auth
            const response = isLogin 
                ? await authService.login(authData) 
                : await authService.register(authData);
            
            if (response && response.token) {
                // 3. ✨ CRITICAL FIX: Save Token AND Email separately
                // OrderHistory.tsx requires 'userEmail' to avoid redirecting to login.
                localStorage.setItem('jwtToken', response.token);
                localStorage.setItem('userEmail', formData.email.trim());
                
                // 4. ✨ The Sync Fix: Await the profile fetch
                // This ensures we have the role and full data before redirecting.
                try {
                    const fullProfile = await userService.getProfile();
                    localStorage.setItem('user', JSON.stringify(fullProfile));
                    
                    // Double-check storage has the correct email from the database profile
                    localStorage.setItem('userEmail', fullProfile.email);
                    
                    // Trigger global storage update for the Header and other listeners
                    window.dispatchEvent(new Event("storage"));
                    
                    toast.success(`Welcome, ${fullProfile.fullName || 'User'}!`);

                    // 5. Role-Based Redirect
                    if (fullProfile.role === 'ADMIN') {
                        // Use window.location for Admin to ensure a clean state reload
                        window.location.href = '/admin/orders';
                    } else {
                        // Regular users go to profile
                        navigate('/profile', { replace: true });
                    }
                } catch (profileErr) {
                    console.error("Profile sync failed, redirecting to home:", profileErr);
                    navigate('/', { replace: true });
                }
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (err: any) {
            console.error("Auth Error Details:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || "Authentication failed. Check your credentials.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 py-20">
            <motion.div layout className="max-w-md w-full bg-white rounded-[3.5rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-[#2D4A73] tracking-tighter uppercase italic">
                            {isLogin ? 'Hello Again!' : 'Join Us'}
                        </h2>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }} 
                                    animate={{ opacity: 1, height: 'auto' }} 
                                    exit={{ opacity: 0, height: 0 }} 
                                    className="space-y-4"
                                >
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input 
                                            required type="text" placeholder="Full Name" 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input 
                                            required type="tel" placeholder="Mobile Number" 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                        <input 
                                            required type="text" placeholder="Shipping Address" 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input 
                                required type="email" placeholder="Email Address" 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input 
                                required 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password" 
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2D4A73]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2D4A73] text-white py-5 rounded-[2.5rem] font-black text-lg shadow-xl hover:bg-[#1e334f] transition-all flex items-center justify-center gap-3 mt-6 disabled:opacity-50 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Get Started')}
                            {!loading && <ArrowRight size={22} />}
                        </button>
                    </form>

                    <div className="text-center mt-8">
                        <button 
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setFormData({ email: '', password: '', fullName: '', address: '', phone: '' });
                            }}
                            className="text-sm font-black text-pink-600 hover:text-pink-700 transition-colors uppercase tracking-widest"
                        >
                            {isLogin ? "New Explorer? Create Account" : "Wanderer returning? Login"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;