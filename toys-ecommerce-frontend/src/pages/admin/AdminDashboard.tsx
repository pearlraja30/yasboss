import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, Truck, CheckCircle, RefreshCcw, ExternalLink, 
    Layers, DollarSign, Activity, User, Phone, FileText,
    Upload, Rotate3d, Image as ImageIcon, Trash2, Loader2,
    Search, Megaphone, LayoutDashboard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { adminService, productService } from '../../services/api'; 
// ✨ Integrated Components
import AdminMediaActions from './AdminMediaActions'; 
import Bulk360Upload from './Bulk360Upload'; 
import AnnouncementManager from './AnnouncementManager'; // ✨ Added

const AdminDashboard: React.FC = () => {
    // --- Navigation & Tab State ---
    const [activeTab, setActiveTab] = useState<'logistics' | 'announcements'>('logistics');
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, pending: 0, fulfillmentRate: 0 });
    const navigate = useNavigate();

    // Image Management States
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [selectedProductData, setSelectedProductData] = useState<any>(null);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('jwtToken');
        if (!token || token === "null") {
            toast.error("Unauthorized. Please login as Admin.");
            navigate('/login');
            return;
        }

        try {
            setLoading(true);
            const [orderRes, productRes] = await Promise.all([
                adminService.getAllOrders(),
                productService.getAllProducts()
            ]);

            setOrders(orderRes.data);
            setProducts(productRes); 
            
            const revenue = orderRes.data.reduce((acc: number, curr: any) => acc + curr.totalAmount, 0);
            const pending = orderRes.data.filter((o: any) => o.status === 'PENDING').length;
            const rate = orderRes.data.length ? ((orderRes.data.filter((o: any) => o.status === 'DELIVERED').length / orderRes.data.length) * 100).toFixed(0) : 0;
            
            setStats({ totalRevenue: revenue, pending: pending, fulfillmentRate: Number(rate) });
        } catch (err: any) {
            toast.error("Failed to load Command Center");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchProductDetails = async (id: number) => {
        try {
            const data = await productService.getProductById(String(id));
            setSelectedProductData(data);
        } catch (err) {
            toast.error("Failed to load product images.");
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || !selectedProductId) return toast.error("Select files and a product!");
        const fileArray = Array.from(selectedFiles);
        setUploading(true);
        try {
            for (const file of fileArray) {
                await productService.uploadMedia(selectedProductId, file, false, file.type.startsWith('video/'));
            }
            toast.success("Gallery images updated!");
            setSelectedFiles(null);
            fetchProductDetails(selectedProductId); 
        } catch (err) {
            // Handled by api.ts
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!window.confirm("Permanently delete this item?")) return;
        try {
            await productService.deleteMedia(imageId);
            toast.success("Media removed successfully.");
            if (selectedProductId) fetchProductDetails(selectedProductId);
        } catch (err) {}
    };

    const updateStatus = async (orderId: string, newStatus: string, agentName: string = "", agentPhone: string = "") => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus, agentName, agentPhone);
            toast.success(`Order #${orderId} updated to ${newStatus}`);
            fetchDashboardData(); 
        } catch (err) {
            toast.error("Update failed.");
        }
    };

    const handleDispatch = (orderId: string) => {
        const name = prompt("Enter Delivery Agent Name:");
        const phone = prompt("Enter Agent Phone Number:");
        if (name && phone) updateStatus(orderId, 'SHIPPED', name, phone);
        else toast.warn("Agent details required.");
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Activity className="animate-spin text-[#2D4A73]" size={48} />
        </div>
    );

    return (
        <div className="bg-[#F8F9FA] min-h-screen p-4 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-2 w-12 bg-pink-600 rounded-full" />
                            <span className="text-[10px] font-black text-pink-600 uppercase tracking-[0.3em]">HQ Command</span>
                        </div>
                        <h1 className="text-6xl font-black text-[#2D4A73] tracking-tighter leading-none">Command Center</h1>
                    </div>
                    
                    {/* ✨ Tab Switcher */}
                    <div className="flex bg-white p-2 rounded-[2rem] shadow-xl border border-gray-100">
                        <button 
                            onClick={() => setActiveTab('logistics')}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'logistics' ? 'bg-[#2D4A73] text-white shadow-lg' : 'text-gray-400 hover:text-[#2D4A73]'}`}
                        >
                            <LayoutDashboard size={16} /> Operations
                        </button>
                        <button 
                            onClick={() => setActiveTab('announcements')}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === 'announcements' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-pink-600'}`}
                        >
                            <Megaphone size={16} /> Broadcasts
                        </button>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'logistics' ? (
                        <motion.div 
                            key="logistics"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                {[
                                    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
                                    { label: 'Pending', value: stats.pending, icon: Layers, color: 'text-amber-600' },
                                    { label: 'Rate', value: `${stats.fulfillmentRate}%`, icon: CheckCircle, color: 'text-blue-600' }
                                ].map((card, i) => (
                                    <div key={i} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 relative group">
                                        <card.icon className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-5 ${card.color}`} />
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{card.label}</p>
                                        <h3 className={`text-4xl font-black tracking-tighter ${card.color}`}>{card.value}</h3>
                                    </div>
                                ))}
                            </div>

                            {/* Logistics Table */}
                            <div className="bg-white rounded-[4rem] shadow-2xl shadow-gray-200/40 border border-white overflow-hidden mb-12">
                                <div className="p-10 border-b border-gray-50 flex justify-between">
                                    <h3 className="text-xl font-black text-[#2D4A73]">Logistics Sequences</h3>
                                    <button onClick={() => navigate('/admin/logistics-summary')} className="flex items-center gap-2 text-pink-600 font-black text-[10px] uppercase tracking-widest">
                                        <FileText size={16} /> Full Manifest
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b">
                                                <th className="px-10 py-6">Ref</th>
                                                <th className="px-10 py-6">Customer</th>
                                                <th className="px-10 py-6">Amount</th>
                                                <th className="px-10 py-6">Status</th>
                                                <th className="px-10 py-6 text-right">Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map((order) => (
                                                <tr key={order.orderId} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-10 py-8 font-black text-[#2D4A73]">#{order.orderId}</td>
                                                    <td className="px-10 py-8 font-bold text-gray-800 text-sm">{order.email}</td>
                                                    <td className="px-10 py-8 font-black text-xl">₹{order.totalAmount}</td>
                                                    <td className="px-10 py-8">
                                                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                                                            order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                                        }`}>{order.status}</span>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        {order.status === 'PENDING' && (
                                                            <button onClick={() => handleDispatch(order.orderId)} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-black transition-all">
                                                                <Truck size={18} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Toy Box Visuals */}
                            <div className="bg-[#2D4A73] rounded-[4rem] p-12 text-white shadow-2xl shadow-blue-300">
                                <div className="flex flex-col lg:flex-row gap-12">
                                    <div className="lg:w-1/3 space-y-8">
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tighter mb-2 italic">Toy Box Visuals</h3>
                                            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">Update 360° Rotate & Gallery</p>
                                        </div>
                                        <select 
                                            onChange={(e) => { 
                                                const id = Number(e.target.value);
                                                setSelectedProductId(id); 
                                                if (id) fetchProductDetails(id); 
                                            }}
                                            className="w-full bg-white/10 border-2 border-white/20 p-5 rounded-3xl font-black text-sm uppercase tracking-widest text-white"
                                        >
                                            <option value="" className="text-black">Select a Toy to Manage</option>
                                            {products.map(p => <option key={p.id} value={p.id} className="text-black">{p.name}</option>)}
                                        </select>

                                        {selectedProductId && (
                                            <div className="space-y-6">
                                                <Bulk360Upload productId={selectedProductId} onUploadComplete={() => fetchProductDetails(selectedProductId)} />
                                                <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-6">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Add Standard Media</p>
                                                    <input type="file" multiple onChange={(e) => setSelectedFiles(e.target.files)} className="text-xs font-black uppercase w-full" />
                                                    <button onClick={handleUpload} disabled={uploading || !selectedFiles} className="w-full bg-white text-[#2D4A73] py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all flex items-center justify-center gap-3">
                                                        {uploading ? <Loader2 className="animate-spin" /> : <Upload size={20} />} Sync Standard Gallery
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
                                                    <div key={img.id} className="relative group rounded-3xl overflow-hidden aspect-square bg-white/10 border border-white/5">
                                                        <img src={`http://localhost:8080${img.imageUrl}`} className="w-full h-full object-contain p-4 mix-blend-lighten" />
                                                        <div className="absolute inset-0 bg-pink-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                                            <button onClick={() => handleDeleteImage(img.id)} className="p-3 bg-white text-pink-600 rounded-full hover:scale-110"><Trash2 size={24} /></button>
                                                        </div>
                                                        {img.is360View && <div className="absolute top-3 left-3 bg-pink-600 text-[8px] font-black uppercase px-2 py-1 rounded-md">360°</div>}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-blue-200/40 italic">
                                                <ImageIcon size={64} className="mb-4" />
                                                <p className="font-bold">Select a product to view active gallery</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="announcements"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        >
                            {/* ✨ NEW: Integrated Manager */}
                            <AnnouncementManager />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;