import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Eye, Loader2, Sparkles, Zap, Truck, Tag, Trophy, Star } from 'lucide-react';
import type { Product } from '../types/Product';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api'; 
import { toast } from 'react-toastify';

const IMAGE_BASE = "http://localhost:8080";

interface ProductCardProps {
    product: Product;
    onQuickView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);
    const [userPoints, setUserPoints] = useState<number>(0);

    /**
     * ✨ NEW: Sync User Points from storage
     */
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUserPoints(parsed.rewardPoints || 0);
        }
    }, []);

    const fullImageUrl = product.imageUrl?.startsWith('http') 
        ? product.imageUrl 
        : `${IMAGE_BASE}${product.imageUrl}`;

    const hasDiscount = product.discountPercent && product.discountPercent > 0;
    const displayOriginalPrice = hasDiscount ? product.originalPrice : Math.round(product.price * 1.25);
    const savings = displayOriginalPrice ? Math.round(displayOriginalPrice - product.price) : 0;

    /**
     * 🧮 GENIUS PRICE LOGIC
     * 10 Points = ₹1 Discount
     * Capped at 25% of the selling price
     */
    const pointValue = userPoints * 0.1; 
    const maxGeniusDiscount = product.price * 0.25;
    const actualPointsDiscount = Math.min(pointValue, maxGeniusDiscount);
    const geniusPrice = Math.round(product.price - actualPointsDiscount);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            toast.warn("Please Sign In to shop!");
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        setIsAdding(true);
        try {
            await api.cartService.addToCart(product.id, 1, userEmail);
            toast.success(`${product.name} added!`, {
                icon: <ShoppingCart className="text-green-500" />
            });
            window.dispatchEvent(new Event("storage"));
        } catch (error: any) {
            console.error("Cart error:", error);
            const msg = error.response?.status === 403 
                ? "Session expired. Please sign in again." 
                : "Failed to add item to bag.";
            toast.error(msg);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10 }}
            className="h-full"
        >
            <div className="group relative flex flex-col h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 overflow-hidden">
                
                {/* Image & Badge Container */}
                <div className="relative h-72 bg-[#F8F9FA] p-8 overflow-hidden flex items-center justify-center">
                    
                    <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                        {hasDiscount && (
                            <motion.span 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="bg-pink-600 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg flex items-center gap-2"
                            >
                                <Tag size={12} /> {product.discountPercent}% OFF
                            </motion.span>
                        )}
                        {/* ✨ NEW: Genius Status Badge */}
                        {userPoints > 0 && (
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                                <Trophy size={10} /> Genius Member
                            </span>
                        )}
                    </div>

                    <Link to={`/product/${product.id}`} className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[#2D4A73]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    </Link>

                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuickView(product);
                            }}
                            className="bg-white text-[#2D4A73] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-gray-100"
                        >
                            <Eye size={16} /> Quick View
                        </button>
                    </div>

                    <img 
                        src={fullImageUrl} 
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 group-hover:scale-110"
                    />
                </div>

                {/* Info Container */}
                <div className="p-6 flex flex-col flex-grow">
                    <Link to={`/product/${product.id}`} className="mb-2 text-left">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{product.category || 'Toy'}</span>
                        <h3 className="text-lg font-black text-[#2D4A73] line-clamp-2 leading-tight mt-1">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="mt-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xl font-black ${hasDiscount ? 'text-pink-600' : 'text-gray-900'}`}>
                                        ₹{product.price}
                                    </span>
                                    {displayOriginalPrice && displayOriginalPrice > product.price && (
                                        <span className="text-[10px] text-gray-400 line-through font-bold">
                                            ₹{displayOriginalPrice}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase border ${
                                product.stockQuantity > 0 
                                ? 'bg-green-50 text-green-700 border-green-100' 
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {product.stockQuantity > 0 ? 'Ready' : 'Sold Out'}
                            </div>
                        </div>

                        {/* ✨ NEW: GENIUS PRICE BOX ✨ */}
                        <div className="mb-6 relative overflow-hidden bg-gradient-to-br from-[#2D4A73] to-[#1e334f] p-4 rounded-2xl text-white shadow-lg group">
                            <Sparkles className="absolute -right-2 -top-2 text-yellow-400 opacity-20 group-hover:scale-150 transition-transform duration-700" size={40} />
                            
                            <div className="flex justify-between items-center relative z-10 text-left">
                                <div>
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <Trophy size={10} className="text-yellow-400" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-blue-200">Genius Price</span>
                                    </div>
                                    <div className="text-xl font-black">₹{geniusPrice}</div>
                                </div>
                                
                                {userPoints > 0 ? (
                                    <div className="text-right">
                                        <div className="bg-yellow-400 text-[#2D4A73] text-[8px] font-black px-2 py-1 rounded-lg flex items-center gap-1">
                                            <Star size={8} fill="currentColor" /> -₹{actualPointsDiscount.toFixed(0)}
                                        </div>
                                    </div>
                                ) : (
                                    <Link to="/quiz" className="text-[8px] font-black uppercase bg-white/10 hover:bg-white/20 px-2 py-1 rounded-lg transition-colors underline decoration-yellow-400">
                                        Play Quiz to Unlock
                                    </Link>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            disabled={isAdding || product.stockQuantity <= 0}
                            className={`w-full flex items-center justify-center py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                                product.stockQuantity > 0 
                                ? 'bg-[#2D4A73] text-white hover:bg-black shadow-blue-100' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {isAdding ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <ShoppingCart size={18} className="mr-2" />
                                    {product.stockQuantity > 0 ? 'Add to Bag' : 'Out of Stock'}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;