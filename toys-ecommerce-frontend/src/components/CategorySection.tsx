import React from 'react';
import { useNavigate } from 'react-router-dom';

const categories = [
    { title: "Wooden Toys", image: "/images/cat/wooden.jpg", color: "bg-blue-100", route: "wooden-toys" },
    { title: "Indoor Games", image: "/images/cat/indoor.jpg", color: "bg-green-100", route: "indoor-games" },
    { title: "Puzzles", image: "/images/cat/puzzles.jpg", color: "bg-yellow-100", route: "puzzles" }
];

const CategorySection: React.FC = () => {
    const navigate = useNavigate();

    return (
        <section className="py-12 px-4 max-w-7xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-8">Shop by Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {categories.map((cat, index) => (
                    <div 
                        key={index}
                        onClick={() => navigate(`/collection/${cat.route}`)}
                        className="cursor-pointer group flex flex-col"
                    >
                        <div className={`${cat.color} rounded-3xl overflow-hidden aspect-[3/4] relative transition-transform duration-500 group-hover:scale-[1.02] shadow-sm`}>
                            <img 
                                src={cat.image} 
                                alt={cat.title} 
                                className="w-full h-full object-cover mix-blend-multiply opacity-90"
                            />
                        </div>
                        <span className="mt-4 text-xl font-bold flex items-center gap-2">
                            {cat.title} <span className="text-gray-400">→</span>
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;