import React, { useState, useRef, useEffect } from 'react';
import { productService, categoryService } from '../../services/api';
import { toast } from 'react-toastify';
import { 
    Upload, 
    Image as ImageIcon, 
    XCircle, 
    CheckCircle2, 
    Layers, 
    Baby, 
    Loader2, 
    AlertTriangle, 
    Eye,
    ShieldCheck
} from 'lucide-react';

const AddProduct: React.FC = () => {
    // ✨ FIX 1: Explicit initial boolean state
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        price: 0,
        stockQuantity: 10,
        description: '',
        detailedDescription: '',
        ageRange: '1-3 Years',
        featured: false
    });

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isLowStock = formData.stockQuantity > 0 && formData.stockQuantity < 5;
    const isOutOfStock = formData.stockQuantity <= 0;
    const selectedCategoryName = categories.find(c => String(c.id) === String(formData.categoryId))?.name || "Unassigned";

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const res = await categoryService.getAllCategories();
                const data = res.data || res;
                setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                toast.error("Could not load categories.");
            }
        };
        fetchCats();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLowStock) {
            const proceed = window.confirm("Stock level is critical (less than 5). Proceed with deployment?");
            if (!proceed) return;
        }

        if (!selectedFile) {
            toast.error("Please select a product image!");
            return;
        }
        if (!formData.categoryId) {
            toast.error("Please select a category!");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            
            // ✨ FIX 2: Explicit Sanitization before stringifying
            // Using !! ensures that null or undefined becomes false, preventing Java Parse Errors
            const productBlob = {
                ...formData,
                price: Number(formData.price),
                stockQuantity: Number(formData.stockQuantity),
                featured: !!formData.featured, 
                category: { id: Number(formData.categoryId) }
            };

            data.append('product', JSON.stringify(productBlob));
            data.append('image', selectedFile);

            await productService.addProductWithImage(data);
            
            toast.success("Asset deployed successfully! 🚀");
            
            // ✨ FIX 3: Clean Reset to standard booleans
            setFormData({
                name: '', 
                categoryId: '', 
                price: 0, 
                stockQuantity: 10,
                description: '', 
                detailedDescription: '', 
                ageRange: '1-3 Years', 
                featured: false
            });
            removeImage();
        } catch (error) {
            toast.error("Deployment failed. Check server connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 text-left">
            <div className="flex flex-col lg:flex-row gap-10">
                
                <div className="flex-1 bg-white rounded-[3.5rem] p-8 md:p-12 shadow-2xl border border-gray-50">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="p-4 bg-[#2D4A73] text-white rounded-2xl shadow-lg">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[#2D4A73] tracking-tighter uppercase italic">Inventory Deployment</h2>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 ml-1">HQ Security Cleared • Stock Validation Active</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Product Identity</label>
                            <input 
                                className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold text-[#2D4A73] focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g. Wooden Educational Train" required 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                                <Layers size={12} /> Catalog Category
                            </label>
                            <select 
                                className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold text-[#2D4A73] outline-none"
                                value={formData.categoryId}
                                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                required
                            >
                                <option value="">Choose Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex items-center gap-2">
                                <Baby size={12} /> Age Range
                            </label>
                            <select 
                                className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold text-[#2D4A73] outline-none"
                                value={formData.ageRange}
                                onChange={e => setFormData({...formData, ageRange: e.target.value})}
                            >
                                <option value="0-6 Months">0-6 Months</option>
                                <option value="6-12 Months">6-12 Months</option>
                                <option value="1-3 Years">1-3 Years</option>
                                <option value="3+ Years">3+ Years</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Selling Price (₹)</label>
                            <input 
                                type="number" 
                                className="w-full p-5 bg-gray-50 border-none rounded-2xl font-bold text-[#2D4A73] outline-none" 
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest flex justify-between">
                                Inventory Stock
                                {isLowStock && <span className="text-orange-500 flex items-center gap-1 animate-pulse"><AlertTriangle size={12}/> Low Stock</span>}
                            </label>
                            <input 
                                type="number" 
                                className={`w-full p-5 rounded-2xl font-bold outline-none transition-all ${
                                    isOutOfStock ? 'bg-red-50 text-red-600' : isLowStock ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-[#2D4A73]'
                                }`}
                                value={formData.stockQuantity}
                                onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} 
                                required
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2 tracking-widest">Full Specs</label>
                            <textarea 
                                className="w-full p-5 bg-gray-50 border-none rounded-3xl font-medium text-[#2D4A73] h-32 outline-none focus:ring-2 ring-blue-50 resize-none" 
                                value={formData.detailedDescription}
                                onChange={e => setFormData({...formData, detailedDescription: e.target.value})}
                                placeholder="Materials, safety certifications, and play value..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-2 tracking-widest">Visual Asset</label>
                            <div className="relative border-4 border-dashed border-gray-50 rounded-[3rem] p-10 bg-gray-50/50 flex flex-col items-center justify-center transition-all hover:bg-gray-50 group">
                                {previewUrl ? (
                                    <div className="relative">
                                        <img src={previewUrl} alt="Preview" className="h-48 w-48 object-contain bg-white rounded-[2rem] shadow-2xl p-4" />
                                        <button type="button" onClick={removeImage} className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-2 shadow-lg"><XCircle size={20} /></button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#2D4A73] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl">
                                        <Upload size={18} /> Upload Image
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || isOutOfStock}
                            className={`md:col-span-2 py-8 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 ${
                                isOutOfStock ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-[#2D4A73] text-white hover:bg-pink-600'
                            }`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : "Finalize Deployment"}
                        </button>
                    </form>
                </div>

                <div className="lg:w-80 space-y-6">
                    <div className="bg-[#2D4A73] rounded-[3rem] p-8 text-white shadow-xl sticky top-32 overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Eye size={80} />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-blue-200 flex items-center gap-2">
                            <Eye size={14} /> Live Preview
                        </h3>
                        
                        <div className="bg-white rounded-[2.5rem] p-4 text-[#2D4A73] shadow-inner mb-6 aspect-[4/5] flex flex-col">
                            <div className="flex-1 bg-gray-50 rounded-[2rem] flex items-center justify-center overflow-hidden border border-gray-100">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain p-4" />
                                ) : (
                                    <ImageIcon size={40} className="text-gray-200" />
                                )}
                            </div>
                            <div className="mt-4 px-2">
                                <span className="text-[8px] font-black uppercase text-pink-500 tracking-widest">{selectedCategoryName}</span>
                                <h4 className="font-black text-sm uppercase truncate mt-1">{formData.name || "Product Name"}</h4>
                                <p className="font-black text-xs mt-2">₹{formData.price || "0"}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                {/* ✨ FIX 4: Explicit .checked usage */}
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 rounded-lg accent-pink-500" 
                                    checked={formData.featured || false}
                                    onChange={e => setFormData({...formData, featured: e.target.checked})} 
                                />
                                <label className="text-[10px] font-black uppercase tracking-widest">Bestseller Status</label>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-[8px] font-black uppercase text-blue-200 mb-2">Technical Health</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold">Stock Priority</span>
                                    <span className={`text-[10px] font-black ${isLowStock ? 'text-orange-400' : 'text-green-400'}`}>
                                        {isOutOfStock ? 'CRITICAL' : isLowStock ? 'LOW' : 'OPTIMAL'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AddProduct;