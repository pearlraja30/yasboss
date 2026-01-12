import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, 
    MapPin, Phone, Github, Chrome, ShieldCheck, Sparkles,
    Facebook, Instagram, Twitter
} from 'lucide-react';
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

    // 🌐 Redirect to Spring Boot OAuth2 Endpoints
    const handleSocialLogin = (provider: string) => {
        // This triggers the Spring Security OAuth2 flow for the specific provider
        window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const authPayload = isLogin 
                ? { email: formData.email.trim(), password: formData.password }
                : { ...formData, email: formData.email.trim() };

            const response = isLogin 
                ? await authService.login(authPayload) 
                : await authService.register(authPayload);
            
            if (response && response.token) {
                localStorage.setItem('jwtToken', response.token);
                localStorage.setItem('userEmail', response.user.email);
                
                const fullProfile = await userService.getProfile();
                localStorage.setItem('user', JSON.stringify(fullProfile));

                window.dispatchEvent(new Event("user-login"));
                window.dispatchEvent(new Event("storage"));

                toast.success(`Welcome back, ${fullProfile.fullName}!`);

                if (fullProfile.role === 'ADMIN') {
                    window.location.href = '/admin/orders';
                } else {
                    const redirectTo = localStorage.getItem('redirectAfterLogin');
                    if (redirectTo) {
                        localStorage.removeItem('redirectAfterLogin');
                        navigate(redirectTo, { replace: true });
                    } else {
                        navigate('/profile', { replace: true });
                    }
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Magic Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100 rounded-full blur-[120px] opacity-40" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl rounded-[3.5rem] p-10 shadow-2xl border border-white relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-[#2D4A73] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20">
                        <ShieldCheck className="text-white" size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-[#2D4A73] tracking-tighter uppercase italic">
                        {isLogin ? 'Hello Explorer!' : 'Create Account'}
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
                        {isLogin ? 'Enter your toy kingdom' : 'Start your magical journey'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <AnimatePresence mode='wait'>
                        {!isLogin && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }} 
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input 
                                        required type="text" placeholder="Full Name" 
                                        className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            required type="tel" placeholder="Mobile" 
                                            className="w-full pl-10 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        <input 
                                            required type="text" placeholder="Pincode" 
                                            className="w-full pl-10 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                            required type="email" placeholder="Email Address" 
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
                            className="w-full pl-12 pr-12 py-4 bg-white/50 border border-gray-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
                        className="w-full bg-[#2D4A73] text-white py-5 rounded-[2.5rem] font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                {/* 🛡️ Social Logins */}
                <div className="relative my-10">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                    <div className="relative flex justify-center text-[9px] uppercase font-black text-gray-300 tracking-[0.3em]">
                        <span className="bg-white px-4">Social Gateways</span>
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-3">
                    <button 
                        onClick={() => handleSocialLogin('google')}
                        className="flex items-center justify-center p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                        title="Google"
                    >
                        <Chrome size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('facebook')}
                        className="flex items-center justify-center p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                        title="Facebook"
                    >
                        <Facebook size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('twitter')}
                        className="flex items-center justify-center p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                        title="X (Twitter)"
                    >
                        <Twitter size={18} className="text-black group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('instagram')}
                        className="flex items-center justify-center p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                        title="Instagram"
                    >
                        <Instagram size={18} className="text-pink-600 group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                        onClick={() => handleSocialLogin('github')}
                        className="flex items-center justify-center p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm group"
                        title="GitHub"
                    >
                        <Github size={18} className="text-slate-800 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="text-center mt-10">
                    <button 
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[11px] font-black text-pink-600 hover:text-pink-700 transition-colors uppercase tracking-[0.2em]"
                    >
                        {isLogin ? "New Explorer? Create Account" : "Wanderer returning? Sign In"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;