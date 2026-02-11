import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ChevronRight, Loader2 } from 'lucide-react'; // Added Loader2
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Added toast import

const ParentingHub: React.FC = () => {
    // ✨ Added missing states
    const [ageOptions, setAgeOptions] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        
        // ✨ Fetching both Age Groups and Articles simultaneously
        Promise.all([
            api.articleService.getFeatured(),
            api.articleService.getAgeGroups()
        ])
        .then(([articlesData, ageData]) => {
            setArticles(Array.isArray(articlesData) ? articlesData : []);
            setAgeOptions(Array.isArray(ageData) ? ageData : []);
        })
        .catch(err => {
            console.error("Hub Load Error:", err);
            toast.error("Failed to load Hub data");
        })
        .finally(() => setLoading(false));
    }, []);

    // ✨ Added Loading State UI
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="animate-spin text-pink-500 mb-4" size={40} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Preparing your parenting magic...</p>
            </div>
        );
    }

    // Get the first featured article to display in the Hero section
    const featuredArticle = articles.length > 0 ? articles[0] : null;

    return (
        <div className="max-w-7xl mx-auto p-6 md:p-12 flex flex-col md:flex-row gap-12 text-left bg-white pt-32">
            {/* Left: Featured Article Section */}
            <div className="flex-1 rounded-[3rem] overflow-hidden shadow-2xl relative min-h-[500px] group cursor-pointer">
                <img 
                    src={featuredArticle?.imageUrl || "/images/parenting-hero.jpg"} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    alt="Parenting Advice" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-12 left-12 right-12 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-pink-400">Featured Article</p>
                    <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-none mb-6">
                        {featuredArticle?.title || "Healthy Living for Tiny Humans"}
                    </h2>
                    <button 
                        onClick={() => featuredArticle && navigate(`/parenting/article/${featuredArticle.slug}`)}
                        className="bg-white text-[#2D4A73] px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-pink-500 hover:text-white transition-all shadow-xl"
                    >
                        Read Now
                    </button>
                </div>
            </div>

            {/* Right: Personalization Sidebar */}
            <div className="w-full md:w-[450px] bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 flex flex-col">
                <div className="mb-10">
                    <h3 className="text-2xl font-black text-[#2D4A73] uppercase italic leading-tight">
                        Get Personalised <br/>
                        <span className="text-pink-500 underline decoration-wavy underline-offset-8">Parenting Advice</span>
                    </h3>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-6">Select your child's age</p>
                </div>
                
                <div className="space-y-4">
                    {Array.isArray(ageOptions) &&ageOptions.length > 0 ? (
                        ageOptions.map(option => (
                            <button 
                                key={option.id} 
                                onClick={() => navigate(`/parenting/category/${option.categorySlug}`)}
                                className="w-full flex items-center gap-6 p-5 rounded-[2rem] hover:bg-pink-50 transition-all group border border-transparent hover:border-pink-100"
                            >
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-100 shrink-0 bg-gray-50">
                                    <img 
                                        src={option.imageUrl || "/images/ages/default.png"} 
                                        className="w-full h-full object-cover" 
                                        alt={option.name} 
                                    />
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-black text-[#2D4A73] text-lg leading-none">{option.name}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{option.range}</p>
                                </div>
                                <ChevronRight className="text-gray-200 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                            </button>
                        ))
                    ) : (
                        <p className="text-gray-400 text-xs italic">No age groups available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentingHub;