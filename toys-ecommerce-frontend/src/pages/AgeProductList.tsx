import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Home, ShoppingCart, Eye, Loader2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AgeProductList = () => {
    const { ageId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgeSpecificData = async () => {
            try {
                setLoading(true);
                // Modernized API call
                const res = await axios.get(`http://localhost:8080/api/products/age/${ageId}`);
                setProducts(res.data);
            } catch (err) {
                toast.error("Failed to load age-specific toys.");
            } finally {
                setLoading(false);
            }
        };
        fetchAgeSpecificData();
    }, [ageId]);

    const handleQuickAdd = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault(); // Prevent navigation
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return toast.warn("Please login to add items!");

        try {
            await axios.post(`http://localhost:8080/api/cart/add/${productId}`, {}, {
                headers: { 'X-User-Email': userEmail }
            });
            toast.success("Added to bag!");
        } catch (error) {
            toast.error("Failed to add to cart.");
        }
    };

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#2D4A73]" size={48} />
            <p className="mt-4 font-black text-[#2D4A73] uppercase tracking-widest">Unboxing Toys...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="mb-16">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-black text-[#2D4A73] mb-8 hover:translate-x-[-4px] transition-transform">
                    <ArrowLeft size={20} /> GO BACK
                </button>
                <h1 className="text-7xl font-black text-[#2D4A73] tracking-tighter capitalize">{ageId?.replace(/-/g, ' ')}</h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {products.map(product => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group">
                        <div className="bg-gray-50 rounded-[3.5rem] p-12 aspect-square flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-100">
                            <img 
                                src={product.imageUrl}
                                className="max-h-full object-contain group-hover:scale-110 transition-transform duration-700" 
                                alt={product.name} 
                            />
                            
                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <button 
                                    onClick={(e) => handleQuickAdd(e, product.id)}
                                    className="p-5 bg-[#2D4A73] text-white rounded-3xl hover:bg-black transition-all shadow-xl"
                                >
                                    <ShoppingCart size={24} />
                                </button>
                                <div className="p-5 bg-white text-[#2D4A73] rounded-3xl shadow-xl">
                                    <Eye size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 px-4">
                            <h3 className="text-2xl font-black text-[#2D4A73] tracking-tight">{product.name}</h3>
                            <p className="text-3xl font-black text-blue-600 mt-2">₹{product.price}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AgeProductList;