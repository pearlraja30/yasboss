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
import { X, ShoppingBag, ArrowRight, Star, Trophy, Sparkles, Loader2, Medal, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
const navigate = useNavigate();
const day = new Date().getDay();
const isWeekend = day === 0 || day === 6;
const [products, setProducts] = useState<Product[]>([]);
const [leaders, setLeaders] = useState<any[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);
const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
// UI States
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
const [isCartOpen, setIsCartOpen] = useState(false);

useEffect(() => {
const loadInitialData = async () => {
try {
setLoading(true);
// 1. Check Auth Status
const token = localStorage.getItem('jwtToken');
const hasToken = token && token !== "null" && token.length > 20;
setIsAuthenticated(!!hasToken);

// 2. Load Public Featured Products
const productData = await productService.getFeaturedProducts();
setProducts(productData);
// 3. ✨ CONDITIONAL FETCH: Load Top 3 only if logged in
if (hasToken) {
try {
const leaderData = await userService.getLeaderboard();
setLeaders(leaderData.slice(0, 3));
} catch (leaderErr) {
console.error("Authenticated but leaderboard failed:", leaderErr);
}
}
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

{/* ✨ QUIZ & LEADERBOARD SECTION (Requirement #5) ✨ */}
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
{/* ✨ MINI LEADERBOARD WIDGET: Only rendered if authenticated */}
{isAuthenticated && leaders.length > 0 && (
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
)}
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
<motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-white w-full max-w-5xl rounded-[3.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row" >
<button onClick={() => setSelectedProduct(null)} className="absolute top-6 right-6 p-3 bg-gray-100 rounded-full hover:bg-gray-200 z-20">
<X size={20} />
</button>
<div className="md:w-1/2 bg-[#F8F9FA] p-16 flex items-center justify-center">
<img
src={selectedProduct.imageUrl.startsWith('http') ? selectedProduct.imageUrl : `http://localhost:8080${selectedProduct.imageUrl}`}
className="max-h-96 object-contain drop-shadow-2xl"
alt={selectedProduct.name}
onError={(e) => { e.currentTarget.src = "/fallback-image.png"; }}
/>
</div>
<div className="p-12 md:w-1/2 flex flex-col justify-center">
<span className="text-pink-600 font-black text-[10px] uppercase tracking-widest">{selectedProduct.category}</span>
<h2 className="text-4xl font-black mt-4 text-[#2D4A73] leading-tight">{selectedProduct.name}</h2>
<div className="flex items-center gap-3 mt-6">
<p className="text-4xl font-black text-gray-900">₹{selectedProduct.price}</p>
<span className="text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full border border-green-100">Ready to Ship</span>
</div>
<p className="text-gray-500 mt-8 text-sm leading-relaxed line-clamp-4">
{selectedProduct.detailedDescription}
</p>
{/* ✨ UPDATED ACTION BUTTONS */}
<div className="flex flex-col sm:flex-row gap-4 mt-10">
<button className="flex-1 bg-[#2D4A73] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#1e334f] transition-all shadow-xl active:scale-95">
Add to Cart
</button>
{/* ✨ NEW: View Complete Details Button */}
<button
onClick={() => navigate(`/product/${selectedProduct.id}`)}
className="flex-1 bg-white text-[#2D4A73] border-2 border-[#2D4A73]/10 py-5 rounded-2xl font-black text-lg hover:border-pink-500 hover:text-pink-600 transition-all flex items-center justify-center gap-2 group"
>
Full Experience <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
</button>
</div>
<div className="mt-6 flex items-center gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
<span className="flex items-center gap-1.5"><Eye size={14}/> 360° View Available</span>
<span className="flex items-center gap-1.5"><Sparkles size={14}/> Video Preview</span>
</div>
</div>
</motion.div>
</div>
)}

{/* 2. SLIDE-OUT CART SIDEBAR */}
{/* ... (rest of cart code remains the same) */}
</AnimatePresence>
</div>
);
};

export default Home;