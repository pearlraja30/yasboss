import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, PackagePlus, LogOut, Settings } from 'lucide-react';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login'; // Full refresh to clear admin state
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 🛠️ Admin Sidebar Command Center */}
            <aside className="w-64 bg-[#2D4A73] text-white flex flex-col p-6">
                <div className="mb-10 px-2">
                    <h1 className="text-xl font-black tracking-tighter uppercase">YasBoss <span className="text-pink-400">Admin</span></h1>
                </div>

                <nav className="flex-grow space-y-2">
                    <Link to="/admin/orders" className="flex items-center gap-3 p-4 hover:bg-white/10 rounded-2xl font-bold transition-all">
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/admin/inventory" className="flex items-center gap-3 p-4 hover:bg-white/10 rounded-2xl font-bold transition-all">
                        <Box size={20} /> Inventory
                    </Link>
                    <Link to="/admin/add-product" className="flex items-center gap-3 p-4 hover:bg-white/10 rounded-2xl font-bold transition-all">
                        <PackagePlus size={20} /> Add Product
                    </Link>
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-4 text-red-300 hover:bg-red-500/10 rounded-2xl font-bold transition-all">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-10">
                <Outlet /> {/* Admin pages render here */}
            </main>
        </div>
    );
};

export default AdminLayout;