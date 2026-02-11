import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, ShieldCheck, Trash2, Save, Plus, Loader2, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';

const CategoryManager = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: null as number | null,
        name: '',
        description: '',
        warrantyDays: 7,
        imageUrl: ''
    });

    const fetchCategories = async () => {
        try {
            const res = await api.categoryService.getAllCategories();
            
            // ✨ FIX: Axios type-safe data extraction
            // Ensures we extract the array regardless of how the API service is structured
            const data = (res && (res as any).data) ? (res as any).data : res;
            
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error("Failed to load categories");
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.categoryService.saveCategory(formData);
            toast.success(formData.id ? "Category updated! 📂" : "Category created! 📂");
            
            // Reset form
            setFormData({ id: null, name: '', description: '', warrantyDays: 7, imageUrl: '' });
            fetchCategories();
        } catch (err) {
            toast.error("Save failed. Check if name is unique.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (cat: any) => {
        setFormData({
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            warrantyDays: cat.warrantyDays || 7,
            imageUrl: cat.imageUrl || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteCategory = async (id: number) => {
        if (!window.confirm("Delete category? This might affect products linked to it.")) return;
        try {
            await api.categoryService.deleteCategory(id);
            toast.info("Category removed");
            fetchCategories();
        } catch (err) {
            toast.error("Cannot delete category with active products.");
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Building the catalog...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-8 pt-32 min-h-screen text-left">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-[#2D4A73] italic uppercase">
                    Catalog <span className="text-pink-500">Architecture</span>
                </h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Define product groups and warranty windows</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-10">
                {/* --- 📂 CREATE/EDIT FORM --- */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-fit sticky top-32 transition-all">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-[#2D4A73] uppercase flex items-center gap-2">
                            {formData.id ? <Edit3 size={16} className="text-pink-500" /> : <Plus size={16} />} 
                            {formData.id ? 'Edit Category' : 'New Category'}
                        </h3>
                        {formData.id && (
                            <button 
                                onClick={() => setFormData({ id: null, name: '', description: '', warrantyDays: 7, imageUrl: '' })}
                                className="text-[9px] font-black text-blue-500 uppercase underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    
                    <form onSubmit={handleSave} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Category Name</label>
                            <input 
                                type="text" 
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-none focus:ring-2 ring-pink-100 transition-all"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="e.g., Soft Toys" required
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2 flex items-center gap-1">
                                <ShieldCheck size={10} /> Warranty Window (Days)
                            </label>
                            <input 
                                type="number" 
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-none focus:ring-2 ring-pink-100 transition-all"
                                value={formData.warrantyDays}
                                onChange={e => setFormData({...formData, warrantyDays: parseInt(e.target.value)})}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Description</label>
                            <textarea 
                                className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none border-none h-24 resize-none focus:ring-2 ring-pink-100 transition-all"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="What kind of items go here?"
                            />
                        </div>

                        <button 
                            disabled={isSaving}
                            className="w-full py-5 bg-[#2D4A73] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-blue-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {formData.id ? "Update Configuration" : "Deploy Category"}
                        </button>
                    </form>
                </div>

                {/* --- 📋 CATEGORY LIST --- */}
                <div className="lg:col-span-2 grid md:grid-cols-2 gap-4">
                    {categories.length === 0 ? (
                        <div className="col-span-2 text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                             <Layers className="mx-auto text-gray-200 mb-4" size={48} />
                             <p className="text-gray-400 font-bold uppercase text-xs">No categories established yet.</p>
                        </div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-50/50 transition-all group relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-pink-50 transition-colors">
                                        <Layers className="text-[#2D4A73] group-hover:text-pink-500" size={24} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleEdit(cat)} 
                                            className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                                            title="Edit Category"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => deleteCategory(cat.id)} 
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                            title="Delete Category"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h4 className="font-black text-[#2D4A73] text-xl uppercase italic mb-1">{cat.name}</h4>
                                <p className="text-gray-400 text-xs font-medium mb-4 line-clamp-2 min-h-[2rem]">
                                    {cat.description || 'No description provided for this collection.'}
                                </p>
                                
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#2D4A73] rounded-xl w-fit group-hover:bg-pink-500 transition-colors">
                                    <ShieldCheck size={12} className="text-white" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{cat.warrantyDays} Day Warranty</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;