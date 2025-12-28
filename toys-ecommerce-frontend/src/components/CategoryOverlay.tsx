import React from 'react';
import type { categories, Category } from '../data/CategoriesData';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const CategoryOverlay: React.FC<CategoryOverlayProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Component for a single Category Tile
    const CategoryTile: React.FC<{ category: Category }> = ({ category }) => (
        <Link 
            to={`/products/category/${category.route}`} 
            onClick={onClose}
            className="group block p-4 border border-gray-200 rounded-lg text-center hover:shadow-lg transition-shadow duration-200 bg-white"
        >
            {/* Placeholder Image (replace with actual image tag) */}
            <div className="h-28 w-28 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                <img src={category.imageUrl} alt={category.name} className="object-cover w-full h-full" />
            </div>
            <p className="font-semibold text-gray-700 group-hover:text-pink-600">{category.name}</p>
        </Link>
    );

    return (
        // Overlay container fixed over the content
        <div className="fixed inset-0 z-40 bg-white shadow-2xl overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                
                {/* Header and Close Button */}
                <div className="flex justify-end mb-8">
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row lg:space-x-12">
                    
                    {/* Main Category Tiles (Grid) */}
                    <div className="lg:w-3/4">
                        <h2 className="text-3xl font-serif font-bold mb-8">Categories</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {categories.map(cat => <CategoryTile key={cat.id} category={cat} />)}
                        </div>
                    </div>

                    {/* Other Categories Sidebar (from image) */}
                    <div className="lg:w-1/4 mt-12 lg:mt-0 lg:border-l lg:pl-10">
                        <h3 className="text-xl font-bold mb-4">Other Categories</h3>
                        <ul className="space-y-3 text-gray-700">
                            <li><Link to="/products/category/wooden-toys" className="hover:text-pink-600" onClick={onClose}>Wooden Toys</Link></li>
                            <li><Link to="/products" className="hover:text-pink-600" onClick={onClose}>All Products</Link></li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CategoryOverlay;