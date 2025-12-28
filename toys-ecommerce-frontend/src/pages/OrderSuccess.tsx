import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Star, Sparkles, Truck, MapPin } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';

const OrderSuccess: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve Order Data from the Checkout navigation state
    const orderId = location.state?.orderId || "YB-GENERATING...";
    const orderTotal = location.state?.total || 0;
    const shippingAddress = location.state?.address || "Registered Address";
    
    // Logic: Earn 1 point for every ₹100 spent
    const pointsEarned = Math.floor(orderTotal / 100);

    // --- NEW: Logic to Estimate Delivery based on current date ---
    const getEstimatedDelivery = () => {
        const today = new Date();
        const minDate = new Date();
        const maxDate = new Date();
        
        minDate.setDate(today.getDate() + 3); // Min 3 days
        maxDate.setDate(today.getDate() + 5); // Max 5 days
        
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        return `${minDate.toLocaleDateString('en-IN', options)} - ${maxDate.toLocaleDateString('en-IN', options)}`;
    };

    useEffect(() => {
        // Trigger a premium confetti celebration on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
        }, 250);

        // Redirect if someone tries to access this page without an order session
        if (!location.state?.orderId) {
            const timer = setTimeout(() => navigate('/'), 5000);
            return () => clearTimeout(timer);
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20 relative overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full text-center"
            >
                {/* Success Icon Animation */}
                <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-8 shadow-inner"
                >
                    <CheckCircle size={48} className="text-green-500" />
                </motion.div>

                <h1 className="text-5xl font-black text-[#2D4A73] mb-4 tracking-tighter">
                    Woohoo! Order Placed.
                </h1>
                <p className="text-gray-400 text-lg mb-10 font-medium">
                    Your toys are getting ready for their new home. <br/>
                    We've sent a confirmation to your email.
                </p>

                {/* Main Order Info Card */}
                <div className="bg-gray-50 rounded-[3.5rem] p-10 mb-10 border border-gray-100 flex flex-col gap-6 shadow-sm">
                    {/* Order Reference */}
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                            Order Reference
                        </p>
                        <h2 className="text-3xl font-black text-gray-900 tracking-widest uppercase font-mono">
                            {orderId}
                        </h2>
                    </div>

                    <div className="h-[1px] bg-gray-200 w-1/2 mx-auto" />

                    {/* NEW: Delivery Info Section */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
                            <Truck className="text-blue-500" size={20} />
                            <div className="text-left">
                                <span className="text-[8px] font-black text-gray-400 uppercase block tracking-widest">Est. Delivery</span>
                                <span className="text-sm font-black text-[#2D4A73]">{getEstimatedDelivery()}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
                            <MapPin className="text-pink-500" size={20} />
                            <div className="text-left">
                                <span className="text-[8px] font-black text-gray-400 uppercase block tracking-widest">Shipping To</span>
                                <span className="text-sm font-black text-[#2D4A73] truncate max-w-[120px] block">{shippingAddress}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-gray-200 w-1/2 mx-auto" />

                    {/* Loyalty Points Summary */}
                    <div className="flex flex-col items-center">
                        <div className="bg-purple-100 text-purple-600 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-2 tracking-widest">
                            Loyalty Reward
                        </div>
                        <h3 className="text-2xl font-black text-purple-700 flex items-center gap-2">
                            <Star size={24} fill="currentColor" /> +{pointsEarned} Points Earned
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">
                            Will be added to wallet upon delivery
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
                    <button 
                        onClick={() => navigate('/profile/orders')} 
                        className="flex items-center justify-center gap-2 bg-[#2D4A73] text-white px-8 py-5 rounded-2xl font-black transition-all hover:bg-[#1e334f] hover:shadow-xl shadow-blue-100 uppercase text-xs tracking-widest"
                    >
                        <Package size={20} /> Track Live Status
                    </button>
                    <Link 
                        to="/" 
                        className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-100 px-8 py-5 rounded-2xl font-black transition-all hover:bg-gray-50 uppercase text-xs tracking-widest"
                    >
                        <ShoppingBag size={20} /> Shop More Toys <ArrowRight size={20} />
                    </Link>
                </div>

                {/* Gamified Upsell */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <Link 
                        to="/quiz" 
                        className="inline-flex items-center gap-2 text-pink-600 font-black text-xs uppercase tracking-widest hover:text-pink-700 transition-all group"
                    >
                        <Sparkles size={16} className="group-hover:rotate-12 transition-transform" /> 
                        Win more points? Play the Toy Quiz while you wait 
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default OrderSuccess;