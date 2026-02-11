import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
    Calendar, User, Clock, ArrowLeft, 
    Share2, Bookmark, Loader2, ChevronRight 
} from 'lucide-react';
import { toast } from 'react-toastify';

const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    
    const [article, setArticle] = useState<any>(null);
    const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchArticleData();
    }, [slug]);

    const fetchArticleData = async () => {
        setLoading(true);
        try {
            // Fetch the main article
            const data = await api.articleService.getBySlug(slug!);
            setArticle(data);

            // Fetch related articles in the same category
            const related = await api.articleService.getByCategory(data.categorySlug);
            setRelatedArticles(related.filter((a: any) => a.slug !== slug).slice(0, 3));
        } catch (err) {
            toast.error("Article not found");
            navigate('/parenting');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-pink-500 mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opening the magazine...</p>
        </div>
    );

    return (
        <div className="bg-white min-h-screen pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-12">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-pink-500 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Hub
                    </button>
                    <div className="flex gap-4">
                        <button className="p-3 bg-gray-50 rounded-full hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-all">
                            <Share2 size={18} />
                        </button>
                        <button className="p-3 bg-gray-50 rounded-full hover:bg-pink-50 text-gray-400 hover:text-pink-500 transition-all">
                            <Bookmark size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16">
                    
                    {/* LEFT: MAIN CONTENT */}
                    <div className="flex-1 text-left">
                        <span className="bg-pink-50 text-pink-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {article.categorySlug}
                        </span>
                        
                        <h1 className="text-4xl md:text-6xl font-black text-[#2D4A73] italic uppercase leading-tight mt-6 mb-8">
                            {article.title}
                        </h1>

                        <div className="flex items-center gap-8 mb-12 py-6 border-y border-gray-50">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-pink-500" />
                                <span className="text-xs font-bold text-[#2D4A73] uppercase tracking-tighter">By {article.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-pink-500" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                    {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-pink-500" />
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">5 Min Read</span>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl mb-12 aspect-video">
                            <img 
                                src={article.imageUrl ? `http://localhost:8080${article.imageUrl}` : "/images/parenting-hero.jpg"} 
                                className="w-full h-full object-cover"
                                alt={article.title}
                            />
                        </div>

                        {/* Article Text */}
                        <div className="prose prose-lg max-w-none">
                            <p className="text-xl font-bold text-gray-500 leading-relaxed italic mb-8 border-l-4 border-pink-500 pl-6">
                                Everything you need to know about navigating this stage of your child's growth with confidence and joy.
                            </p>
                            <div 
                                className="text-gray-700 leading-loose text-lg space-y-6"
                                dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br/>') }}
                            />
                        </div>
                    </div>

                    {/* RIGHT: SIDEBAR */}
                    <div className="w-full lg:w-96">
                        <div className="sticky top-40 space-y-12">
                            
                            {/* Newsletter / CTA */}
                            <div className="bg-[#2D4A73] p-10 rounded-[3rem] text-white">
                                <h3 className="text-xl font-black uppercase italic mb-4 leading-tight">Join the <br/>Parent Hub</h3>
                                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-6">Weekly tips in your inbox</p>
                                <input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="w-full p-4 rounded-2xl bg-white/10 border-none outline-none mb-4 text-sm font-bold placeholder:text-blue-300"
                                />
                                <button className="w-full py-4 bg-pink-500 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Subscribe</button>
                            </div>

                            {/* Related Stories */}
                            <div>
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Related Stories</h3>
                                <div className="space-y-8">
                                    {relatedArticles.map(rel => (
                                        <Link key={rel.id} to={`/parenting/article/${rel.slug}`} className="group flex gap-4">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                                                <img src={`http://localhost:8080${rel.imageUrl}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className="font-black text-[#2D4A73] text-sm group-hover:text-pink-500 transition-colors leading-tight mb-2">
                                                    {rel.title}
                                                </h4>
                                                <div className="flex items-center text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                    Read More <ChevronRight size={10} />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetail;