import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Eye, Plus, X, Save, Search, Star, Package, Info, Tag, Ruler } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { fetchInventory(); }, []);

    const fetchInventory = async () => {
        try {
            // Updated endpoint to match standard controller naming
            const res = await axios.get('http://localhost:8080/api/products');
            setProducts(res.data);
        } catch (err) {
            toast.error("Failed to fetch database records.");
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("⚠️ This will permanently remove the toy from PostgreSQL. Continue?")) {
            try {
                await axios.delete(`http://localhost:8080/api/products/${id}`);
                toast.success("Product Deleted Successfully");
                fetchInventory();
            } catch (err) { toast.error("Delete failed."); }
        }
    };

    const handleSaveUpdate = async () => {
        try {
            // Fixed mapping to standard PUT endpoint
            await axios.put(`http://localhost:8080/api/products/${selectedProduct.id}`, selectedProduct);
            toast.success("Database Updated Successfully");
            setSelectedProduct(null);
            fetchInventory();
        } catch (err) { toast.error("Update Failed. Check server logs."); }
    };

    const filteredProducts = products.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto bg-[#F8FAFC] min-h-screen">
            {/* Header with Search & New Product Logic */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-[#2D4A73] tracking-tight">Inventory Control</h1>
                    <p className="text-gray-400 text-sm mt-1 font-medium uppercase tracking-widest">Master Stock & SKU Management</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-4 top-4 text-gray-300" size={18} />
                        <input 
                            placeholder="Search name, SKU, or brand..." 
                            className="pl-12 pr-4 py-4 border-none rounded-2xl w-full outline-none focus:ring-4 ring-blue-50 bg-white shadow-sm font-bold"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => navigate('/admin/add-product')}
                        className="bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-[#1e334f] transition-all shadow-xl shadow-blue-100"
                    >
                        <Plus size={20}/> Add New Toy
                    </button>
                </div>
            </div>

            {/* Advanced Table UI */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <th className="p-6">Toy Details</th>
                            <th className="p-6">SKU & Brand</th>
                            <th className="p-6">Inventory Status</th>
                            <th className="p-6">Pricing</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-blue-50/20 transition-all duration-300 group">
                                <td className="p-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-[1.5rem] flex items-center justify-center p-2 group-hover:rotate-3 transition-transform overflow-hidden">
                                            {/* Fix: Ensure imageUrl is correctly prefixed if stored as a relative path */}
                                            <img src={p.imageUrl} className="object-contain w-full h-full" alt="" />
                                        </div>
                                        <div>
                                            <div className="font-black text-[#2D4A73] text-base">{p.name}</div>
                                            <div className="text-[10px] text-pink-500 font-black uppercase tracking-widest">{p.category}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <div className="text-sm font-bold text-gray-700">{p.sku || 'NO-SKU'}</div>
                                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{p.brand || 'No Brand'}</div>
                                </td>
                                <td className="p-6">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${p.stock < 10 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                        <Package size={12} /> {p.stock} Units
                                    </div>
                                    {p.isFeatured && <div className="text-[9px] text-amber-500 font-black uppercase mt-1">★ Featured Toy</div>}
                                </td>
                                <td className="p-6">
                                    <div className="font-black text-[#2D4A73] text-lg">₹{p.sellingPrice}</div>
                                    <div className="text-[10px] text-gray-300 line-through">MRP ₹{p.mrpPrice}</div>
                                </td>
                                <td className="p-6 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setSelectedProduct(p); setIsEditMode(false); }} className="p-3 text-blue-500 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white"><Eye size={18}/></button>
                                        <button onClick={() => { setSelectedProduct(p); setIsEditMode(true); }} className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all shadow-sm bg-white"><Edit3 size={18}/></button>
                                        <button onClick={() => handleDelete(p.id)} className="p-3 text-rose-400 hover:bg-rose-50 rounded-2xl transition-all shadow-sm bg-white"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- SLIDE-OVER DETAIL MODAL --- */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-[#2D4A73]/40 backdrop-blur-lg z-50 flex justify-end">
                    <div className="bg-white w-full max-w-2xl h-full shadow-2xl p-12 overflow-y-auto border-l border-gray-100">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-4xl font-black text-[#2D4A73] tracking-tighter">{isEditMode ? 'Edit Toy Details' : 'Product Technicals'}</h2>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Catalog Item #{selectedProduct.id}</p>
                            </div>
                            <button onClick={() => setSelectedProduct(null)} className="p-4 bg-gray-50 hover:bg-gray-100 rounded-3xl transition-colors"><X/></button>
                        </div>

                        <div className="space-y-10">
                            <div className="relative group bg-gray-50 rounded-[3rem] p-12 flex items-center justify-center border border-gray-100">
                                <img src={selectedProduct.imageUrl} className="max-h-64 object-contain drop-shadow-2xl" alt="" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Display Name</label>
                                    <input disabled={!isEditMode} className="w-full mt-2 p-5 bg-gray-50 border-none rounded-2xl outline-none font-bold text-[#2D4A73]" value={selectedProduct.name} onChange={e => setSelectedProduct({...selectedProduct, name: e.target.value})} />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">SKU Code</label>
                                    <input disabled={!isEditMode} className="w-full mt-2 p-5 bg-gray-50 border-none rounded-2xl outline-none font-bold text-blue-600" value={selectedProduct.sku} onChange={e => setSelectedProduct({...selectedProduct, sku: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Brand</label>
                                    <input disabled={!isEditMode} className="w-full mt-2 p-5 bg-gray-50 border-none rounded-2xl outline-none font-bold" value={selectedProduct.brand} onChange={e => setSelectedProduct({...selectedProduct, brand: e.target.value})} />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Selling Price (₹)</label>
                                    <input type="number" disabled={!isEditMode} className="w-full mt-2 p-5 bg-gray-50 border-none rounded-2xl outline-none font-black text-green-600" value={selectedProduct.sellingPrice} onChange={e => setSelectedProduct({...selectedProduct, sellingPrice: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Current Stock</label>
                                    <input type="number" disabled={!isEditMode} className="w-full mt-2 p-5 bg-gray-50 border-none rounded-2xl outline-none font-black" value={selectedProduct.stock} onChange={e => setSelectedProduct({...selectedProduct, stock: e.target.value})} />
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Technical Description</label>
                                    <textarea disabled={!isEditMode} className="w-full mt-2 p-5 bg-gray-50 border-none rounded-[2rem] h-44 outline-none leading-relaxed font-medium text-gray-600" value={selectedProduct.detailedDescription} onChange={e => setSelectedProduct({...selectedProduct, detailedDescription: e.target.value})} />
                                </div>
                            </div>

                            {isEditMode && (
                                <button onClick={handleSaveUpdate} className="w-full bg-[#2D4A73] text-white py-6 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-blue-200">
                                    <Save size={24}/> UPDATE MASTER RECORD
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;