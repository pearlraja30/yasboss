import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import EmptyState from './EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '../types/Product';

const SearchResults: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) return;
            try {
                setLoading(true);
                const data = await productService.searchProducts(query);
                setProducts(data);
            } catch (err) {
                console.error("Search API Error:", err);
            } finally {
                setLoading(false);
            }
        };
        performSearch();
    }, [query]);

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Search Results for "{query}"
                    </h1>
                    <p className="text-gray-500 mt-2">{products.length} toys found</p>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-80 bg-gray-50 animate-pulse rounded-[2.5rem]" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SearchResults;