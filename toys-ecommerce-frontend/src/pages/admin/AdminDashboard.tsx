import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Truck, CheckCircle, RefreshCcw, ExternalLink, 
    Layers, DollarSign, Activity, User, Phone, FileText,
    Upload, Rotate3d, Image as ImageIcon, Trash2, Loader2,
    Search, Megaphone, LayoutDashboard, Filter, Baby
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { adminService, productService, categoryService } from '../../services/api'; 
import AdminMediaActions from './AdminMediaActions'; 
import Bulk360Upload from './Bulk360Upload'; 
import AnnouncementManager from './AnnouncementManager';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'logistics' | 'announcements'>('logistics');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, pending: 0, fulfillmentRate: 0 });
    const navigate = useNavigate();

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [filters, setFilters] = useState({ search: '', category: '', age: '' });
    
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedProductData, setSelectedProductData] = useState<any>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);

    // ✨ FIX: Helper to extract data from Axios response safely
    const extractData = (res: any) => {
        if (!res) return [];
        return res.data ? res.data : res;
    };

    const handleSearch = useCallback(async () => {
        try {
            const res = await productService.getFilteredProducts(
                filters.category, 
                filters.age, 
                filters.search
            );
            // ✅ Fix: Extracting the data array before setting state
            setProducts(extractData(res));
        } catch (err) {
            toast.error("Search failed");
        }
    }, [filters]);

    const fetchDashboardData = useCallback(async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token) { navigate('/login'); return; }

        try {
            setLoading(true);
            const [orderRes, catRes] = await Promise.all([
                adminService.getAllOrders(),
                categoryService.getAllCategories()
            ]);

            const orderData = extractData(orderRes);
            setOrders(orderData);
            setCategories(extractData(catRes)); 
            
            const revenue = orderData.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
            const pending = orderData.filter((o: any) => o.status === 'PENDING').length;
            const rate = orderData.length ? ((orderData.filter((o: any) => o.status === 'DELIVERED').length / orderData.length) * 100).toFixed(0) : 0;
            
            setStats({ totalRevenue: revenue, pending: pending, fulfillmentRate: Number(rate) });
            
            // Initial product load
            await handleSearch();
        } catch (err: any) {
            toast.error("Failed to load Command Center");
        } finally {
            setLoading(false);
        }
    }, [navigate, handleSearch]);

    useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

    const fetchProductDetails = async (id: number) => {
        try {
            const data = await productService.getProductById(String(id));
            setSelectedProductData(data);
        } catch (err) {
            toast.error("Failed to load product images.");
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || !selectedProductId) return toast.error("Select files!");
        setUploading(true);
        try {
            for (const file of Array.from(selectedFiles)) {
                await productService.uploadMedia(selectedProductId, file, false, file.type.startsWith('video/'));
            }
            toast.success("Gallery updated!");
            fetchProductDetails(selectedProductId); 
        } finally { setUploading(false); }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!window.confirm("Delete item?")) return;
        try {
            await productService.deleteMedia(imageId);
            if (selectedProductId) fetchProductDetails(selectedProductId);
        } catch (err) {}
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Activity className="animate-spin text-[#2D4A73]" size={48} />
        </div>
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen p-4 md:p-12 text-left">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-2 w-12 bg-pink-600 rounded-full" />
                            <span className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em]">HQ Command</span>
                        </div>
                        <h1 className="text-6xl font-black text-[#2D4A73] tracking-tighter leading-none italic">Command <span className="text-blue-600">Center</span></h1>
                    </div>
                    
                    <div className="flex bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100">
                        <button onClick={() => setActiveTab('logistics')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'logistics' ? 'bg-[#2D4A73] text-white' : 'text-gray-400'}`}>
                            <LayoutDashboard size={16} /> Operations
                        </button>
                        <button onClick={() => setActiveTab('announcements')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'announcements' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}>
                            <Megaphone size={16} /> Broadcasts
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'logistics' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* --- Stats Grid --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                {[
                                    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
                                    { label: 'Pending', value: stats.pending, icon: Layers, color: 'text-amber-600' },
                                    { label: 'Fulfillment', value: `${stats.fulfillmentRate}%`, icon: CheckCircle, color: 'text-blue-600' }
                                ].map((card, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
                                        <card.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 ${card.color}`} />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
                                        <h3 className={`text-4xl font-black tracking-tighter ${card.color}`}>{card.value}</h3>
                                    </div>
                                ))}
                            </div>

                            {/* --- Search Hub --- */}
                            <div className="bg-white p-10 rounded-[4rem] border border-gray-100 mb-12 shadow-sm">
                                <div className="flex items-center gap-4 mb-8">
                                    <Search className="text-blue-600" size={24} />
                                    <h3 className="text-xl font-black text-[#2D4A73] uppercase italic">Search Hub</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <input 
                                        type="text" 
                                        placeholder="Product Name..." 
                                        className="bg-gray-50 p-5 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-100"
                                        value={filters.search}
                                        onChange={e => setFilters({...filters, search: e.target.value})}
                                    />
                                    <select 
                                        className="bg-gray-50 p-5 rounded-2xl font-bold text-sm outline-none"
                                        value={filters.category}
                                        onChange={e => setFilters({...filters, category: e.target.value})}
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                    <select 
                                        className="bg-gray-50 p-5 rounded-2xl font-bold text-sm outline-none"
                                        value={filters.age}
                                        onChange={e => setFilters({...filters, age: e.target.value})}
                                    >
                                        <option value="">All Ages</option>
                                        <option value="0-6 Months">0-6 Months</option>
                                        <option value="6-12 Months">6-12 Months</option>
                                        <option value="1-3 Years">1-3 Years</option>
                                        <option value="3+ Years">3+ Years</option>
                                    </select>
                                    <button 
                                        onClick={handleSearch}
                                        className="bg-[#2D4A73] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>

                            {/* --- Media Manager Section --- */}
                            <div className="bg-[#2D4A73] rounded-[4rem] p-12 text-white shadow-2xl shadow-blue-200">
                                <div className="flex flex-col lg:flex-row gap-12">
                                    <div className="lg:w-1/3 space-y-8">
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tighter mb-2 italic">Visual Assets</h3>
                                            <p className="text-blue-200 text-[10px] font-black uppercase tracking-widest">Selected From Filtered List</p>
                                        </div>
                                        <select 
                                            onChange={(e) => { 
                                                const id = Number(e.target.value);
                                                setSelectedProductId(id); 
                                                if (id) fetchProductDetails(id); 
                                            }}
                                            className="w-full bg-white/10 border-2 border-white/20 p-5 rounded-3xl font-black text-sm uppercase tracking-widest text-white outline-none"
                                        >
                                            <option value="" className="text-black">Choose a Product</option>
                                            {products.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
                                        </select>

                                        {selectedProductId && (
                                            <div className="space-y-6">
                                                <Bulk360Upload productId={selectedProductId} onUploadComplete={() => fetchProductDetails(selectedProductId)} />
                                                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-4">
                                                    <input type="file" multiple onChange={(e) => setSelectedFiles(e.target.files)} className="text-[10px] font-black uppercase w-full" />
                                                    <button onClick={handleUpload} disabled={uploading} className="w-full bg-white text-[#2D4A73] py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-pink-600 hover:text-white transition-all">
                                                        {uploading ? "Syncing..." : "Upload To Gallery"}
                                                    </button>
                                                </div>
                                                <AdminMediaActions productId={selectedProductId} onSequenceCleared={() => fetchProductDetails(selectedProductId)} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 bg-white/5 rounded-[4rem] p-10 border border-white/10 min-h-[400px]">
                                        {selectedProductData ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                {selectedProductData.images?.map((img: any) => (
                                                    <div key={img.id} className="relative group rounded-3xl overflow-hidden aspect-square bg-white shadow-sm border border-white/10">
                                                        <img src={`http://localhost:8080${img.imageUrl}`} className="w-full h-full object-contain p-4" />
                                                        <div className="absolute inset-0 bg-pink-600/90 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                            <button onClick={() => handleDeleteImage(img.id)} className="p-3 bg-white text-pink-600 rounded-full hover:scale-110">
                                                                <Trash2 size={24} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-blue-200/40 italic">
                                                <ImageIcon size={64} className="mb-4" />
                                                <p className="font-bold uppercase text-[10px] tracking-widest">Select a product to preview</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'announcements' && <AnnouncementManager />}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;