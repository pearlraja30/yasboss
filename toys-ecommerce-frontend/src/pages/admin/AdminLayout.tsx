import React from 'react';
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
    UserCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event('user-login'));
        window.dispatchEvent(new Event('storage'));
        toast.success("Admin Session Ended");
        window.location.href = '/'; 
    };

    const isActive = (path: string) => location.pathname === path;

    // ✨ Navigation Config for easier maintenance
    const navItems = [
        { path: '/admin/orders', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/shipments', label: 'Shipments', icon: <Truck size={20} /> },
        { path: '/admin/inventory', label: 'Inventory', icon: <Box size={20} /> },
        { path: '/admin/add-product', label: 'Add Product', icon: <PackagePlus size={20} /> },
        { path: '/admin/reports', label: 'Tax & Reports', icon: <FileSpreadsheet size={20} />, highlight: true },
        { path: '/admin/announcements', label: 'Ticker & Ads', icon: <Megaphone size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[#F0F2F5] font-sans">
            {/* 🛠️ Sidebar Command Center */}
            <aside className="w-80 bg-[#1A2E4C] text-white flex flex-col p-8 shadow-[10px_0_30px_rgba(0,0,0,0.05)] z-20 relative">
                {/* Branding */}
                <div className="mb-12 px-2 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <motion.div 
                            animate={{ rotate: [0, 15, 0] }} 
                            transition={{ repeat: Infinity, duration: 4 }}
                        >
                            <ShieldCheck className="text-pink-400" size={20} />
                        </motion.div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400/80">Systems Secure</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                        YasBoss <span className="text-pink-400">HQ</span>
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-grow space-y-2 relative z-10">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            className={`group flex items-center justify-between p-4 rounded-2xl font-bold transition-all duration-300 ${
                                isActive(item.path) 
                                ? 'bg-white text-[#2D4A73] shadow-xl translate-x-2' 
                                : 'hover:bg-white/5 text-slate-300 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                {item.icon}
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </div>
                            {item.highlight && !isActive(item.path) && (
                                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Bottom Footer */}
                <div className="pt-8 border-t border-white/5 relative z-10">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-4 p-4 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all group shadow-sm"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                        Terminate Session
                    </button>
                </div>

                {/* Decorative Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                {/* Advanced Sticky Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-6 flex justify-between items-center sticky top-0 z-30">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-[#2D4A73] shadow-inner">
                                <Settings size={22} />
                            </div>
                            <div>
                                <h2 className="font-black text-[#2D4A73] uppercase tracking-tighter leading-none">Command Center</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Version 2.0.4 • Stable</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Status Indicators */}
                        <div className="hidden xl:flex items-center gap-6 border-r border-slate-200 pr-8">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Database</p>
                                <p className="text-[11px] font-bold text-green-500 uppercase flex items-center gap-1.5 justify-end">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Connected
                                </p>
                            </div>
                            <button className="relative p-2 text-slate-400 hover:text-[#2D4A73] transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />
                            </button>
                        </div>

                        {/* Admin Profile */}
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Principal</p>
                                <p className="text-sm font-black text-[#2D4A73]">Commander Chief</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-tr from-[#2D4A73] to-[#4a6fa5] rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-white">
                                <UserCircle size={24} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Scrollable Body */}
                <div className="p-10 relative flex-grow">
                    {/* Floating Glow decoration */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 blur-[120px] rounded-full pointer-events-none -z-10" />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>

                {/* Simple Footer */}
                <footer className="px-10 py-6 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-slate-200 bg-white/50 backdrop-blur-sm">
                    © 2026 YasBoss Global Systems • Internal Use Only
                </footer>
            </main>
        </div>
    );
};

export default AdminLayout;