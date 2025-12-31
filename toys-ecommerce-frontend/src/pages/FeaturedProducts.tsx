import React, { useState, useEffect, useMemo } from 'react';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState'; 
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import type { Product } from '../types/Product';

const FeaturedProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<string>("featured");
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    // State to handle the Quick View modal product
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const loadFeatured = async () => {
            try {
                setLoading(true);
                const data = await productService.getFeaturedProducts();
                setProducts(data);
            } catch (err) {
                console.error("Featured Products Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadFeatured();
    }, []);

    const sortedProducts = useMemo(() => {
        const list = [...products];
        if (sortBy === "price-low") return list.sort((a, b) => a.price - b.price);
        if (sortBy === "price-high") return list.sort((a, b) => b.price - a.price);
        return list; 
    }, [products, sortBy]);

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <header className="text-center mb-10">
                    <div className="inline-block relative">
                         {/* Pulsing Featured Badge */}
                        <motion.span 
                            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="bg-pink-100 text-pink-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter mb-4 inline-block"
                        >
                            Exclusive Collection
                        </motion.span>
                        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Featured Products</h1>
                    </div>
                </header>

                {/* Filter & Sort Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-y border-gray-100 py-6 mb-10">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold">
                            <SlidersHorizontal size={16} /> Filter
                        </button>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-blue-100">
                            In Stock <X size={14} className="cursor-pointer" />
                        </div>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold"
                        >
                            Sort By: <span className="text-pink-600 capitalize">{sortBy}</span> <ChevronDown size={16} />
                        </button>
                        {/* Dropdown Logic Here */}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-[2rem]" />)}
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {sortedProducts.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    onQuickView={(p) => setSelectedProduct(p)} // Fixed the missing prop error!
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState />
                    )}
                </AnimatePresence>
            </div>
            
            {/* Remember to include your Quick View Modal Component here too */}
        </div>
    );
};

export default FeaturedProducts;