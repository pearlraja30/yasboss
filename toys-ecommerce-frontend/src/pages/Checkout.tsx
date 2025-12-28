import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldCheck, ArrowLeft, Loader2, Sparkles, Tag, Phone, CheckCircle2, Truck, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api'; 

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [address, setAddress] = useState({ street: '', city: '', zip: '', phone: '' });
    
    // --- Success Modal State ---
    const [showSuccess, setShowSuccess] = useState(false);
    const [placedOrderData, setPlacedOrderData] = useState<any>(null);

    // --- Loyalty & Rewards State ---
    const [usePoints, setUsePoints] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const pointValue = 0.25; 

    // --- Coupon State ---
    const [couponCode, setCouponCode] = useState("");
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    useEffect(() => {
        const syncUserData = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                toast.warn("Please login to checkout");
                navigate('/login');
                return;
            }

            try {
                const profile = await api.userService.getProfile();
                setUserPoints(profile.rewardPoints || 0);
                setAddress(prev => ({
                    ...prev,
                    street: profile.address || '',
                    phone: profile.phone || '' 
                }));
            } catch (err) {
                console.error("Failed to sync profile for checkout");
            }
        };

        syncUserData();
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
    }, [navigate]);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountFromCoupon = (subtotal * couponDiscount) / 100;
    const taxableAmount = subtotal - discountFromCoupon;
    const gstTotal = taxableAmount * 0.18; 
    const deliveryCharge = subtotal >= 500 ? 0 : 49;
    const discountFromPoints = usePoints ? Math.min(taxableAmount, userPoints * pointValue) : 0;
    const total = taxableAmount + deliveryCharge - discountFromPoints;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsValidatingCoupon(true);
        try {
            const data = await api.couponService.validateCoupon(couponCode, subtotal);
            setCouponDiscount(data.discountPercent);
            toast.success(`Coupon Applied! ${data.discountPercent}% off`);
        } catch (err: any) {
            toast.error(err.response?.data || "Invalid or expired coupon");
            setCouponDiscount(0);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const orderData = {
                productName: cartItems.map(i => i.name).join(", "),
                totalAmount: total,
                paymentMethod: "UPI/CARD", 
                address: `${address.street}, ${address.city}, ${address.zip}`
            };

            // Backend returns the Order object containing the generated orderId
            const response = await api.orderService.createOrder(orderData);
            
            setPlacedOrderData(response);
            localStorage.removeItem('cart');
            setShowSuccess(true); // Open the success modal
        } catch (err) {
            toast.error("Checkout failed. Please check your network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F8F9FA] min-h-screen py-20 px-4">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                <div className="lg:col-span-8 space-y-8">
                    <Link to="/cart" className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#2D4A73] transition-colors">
                        <ArrowLeft size={16} /> Edit My Bag
                    </Link>

                    {/* Shipping Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><MapPin size={24} /></div>
                            <h2 className="text-2xl font-black text-[#2D4A73]">Shipping Detail</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Street Address" className="col-span-2 p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
                            <input type="text" placeholder="City" className="p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
                            <input type="text" placeholder="ZIP" className="p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})} />
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input readOnly type="text" className="w-full pl-12 p-5 bg-gray-100/50 text-gray-400 rounded-2xl border-none font-bold outline-none cursor-not-allowed" value={address.phone} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Loyalty Toggle */}
                    <motion.div className="bg-gradient-to-br from-[#2D4A73] to-[#1e334f] rounded-[3rem] p-10 shadow-xl text-white flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-black mb-1">Redeem Rewards</h3>
                            <p className="text-blue-200 font-bold uppercase text-[10px] tracking-widest">Available Points: {userPoints}</p>
                        </div>
                        <button onClick={() => setUsePoints(!usePoints)} className={`w-16 h-8 rounded-full relative transition-all ${usePoints ? 'bg-green-500' : 'bg-[#0a1526]'}`}>
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${usePoints ? 'left-9' : 'left-1'}`} />
                        </button>
                    </motion.div>
                </div>

                {/* Order Summary Sidebar */}
                <div className="lg:col-span-4">
                    <div className="sticky top-32 bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Summary</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-500 font-bold"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-500 font-bold"><span>Total</span><span className="text-3xl font-black text-[#2D4A73]">₹{total.toFixed(2)}</span></div>
                        </div>
                        <button onClick={handlePlaceOrder} disabled={loading || !address.street} className="w-full bg-[#2D4A73] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl hover:bg-[#1e334f] transition-all disabled:opacity-50">
                            {loading ? <Loader2 className="animate-spin" /> : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- ORDER SUCCESS MODAL --- */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D4A73]/60 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[3.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
                            <Sparkles className="absolute top-[-20px] left-[-20px] text-blue-50 opacity-50" size={150} />
                            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 size={48} />
                            </div>
                            <h2 className="text-4xl font-black text-[#2D4A73] mb-3 tracking-tighter">Order Placed!</h2>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-8">
                                Order Ref: <span className="text-pink-600">{placedOrderData?.orderId}</span>
                            </p>
                            <div className="bg-gray-50 rounded-3xl p-6 mb-8 text-left">
                                <div className="flex items-center gap-3 mb-2">
                                    <Truck size={18} className="text-[#2D4A73]" />
                                    <span className="text-xs font-black text-[#2D4A73] uppercase tracking-tighter">Shipping Status</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Your package is being prepared. Track live status in your profile.</p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <button onClick={() => navigate('/profile/orders')} className="w-full bg-[#2D4A73] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:bg-[#1e334f] flex items-center justify-center gap-3">
                                    Track My Order <ArrowRight size={20} />
                                </button>
                                <button onClick={() => navigate('/')} className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-[#2D4A73]">Back to Home</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;