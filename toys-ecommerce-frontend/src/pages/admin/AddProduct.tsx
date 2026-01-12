import React, { useState, useRef } from 'react';
import { productService } from '../../services/api';
import { toast } from 'react-toastify';
import { Upload, Image as ImageIcon, XCircle, CheckCircle2 } from 'lucide-react';

const AddProduct: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Activity Toys',
        mrpPrice: 0,
        sellingPrice: 0,
        discountPct: 0,
        shortDescription: '',
        detailedDescription: '',
        ageRange: '0-2-years',
        featured: false,
        stock: 10
    });

    // ✨ New states for file handling
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            // Create a local URL for the preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
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
        
        if (!selectedFile) {
            toast.error("Please browse and select a product image!");
            return;
        }

        try {
            // Prepare Multipart Data
            const data = new FormData();
            // We stringify the JSON part for the @RequestPart in Java
            data.append('product', JSON.stringify(formData));
            data.append('image', selectedFile);

            await productService.addProductWithImage(data);
            
            toast.success("Product & Image saved successfully!");
            // Optional: Reset form
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error) {
            toast.error("Failed to add product. Check server logs.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-10 bg-white rounded-[2.5rem] shadow-2xl my-10 border border-gray-50">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-50 text-[#2D4A73] rounded-2xl">
                    <CheckCircle2 size={24} />
                </div>
                <h2 className="text-3xl font-black text-[#2D4A73] tracking-tighter uppercase italic">Command Center: Add Toy</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">Full Product Name (SEO Friendly)</label>
                    <input 
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-[#2D4A73] focus:ring-2 focus:ring-blue-100 outline-none" 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. 5 in 1 Activity Cube - Learning House" 
                        required 
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">MRP Price (₹)</label>
                    <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-[#2D4A73] focus:ring-2 focus:ring-blue-100 outline-none" 
                        onChange={e => setFormData({...formData, mrpPrice: Number(e.target.value)})} />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">Selling Price (₹)</label>
                    <input type="number" className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-[#2D4A73] focus:ring-2 focus:ring-blue-100 outline-none" 
                        onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">Detailed Description</label>
                    <textarea 
                        className="w-full p-4 bg-gray-50 border-none rounded-2xl font-medium text-[#2D4A73] h-32 focus:ring-2 focus:ring-blue-100 outline-none" 
                        onChange={e => setFormData({...formData, detailedDescription: e.target.value})}
                        placeholder="Why Parents Love This..."
                    />
                </div>

                {/* --- ✨ FILE UPLOAD SECTION --- */}
                <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-3 ml-2 tracking-widest">Product Image Attachment</label>
                    
                    <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 rounded-[2.5rem] bg-gray-50 hover:bg-gray-100 transition-all group relative">
                        {previewUrl ? (
                            <div className="relative group">
                                <img src={previewUrl} alt="Preview" className="h-48 w-48 object-cover rounded-3xl shadow-xl border-4 border-white" />
                                <button 
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-black transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                    <ImageIcon size={32} />
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all flex items-center gap-3"
                                >
                                    <Upload size={16} /> Browse Product Image
                                </button>
                                <p className="mt-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">PNG, JPG or JPEG (Max 5MB)</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*" 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl w-fit">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-none text-[#2D4A73] focus:ring-0" 
                        onChange={e => setFormData({...formData, featured: e.target.checked})} />
                    <label className="text-xs font-black text-[#2D4A73] uppercase tracking-tighter">Mark as Bestseller (Featured)</label>
                </div>

                <button type="submit" className="md:col-span-2 bg-[#2D4A73] text-white py-6 rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95">
                    Save Product to Database
                </button>
            </form>
        </div>
    );
};

export default AddProduct;