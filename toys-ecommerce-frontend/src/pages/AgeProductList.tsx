import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Home } from 'lucide-react'; // Added for UI icons
import axios from 'axios';

const AgeProductList = () => {
    const { ageId } = useParams(); // Captures "0-2-years" or similar from URL
    const navigate = useNavigate(); // For navigation back/home
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgeSpecificData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:8080/api/products/age/${ageId}`);
                setProducts(res.data);
                console.log("Fetched products for age range", ageId, res.data);
            } catch (err) {
                console.error("Failed to load products for age range", ageId);
            } finally {
                setLoading(false);
            }
        };
        fetchAgeSpecificData();
    }, [ageId]);

    // Handle back navigation
    const goBack = () => navigate(-1);
    const goHome = () => navigate('/');

    if (loading) {
        return <div className="p-20 text-center font-bold text-[#2D4A73]">Loading Toys...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-8 bg-white min-h-screen">
            {/* 🛠️ Top Navigation: Go Back Option */}
            <div className="mb-8">
                <button 
                    onClick={goBack}
                    className="flex items-center gap-2 text-[#2D4A73] font-bold hover:bg-gray-50 px-4 py-2 rounded-xl transition-all"
                >
                    <ArrowLeft size={20} /> Go Back
                </button>
            </div>

            {/* Dynamic Header */}
            <div className="text-center mb-12">
                <h1 className="text-6xl font-black text-[#2D4A73] mb-4 capitalize">
                    {ageId?.replace(/-/g, ' ')}
                </h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                    Explore safe and stimulating toys for babies aged {ageId?.replace(/-/g, ' ')}. 
                    From rattles to sensory toys, each piece is designed to spark curiosity.
                </p>
                <p className="mt-4 font-black text-gray-400 uppercase tracking-widest text-sm">
                    {products.length} Products Found
                </p>
            </div>

            {/* 🛠️ Conditional Rendering: Empty State Logic */}
            {products.length === 0 ? (
                <div className="mt-16 py-20 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-200 text-center">
                    <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ShoppingBag size={40} className="text-gray-300" />
                    </div>
                    <h2 className="text-3xl font-black text-[#2D4A73]">No Toys Found Yet</h2>
                    <p className="text-gray-400 mt-2 mb-10 font-medium">
                        We don't have items in this category right now. Check back soon!
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={goBack}
                            className="px-10 py-4 bg-white text-[#2D4A73] font-black rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={18} /> Try Another Age
                        </button>
                        <button 
                            onClick={goHome}
                            className="px-10 py-4 bg-[#2D4A73] text-white font-black rounded-2xl shadow-lg hover:bg-black transition-all flex items-center gap-2"
                        >
                            <Home size={18} /> Continue Shopping
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Filter & Sort Bar (Visible only if items exist) */}
                    <div className="flex justify-between items-center mb-10">
                        <button className="border-2 border-gray-100 px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-[#2D4A73] hover:bg-gray-50">Filter</button>
                        <button className="border-2 border-gray-100 px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-[#2D4A73] hover:bg-gray-50">Sort By</button>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {products.map(product => (
                            <div key={product.id} className="group cursor-pointer">
                                <div className="bg-gray-50 rounded-[3rem] p-10 aspect-square flex items-center justify-center overflow-hidden relative">
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name} 
                                        className="max-h-full group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h3 className="mt-6 font-bold text-xl text-[#2D4A73]">{product.name}</h3>
                                <p className="text-blue-600 font-black text-2xl mt-1">₹{product.sellingPrice}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default AgeProductList;