import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingCart, Star, Loader2, 
    Sparkles, PackageSearch, AlertCircle,
    Eye 
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const ProductListing: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ✨ URL Parameter extraction
    const category = searchParams.get('category') || '';
    const age = searchParams.get('age') || '';
    const searchQuery = searchParams.get('q') || '';

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            // ✨ FIX: Switched to getFilteredProducts to match backend Search endpoint
            // Passing empty strings ensures the backend @RequestParam logic handles them as optional
            const response = await api.productService.getFilteredProducts(
                category,
                age,
                searchQuery
            );
            
            // Handle both Axios response wrapper and direct data
            const data = response.data || response;
            setProducts(Array.isArray(data) ? data : []);
            
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Unable to load the toy box right now.");
            setProducts([]); // Clear state on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        // Scroll to top when filters change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [category, age, searchQuery]);

    const handleAddToCart = async (product: any) => {
        if (product.stockQuantity <= 0) {
            toast.warning("This magical item is currently out of stock!");
            return;
        }

        const token = localStorage.getItem('jwtToken');
        const userEmail = localStorage.getItem('userEmail');

        if (!token || !userEmail) {
            toast.info("Please sign in to add toys to your discovery box!");
            navigate('/login', { state: { from: window.location.pathname + window.location.search } });
            return;
        }

        try {
            await api.cartService.addToCart(product.id, 1, userEmail);
            toast.success(`${product.name} added to bag!`);
            window.dispatchEvent(new Event("storage"));
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Could not save item to your bag.");
        }
    };

    const handleBuyNow = (product: any) => {
        if (product.stockQuantity <= 0) return;

        const token = localStorage.getItem('jwtToken');
        if (!token) {
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
        <div className="bg-[#F8F9FA] min-h-screen pt-32 pb-20 relative text-left">
            <div className="max-w-7xl mx-auto px-6">
                
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

                <AnimatePresence mode="wait">
                    {products.length === 0 ? (
                        <motion.div 
                            key="no-results"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[4rem] p-12 md:p-24 text-center shadow-xl border border-gray-100 flex flex-col items-center"
                        >
                            <PackageSearch size={64} className="text-[#2D4A73] mb-6" />
                            <h2 className="text-4xl font-black text-[#2D4A73] mb-4">No Magic Found</h2>
                            <p className="text-gray-400 mb-8 uppercase tracking-widest text-xs font-bold">We couldn't find items matching "{category || age || searchQuery}"</p>
                            <button onClick={() => navigate('/products')} className="bg-[#2D4A73] text-white px-10 py-4 rounded-[2rem] font-black uppercase text-xs">Clear Filters</button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product, index) => {
                                const isOutOfStock = product.stockQuantity <= 0;

                                return (
                                    <motion.div 
                                        key={product.id} 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        transition={{ delay: index * 0.05 }} 
                                        className={`group bg-white rounded-[3rem] p-5 shadow-sm border border-gray-50 transition-all duration-500 ${isOutOfStock ? 'opacity-75' : 'hover:shadow-2xl'}`}
                                    >
                                        <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-gray-50 mb-6 relative group">
                                            <img 
                                                src={product.imageUrl} 
                                                alt={product.name} 
                                                className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ${!isOutOfStock && 'group-hover:scale-110'}`} 
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=500&auto=format&fit=crop'; }}
                                            />
                                            
                                            {!isOutOfStock && (
                                                <div 
                                                    onClick={() => navigate(`/product/${product.id}`)}
                                                    className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                                                >
                                                    <div className="bg-white/90 p-4 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                        <Eye size={24} className="text-[#2D4A73]" />
                                                    </div>
                                                </div>
                                            )}

                                            {isOutOfStock && (
                                                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                                                    <div className="bg-pink-100 text-pink-600 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm flex items-center gap-2">
                                                        <AlertCircle size={14} /> Sold Out
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl flex items-center gap-1 shadow-sm">
                                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                                <span className="text-[10px] font-black">{product.rating || '4.8'}</span>
                                            </div>
                                        </div>

                                        <div className="px-2">
                                            <h3 className={`text-lg font-black mb-4 truncate ${isOutOfStock ? 'text-gray-400' : 'text-[#2D4A73]'}`}>
                                                {product.name}
                                            </h3>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[9px] font-black text-gray-400 uppercase">Price</p>
                                                        <p className={`text-2xl font-black ${isOutOfStock ? 'text-gray-400' : 'text-[#2D4A73]'}`}>₹{product.sellingPrice || product.price}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/product/${product.id}`)}
                                                        className="text-[#2D4A73] p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </div>
                                                
                                                <div className="flex gap-2 w-full">
                                                    <button 
                                                        disabled={isOutOfStock}
                                                        onClick={() => handleAddToCart(product)}
                                                        className={`flex-1 p-4 rounded-2xl transition-all flex items-center justify-center ${isOutOfStock ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-gray-100 text-[#2D4A73] hover:bg-[#2D4A73] hover:text-white active:scale-95'}`}
                                                    >
                                                        <ShoppingCart size={20} />
                                                    </button>
                                                    <button 
                                                        disabled={isOutOfStock}
                                                        onClick={() => handleBuyNow(product)}
                                                        className={`flex-[2] font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-pink-600 text-white hover:shadow-pink-200 hover:shadow-lg active:scale-95 shadow-lg shadow-pink-100'}`}
                                                    >
                                                        {isOutOfStock ? 'Unavailable' : 'Buy Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductListing;