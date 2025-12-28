import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AgeCategories: React.FC = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const categories = [
        { id: '0-2-years', label: '0-2 YEARS', image: '/images/products/age-0-2.jpg' },
        { id: '2-4-years', label: '2-4 YEARS', image: '/images/products/age-2-4.jpg' },
        { id: '4-6-years', label: '4-6 YEARS', image: '/images/products/age-4-6.jpg' },
        { id: '6-years', label: '6-8 YEARS', image: '/images/products/age-6.jpg' }
    ];

    // Function to handle horizontal scrolling
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollTo = direction === 'left' 
                ? scrollLeft - clientWidth 
                : scrollLeft + clientWidth;
            
            scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="max-w-7xl mx-auto px-4 py-16 relative group">
            <h2 className="text-3xl font-bold text-[#2D4A73] mb-10 font-serif">Shop by AGE</h2>
            
            {/* Left Arrow Button */}
            <button 
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-white p-3 rounded-full shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
            >
                <ChevronLeft size={24} />
            </button>

            {/* Horizontal Scroll Container */}
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 no-scrollbar snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((cat) => (
                    <div 
                        key={cat.id}
                        onClick={() => navigate(`/products/age/${cat.id}`)}
                        className="flex-none w-[85%] md:w-[32%] snap-start cursor-pointer relative rounded-[2.5rem] overflow-hidden shadow-md"
                    >
                        <img 
                            src={cat.image} 
                            alt={cat.label} 
                            className="w-full h-[400px] object-cover" 
                        />
                      {/*  <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                            <button className="bg-[#E4407B] text-white font-black px-10 py-4 rounded-full text-xl whitespace-nowrap">
                                {cat.label}
                            </button>
                        </div> */}
                    </div>
                ))}
            </div>

            {/* Right Arrow Button */}
            <button 
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-white p-3 rounded-full shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
            >
                <ChevronRight size={24} />
            </button>
        </section>
    );
};

export default AgeCategories;