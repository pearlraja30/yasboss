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
import { X, ShoppingBag, ArrowRight, Star, Trophy, Sparkles, Loader2, Medal, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const day = new Date().getDay();
    const isWeekend = day === 0 || day === 6;
    
    const [products, setProducts] = useState<Product[]>([]);
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('jwtToken');
                const hasToken = token && token !== "null" && token.length > 20;
                setIsAuthenticated(!!hasToken);

                const productData = await productService.getFeaturedProducts();
                setProducts(productData);
                
                if (hasToken) {
                    try {
                        const leaderData = await userService.getLeaderboard();
                        setLeaders(leaderData.slice(0, 3)); 
                    } catch (e) { console.error(e); }
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    return (
        <div className="homepage bg-[#FDFDFD] text-[#1A1A1A] overflow-hidden">
            
            {/* 1. CLEAN SPLIT HERO SECTION */}
            <section className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -40 }} 
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-[#2D4A73] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100">
                            <Sparkles size={14} /> New Collection 2026
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10 text-[#2D4A73]">
                            Toys for <br />
                            <span className="text-pink-500 italic">Tomorrow.</span>
                        </h1>
                        <p className="text-gray-500 text-xl mb-12 max-w-lg leading-relaxed font-medium">
                            Curated educational toys designed to spark wonder and help your little ones grow through play.
                        </p>
                        <div className="flex flex-wrap gap-5">
                            <button 
                                onClick={() => navigate('/products')}
                                className="bg-[#2D4A73] text-white px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-2xl flex items-center gap-3"
                            >
                                Shop All Toys <ArrowRight size={20} />
                            </button>
                            <button className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all">
                                Our Story
                            </button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Decorative Background Shape */}
                        <div className="absolute inset-0 bg-blue-50 rounded-[5rem] rotate-6 scale-105 -z-10" />
                        <Banner />
                       {/* <img 
                            src="/hero-toy.png" 
                            alt="Hero" 
                            className="w-full h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-700 pointer-events-none" 
                        /> */}
                    </motion.div>
                </div>
            </section>

            {/* 2. AGE CATEGORIES (TIGHTER SPACING) */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                <AgeCategories />
            </div>

            {/* 3. GAMIFIED LOYALTY CARD (CLEAN BENTO STYLE) */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-[#2D4A73] rounded-[4rem] p-12 md:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    
                    <div className="max-w-xl relative z-10 text-center lg:text-left">
                        {isWeekend && (
                            <div className="mb-6 inline-flex items-center gap-2 bg-yellow-400 text-[#2D4A73] px-4 py-1.5 rounded-full font-black text-[10px] uppercase">
                                <Sparkles size={14} /> Weekend Special: 2x Points Today!
                            </div>
                        )}
                        <h2 className="text-5xl font-black mb-8 leading-none tracking-tighter">Play & Earn <br/> <span className="text-pink-400">Magic Points</span></h2>
                        <p className="text-blue-100/70 text-lg mb-10 font-medium">Test your knowledge with our weekly quiz and unlock exclusive discounts.</p>
                        <button 
                            onClick={() => navigate('/quiz')}
                            className="bg-white text-[#2D4A73] px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-pink-500 hover:text-white transition-all inline-flex items-center gap-3 shadow-xl"
                        >
                            Start Quiz Now <ArrowRight size={18} />
                        </button>
                    </div>

                    {isAuthenticated && leaders.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 w-full max-w-sm relative z-10">
                            <h3 className="text-center font-black uppercase text-[10px] tracking-[0.3em] mb-8 flex items-center justify-center gap-2 text-blue-200">
                                <Trophy size={16} className="text-yellow-400" /> Leaderboard
                            </h3>
                            <div className="space-y-4">
                                {leaders.map((leader, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            {index === 0 ? <Medal className="text-yellow-400" size={18} /> : <Star className="text-blue-300" size={18} />}
                                            <span className="font-bold text-sm">{leader.name}</span>
                                        </div>
                                        <span className="font-black text-pink-400 text-sm">{leader.points}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </section>

            <CategorySection />

            {/* 4. FEATURED PRODUCTS (THE MAIN FEED) */}
            <div className="container mx-auto px-4 py-24">
                <div className="flex items-end justify-between mb-16 px-4">
                    <div>
                        <span className="text-pink-600 font-black text-[10px] uppercase tracking-[0.3em] mb-3 block">Top Picks</span>
                        <h2 className="text-5xl font-black text-[#2D4A73] tracking-tighter">Featured Toys</h2>
                    </div>
                    <button 
                        onClick={() => navigate('/products')}
                        className="group flex items-center gap-2 font-black text-xs text-[#2D4A73] uppercase tracking-widest"
                    >
                        See All <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-[3rem]"></div>
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        className="grid grid-cols-2 md:grid-cols-4 gap-10"
                        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
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

            {/* 5. REFINED QUICK VIEW MODAL */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            exit={{ scale: 0.9, opacity: 0, y: 30 }} 
                            className="bg-white w-full max-w-5xl rounded-[4rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row" 
                        >
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 p-3 bg-gray-100 rounded-full hover:bg-gray-200 z-20 transition-all">
                                <X size={20} />
                            </button>
                            <div className="md:w-1/2 bg-[#F8F9FA] p-20 flex items-center justify-center">
                                <img 
                                    src={selectedProduct.imageUrl.startsWith('http') ? selectedProduct.imageUrl : `http://localhost:8080${selectedProduct.imageUrl}`} 
                                    className="max-h-[450px] object-contain drop-shadow-2xl" 
                                    alt={selectedProduct.name} 
                                />
                            </div>
                            <div className="p-16 md:w-1/2 flex flex-col justify-center">
                                <span className="text-pink-600 font-black text-[10px] uppercase tracking-widest">{selectedProduct.category}</span>
                                <h2 className="text-4xl font-black mt-4 text-[#2D4A73] leading-tight tracking-tighter">{selectedProduct.name}</h2>
                                <p className="text-4xl font-black text-gray-900 mt-6">₹{selectedProduct.price}</p>
                                <p className="text-gray-500 mt-8 text-lg leading-relaxed line-clamp-4 font-medium">
                                    {selectedProduct.detailedDescription}
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-5 mt-12">
                                    <button className="flex-1 bg-[#2D4A73] text-white py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">
                                        Add to Cart
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/product/${selectedProduct.id}`)}
                                        className="flex-1 bg-white text-[#2D4A73] border-2 border-gray-100 py-6 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-pink-500 hover:text-pink-600 transition-all flex items-center justify-center gap-3"
                                    >
                                        Full Experience <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;