import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Wishlist: React.FC = () => {
    // This would typically come from your Java backend or LocalStorage
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setItems(saved);
    }, []);

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-pink-50 p-8 rounded-[3rem] mb-6">
                    <Heart size={64} className="text-pink-600 fill-pink-600" />
                </div>
                <h2 className="text-4xl font-black text-[#2D4A73]">Your wishlist is empty</h2>
                <p className="text-gray-500 mt-4 max-w-sm">Save your favorite toys here to keep track of what your little ones love.</p>
                <Link to="/" className="mt-8 bg-[#2D4A73] text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2">
                    Start Shopping <ArrowRight size={20} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
            <h1 className="text-5xl font-black text-[#2D4A73] mb-12 tracking-tighter">My Wishlist</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <AnimatePresence>
                    {items.map((product) => (
                        <motion.div 
                            key={product.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2.5rem] border border-gray-100 p-4 shadow-sm group hover:shadow-xl transition-all"
                        >
                            <div className="relative aspect-square bg-gray-50 rounded-[2rem] overflow-hidden mb-4">
                                <img src={`http://localhost:8080${product.imageUrl}`} className="w-full h-full object-contain p-6" alt="" />
                                <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-red-500 shadow-sm">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <h3 className="font-bold text-gray-800 px-2 truncate">{product.name}</h3>
                            <p className="text-[#2D4A73] font-black px-2 mt-1">₹{product.price}</p>
                            <button className="w-full mt-4 bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
                                <ShoppingCart size={18} /> Move to Bag
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Wishlist;