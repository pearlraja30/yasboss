import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MapPin, ArrowLeft, Loader2, Sparkles, Phone, 
    CheckCircle2, Truck, ArrowRight, Info, Ticket, Tag, XCircle, Gift, CreditCard, ChevronDown, MessageSquare
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api'; 

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    
    // --- ✨ NEW: Global Settings States ---
    const [globalSettings, setGlobalSettings] = useState({
        RETURN_WINDOW_DAYS: 7,
        FREE_DELIVERY_THRESHOLD: 500,
        TAX_PERCENTAGE: 18
    });

    // --- ✨ NEW: Address Management States ---
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [showAddressSelector, setShowAddressSelector] = useState(false);
    const [address, setAddress] = useState({ street: '', city: '', zip: '', phone: '' });
    
    // --- ✨ NEW: Gift & Billing States ---
    const [isGift, setIsGift] = useState(false);
    const [giftMessage, setGiftMessage] = useState(''); // Added personal note
    const [differentBilling, setDifferentBilling] = useState(false);
    const [billingAddress, setBillingAddress] = useState('');
    
    const [customerNotes, setCustomerNotes] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [placedOrderData, setPlacedOrderData] = useState<any>(null);

    const [usePoints, setUsePoints] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const pointValue = 0.25; 

    const [couponCode, setCouponCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [validCouponRef, setValidCouponRef] = useState<string | null>(null);

    useEffect(() => {
        const syncUserData = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                toast.warn("Please login to checkout");
                navigate('/login');
                return;
            }

            try {
                // ✨ NEW: Fetch Global Settings (Tax & Thresholds)
                const settings = await api.adminService.getGlobalSettings();
                setGlobalSettings({
                    RETURN_WINDOW_DAYS: parseInt(settings.RETURN_WINDOW_DAYS || '7'),
                    FREE_DELIVERY_THRESHOLD: parseInt(settings.FREE_DELIVERY_THRESHOLD || '500'),
                    TAX_PERCENTAGE: parseInt(settings.TAX_PERCENTAGE || '18')
                });

                // Fetch User Profile
                const profile = await api.userService.getProfile();
                setUserPoints(profile.rewardPoints || 0);

                // ✨ NEW: Fetch Saved Addresses
                const addresses = await api.userService.getAddresses();
                setSavedAddresses(addresses || []);

                // Find default address to pre-fill
                const defaultAddr = addresses?.find((a: any) => a.isDefault);
                if (defaultAddr) {
                    setAddress({
                        street: defaultAddr.street,
                        city: defaultAddr.city,
                        zip: defaultAddr.zip,
                        phone: defaultAddr.phone
                    });
                } else {
                    // Fallback to profile data if no address records exist
                    setAddress(prev => ({
                        ...prev,
                        street: profile.address || '',
                        phone: profile.phone || '' 
                    }));
                }
            } catch (err) {
                console.error("Failed to sync profile for checkout");
            }
        };

        syncUserData();
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(savedCart);
    }, [navigate]);

    const selectSavedAddress = (addr: any) => {
        setAddress({
            street: addr.street,
            city: addr.city,
            zip: addr.zip,
            phone: addr.phone
        });
        setShowAddressSelector(false);
        toast.info(`Using: ${addr.fullName}'s Address`);
    };

    // --- 🧮 DYNAMIC CALCULATIONS ---
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // ✨ Use dynamic threshold from settings instead of hardcoded 500
    const deliveryCharge = subtotal >= globalSettings.FREE_DELIVERY_THRESHOLD ? 0 : 49;
    
    const taxableAfterCoupon = Math.max(0, subtotal - appliedDiscount);
    
    // ✨ Calculate GST based on dynamic percentage from Admin Settings
    const taxAmount = (taxableAfterCoupon * globalSettings.TAX_PERCENTAGE) / 100;
    
    const discountFromPoints = usePoints ? Math.min(taxableAfterCoupon + taxAmount, userPoints * pointValue) : 0;
    
    // ✨ Grand Total now includes dynamic Tax
    const finalTotal = taxableAfterCoupon + taxAmount + deliveryCharge - discountFromPoints;

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsValidatingCoupon(true);
        try {
            const discountAmount = await api.couponService.validateCoupon(couponCode, subtotal);
            setAppliedDiscount(discountAmount);
            setValidCouponRef(couponCode.toUpperCase());
            toast.success(`Coupon Applied! ₹${discountAmount} off`);
        } catch (err: any) {
            setAppliedDiscount(0);
            setValidCouponRef(null);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedDiscount(0);
        setValidCouponRef(null);
        setCouponCode("");
        toast.info("Coupon removed");
    };

    const handleConfirmOrder = async () => {
        const token = localStorage.getItem('jwtToken');
        const email = localStorage.getItem('userEmail');

        if (!token || !email) {
            toast.error("Session expired. Please log in again.");
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const fullShippingAddress = `${address.street}, ${address.city}, ${address.zip}`;

            const orderData = {
                items: cartItems,
                totalAmount: finalTotal,
                taxAmount: taxAmount, // ✨ Pass calculated tax to backend
                shippingAddress: fullShippingAddress,
                billingAddress: differentBilling ? billingAddress : fullShippingAddress,
                isGift: isGift,
                giftMessage: giftMessage, // Pass the personal note
                email: email,
                paymentMethod: "UPI/CARD",
                customerNotes: customerNotes,
                couponCode: validCouponRef,
                pointsUsed: usePoints ? userPoints : 0
            };

            const response = await api.orderService.createOrder(orderData);

            if (response) {
                setPlacedOrderData(response);
                localStorage.removeItem('cart');
                setShowSuccess(true);
                toast.success("Order confirmed!");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Checkout failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#F8F9FA] min-h-screen py-20 px-4 text-left">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                <div className="lg:col-span-8 space-y-8">
                    <Link to="/cart" className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#2D4A73] transition-colors">
                        <ArrowLeft size={16} /> Edit My Bag
                    </Link>

                    {/* Shipping Section */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><MapPin size={24} /></div>
                                <h2 className="text-2xl font-black text-[#2D4A73]">Shipping Detail</h2>
                            </div>
                            
                            {/* ✨ NEW: Saved Address Selector Dropdown */}
                            {savedAddresses.length > 0 && (
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowAddressSelector(!showAddressSelector)}
                                        className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#2D4A73] border border-gray-100 hover:bg-gray-100 transition-all"
                                    >
                                        Use Saved Address <ChevronDown size={14} />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {showAddressSelector && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full right-0 w-72 mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-50"
                                            >
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Your Locations</p>
                                                {savedAddresses.map((addr) => (
                                                    <button 
                                                        key={addr.id}
                                                        onClick={() => selectSavedAddress(addr)}
                                                        className="w-full text-left p-4 hover:bg-blue-50 rounded-2xl transition-all group"
                                                    >
                                                        <p className="text-xs font-black text-[#2D4A73]">{addr.fullName}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold truncate">{addr.street}, {addr.city}</p>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Street Address" className="col-span-2 p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={address.street} onChange={(e) => setAddress({...address, street: e.target.value})} />
                            <input type="text" placeholder="City" className="p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} />
                            <input type="text" placeholder="ZIP" className="p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" value={address.zip} onChange={(e) => setAddress({...address, zip: e.target.value})} />
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input type="text" className="w-full pl-12 p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} />
                            </div>
                        </div>

                        {/* ✨ GIFT & BILLING OPTIONS ✨ */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                                onClick={() => setIsGift(!isGift)}
                                className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${isGift ? 'border-pink-500 bg-pink-50' : 'border-gray-50 bg-gray-50'}`}
                            >
                                <div className={`p-2 rounded-xl ${isGift ? 'bg-pink-500 text-white' : 'bg-white text-gray-300'}`}>
                                    <Gift size={20} />
                                </div>
                                <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isGift ? 'text-pink-600' : 'text-gray-400'}`}>This is a gift</p>
                                    <p className="text-[9px] font-bold text-gray-400">Hide prices on invoice</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setDifferentBilling(!differentBilling)}
                                className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${differentBilling ? 'border-[#2D4A73] bg-blue-50' : 'border-gray-50 bg-gray-50'}`}
                            >
                                <div className={`p-2 rounded-xl ${differentBilling ? 'bg-[#2D4A73] text-white' : 'bg-white text-gray-300'}`}>
                                    <CreditCard size={20} />
                                </div>
                                <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${differentBilling ? 'text-[#2D4A73]' : 'text-gray-400'}`}>Different Billing</p>
                                    <p className="text-[9px] font-bold text-gray-400">Use a different address</p>
                                </div>
                            </button>
                        </div>

                        {/* ✨ Conditional Sections for Gift Message and Billing Address ✨ */}
                        <AnimatePresence>
                            {isGift && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 text-left">
                                    <label className="flex items-center gap-2 text-[9px] font-black text-pink-500 uppercase tracking-widest ml-2 mb-2">
                                        <MessageSquare size={12} /> Gift Message
                                    </label>
                                    <textarea 
                                        placeholder="Add a sweet note for the child... (e.g. Happy Birthday Champ!)" 
                                        className="w-full p-5 bg-pink-50/30 border-2 border-pink-100 rounded-[2rem] outline-none font-medium text-pink-700"
                                        value={giftMessage}
                                        onChange={(e) => setGiftMessage(e.target.value)}
                                    />
                                </motion.div>
                            )}
                            
                            {differentBilling && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 overflow-hidden text-left">
                                    <textarea 
                                        placeholder="Enter Billing Address (Full Details)" 
                                        className="w-full p-5 bg-blue-50/30 border-2 border-blue-100 rounded-[2rem] outline-none font-medium text-[#2D4A73]"
                                        value={billingAddress}
                                        onChange={(e) => setBillingAddress(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 text-left">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-2">
                                <Info size={12} /> Delivery Instructions (Optional)
                            </label>
                            <textarea 
                                placeholder="e.g. Leave at the gate, call before arrival..." 
                                className="w-full p-5 bg-gray-50 border-none rounded-[2rem] h-32 outline-none font-medium text-gray-600 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                                value={customerNotes}
                                onChange={(e) => setCustomerNotes(e.target.value)}
                            />
                        </div>
                    </motion.div>

                    {/* Loyalty Toggle */}
                    <motion.div className="bg-gradient-to-br from-[#2D4A73] to-[#1e334f] rounded-[3rem] p-10 shadow-xl text-white flex justify-between items-center relative overflow-hidden">
                        <Sparkles className="absolute right-[-20px] top-[-20px] text-blue-400/20" size={120} />
                        <div className="relative z-10 text-left">
                            <h3 className="text-2xl font-black mb-1">Redeem Rewards</h3>
                            <p className="text-blue-200 font-bold uppercase text-[10px] tracking-widest">Points Value: ₹{(userPoints * pointValue).toFixed(2)}</p>
                        </div>
                        <button onClick={() => setUsePoints(!usePoints)} className={`w-16 h-8 rounded-full relative transition-all z-10 ${usePoints ? 'bg-green-500' : 'bg-[#0a1526]'}`}>
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${usePoints ? 'left-9' : 'left-1'}`} />
                        </button>
                    </motion.div>
                </div>

                {/* --- ORDER SUMMARY SIDEBAR --- */}
                <div className="lg:col-span-4 text-left">
                    <div className="sticky top-32 bg-white rounded-[3rem] p-10 shadow-2xl border border-gray-100">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Order Summary</h3>
                        
                        <div className="mb-8 space-y-3">
                            {!validCouponRef ? (
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        <input 
                                            type="text" 
                                            placeholder="Coupon Code" 
                                            className="w-full pl-9 pr-3 py-3 bg-gray-50 rounded-xl text-xs font-bold outline-none uppercase"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={handleApplyCoupon}
                                        disabled={isValidatingCoupon || !couponCode}
                                        className="bg-[#2D4A73] text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {isValidatingCoupon ? <Loader2 className="animate-spin" size={14} /> : "Apply"}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="text-green-500" size={14} />
                                        <span className="text-xs font-black text-[#2D4A73]">{validCouponRef}</span>
                                    </div>
                                    <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 transition-colors">
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 mb-8 text-sm">
                            <div className="flex justify-between text-gray-400 font-bold">
                                <span>Cart Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>

                            {/* ✨ NEW: DYNAMIC TAX SUMMARY ✨ */}
                            <div className="flex justify-between text-gray-400 font-bold">
                                <span className="flex items-center gap-1">Estimated GST ({globalSettings.TAX_PERCENTAGE}%)</span>
                                <span>₹{taxAmount.toFixed(2)}</span>
                            </div>

                            <AnimatePresence>
                                {appliedDiscount > 0 && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex justify-between text-green-600 font-black">
                                        <span className="flex items-center gap-1"><Tag size={12}/> Promo Discount</span>
                                        <span>- ₹{appliedDiscount.toFixed(2)}</span>
                                    </motion.div>
                                )}
                                {discountFromPoints > 0 && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex justify-between text-blue-600 font-black">
                                        <span>✨ Rewards Used</span>
                                        <span>- ₹{discountFromPoints.toFixed(2)}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between text-gray-400 font-bold">
                                <span>Delivery</span>
                                <span className={deliveryCharge === 0 ? "text-green-500 font-black" : ""}>
                                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                                </span>
                            </div>
                            
                            <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs font-black text-[#2D4A73] uppercase tracking-widest">Grand Total</span>
                                <span className="text-3xl font-black text-[#2D4A73]">₹{finalTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleConfirmOrder} 
                            disabled={loading || !address.street || !address.city || !address.zip} 
                            className="w-full bg-[#2D4A73] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl hover:bg-[#1e334f] transition-all disabled:opacity-50 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
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
                                Order Ref: <span className="text-pink-600">#{placedOrderData?.id || placedOrderData?.orderId}</span>
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