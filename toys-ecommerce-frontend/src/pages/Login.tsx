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
            const authData = isLogin 
                ? { email: formData.email.trim(), password: formData.password }
                : { ...formData, email: formData.email.trim() };

            const response = isLogin 
                ? await authService.login(authData) 
                : await authService.register(authData);
            
            if (response && response.token) {
                // ✨ STEP 1: Immediate Storage Lock
                // We save these BEFORE calling any other service to ensure 
                // the API Interceptor has the token for the Profile call.
                localStorage.setItem('jwtToken', response.token);
                localStorage.setItem('userEmail', formData.email.trim());
                
                // ✨ STEP 2: Profile Sync
                try {
                    const fullProfile = await userService.getProfile();
                    
                    // Finalize storage with verified data from DB
                    localStorage.setItem('user', JSON.stringify(fullProfile));
                    localStorage.setItem('userEmail', fullProfile.email);
                    
                    // Force a storage event to wake up the Header/App listeners
                    window.dispatchEvent(new Event("storage"));
                    
                    toast.success(`Welcome back, ${fullProfile.fullName}!`);

                    // ✨ STEP 3: Controlled Navigation
                    // Use window.location for Admin to break any stale state loops
                    setTimeout(() => {
                        if (fullProfile.role === 'ADMIN') {
                            window.location.href = '/admin/orders'; // Force reload for Admin
                        } else {
                            navigate('/profile', { replace: true }); // 'replace' stops back-button loops
                        }
                    }, 100);
                } catch (profileErr) {
                    console.error("Profile sync failed:", profileErr);
                    // Fallback: proceed to profile even if full data isn't synced yet
                    navigate('/profile', { replace: true });
                }
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (err: any) {
            console.error("Auth Error:", err);
            const errorMsg = err.response?.data?.message || "Login failed. Please check credentials.";
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