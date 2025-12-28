import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const mainCats = [
    { id: 'activity-toys', name: 'Activity Toys', img: '/images/cat/activity.jpg' },
    { id: 'indoor-games', name: 'Indoor Games', img: '/images/cat/indoor.jpg' },
    { id: 'puzzles', name: 'Puzzles', img: '/images/cat/puzzles.jpg' },
    { id: 'return-gifts', name: 'Return Gifts', img: '/images/cat/return.jpg' },
];

const CategoryMenu: React.FC<CategoryMenuProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Background Blur Overlay - Click anywhere outside to close */}
            <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" 
                onClick={onClose} 
            />
            
            <div className="absolute top-full left-0 w-full bg-white z-50 border-b shadow-2xl animate-in slide-in-from-top duration-300">
                <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-12 relative">
                    
                    {/* Close Button */}
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>

                    {/* Main Visual Categories */}
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {mainCats.map((cat) => (
                            <Link 
                                key={cat.id} 
                                to={`/products/category/${cat.id}`} 
                                onClick={onClose}
                                className="group flex flex-col items-center"
                            >
                                <div className="w-full aspect-square rounded-[2rem] overflow-hidden mb-4 border border-gray-100 group-hover:shadow-xl transition-all duration-500">
                                    <img 
                                        src={cat.img} 
                                        alt={cat.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                                    />
                                </div>
                                <span className="text-sm font-black text-[#2D4A73] uppercase tracking-widest group-hover:text-pink-600 transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Sidebar: Secondary Categories */}
                    <div className="w-full md:w-64 border-l border-gray-100 md:pl-12">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Explore More</h3>
                        <div className="flex flex-col gap-4">
                            <Link 
                                to="/products/category/wooden-toys" 
                                onClick={onClose} 
                                className="text-gray-600 hover:text-[#2D4A73] font-bold text-sm transition-colors flex items-center justify-between group"
                            >
                                Wooden Toys
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                            <Link 
                                to="/products/category/all" 
                                onClick={onClose} 
                                className="text-gray-600 hover:text-[#2D4A73] font-bold text-sm transition-colors flex items-center justify-between group"
                            >
                                View All Products
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CategoryMenu;