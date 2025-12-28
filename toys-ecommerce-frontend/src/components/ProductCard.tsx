import * as React from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Eye, Loader2, Sparkles } from 'lucide-react';
import type { Product } from '../types/Product';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';

interface ProductCardProps {
    product: Product;
    onQuickView: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);

    // Backend URL handling logic
    const imageUrl = product.imageUrl?.startsWith('http') 
        ? product.imageUrl 
        : `http://localhost:8080${product.imageUrl}`;

    const oldPrice = Math.round(product.price * 1.5);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents Link navigation

        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            toast.warn("Please Sign In to shop!");
            return;
        }

        setIsAdding(true);
        try {
            await axios.post(
                `http://localhost:8080/api/cart/add/${product.id}`, 
                {}, 
                { headers: { 'X-User-Email': userEmail } }
            );
            toast.success(`${product.name} added!`, {
                icon: <ShoppingCart className="text-green-500" />
            });
        } catch (error) {
            toast.error("Database connection failed.");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="h-full"
        >
            <Link 
                to={`/product/${product.id}`} 
                className="group relative flex flex-col h-full bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all duration-500 overflow-hidden"
            >
                {/* Image & Badge Container */}
                <div className="relative h-72 bg-[#F9FAFB] p-8 overflow-hidden flex items-center justify-center">
                    {/* Dynamic Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {product.price >= 500 && (
                            <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg flex items-center gap-1">
                                <Sparkles size={10} /> Free Delivery
                            </span>
                        )}
                        {product.price < 300 && (
                            <span className="bg-pink-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg">
                                Budget Pick
                            </span>
                        )}
                    </div>

                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onQuickView(product);
                            }}
                            className="bg-white text-gray-900 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2 border border-gray-100"
                        >
                            <Eye size={16} /> Quick View
                        </motion.button>
                    </div>

                    <img 
                        src={imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-1000 group-hover:scale-110"
                    />
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.category}</span>
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#2D4A73] transition-colors">
                            {product.name}
                        </h3>
                    </div>

                    {/* Price & Stock Row */}
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-[#2D4A73]">₹{product.price}</span>
                                <span className="text-sm text-gray-400 line-through">₹{oldPrice}</span>
                            </div>
                            <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight">You Save ₹{oldPrice - product.price}</p>
                        </div>
                        
                        <div className={`text-[9px] font-black px-2 py-1 rounded-md uppercase border ${
                            product.stock > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                            {product.stock > 0 ? 'In Stock' : 'Sold Out'}
                        </div>
                    </div>

                    {/* Comparison Toggle */}
                    <label className="flex items-center gap-2 mt-6 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input 
                            type="checkbox" 
                            className="w-4 h-4 accent-[#2D4A73] rounded border-gray-300"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-[11px] font-black text-gray-500 uppercase tracking-tighter">Add to Compare</span>
                    </label>

                    {/* CTA Button */}
                    <button 
                        onClick={handleAddToCart}
                        disabled={isAdding || product.stock <= 0}
                        className={`mt-4 w-full flex items-center justify-center py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-50 active:scale-95 ${
                            product.stock > 0 
                            ? 'bg-[#2D4A73] text-white hover:bg-[#1e334f]' 
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
            </Link>
        </motion.div>
    );
};

export default ProductCard;