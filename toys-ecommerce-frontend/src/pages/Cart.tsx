import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Loader2, 
    ShieldCheck, Truck, CreditCard, Sparkles, Undo2, SearchX,
    ArrowRight, Info, Percent
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../services/api'; 

const Cart = () => {
    const [cart, setCart] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // ✨ Dynamic Configuration States
    const [globalSettings, setGlobalSettings] = useState({
        TAX_PERCENTAGE: 18,
        FREE_DELIVERY_THRESHOLD: 500
    });

    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userEmail = localStorage.getItem('userEmail') || user?.email;
    const token = localStorage.getItem('jwtToken'); 

    useEffect(() => {
        const initCart = async () => {
            if (userEmail && token) {
                try {
                    // Fetch current store rules from common api service
                    const settings = await api.adminService.getGlobalSettings();
                    setGlobalSettings({
                        TAX_PERCENTAGE: parseInt(settings.TAX_PERCENTAGE || '18'),
                        FREE_DELIVERY_THRESHOLD: parseInt(settings.FREE_DELIVERY_THRESHOLD || '500')
                    });
                } catch (e) {
                    console.error("Settings load failed, using defaults");
                }
                fetchCart();
            } else {
                setLoading(false);
            }
        };
        initCart();
    }, [userEmail, token]);

    const fetchCart = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/cart', {
                headers: { 
                    'X-User-Email': userEmail,
                    'Authorization': `Bearer ${token}` 
                }
            });
            setCart(res.data);
            localStorage.setItem('cartCount', res.data?.items?.length || '0');
            window.dispatchEvent(new Event('storage'));
        } catch (error: any) {
            console.error("Cart fetch error:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem('jwtToken');
                setLoading(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityUpdate = async (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            await axios.put(`http://localhost:8080/api/cart/update-quantity`, {
                productId: productId,
                quantity: newQuantity
            }, {
                headers: { 
                    'X-User-Email': userEmail,
                    'Authorization': `Bearer ${token}` 
                }
            });
            fetchCart(); 
        } catch (error) {
            toast.error("Failed to update quantity.");
        }
    };

    const handleRemove = async (itemId: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/cart/item/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Removed from bag");
            fetchCart(); 
        } catch (error) {
            toast.error("Could not remove item.");
        }
    };

    // --- 🧮 CENTRALIZED DYNAMIC CALCULATIONS ---
    // We use the logic defined in our advanced api service
    const cartData = cart?.items ? api.cartService.calculateCartTotals(
        cart.items.map((item: any) => ({ price: item.product.sellingPrice, quantity: item.quantity })),
        globalSettings.TAX_PERCENTAGE,
        globalSettings.FREE_DELIVERY_THRESHOLD
    ) : { subtotal: 0, taxAmount: 0, shipping: 49, grandTotal: 0 };

    const { subtotal, taxAmount, shipping, grandTotal } = cartData;

    // ✨ Savings Progress Calculations
    const remainingForFree = Math.max(0, globalSettings.FREE_DELIVERY_THRESHOLD - subtotal);
    const progressPercent = Math.min(100, (subtotal / globalSettings.FREE_DELIVERY_THRESHOLD) * 100);

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
            <Loader2 className="animate-spin text-[#2D4A73] mb-4" size={48} />
            <p className="text-[#2D4A73] font-black uppercase text-[10px] tracking-widest italic">Opening discovery box...</p>
        </div>
    );

    if (!userEmail || !token) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8 text-gray-300">
                <ShoppingBag size={48} />
            </div>
            <h2 className="text-3xl font-black text-[#2D4A73] mb-4 tracking-tighter uppercase italic">Discovery box is locked!</h2>
            <p className="text-gray-400 font-medium mb-10 leading-relaxed max-w-sm">Login to save your favorite toys and track your items across all your devices.</p>
            <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
                <Link to="/login" className="bg-[#2D4A73] text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-50 hover:bg-[#1e334f] transition-all">
                    Sign In Now
                </Link>
                <button onClick={() => navigate(-1)} className="text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-[#2D4A73]">
                    <ArrowLeft size={14} className="inline mr-2" /> Go Back
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen pt-32 pb-20 px-6 text-left">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-[#2D4A73] tracking-tighter italic uppercase">Shopping Bag</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
                            {cart?.items?.length || 0} Magic Items Found
                        </p>
                    </div>
                </div>

                {(!cart || cart.items.length === 0) ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-24 rounded-[4rem] text-center shadow-sm border border-gray-100">
                        <SearchX size={64} className="mx-auto text-gray-100 mb-6" />
                        <h2 className="text-2xl font-black text-[#2D4A73] mb-2">Your box is empty!</h2>
                        <p className="text-gray-400 font-medium mb-10">Discover something magical to fill it up.</p>
                        <button onClick={() => navigate('/products')} className="bg-[#2D4A73] text-white px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-all">Start Exploring</button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
                        <div className="lg:col-span-8 space-y-6">
                            
                            {/* ✨ SAVINGS PROGRESS BAR ✨ */}
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-8 rounded-[3rem] border border-blue-50 shadow-sm relative overflow-hidden group"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${remainingForFree === 0 ? 'bg-green-100 text-green-600' : 'bg-blue-50 text-blue-600'} transition-colors`}>
                                            <Truck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[#2D4A73] uppercase tracking-tighter">
                                                {remainingForFree === 0 ? "You've unlocked FREE Delivery!" : "Free Delivery Progress"}
                                            </h4>
                                            <p className="text-[10px] font-bold text-gray-400">
                                                {remainingForFree > 0 
                                                    ? `Add ₹${remainingForFree.toLocaleString()} more to save on shipping` 
                                                    : "Your shipping costs are covered by us! 🎁"}
                                            </p>
                                        </div>
                                    </div>
                                    {remainingForFree > 0 && (
                                        <span className="text-xs font-black text-[#2D4A73]">{Math.round(progressPercent)}%</span>
                                    )}
                                </div>
                                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full ${remainingForFree === 0 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-gradient-to-r from-blue-400 to-[#2D4A73]'}`}
                                    />
                                </div>
                            </motion.div>

                            <AnimatePresence mode="popLayout">
                                {cart.items.map((item: any) => (
                                    <motion.div 
                                        key={item.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                        className="bg-white p-6 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col md:flex-row items-center gap-8 group hover:shadow-xl transition-all duration-500"
                                    >
                                        <div className="w-40 h-40 bg-gray-50 rounded-[2.5rem] overflow-hidden p-4">
                                            <img src={`http://localhost:8080${item.product.imageUrl}`} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={item.product.name} />
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1 block">{item.product.category}</span>
                                            <h3 className="text-xl font-black text-[#2D4A73] mb-4 leading-tight">{item.product.name}</h3>
                                            <div className="flex flex-col md:flex-row items-center gap-6">
                                                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 shadow-inner">
                                                    <button onClick={() => handleQuantityUpdate(item.product.id, item.quantity - 1)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all"><Minus size={16}/></button>
                                                    <span className="font-black text-lg text-[#2D4A73] w-6 text-center">{item.quantity}</span>
                                                    <button onClick={() => handleQuantityUpdate(item.product.id, item.quantity + 1)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-blue-500 transition-all"><Plus size={16}/></button>
                                                </div>
                                                <button onClick={() => handleRemove(item.id)} className="text-[10px] font-black text-gray-300 hover:text-red-500 uppercase tracking-widest flex items-center gap-2 transition-colors">
                                                    <Trash2 size={16}/> Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="text-right pr-4">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Item Total</p>
                                            <p className="text-2xl font-black text-[#2D4A73]">₹{(item.product.sellingPrice * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="lg:col-span-4 sticky top-32">
                            <div className="bg-white p-10 rounded-[4rem] shadow-2xl border border-gray-50 relative overflow-hidden">
                                <h2 className="text-2xl font-black text-[#2D4A73] mb-8 uppercase italic tracking-tighter">Summary</h2>
                                
                                <div className="space-y-4 mb-10 pb-10 border-b border-gray-100">
                                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span>Cart Subtotal</span>
                                        <span className="text-[#2D4A73]">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span className="flex items-center gap-1">Estimated GST ({globalSettings.TAX_PERCENTAGE}%) <Info size={12} className="opacity-50" /></span>
                                        <span className="text-[#2D4A73]">₹{taxAmount.toLocaleString()}</span>
                                    </div>

                                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <span>Delivery Fee</span>
                                        <span className={shipping === 0 ? "text-green-500 font-bold tracking-tighter" : "text-[#2D4A73]"}>
                                            {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mb-12 text-[#2D4A73]">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Total Payable</span>
                                        <span className="text-[8px] font-bold text-gray-400 lowercase italic tracking-tighter">Tax inclusive price</span>
                                    </div>
                                    <span className="text-4xl font-black tracking-tighter">₹{grandTotal.toLocaleString()}</span>
                                </div>

                                <button onClick={() => navigate('/checkout')} className="w-full bg-[#2D4A73] text-white py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#1e334f] transition-all flex items-center justify-center gap-4 active:scale-95">
                                    Secure Checkout <ArrowRight size={20} />
                                </button>
                                
                                <div className="mt-6 flex items-center justify-center gap-3">
                                    <ShieldCheck size={16} className="text-green-500" />
                                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Safe & Secure Payments</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;