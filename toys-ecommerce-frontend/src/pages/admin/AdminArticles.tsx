import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Clock, User, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ArticleDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                // Use the service we added to api.ts earlier
                const data = await api.articleService.getBySlug(slug!);
                setArticle(data);
            } catch (err) {
                toast.error("Article not found");
                navigate('/parenting');
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchArticle();
    }, [slug, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-pink-500 mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Story...</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-12 text-left bg-white pt-32">
            <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-pink-500 mb-8 transition-colors"
            >
                <ArrowLeft size={14} /> Back
            </button>

            <img 
                src={article.imageUrl ? `http://localhost:8080${article.imageUrl}` : "/images/parenting-hero.jpg"} 
                className="w-full h-[400px] object-cover rounded-[3rem] shadow-2xl mb-10" 
                alt={article.title} 
            />

            <div className="flex items-center gap-6 mb-6">
                <span className="bg-pink-50 text-pink-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {article.categorySlug}
                </span>
                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase">
                    <Clock size={12} /> 5 Min Read
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-[#2D4A73] italic uppercase leading-none mb-8">
                {article.title}
            </h1>

            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#2D4A73] font-black text-xs">
                    {article.author?.charAt(0) || 'A'}
                </div>
                <div>
                    <p className="text-xs font-black text-[#2D4A73] uppercase tracking-tighter">By {article.author || 'Admin'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(article.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Content Body */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed font-medium">
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
        </div>
    );
};

export default ArticleDetail;