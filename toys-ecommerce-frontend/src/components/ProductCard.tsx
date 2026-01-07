import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Eye, Loader2, Sparkles, Zap, Truck } from 'lucide-react';
import type { Product } from '../types/Product';
import { motion } from 'framer-motion';
import api from '../services/api'; 
import { toast } from 'react-toastify';

// 🛠️ Environment Configuration for Image Base
const IMAGE_BASE = "http://localhost:8080";

interface ProductCardProps {
    product: Product;
    onQuickView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);

    /**
     * ✨ THE FIX: URL Resolution
     * Ensures images load from the Java backend resource handler.
     */
    const fullImageUrl = product.imageUrl?.startsWith('http') 
        ? product.imageUrl 
        : `${IMAGE_BASE}${product.imageUrl}`;

    const oldPrice = Math.round(product.price * 1.5);

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
            // Using centralized api service to attach JWT
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
                    
                    {/* Visual Badges */}
                    <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                        {product.price >= 500 && (
                            <span className="bg-[#2D4A73] text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                                <Truck size={10} className="text-blue-300" /> Free Delivery
                            </span>
                        )}
                        {product.stock <= 5 && product.stock > 0 && (
                            <span className="bg-orange-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                                <Zap size={10} /> Low Stock
                            </span>
                        )}
                    </div>

                    {/* Quick View Overlay */}
                    <Link to={`/product/${product.id}`} className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-[#2D4A73]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                    </Link>

                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuickView(product);
                            }}
                            className="bg-white text-[#2D4A73] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 border border-gray-100"
                        >
                            <Eye size={16} /> Quick View
                        </motion.button>
                    </div>

                    <img 
                        src={fullImageUrl} 
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 group-hover:scale-110"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; 
                            target.src = '/fallback-toy.png'; // Local fallback asset
                        }}
                    />
                </div>

                {/* Info Container */}
                <div className="p-6 flex flex-col flex-grow">
                    <Link to={`/product/${product.id}`} className="mb-2">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{product.category}</span>
                        <h3 className="text-lg font-black text-[#2D4A73] line-clamp-2 leading-tight mt-1">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="mt-auto">
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-gray-900">₹{product.price}</span>
                                    <span className="text-sm text-gray-400 line-through font-bold">₹{oldPrice}</span>
                                </div>
                                <p className="text-[9px] font-black text-green-600 uppercase tracking-tighter">Save ₹{oldPrice - product.price} Today</p>
                            </div>
                            
                            <div className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase border-2 ${
                                product.stock > 0 
                                ? 'bg-green-50 text-green-700 border-green-100' 
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                                {product.stock > 0 ? 'Ready' : 'Sold Out'}
                            </div>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            disabled={isAdding || product.stock <= 0}
                            className={`w-full flex items-center justify-center py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                                product.stock > 0 
                                ? 'bg-[#2D4A73] text-white hover:bg-black shadow-blue-100' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            }`}
                        >
                            {isAdding ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <>
                                    <ShoppingCart size={18} className="mr-2" />
                                    {product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}
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