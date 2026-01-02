import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Box, 
    PackagePlus, 
    LogOut, 
    Truck, 
    Settings,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * ✨ HARD LOGOUT
     * Completely wipes local storage and session tokens to prevent routing loops.
     */
    const handleLogout = () => {
        localStorage.clear(); // Wipes jwtToken, user, and email
        
        // Notify the application state to reset
        window.dispatchEvent(new Event('user-login'));
        window.dispatchEvent(new Event('storage'));
        
        toast.success("Admin Session Ended");
        
        // Force a hard redirect to the home page to clear React memory
        window.location.href = '/'; 
    };

    // Helper to highlight the active link
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-[#F8F9FA]">
            {/* 🛠️ Admin Sidebar Command Center */}
            <aside className="w-72 bg-[#2D4A73] text-white flex flex-col p-8 shadow-2xl z-20">
                <div className="mb-12 px-2">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="text-pink-400" size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400">Commander Console</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                        YasBoss <span className="text-pink-400">Admin</span>
                    </h1>
                </div>

                <nav className="flex-grow space-y-2">
                    <Link 
                        to="/admin/orders" 
                        className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                            isActive('/admin/orders') ? 'bg-white text-[#2D4A73] shadow-lg' : 'hover:bg-white/10'
                        }`}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>

                    {/* ✨ NEW: Shipment Tracker Link */}
                    <Link 
                        to="/admin/shipments" 
                        className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                            isActive('/admin/shipments') ? 'bg-white text-[#2D4A73] shadow-lg' : 'hover:bg-white/10'
                        }`}
                    >
                        <Truck size={20} /> Shipment Tracker
                    </Link>

                    <Link 
                        to="/admin/inventory" 
                        className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                            isActive('/admin/inventory') ? 'bg-white text-[#2D4A73] shadow-lg' : 'hover:bg-white/10'
                        }`}
                    >
                        <Box size={20} /> Inventory
                    </Link>

                    <Link 
                        to="/admin/add-product" 
                        className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
                            isActive('/admin/add-product') ? 'bg-white text-[#2D4A73] shadow-lg' : 'hover:bg-white/10'
                        }`}
                    >
                        <PackagePlus size={20} /> Add Product
                    </Link>
                </nav>

                <div className="pt-6 border-t border-white/10">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-4 p-4 text-red-300 hover:bg-red-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> 
                        Logout System
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[#F1F3F9]">
                {/* Header context for main area */}
                <header className="bg-white border-b border-gray-100 px-10 py-6 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#2D4A73]">
                            <Settings size={20} />
                        </div>
                        <h2 className="font-black text-[#2D4A73] uppercase tracking-tighter">System Intelligence</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Admin</p>
                            <p className="text-sm font-bold text-[#2D4A73]">YasBoss Commander</p>
                        </div>
                        <div className="w-10 h-10 bg-pink-100 rounded-full border-2 border-white shadow-sm" />
                    </div>
                </header>

                <div className="p-10">
                    <Outlet /> {/* Admin pages render here */}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;