import React, { useEffect, useState } from 'react';
import { 
    Edit3, Trash2, Eye, Plus, X, Save, Search, 
    Package, Layers, Activity, Tag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services/api'; 

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchInventory = async () => {
        const token = localStorage.getItem('jwtToken');
        
        if (!token || token === "null") {
            toast.error("Session expired. Please login as Admin.");
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            // ✨ Updated to use the correct /all endpoint as per backend controller
            const res = await inventoryService.getAll();
            setProducts(res.data);
        } catch (err: any) {
            console.error("Inventory Fetch Error:", err);
            if (err.response?.status === 403) {
                toast.error("Access Denied: Admin permissions required.");
            } else {
                toast.error("Failed to sync with PostgreSQL database.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchInventory(); }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm("⚠️ Permanently delete this toy from PostgreSQL?")) {
            try {
                await inventoryService.delete(id);
                toast.success("Database entry removed");
                fetchInventory();
            } catch (err) { 
                toast.error("Delete failed. Check server permissions."); 
            }
        }
    };

    const handleSaveUpdate = async () => {
        try {
            await inventoryService.update(selectedProduct.id, selectedProduct);
            toast.success("Master Record Synchronized");
            setSelectedProduct(null);
            fetchInventory();
        } catch (err) { 
            toast.error("Update failed. Check field constraints."); 
        }
    };

    const filteredProducts = products.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Activity className="animate-spin text-[#2D4A73] mb-4" size={48} />
            <h2 className="text-xl font-black text-[#2D4A73] uppercase tracking-tighter">Syncing Catalog...</h2>
        </div>
    );

    return (
        <div className="p-4 md:p-12 max-w-7xl mx-auto bg-[#F8FAFC] min-h-screen">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Layers className="text-pink-600" size={20} />
                        <span className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em]">Logistics Hub</span>
                    </div>
                    <h1 className="text-5xl font-black text-[#2D4A73] tracking-tighter leading-none">Inventory<br/>Control</h1>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 sm:w-80">
                        <Search className="absolute left-5 top-5 text-gray-300" size={20} />
                        <input 
                            placeholder="Find SKU, Name or Brand..." 
                            className="pl-14 pr-6 py-5 border-none rounded-[2rem] w-full outline-none focus:ring-4 ring-blue-50 bg-white shadow-xl shadow-gray-200/40 font-bold text-[#2D4A73]"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => navigate('/admin/add-product')}
                        className="bg-[#2D4A73] text-white px-10 py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-blue-200 active:scale-95"
                    >
                        <Plus size={24}/> New Unit
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[4rem] shadow-2xl shadow-gray-200/30 border border-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-10 py-8">Product Intelligence</th>
                                <th className="px-10 py-8">Identification</th>
                                <th className="px-10 py-8">Stock Level</th>
                                <th className="px-10 py-8">Valuation</th>
                                <th className="px-10 py-8 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center p-3 group-hover:scale-110 transition-transform shadow-inner overflow-hidden">
                                                <img src={p.imageUrl} className="object-contain w-full h-full drop-shadow-lg" alt="" />
                                            </div>
                                            <div>
                                                <div className="font-black text-[#2D4A73] text-lg leading-tight">{p.name}</div>
                                                <div className="text-[10px] text-pink-500 font-black uppercase mt-1">{p.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-sm font-black text-[#2D4A73]">{p.sku || 'UNASSIGNED'}</div>
                                        <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{p.brand}</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase border ${p.stock < 10 ? 'bg-red-50 text-red-500 border-red-100 animate-pulse' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                            <Package size={14} /> {p.stock} Units
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="font-black text-[#2D4A73] text-2xl tracking-tighter">₹{p.sellingPrice}</div>
                                        <div className="text-[10px] text-gray-300 font-bold line-through">MRP ₹{p.mrpPrice}</div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => { setSelectedProduct(p); setIsEditMode(false); }} className="p-4 text-blue-500 bg-blue-50/50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm"><Eye size={20}/></button>
                                            <button onClick={() => { setSelectedProduct(p); setIsEditMode(true); }} className="p-4 text-emerald-500 bg-emerald-50/50 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm"><Edit3 size={20}/></button>
                                            <button onClick={() => handleDelete(p.id)} className="p-4 text-rose-400 bg-rose-50/50 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={20}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {selectedProduct && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-[#2D4A73]/60 backdrop-blur-md z-50 flex justify-end">
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="bg-white w-full max-w-2xl h-full shadow-2xl p-8 md:p-16 overflow-y-auto relative">
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-8 right-8 p-4 bg-gray-50 hover:bg-gray-200 rounded-3xl transition-colors"><X/></button>
                            
                            <h2 className="text-5xl font-black text-[#2D4A73] tracking-tighter mb-2">{isEditMode ? 'Modify Toy' : 'Technicals'}</h2>
                            <p className="text-gray-400 text-xs font-black uppercase tracking-[0.3em] mb-12">Serial SKU: {selectedProduct.sku || 'N/A'}</p>

                            <div className="space-y-12">
                                <div className="bg-gray-50 rounded-[4rem] p-16 flex items-center justify-center border border-gray-100 shadow-inner">
                                    <img src={selectedProduct.imageUrl || ''} className="max-h-72 object-contain drop-shadow-2xl" alt="" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Full Product Name</label>
                                        <div className="relative mt-2">
                                            {/* ✨ Sanitized value with fallback to empty string */}
                                            <input 
                                                disabled={!isEditMode} 
                                                className="w-full p-6 bg-gray-50 rounded-3xl outline-none font-black text-2xl text-[#2D4A73] disabled:opacity-70" 
                                                value={selectedProduct.name || ''} 
                                                onChange={e => setSelectedProduct({...selectedProduct, name: e.target.value})} 
                                            />
                                            <Tag className="absolute right-6 top-6 text-gray-200" size={24} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Stock Level</label>
                                        <input 
                                            type="number" 
                                            disabled={!isEditMode} 
                                            className="w-full mt-2 p-6 bg-gray-50 rounded-3xl outline-none font-black text-[#2D4A73]" 
                                            value={selectedProduct.stock ?? 0} 
                                            onChange={e => setSelectedProduct({...selectedProduct, stock: parseInt(e.target.value) || 0})} 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Selling Price (₹)</label>
                                        <input 
                                            type="number" 
                                            disabled={!isEditMode} 
                                            className="w-full mt-2 p-6 bg-gray-50 rounded-3xl outline-none font-black text-emerald-600" 
                                            value={selectedProduct.sellingPrice ?? 0} 
                                            onChange={e => setSelectedProduct({...selectedProduct, sellingPrice: parseFloat(e.target.value) || 0})} 
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Database Description</label>
                                        <textarea 
                                            disabled={!isEditMode} 
                                            className="w-full mt-2 p-6 bg-gray-50 rounded-[2.5rem] outline-none font-bold text-gray-600 h-40 resize-none" 
                                            value={selectedProduct.detailedDescription || ''} 
                                            onChange={e => setSelectedProduct({...selectedProduct, detailedDescription: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                {isEditMode && (
                                    <button onClick={handleSaveUpdate} className="w-full bg-[#2D4A73] text-white py-8 rounded-[3rem] font-black text-xl hover:bg-black transition-all shadow-2xl shadow-blue-200 mt-6 flex items-center justify-center gap-3">
                                        <Save size={24} /> UPDATE REPOSITORY
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Inventory;