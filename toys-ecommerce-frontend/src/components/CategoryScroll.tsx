import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const categories = [
    { 
        id: 'wooden', // This ID should match the 'category' name in your DB (e.g., wooden, indoor, puzzles)
        name: 'Wooden Toys', 
        img: '/images/cat/wooden.jpg', 
        bgColor: 'bg-cyan-400', 
        shape: 'rounded-[40%_60%_70%_30%/40%_50%_60%_40%]' 
    },
    { 
        id: 'indoor', 
        name: 'Indoor Games', 
        img: '/images/cat/indoor.jpg', 
        bgColor: 'bg-green-800', 
        shape: 'rounded-full' 
    },
    { 
        id: 'puzzles', 
        name: 'Puzzles', 
        img: '/images/cat/puzzles.jpg', 
        bgColor: 'bg-yellow-500', 
        shape: 'rounded-[50%_50%_50%_50%/60%_60%_40%_40%]' 
    },
];

const CategoryScroll: React.FC = () => {
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleCategoryClick = (categoryId: string) => {
        /* FIX: Match the route structure in App.tsx: /collection/:collectionRoute
           This sends 'wooden' or 'indoor' directly to CollectionProducts.tsx
        */
        navigate(`/collection/${categoryId.toLowerCase()}`);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 relative group">
            <h2 className="text-4xl font-serif mb-10">Shop by Categories</h2>
            
            {/* Scroll Buttons for better UX */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 z-10 bg-white p-2 rounded-full shadow-md border hover:bg-gray-50 hidden group-hover:block"
            >
                <ChevronLeft size={24} />
            </button>

            <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 z-10 bg-white p-2 rounded-full shadow-md border hover:bg-gray-50 hidden group-hover:block"
            >
                <ChevronRight size={24} />
            </button>

            <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-6 no-scrollbar pb-4 scroll-smooth"
            >
                {categories.map((cat) => (
                    <div key={cat.id} className="min-w-[300px] flex-shrink-0">
                        {/* Artistic Card Container */}
                        <div 
                            className={`${cat.bgColor} aspect-[3/4] p-6 relative overflow-hidden rounded-3xl cursor-pointer hover:shadow-2xl transition-all duration-300`}
                            onClick={() => handleCategoryClick(cat.id)}
                        >
                            {/* Hand-drawn style decorative elements */}
                            <div className="absolute top-4 right-4 text-white/60 text-2xl animate-pulse">✨</div>
                            <div className="absolute bottom-10 left-4 text-white/40 text-4xl">☁️</div>

                            {/* Shape-clipped Image Container */}
                            <div className={`w-full h-full overflow-hidden border-8 border-white/20 shadow-inner ${cat.shape}`}>
                                <img 
                                    src={cat.img} 
                                    alt={cat.name} 
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Text Link */}
                        <button 
                            onClick={() => handleCategoryClick(cat.id)}
                            className="mt-6 text-2xl font-semibold text-gray-800 hover:text-pink-600 transition-colors flex items-center group/btn"
                        >
                            {cat.name} 
                            <ChevronRight className="ml-2 transform group-hover/btn:translate-x-2 transition-transform" size={24} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryScroll;