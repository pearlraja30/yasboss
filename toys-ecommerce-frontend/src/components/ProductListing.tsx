import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingCart, Star, Loader2, 
    Sparkles, PackageSearch
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ProductListing: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const category = searchParams.get('category');
    const age = searchParams.get('age');
    const searchQuery = searchParams.get('q');

    useEffect(() => {
        fetchProducts();
    }, [category, age, searchQuery]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            /**
             * ✨ Fixed: This call now matches your updated ProductController.java
             * which uses the /filter endpoint.
             */
            const data = await api.productService.getProducts({
                category: category || '',
                age: age || '',
                search: searchQuery || ''
            });
            setProducts(data);
        } catch (err) {
            console.error("Fetch Error:", err);
            // This toast handles the 403 error if the security permitAll is missing
            toast.error("Unable to load the toy box right now.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (product: any) => {
        const token = localStorage.getItem('jwtToken');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const userEmail = localStorage.getItem('userEmail') || user?.email;

        if (!token || !userEmail) {
            toast.info("Please sign in to add toys to your discovery box!");
            navigate('/login', { state: { from: window.location.pathname + window.location.search } });
            return;
        }

        try {
            await api.cartService.addToCart(product.id, 1, userEmail);
            toast.success(`${product.name} synced to your account!`);
            window.dispatchEvent(new Event("storage"));
        } catch (error: any) {
            console.error("Cart sync failed:", error);
            const msg = error.response?.data?.message || "Could not save item to your bag.";
            toast.error(msg);
        }
    };

    const handleBuyNow = (product: any) => {
        const token = localStorage.getItem('jwtToken');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const userEmail = localStorage.getItem('userEmail') || user?.email;

        if (!token || !userEmail) {
            toast.info("Please sign in to complete your purchase!");
            navigate('/login', { state: { from: window.location.pathname + window.location.search } });
            return;
        }

        navigate('/checkout', { 
            state: { 
                directPurchase: true,
                product: {
                    id: product.id,
                    name: product.name,
                    price: product.sellingPrice || product.price,
                    image: product.imageUrl,
                    quantity: 1
                }
            } 
        });
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
            <Loader2 className="animate-spin text-[#2D4A73] mb-4" size={48} />
            <p className="text-[#2D4A73] font-black uppercase text-[10px] tracking-widest italic">Finding magic...</p>
        </div>
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen pt-32 pb-20 relative">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* 1. Dynamic Page Header */}
                {products.length > 0 && (
                    <div className="mb-12">
                        <h1 className="text-5xl font-black text-[#2D4A73] tracking-tighter capitalize italic">
                            {category || age || searchQuery || 'Toy Collection'}
                        </h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">
                            Explore {products.length} hand-picked treasures
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    {products.length === 0 ? (
                        /* 2. Enhanced "Coming Soon" UI */
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            className="bg-white rounded-[4rem] p-12 md:p-24 text-center shadow-xl border border-gray-100 flex flex-col items-center"
                        >
                            <div className="relative mb-8">
                                <div className="w-32 h-32 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-[#2D4A73]">
                                    <PackageSearch size={64} strokeWidth={1.5} />
                                </div>
                                <motion.div 
                                    animate={{ rotate: 360 }} 
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }} 
                                    className="absolute -top-2 -right-2 text-yellow-400"
                                >
                                    <Sparkles size={32} />
                                </motion.div>
                            </div>
                            <h2 className="text-4xl font-black text-[#2D4A73] mb-4 tracking-tight">More Magic Coming Soon!</h2>
                            <p className="text-gray-400 font-medium text-lg mb-12 max-w-md mx-auto leading-relaxed">
                                We're currently curating new toys for <span className="text-[#2D4A73] font-bold">"{category || age || 'this section'}"</span>.
                            </p>
                            <div className="flex justify-center">
                                <button 
                                    onClick={() => navigate('/')} 
                                    className="bg-white text-gray-400 border border-gray-100 px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all"
                                >
                                    Home
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        /* 3. Product Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product, index) => (
                                <motion.div 
                                    key={product.id} 
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    transition={{ delay: index * 0.05 }} 
                                    className="group bg-white rounded-[3rem] p-5 shadow-sm border border-gray-50 hover:shadow-2xl transition-all duration-500"
                                >
                                    <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-gray-50 mb-6 relative">
                                        <img 
                                            /**
                                             * ✨ Fixed: Image Pathing
                                             * Points to the local frontend public assets to avoid 403 errors from :8080.
                                             */
                                            src={product.imageUrl} 
                                            alt={product.name} 
                                            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110" 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null; // 🛡️ Stop the loop
                                                target.src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=500&auto=format&fit=crop'; 
                                            }}
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl flex items-center gap-1 shadow-sm">
                                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-[10px] font-black">{product.rating || '4.8'}</span>
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="text-lg font-black text-[#2D4A73] mb-4 truncate">{product.name}</h3>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Price</p>
                                                <p className="text-2xl font-black text-[#2D4A73]">₹{product.sellingPrice || product.price}</p>
                                            </div>
                                            
                                            <div className="flex gap-2 w-full">
                                                <button 
                                                    onClick={() => handleAddToCart(product)}
                                                    className="flex-1 bg-gray-100 text-[#2D4A73] p-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                                                    title="Add to Bag"
                                                >
                                                    <ShoppingCart size={20} className="mx-auto" />
                                                </button>
                                                <button 
                                                    onClick={() => handleBuyNow(product)}
                                                    className="flex-[2] bg-pink-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-[#2D4A73] transition-all active:scale-95 shadow-lg shadow-pink-100"
                                                >
                                                    Buy Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductListing;