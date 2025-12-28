import * as React from 'react'; // Fixed for 'allowSyntheticDefaultImports'
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/api';
import { ShoppingCart, Truck, ShieldCheck, Loader2, Info, Rotate3d, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
// @ts-ignore - Ignoring if types are still propagating
import ThreeSixty from 'react-360-view';

interface ProductImage {
    id: number;
    imageUrl: string;
    is360View: boolean;
}

interface ProductDetailType {
    id: number;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    detailedDescription?: string;
    longDescription?: string;
    useCases?: string;
    images?: ProductImage[];
}

const ProductDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    
    // View States
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'zoom' | '360'>('zoom');
    const [images360, setImages360] = useState<string[]>([]);

    useEffect(() => {
        const loadProductData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await productService.getProductById(id);
                setProduct(data);
                setSelectedImage(data.imageUrl);
                
                // Filter images for 360 view
                const threeSixtySet = data.images
                    ?.filter((img: ProductImage) => img.is360View)
                    .map((img: ProductImage) => `http://localhost:8080${img.imageUrl}`) || [];
                setImages360(threeSixtySet);

                saveToLastViewed(data);
            } catch (err) {
                console.error("Failed to fetch product:", err);
                toast.error("Toy details could not be loaded.");
            } finally {
                setLoading(false);
            }
        };
        loadProductData();
    }, [id]);

    const handleAddToCart = async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            toast.warn("Please Sign In to add toys to your bag.");
            return;
        }

        setAddingToCart(true);
        try {
            await axios.post(
                `http://localhost:8080/api/cart/add/${id}`, 
                {}, 
                { headers: { 'X-User-Email': userEmail } }
            );
            toast.success(`${product?.name} added to your collection!`);
            setTimeout(() => navigate('/cart'), 800);
        } catch (error) {
            toast.error("Failed to add to cart.");
        } finally {
            setAddingToCart(false);
        }
    };

    const saveToLastViewed = (item: any) => {
        const history = JSON.parse(localStorage.getItem('recent_toys') || '[]');
        const filtered = history.filter((p: any) => p.id !== item.id);
        const newHistory = [item, ...filtered].slice(0, 4);
        localStorage.setItem('recent_toys', JSON.stringify(newHistory));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-[#2D4A73]" size={48} />
            <p className="mt-4 font-bold text-gray-500 italic">Unboxing Toy Details...</p>
        </div>
    );

    if (!product) return <div className="py-20 text-center font-bold">Toy not found.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* LEFT: Interactive Gallery */}
                <div className="space-y-6">
                    {/* View Mode Switcher */}
                    <div className="flex gap-2 mb-4">
                        <button 
                            onClick={() => setActiveTab('zoom')}
                            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'zoom' ? 'bg-[#2D4A73] text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                        >
                            <Search size={14} /> Zoom View
                        </button>
                        {images360.length > 0 && (
                            <button 
                                onClick={() => setActiveTab('360')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === '360' ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                            >
                                <Rotate3d size={14} /> 360° Rotate
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-[3rem] p-6 border-2 border-gray-50 shadow-sm overflow-hidden flex items-center justify-center min-h-[550px] relative">
                    </div>

                    {/* Thumbnail Switcher (Hidden in 360 mode for focus) */}
                    {activeTab === 'zoom' && (
                        <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
                            <img 
                                src={`http://localhost:8080${product.imageUrl}`}
                                onClick={() => setSelectedImage(product.imageUrl)}
                                className={`w-24 h-24 rounded-2xl cursor-pointer border-2 p-2 object-contain transition-all
                                    ${selectedImage === product.imageUrl ? 'border-[#2D4A73] bg-blue-50' : 'border-transparent bg-gray-50'}`}
                                alt="Default"
                            />
                            {product.images?.filter(img => !img.is360View).map((img) => (
                                <img 
                                    key={img.id}
                                    src={`http://localhost:8080${img.imageUrl}`}
                                    onClick={() => setSelectedImage(img.imageUrl)}
                                    className={`w-24 h-24 rounded-2xl cursor-pointer border-2 p-2 object-contain transition-all
                                        ${selectedImage === img.imageUrl ? 'border-[#2D4A73] bg-blue-50' : 'border-transparent bg-gray-50'}`}
                                    alt="Gallery"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: Product Info */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <span className="text-sm font-black text-blue-500 uppercase tracking-[0.15em]">{product.category}</span>
                        <h1 className="text-5xl font-black text-gray-900 mt-2 leading-tight tracking-tighter">{product.name}</h1>
                    </div>

                    <div className="flex items-center gap-6 mb-10">
                        <span className="text-6xl font-black text-[#2D4A73]">₹{product.price}</span>
                        <div className="flex flex-col">
                            <span className="text-gray-400 line-through font-bold">M.R.P.: ₹{Math.round(product.price * 1.5)}</span>
                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-md font-black mt-1 uppercase">33% Discount</span>
                        </div>
                    </div>

                    <div className="space-y-10 border-t pt-10 border-gray-100">
                        <section>
                            <h3 className="font-black text-gray-800 flex items-center gap-2 mb-4 text-lg uppercase tracking-tight">
                                <Info size={20} className="text-blue-500" /> Story Behind the Toy
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-md">
                                {product.longDescription || product.detailedDescription}
                            </p>
                        </section>

                        <section className="bg-blue-50/40 p-8 rounded-[2.5rem] border border-blue-100">
                            <h3 className="font-black text-[#2D4A73] mb-3 uppercase text-sm tracking-widest">How to play & Learn</h3>
                            <p className="text-sm text-gray-600 leading-relaxed italic font-medium">
                                {product.useCases || "Designed to enhance cognitive spatial awareness and fine motor skills through interactive play."}
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 flex gap-4">
                        <button className="flex-1 bg-[#2D4A73] text-white py-5 rounded-3xl font-black text-xl shadow-2xl shadow-blue-100 hover:bg-[#1e334f] transition-all transform active:scale-95 uppercase tracking-tighter">
                            Buy Now
                        </button>
                        <button 
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                            className="flex-1 border-4 border-[#2D4A73] text-[#2D4A73] py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-50 transition-all disabled:opacity-50 uppercase tracking-tighter"
                        >
                            {addingToCart ? <Loader2 className="animate-spin" size={26} /> : <ShoppingCart size={26} />}
                            {addingToCart ? 'Adding...' : 'Add to Bag'}
                        </button>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                            <Truck size={22} className="text-green-500" /> Free Shipping
                        </div>
                        <div className="flex items-center gap-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                            <ShieldCheck size={22} className="text-blue-500" /> Child Safe
                        </div>
                    </div>
                </div>
            </div>

            <RecentlyViewed />
        </div>
    );
};

const RecentlyViewed: React.FC = () => {
    const recent = JSON.parse(localStorage.getItem('recent_toys') || '[]');
    if (recent.length === 0) return null;

    return (
        <div className="mt-32 border-t pt-16">
            <h3 className="text-3xl font-black mb-12 text-gray-900 tracking-tighter">Continue Your Adventure</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                {recent.map((item: any) => (
                    <Link to={`/product/${item.id}`} key={item.id} className="group block">
                        <div className="h-60 flex items-center justify-center bg-gray-50 rounded-[3rem] mb-5 p-10 group-hover:bg-blue-50 transition-all duration-500 shadow-sm group-hover:shadow-xl">
                            <img src={`http://localhost:8080${item.imageUrl}`} className="h-full object-contain transition-transform duration-700 group-hover:scale-110" alt={item.name} />
                        </div>
                        <p className="text-md font-black text-gray-800 truncate px-2 text-center group-hover:text-[#2D4A73] transition-colors">{item.name}</p>
                        <p className="text-center text-[#2D4A73] font-black text-xl mt-1">₹{item.price}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductDetail;