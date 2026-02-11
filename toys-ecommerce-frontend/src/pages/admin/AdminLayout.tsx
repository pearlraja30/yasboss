import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Box, 
    PackagePlus, 
    LogOut, 
    Truck, 
    Settings,
    ShieldCheck,
    FileSpreadsheet,
    Megaphone,
    Bell,
    UserCircle,
    Ticket,
    Layers,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [adminName, setAdminName] = useState("Commander Chief");
    const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));

    useEffect(() => {
        // Sync actual Admin Name from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsed = JSON.parse(userData);
                if (parsed.fullName) setAdminName(parsed.fullName);
            } catch (e) { console.error("Profile sync error", e); }
        }

        // Listen for role changes to update badge in real-time
        const handleRoleSync = () => setUserRole(localStorage.getItem('userRole'));
        window.addEventListener('user-login', handleRoleSync);
        return () => window.removeEventListener('user-login', handleRoleSync);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event('user-login'));
        window.dispatchEvent(new Event('storage'));
        toast.success("Admin Session Terminated Successfully");
        window.location.href = '/login'; 
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/admin/dashboard', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/shipments', label: 'Logistics', icon: <Truck size={20} /> },
        { path: '/admin/inventory', label: 'Inventory', icon: <Box size={20} /> },
        { path: '/admin/add-product', label: 'Deploy Product', icon: <PackagePlus size={20} /> },
        { path: '/admin/categories', label: 'Categories', icon: <Layers size={20} /> },
        { path: '/admin/coupons', label: 'Coupon Vault', icon: <Ticket size={20} /> },
        { path: '/admin/reports', label: 'Tax & Analytics', icon: <FileSpreadsheet size={20} />, highlight: true },
        { path: '/admin/announcements', label: 'Broadcaster', icon: <Megaphone size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-sans overflow-hidden">
            {/* Sidebar Command Center */}
            <aside className="w-80 bg-[#1A2E4C] text-white flex flex-col p-8 shadow-[10px_0_30px_rgba(0,0,0,0.15)] z-20 relative">
                <div className="mb-12 px-2 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <motion.div animate={{ rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                            <ShieldCheck className="text-pink-400" size={18} />
                        </motion.div>
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-pink-400/80">HQ Level Access</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                        YasBoss <span className="text-pink-400">HQ</span>
                    </h1>
                </div>

                <nav className="flex-grow space-y-2 relative z-10 overflow-y-auto no-scrollbar pr-2">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            className={`group flex items-center justify-between p-4 rounded-2xl font-bold transition-all duration-300 ${
                                isActive(item.path) 
                                ? 'bg-white text-[#1A2E4C] shadow-xl translate-x-1' 
                                : 'hover:bg-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                            </div>
                            {isActive(item.path) && <ChevronRight size={14} className="text-pink-500" />}
                        </Link>
                    ))}
                </nav>

                <div className="pt-8 border-t border-white/10 relative z-10">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-4 p-5 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group shadow-sm"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                        Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto flex flex-col bg-[#F8F9FA]">
                <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-10 py-6 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#2D4A73] shadow-inner">
                                <Settings size={22} className="animate-[spin_8s_linear_infinite]" />
                            </div>
                            <div>
                                <h2 className="font-black text-[#2D4A73] uppercase tracking-tighter leading-none text-lg">Command Terminal</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">System Health: Optimal</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* ✨ NEW: Authorization & Role Badge */}
                        <div className="hidden xl:flex items-center gap-6 border-r border-slate-100 pr-8">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Authorization</p>
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-sm ${
                                    userRole?.includes('ADMIN') 
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                    : 'bg-amber-50 border-amber-100 text-amber-600'
                                }`}>
                                    {userRole?.includes('ADMIN') ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                    <span className="text-[10px] font-black uppercase tracking-tighter">
                                        {userRole?.replace('ROLE_', '') || 'UNAUTHORIZED'}
                                    </span>
                                </div>
                            </div>
                            <button className="relative p-2 text-slate-400 hover:text-[#2D4A73] transition-colors bg-slate-50 rounded-xl">
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white" />
                            </button>
                        </div>

                        {/* Admin Profile */}
                        <div className="flex items-center gap-4 bg-slate-50 p-2 pr-6 rounded-2xl border border-slate-100">
                            <div className="w-10 h-10 bg-[#2D4A73] rounded-xl shadow-md flex items-center justify-center text-white">
                                <UserCircle size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Principal</p>
                                <p className="text-xs font-black text-[#2D4A73] uppercase tracking-tight">{adminName}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-10 relative flex-grow text-left">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 blur-[120px] rounded-full pointer-events-none -z-10" />
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Outlet />
                    </motion.div>
                </div>

                <footer className="px-10 py-6 text-slate-300 text-[9px] font-black uppercase tracking-[0.3em] border-t border-slate-100 bg-white">
                    © 2026 YasBoss • Kernel v2.0.4-LTS • Secure Environment
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;