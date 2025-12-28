import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api'; 
import ProductCard from './ProductCard';
import { collections } from '../data/CollectionsData'; 
import EmptyState from './EmptyState'; 
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, ChevronDown, X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import type { Product } from '../types/Product';

const CollectionProducts: React.FC = () => {
    const { collectionRoute } = useParams<{ collectionRoute: string }>(); 
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<string>("featured");
    const [isSortOpen, setIsSortOpen] = useState(false);

    // NEW: State for Quick View Modal
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const currentData = collections.find(c => c.route === collectionRoute);
    const displayTitle = currentData?.name || collectionRoute?.split('-').join(' ');

    useEffect(() => {
        const fetchCategoryData = async () => {
            if (!collectionRoute) return;
            try {
                setLoading(true);
                const data = await productService.getProductsByCategory(collectionRoute);
                setProducts(data);
            } catch (err) {
                console.error("Failed to fetch products for category:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [collectionRoute]);

    const sortedProducts = useMemo(() => {
        const list = [...products];
        if (sortBy === "price-low") return list.sort((a, b) => a.price - b.price);
        if (sortBy === "price-high") return list.sort((a, b) => b.price - a.price);
        return list; 
    }, [products, sortBy]);

    return (
        <div className="min-h-screen bg-white pb-20 relative">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <header className="text-center mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-serif font-bold capitalize text-gray-900 mb-6"
                    >
                        {displayTitle}
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed"
                    >
                        {currentData?.description || `Explore our thoughtfully curated selection of ${displayTitle}. Each toy is designed to inspire future growth.`}
                    </motion.p>
                    
                    <div className="mt-8">
                        <span className="bg-gray-50 text-gray-600 px-6 py-2 rounded-full border border-gray-100 font-bold text-sm">
                            {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
                        </span>
                    </div>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-y border-gray-100 py-6 gap-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button className="flex items-center gap-2 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm">
                            <SlidersHorizontal size={18} /> Filter
                        </button>
                        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-bold border border-blue-100">
                            In Stock <X size={16} className="cursor-pointer" />
                        </div>
                        <button className="text-blue-600 text-sm font-bold hover:underline">Clear Filters</button>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition shadow-sm"
                        >
                            Sort By: <span className="text-pink-600 capitalize">{sortBy.replace('-', ' ')}</span> <ChevronDown size={18} />
                        </button>

                        <AnimatePresence>
                            {isSortOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                >
                                    {[
                                        { label: "Featured", value: "featured" },
                                        { label: "Price: Low to High", value: "price-low" },
                                        { label: "Price: High to Low", value: "price-high" }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            className="w-full text-left px-6 py-4 text-sm font-semibold hover:bg-pink-50 hover:text-pink-600 border-b border-gray-50 last:border-0 transition-colors"
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setIsSortOpen(false);
                                            }}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-[2.5rem]" />
                            ))}
                        </div>
                    ) : sortedProducts.length > 0 ? (
                        <motion.div 
                            key={collectionRoute + sortBy}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-10"
                        >
                            {sortedProducts.map((product) => (
                                <ProductCard 
                                    key={product.id} 
                                    product={product}
                                    onQuickView={(p) => setSelectedProduct(p)} // Passing trigger to Card
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <EmptyState />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* QUICK VIEW MODAL COMPONENT */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
                        {/* Overlay/Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />

                        {/* Modal Body */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row z-10"
                        >
                            <button 
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-6 right-6 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-20"
                            >
                                <X size={24} />
                            </button>

                            <div className="md:w-1/2 bg-gray-50 p-12 flex items-center justify-center">
                                <motion.img 
                                    src={selectedProduct.imageUrl.startsWith('http') ? selectedProduct.imageUrl : `http://localhost:8080${selectedProduct.imageUrl}`} 
                                    className="max-h-[400px] object-contain drop-shadow-2xl"
                                />
                            </div>

                            <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-pink-600 font-bold uppercase tracking-widest text-xs">{selectedProduct.category}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="flex items-center gap-1 text-green-600 font-bold text-xs"><CheckCircle2 size={14}/> In Stock</span>
                                </div>

                                <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{selectedProduct.name}</h2>
                                <p className="text-3xl font-black text-pink-600 mb-6">₹{selectedProduct.price}</p>
                                
                                <p className="text-gray-500 leading-relaxed mb-10 text-lg">
                                    {selectedProduct.description || "Thoughtfully designed to inspire curiosity and creativity in young minds."}
                                </p>

                                <button className="w-full bg-green-500 text-white py-5 rounded-2xl font-bold text-xl hover:bg-green-600 shadow-lg shadow-green-100 transition-all active:scale-95 flex items-center justify-center gap-3">
                                    <ShoppingBag size={24} /> Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollectionProducts;