import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { Product } from '../types/Product';

interface CompareDrawerProps {
    products: Product[];
    onClose: () => void;
    onRemove: (id: number) => void;
}

const CompareDrawer: React.FC<CompareDrawerProps> = ({ products, onClose, onRemove }) => {
    return (
        <AnimatePresence>
            {products.length > 0 && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[200] border-t rounded-t-[3rem]"
                >
                    <div className="max-w-7xl mx-auto p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Compare Toys ({products.length}/3)</h2>
                            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            {/* Feature Labels */}
                            <div className="space-y-8 pt-44 font-bold text-gray-400 text-sm uppercase">
                                <div className="h-12 border-b">Price</div>
                                <div className="h-12 border-b">Age Group</div>
                                <div className="h-24 border-b">Summary</div>
                                <div className="h-12 border-b">Featured</div>
                            </div>

                            {/* Product Columns */}
                            {products.map((p) => (
                                <div key={p.id} className="relative group">
                                    <button 
                                        onClick={() => onRemove(p.id)}
                                        className="absolute top-0 right-0 p-1 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X size={14}/>
                                    </button>
                                    <img src={`http://localhost:8080${p.imageUrl}`} className="h-32 w-full object-contain mb-4" alt={p.name}/>
                                    <h3 className="font-bold text-sm h-8 line-clamp-2 mb-4">{p.name}</h3>
                                    
                                    <div className="space-y-8 text-sm">
                                        <div className="h-12 border-b font-black text-pink-600">₹{p.price}</div>
                                        <div className="h-12 border-b text-gray-700">{p.ageRange}</div>
                                        <div className="h-24 border-b text-gray-500 overflow-hidden line-clamp-3 leading-relaxed">{p.description}</div>
                                        <div className="h-12 border-b">{p.featured ? <Check className="text-green-500"/> : <X className="text-gray-300"/>}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Placeholder for adding more */}
                            {products.length < 3 && (
                                <div className="border-2 border-dashed border-gray-100 rounded-3xl flex items-center justify-center text-gray-300">
                                    Select another toy to compare
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CompareDrawer;