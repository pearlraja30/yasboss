import React, { useState, useEffect } from 'react';
import { productService, userService } from '../services/api'; 
import Banner from '../components/Banner';
import AgeCategories from '../components/AgeCategories';
import ProductCard from '../components/ProductCard'; 
import type { Product } from '../types/Product';
import CategorySection from '../components/CategorySection';
import TrustSignals from '../components/Features';
import AboutUsBanner from '../components/AboutUsBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowRight, Star, Trophy, Sparkles, Loader2, Medal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    const [products, setProducts] = useState<Product[]>([]);
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // UI States
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                // Load Featured Products
                const productData = await productService.getFeaturedProducts();
                setProducts(productData);
                
                // Load Top 3 for Leaderboard Widget (Requirement #5)
                const leaderData = await userService.getLeaderboard();
                setLeaders(leaderData.slice(0, 3)); 
                
                setError(null);
            } catch (err) {
                console.error("Error fetching home data:", err);
                setError("Failed to load content.");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    return (
        <div className="homepage bg-white relative">
            <Banner />
            <AgeCategories />

            {/* ✨ NEW: Quiz Promotional Banner (Requirement #5) ✨ */}
            <section className="max-w-7xl mx-auto px-4 py-12">

                {isWeekend && (
                    <div className="mb-4 inline-flex items-center gap-2 bg-yellow-400 text-[#2D4A73] px-4 py-1.5 rounded-full font-black text-[10px] uppercase animate-bounce">
                        <Sparkles size={14} /> Weekend Special: Earn 2x Points Today!
                    </div>
                )}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-[#2D4A73] to-[#1e334f] rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl"
                >
                    <Sparkles className="absolute top-10 right-10 text-pink-400 opacity-50" size={40} />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 bg-pink-500/20 text-pink-300 px-4 py-1.5 rounded-full w-fit mb-6 border border-pink-500/30">
                                <Star size={14} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Gamified Learning</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                                Play & Win <br /> <span className="text-pink-400">Reward Points!</span>
                            </h2>
                            <p className="text-blue-100 text-lg mb-8">
                                Test your toy knowledge! Earn up to 50 points per quiz and use them for discounts on your next favorite toy.
                            </p>
                            <button 
                                onClick={() => navigate('/quiz')}
                                className="bg-white text-[#2D4A73] px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center gap-3 shadow-xl"
                            >
                                Start Quiz Now <ArrowRight size={20} />
                            </button>
                        </div>
                        
                        {/* Mini Leaderboard Widget */}
                        <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 w-full max-w-sm">
                            <h3 className="text-center font-black uppercase text-[10px] tracking-widest mb-6 flex items-center justify-center gap-2">
                                <Trophy size={16} className="text-yellow-400" /> Top Champions
                            </h3>
                            <div className="space-y-4">
                                {leaders.map((leader, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            {index === 0 ? <Medal className="text-yellow-400" size={18} /> : <Star className="text-blue-300" size={18} />}
                                            <span className="font-bold text-sm">{leader.name}</span>
                                        </div>
                                        <span className="font-black text-pink-400 text-sm">{leader.points} pts</span>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate('/leaderboard')} className="w-full mt-6 text-[10px] font-black uppercase tracking-widest text-blue-300 hover:text-white transition-colors">
                                View Full Rankings
                            </button>
                        </div>
                    </div>
                </motion.div>
            </section>

            <CategorySection />
            
            <div className="container mx-auto px-4 py-16">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-4xl font-black text-[#2D4A73] tracking-tighter">Featured Toys</h2>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1">Handpicked for your little ones</p>
                    </div>
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="flex items-center gap-2 bg-[#F8F9FA] px-6 py-3 rounded-2xl hover:bg-gray-100 transition-all font-black text-xs text-[#2D4A73] shadow-sm border border-gray-100"
                    >
                        <ShoppingBag size={18} /> View Cart
                    </button>
                </div>

                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-50 animate-pulse rounded-[2.5rem]"></div>
                        ))}
                    </div>
                )}

                {error && <div className="text-center text-red-500 py-20 font-medium bg-red-50 rounded-[2.5rem] border border-red-100">{error}</div>}

                {!loading && !error && (
                    <motion.div 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {products.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onQuickView={(p) => setSelectedProduct(p)} 
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            <TrustSignals />
            <AboutUsBanner />

            <AnimatePresence>
                {/* 1. QUICK VIEW MODAL */}
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-white w-full max-w-4xl rounded-[3.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row" >
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 z-20">
                                <X size={20} />
                            </button>
                            <div className="md:w-1/2 bg-[#F8F9FA] p-16 flex items-center justify-center">
                                <img 
                                    src={selectedProduct.imageUrl.startsWith('http') ? selectedProduct.imageUrl : `http://localhost:8080${selectedProduct.imageUrl}`} 
                                    className="max-h-96 object-contain drop-shadow-2xl" 
                                    alt={selectedProduct.name} 
                                />
                            </div>
                            <div className="p-12 md:w-1/2 flex flex-col justify-center">
                                <span className="text-pink-600 font-black text-[10px] uppercase tracking-widest">{selectedProduct.category}</span>
                                <h2 className="text-4xl font-black mt-4 text-[#2D4A73] leading-tight">{selectedProduct.name}</h2>
                                <div className="flex items-center gap-3 mt-6">
                                    <p className="text-4xl font-black text-gray-900">₹{selectedProduct.price}</p>
                                    <span className="text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full border border-green-100">Ready to Ship</span>
                                </div>
                                <p className="text-gray-500 mt-8 text-sm leading-relaxed">{selectedProduct.detailedDescription}</p>
                                <button className="w-full mt-10 bg-[#2D4A73] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1e334f] transition-all shadow-xl active:scale-95">
                                    Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* 2. SLIDE-OUT CART SIDEBAR */}
                {isCartOpen && (
                    <div className="fixed inset-0 z-[150]">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-xs" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-12 flex flex-col rounded-l-[3.5rem]" >
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-[#2D4A73] tracking-tighter">Your Toy Bag</h2>
                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 space-y-6">
                                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center">
                                    <ShoppingBag size={48} strokeWidth={1.5} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-gray-700">Your bag is empty!</p>
                                    <p className="text-sm mt-1">Looks like you haven't picked any toys yet.</p>
                                </div>
                                <button onClick={() => setIsCartOpen(false)} className="bg-pink-50 text-pink-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pink-100 transition-all">
                                    Go Shopping
                                </button>
                            </div>
                            <div className="pt-8 border-t border-gray-100">
                                <button className="w-full bg-[#2D4A73] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-[#1e334f] active:scale-95 transition-all">
                                    Checkout
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;