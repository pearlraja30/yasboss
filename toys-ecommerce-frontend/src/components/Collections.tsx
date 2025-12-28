import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api'; 
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, ShoppingBag, ArrowLeft, Home } from 'lucide-react';
import type { Product } from '../types/Product';

const Collections: React.FC = () => {
    const { ageRange } = useParams<{ ageRange: string }>();
    const navigate = useNavigate();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<string>("featured");
    const [isSortOpen, setIsSortOpen] = useState(false);

    // ✨ NEW: State for Quick View (Fixes the prop error)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const goBack = () => navigate(-1);
    const goHome = () => navigate('/');

    useEffect(() => {
        const fetchByAge = async () => {
            if (!ageRange) return;
            try {
                setLoading(true);
                const data = await productService.getProductsByAge(ageRange);
                setProducts(data);
            } catch (err) {
                console.error("Collection Load Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchByAge();
    }, [ageRange]); 

    const sortedProducts = useMemo(() => {
        const list = [...products];
        if (sortBy === "price-low") return list.sort((a, b) => (a.price) - (b.price));
        if (sortBy === "price-high") return list.sort((a, b) => (b.price) - ( a.price));
        return list; 
    }, [products, sortBy]);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-10">
                
                {/* Product Header & Count */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold capitalize text-gray-900 mb-2">
                        Toys for {ageRange?.replace('-', ' to ')} Years
                    </h1>
                    {!loading && sortedProducts.length > 0 && (
                        <span className="text-gray-500 font-medium bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
                            {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'} Found
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-[2rem]" />
                        ))}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-16 py-20 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200 text-center"
                    >
                        <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <ShoppingBag size={40} className="text-gray-300" />
                        </div>
                        <h2 className="text-3xl font-black text-[#2D4A73]">No Toys Found Yet</h2>
                        <p className="text-gray-400 mt-2 mb-10 font-medium">
                            We don't have items in this category right now. Check back soon!
                        </p>
                        
                        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                            <button 
                                onClick={goBack}
                                className="px-10 py-4 bg-white text-[#2D4A73] font-black rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-2"
                            >
                                <ArrowLeft size={18} /> Try Another Age
                            </button>
                            <button 
                                onClick={goHome}
                                className="px-10 py-4 bg-[#2D4A73] text-white font-black rounded-2xl shadow-lg hover:bg-black transition-all flex items-center gap-2"
                            >
                                <Home size={18} /> Continue Shopping
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-10">
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
                                    <SlidersHorizontal size={16} /> Filter
                                </button>
                                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-blue-100">
                                    In Stock <X size={14} className="cursor-pointer" />
                                </div>
                            </div>

                            <div className="relative">
                                <button 
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                    className="flex items-center gap-2 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    Sort By: <span className="text-pink-600 capitalize">{sortBy.replace('-', ' ')}</span> <ChevronDown size={16} />
                                </button>

                                <AnimatePresence>
                                    {isSortOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            {/* Sort options... */}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <motion.div 
                            key={ageRange + sortBy}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {sortedProducts.map(product => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product} 
                                    // ✨ FIX: Passing the required prop
                                    onQuickView={(p) => setSelectedProduct(p)} 
                                />
                            ))}
                        </motion.div>
                    </>
                )}
            </div>

            {/* Optional: Add the Quick View Modal UI here if you want it to open */}
        </div>
    );
};

export default Collections;