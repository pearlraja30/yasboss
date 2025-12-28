import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types/Product';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, ArrowLeft, Home, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const BASE_API_URL = 'http://localhost:8080/api/products/category/';

const CategoryProducts: React.FC = () => {
    const { categoryRoute } = useParams<{ categoryRoute: string }>(); 
    const navigate = useNavigate();
    
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Navigation Handlers
    const goBack = () => navigate(-1);
    const goHome = () => navigate('/');

    const formatTitle = (route: string | undefined): string => {
        if (!route) return "Category Products";
        return route.split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
    };

    useEffect(() => {
        if (!categoryRoute) return;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get<Product[]>(`${BASE_API_URL}${categoryRoute}`);
                setProducts(response.data);
                setError(null);
            } catch (err) {
                setError(`Failed to fetch products for category: ${categoryRoute}`);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryRoute]);

    const title = formatTitle(categoryRoute);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2D4A73]"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-5xl font-black text-[#2D4A73] text-center mb-12 tracking-tighter">
                {title}
            </h1>
            
            {products.length === 0 ? ( 
                /* ✨ INTEGRATED: Stylized Empty State ✨ */
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
                            <ArrowLeft size={18} /> Try Another Category 
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
                    {/* Filter & Sort Bar */} 
                    <div className="flex justify-between items-center mb-10"> 
                        <button className="border-2 border-gray-100 px-8 py-3.5 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[#2D4A73] hover:bg-gray-50 transition-all">
                            <SlidersHorizontal size={16} /> Filter
                        </button> 
                        <button className="border-2 border-gray-100 px-8 py-3.5 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[#2D4A73] hover:bg-gray-50 transition-all">
                            Sort By <ChevronDown size={16} />
                        </button> 
                    </div> 

                    {/* Product Grid */} 
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10"> 
                        {products.map(product => ( 
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onQuickView={(p) => setSelectedProduct(p)} 
                            />
                        ))} 
                    </div> 
                </> 
            )}
        </div>
    );
};

export default CategoryProducts;