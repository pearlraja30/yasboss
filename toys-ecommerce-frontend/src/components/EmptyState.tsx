import React from 'react';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyState: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="bg-gray-50 p-10 rounded-full mb-6 text-gray-300">
                <ShoppingBag size={80} strokeWidth={1} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! No toys found</h2>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                We couldn't find any products in this specific age group right now. Try exploring our other collections!
            </p>
            <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-pink-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-pink-700 transition shadow-lg shadow-pink-100"
            >
                <ArrowLeft size={18} /> Continue Shopping
            </button>
        </div>
    );
};

export default EmptyState;