import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { 
    ShoppingCart, Truck, ShieldCheck, Loader2, Info, Rotate3d, 
    Search, RotateCcw, X, ShoppingBag, LogIn, Play, Eye, Box, Sparkles, Star, Trophy, Zap 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import AuthModal from '../components/AuthModal';

const isProduction = false; 
const config = {
    BASE_URL: isProduction ? "https://api.yourtoyhub.com" : "http://localhost:8080",
};

interface ProductImage {
    id: number;
    imageUrl: string;
    is360View: boolean;
    isVideo?: boolean;
}

interface ProductDetailType {
    id: number;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    detailedDescription?: string;
    longDescription?: string;
    useCases?: string;
    images?: ProductImage[];
}

const ProductDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    
    // ✨ NEW: Points State
    const [userPoints, setUserPoints] = useState<number>(0);
    
    const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video' | '360' }>({ url: '', type: 'image' });
    const [images360, setImages360] = useState<string[]>([]);
    const [frameIndex, setFrameIndex] = useState(0); 
    const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
    const [isZooming, setIsZooming] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        // Fetch User Data for Genius Pricing
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUserPoints(parsed.rewardPoints || 0);
        }

        const loadProductData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data);
                
                const threeSixtySet = data.images
                    ?.filter((img: ProductImage) => img.is360View)
                    .map((img: ProductImage) => img.imageUrl.startsWith('http') ? img.imageUrl : `${config.BASE_URL}${img.imageUrl}`) || [];
                
                setImages360(threeSixtySet);

                if (threeSixtySet.length > 0) {
                    setActiveMedia({ url: '360_mode', type: '360' });
                } else {
                    const mainUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `${config.BASE_URL}${data.imageUrl}`;
                    setActiveMedia({ url: mainUrl, type: 'image' });
                }
                
                saveToLastViewed(data);
            } catch (err) {
                console.error("Failed to fetch product:", err);
                toast.error("Toy details could not be loaded.");
            } finally {
                setLoading(false);
            }
        };
        loadProductData();
    }, [id]);

    // ✨ NEW: Genius Price Calculation
    const pointsValue = userPoints * 0.1; // 10 points = 1 rupee
    const maxGeniusDiscount = product ? product.price * 0.25 : 0;
    const actualPointsDiscount = Math.min(pointsValue, maxGeniusDiscount);
    const geniusPrice = product ? Math.round(product.price - actualPointsDiscount) : 0;
    const pointsProgress = (actualPointsDiscount / maxGeniusDiscount) * 100;

    const handleRotation = (e: React.MouseEvent | React.TouchEvent) => {
        if (images360.length === 0) return;
        const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const target = e.currentTarget as HTMLElement;
        const { left, width } = target.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - left, width));
        const sensitivity = 1.5; 
        const percentage = (x / width) * sensitivity;
        const newIndex = Math.floor(percentage * images360.length) % images360.length;
        if (newIndex !== frameIndex) setFrameIndex(newIndex);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (activeMedia.type !== 'image') return;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    const saveToLastViewed = (item: any) => {
        const history = JSON.parse(localStorage.getItem('recent_toys') || '[]');
        const filtered = history.filter((p: any) => p.id !== item.id);
        const newHistory = [item, ...filtered].slice(0, 5); 
        localStorage.setItem('recent_toys', JSON.stringify(newHistory));
    };

    const handleAuthGate = (actionType: 'buy' | 'add') => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            setIsAuthModalOpen(true);
            return;
        }
        actionType === 'buy' ? handleBuyNow() : handleAddToCart();
    };

    const handleModalConfirm = () => {
        setIsAuthModalOpen(false);
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
    };

    const handleAddToCart = async () => {
        const userEmail = localStorage.getItem('userEmail');
        setAddingToCart(true);
        try {
            await axios.post(`${config.BASE_URL}/api/cart/add/${id}`, {}, { headers: { 'X-User-Email': userEmail } });
            toast.success(`${product?.name} added to your collection!`);
            window.dispatchEvent(new Event("storage")); 
        } catch (error) {
            toast.error("Failed to add to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        await handleAddToCart();
        navigate('/cart');
    };

    if (loading) return <div className="flex flex-col items-center justify-center py-40"><Loader2 className="animate-spin text-[#2D4A73]" size={48} /></div>;
    if (!product) return <div className="py-20 text-center font-bold text-[#2D4A73]">Toy not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                onConfirm={handleModalConfirm} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* 📸 LEFT MEDIA SECTION */}
                <div className="flex flex-col-reverse lg:flex-row gap-6">
                    <div className="flex lg:flex-col gap-3 overflow-y-auto no-scrollbar lg:max-h-[550px] shrink-0">
                        <div 
                            onClick={() => { 
                                const url = product.imageUrl.startsWith('http') ? product.imageUrl : `${config.BASE_URL}${product.imageUrl}`;
                                setActiveMedia({ url, type: 'image' });
                            }}
                            className={`w-20 h-20 rounded-2xl cursor-pointer border-2 p-2 bg-white flex items-center justify-center transition-all shadow-sm
                                ${activeMedia.url === (product.imageUrl.startsWith('http') ? product.imageUrl : `${config.BASE_URL}${product.imageUrl}`) ? 'border-[#2D4A73] ring-2 ring-blue-50' : 'border-gray-100'}`}
                        >
                            <img src={product.imageUrl.startsWith('http') ? product.imageUrl : `${config.BASE_URL}${product.imageUrl}`} className="max-h-full object-contain" alt="Main" />
                        </div>

                        {product.images?.filter(img => !img.is360View).map((img) => {
                            const fullUrl = img.imageUrl.startsWith('http') ? img.imageUrl : `${config.BASE_URL}${img.imageUrl}`;
                            return (
                                <div 
                                    key={img.id}
                                    onClick={() => setActiveMedia({ url: fullUrl, type: img.isVideo ? 'video' : 'image' })}
                                    className={`w-20 h-20 rounded-2xl cursor-pointer border-2 p-2 bg-white flex items-center justify-center transition-all shadow-sm relative
                                        ${activeMedia.url === fullUrl ? 'border-[#2D4A73] ring-2 ring-blue-50' : 'border-gray-100'}`}
                                >
                                    {img.isVideo && <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10"><Play size={16} className="text-white fill-white" /></div>}
                                    <img src={fullUrl} className="max-h-full object-contain" alt="Gallery" />
                                </div>
                            );
                        })}

                        {images360.length > 0 && (
                            <div 
                                onClick={() => setActiveMedia({ url: '360_mode', type: '360' })} 
                                className={`w-20 h-20 rounded-2xl cursor-pointer border-2 p-2 flex flex-col items-center justify-center gap-1 shadow-sm transition-all 
                                    ${activeMedia.type === '360' ? 'bg-pink-600 border-pink-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                            >
                                <Rotate3d size={24} />
                                <span className="text-[8px] font-black uppercase tracking-tighter">Interact</span>
                            </div>
                        )}
                    </div>

                    <div 
                        className="flex-1 bg-[#F8F9FA] rounded-[3rem] border-2 border-gray-50 shadow-inner overflow-hidden flex items-center justify-center min-h-[550px] relative"
                        onMouseMove={handleMouseMove}
                        onMouseEnter={() => setIsZooming(true)}
                        onMouseLeave={() => setIsZooming(false)}
                    >
                        <AnimatePresence mode="wait">
                            {activeMedia.type === 'image' ? (
                                <motion.div key={activeMedia.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full flex items-center justify-center p-12 cursor-zoom-in">
                                    <img 
                                        src={activeMedia.url}
                                        style={{
                                            transformOrigin: isZooming ? `${zoomPos.x}% ${zoomPos.y}%` : 'center',
                                            transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                                            transition: isZooming ? 'none' : 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
                                        }}
                                        className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
                                        alt={product.name}
                                    />
                                    {!isZooming && <div className="absolute top-8 right-8 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl transition-all"><Search size={22} className="text-[#2D4A73]" /></div>}
                                </motion.div>
                            ) : activeMedia.type === 'video' ? (
                                <motion.div key={activeMedia.url} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex items-center justify-center p-1 bg-black rounded-[2.5rem] overflow-hidden">
                                    <video src={activeMedia.url} controls className="w-full max-h-[550px]" autoPlay />
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                    className="w-full h-full flex flex-col items-center justify-center cursor-ew-resize select-none relative" 
                                    onMouseMove={handleRotation} onTouchMove={handleRotation}
                                >
                                    <img src={images360[frameIndex]} className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl" alt="360 view" />
                                    <div className="absolute top-10 left-10 bg-pink-600/10 text-pink-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-pink-600/20 flex items-center gap-2">
                                        <Rotate3d size={14} /> 360° Interaction Active
                                    </div>
                                    <div className="absolute bottom-10 bg-[#2D4A73] text-white px-8 py-4 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-3 animate-pulse">
                                        <RotateCcw size={16} /> Drag to Rotate Toy
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 🛒 RIGHT INFO SECTION */}
                <div className="flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{product.category}</span>
                            <span className="flex items-center gap-1.5 text-yellow-500 font-black text-xs uppercase"><Star size={14} fill="currentColor"/> 4.8 Store Rating</span>
                        </div>
                        <h1 className="text-6xl font-black text-[#2D4A73] leading-[0.9] tracking-tighter">{product.name}</h1>
                    </div>
                    
                    {/* ✨ UPDATED PRICE SECTION WITH GENIUS UI */}
                    <div className="flex flex-wrap items-center gap-8 mb-10">
                        <div className="flex flex-col">
                            <span className="text-gray-400 line-through font-bold text-lg">M.R.P.: ₹{Math.round(product.price * 1.5)}</span>
                            <span className="text-7xl font-black text-gray-900 tracking-tighter leading-none">₹{product.price}</span>
                        </div>
                        
                        {/* 💎 GENIUS REWARDS CARD */}
                        <div className="flex-1 min-w-[280px]">
                            <div className="relative overflow-hidden bg-gradient-to-br from-[#2D4A73] to-[#1a2e4c] p-6 rounded-[2.5rem] text-white shadow-xl border border-white/10 group">
                                <Sparkles className="absolute -right-2 -top-2 text-yellow-400 opacity-20 group-hover:scale-150 transition-transform duration-1000" size={80} />
                                
                                <div className="flex justify-between items-start relative z-10 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Trophy size={16} className="text-yellow-400" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Genius Member Price</span>
                                        </div>
                                        <div className="text-4xl font-black">₹{geniusPrice}</div>
                                    </div>
                                    <div className="bg-yellow-400 text-[#2D4A73] px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-lg">
                                        <Star size={12} fill="currentColor"/> {userPoints} Pts
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pointsProgress}%` }}
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-300 to-yellow-500"
                                    />
                                </div>
                                
                                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-blue-200/60">
                                    <span>{userPoints > 0 ? `Saved ₹${actualPointsDiscount.toFixed(0)} with points` : 'No points used'}</span>
                                    <Link to="/quiz" className="flex items-center gap-1 text-yellow-400 hover:text-white transition-colors">
                                        Play Quiz to save more <Zap size={10} fill="currentColor" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-500 text-lg leading-relaxed mb-12 font-medium">
                        {product.detailedDescription || "Explore the wonders of play with this hand-selected educational toy designed for your little expert's development."}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-12">
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <Truck className="text-blue-500 mb-2" size={24} />
                            <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Fast Delivery</p>
                            <p className="font-bold text-sm text-[#2D4A73]">Ships in 24 Hours</p>
                        </div>
                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                            <ShieldCheck className="text-green-500 mb-2" size={24} />
                            <p className="font-black text-[10px] uppercase tracking-widest text-gray-400">Child Safe</p>
                            <p className="font-bold text-sm text-[#2D4A73]">Non-Toxic Materials</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={() => handleAuthGate('buy')} className="flex-1 bg-[#2D4A73] text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-black transition-all active:scale-95 uppercase tracking-tighter">Buy Now</button>
                        <button onClick={() => handleAuthGate('add')} disabled={addingToCart} className="flex-1 border-4 border-[#2D4A73] text-[#2D4A73] py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-tighter">
                            {addingToCart ? <Loader2 className="animate-spin" size={26} /> : <ShoppingCart size={26} />}
                            {addingToCart ? 'Syncing...' : 'Add to Bag'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Recently Viewed Section stays the same */}
            <div className="mt-32 border-t border-gray-100 pt-20">
                <div className="flex items-center justify-between mb-12">
                    <h3 className="text-4xl font-black text-[#2D4A73] tracking-tighter uppercase italic flex items-center gap-4">
                        <Sparkles className="text-pink-500" /> More Magic to Explore
                    </h3>
                    <Link to="/products" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-pink-600 transition-colors">View All Gallery</Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {JSON.parse(localStorage.getItem('recent_toys') || '[]')
                        .filter((item: any) => item.id !== product.id)
                        .slice(0, 4)
                        .map((item: any) => (
                            <Link to={`/product/${item.id}`} key={item.id} className="group block relative">
                                <div className="h-64 flex items-center justify-center bg-white rounded-[3.5rem] mb-6 p-12 group-hover:bg-blue-50 transition-all duration-700 shadow-sm group-hover:shadow-2xl relative overflow-hidden border border-gray-50">
                                    <div className="absolute inset-0 bg-[#2D4A73]/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all z-10 backdrop-blur-[2px]">
                                        <div className="p-5 bg-white rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
                                            <Eye size={32} className="text-[#2D4A73]" />
                                        </div>
                                    </div>
                                    <img src={item.imageUrl.startsWith('http') ? item.imageUrl : `${config.BASE_URL}${item.imageUrl}`} className="h-full object-contain transition-transform duration-1000 group-hover:scale-110" alt={item.name} />
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{item.category}</p>
                                    <p className="text-lg font-black text-gray-800 truncate group-hover:text-[#2D4A73] transition-colors">{item.name}</p>
                                    <div className="flex items-center justify-center gap-3 mt-2">
                                        <p className="text-pink-600 font-black text-2xl">₹{item.price}</p>
                                        <ShoppingCart size={16} className="text-gray-200" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;