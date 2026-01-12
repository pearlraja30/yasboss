import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    ChevronDown, Info, HelpCircle, LayoutGrid, 
    Sparkles, Trophy, Rocket, Puzzle, Heart 
} from 'lucide-react';

const HeaderNav: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const menuItems = [
        { name: 'Featured', path: '/products', icon: <Sparkles size={16} /> },
        { name: 'Categories', type: 'mega', icon: <LayoutGrid size={16} /> },
        { name: 'Rewards', path: '/quiz', icon: <Trophy size={16} /> },
    ];

    return (
        <nav className="hidden lg:flex items-center gap-2 relative">
            {menuItems.map((item) => (
                <div 
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setActiveMenu(item.name)}
                    onMouseLeave={() => setActiveMenu(null)}
                >
                    {item.path ? (
                        <Link 
                            to={item.path}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest text-gray-500 hover:text-[#2D4A73] transition-all relative z-10"
                        >
                            {activeMenu === item.name && (
                                <motion.div 
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-blue-50 rounded-full -z-10"
                                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                />
                            )}
                            {item.icon} {item.name}
                        </Link>
                    ) : (
                        <button 
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all relative z-10 
                            ${activeMenu === item.name ? 'text-[#2D4A73]' : 'text-gray-500'}`}
                        >
                            {activeMenu === item.name && (
                                <motion.div 
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-blue-50 rounded-full -z-10"
                                />
                            )}
                            {item.icon} {item.name} <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === item.name ? 'rotate-180' : ''}`} />
                        </button>
                    )}

                    {/* ✨ MEGA MENU: CATEGORIES */}
                    <AnimatePresence>
                        {activeMenu === 'Categories' && (
                            <motion.div 
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 15 }}
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] bg-white/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] border border-white/20 p-8 z-[110] grid grid-cols-2 gap-4"
                            >
                                <CategoryItem icon={<Rocket className="text-blue-500" />} title="STEM Toys" desc="Future Engineers" />
                                <CategoryItem icon={<Puzzle className="text-pink-500" />} title="Puzzles" desc="Brain Boosters" />
                                <CategoryItem icon={<Heart className="text-red-500" />} title="Plushies" desc="Soft Companions" />
                                <CategoryItem icon={<Sparkles className="text-yellow-500" />} title="Creativity" desc="Art & Crafts" />
                                
                                <div className="col-span-2 mt-4 pt-6 border-t border-gray-50">
                                    <Link to="/categories" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#2D4A73] hover:text-pink-600 transition-colors">
                                        View All Categories <ChevronDown size={14} className="-rotate-90" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}

            {/* ✨ "MORE" DROPDOWN */}
            <div 
                className="relative"
                onMouseEnter={() => setActiveMenu('More')}
                onMouseLeave={() => setActiveMenu(null)}
            >
                <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-black uppercase tracking-widest transition-all relative z-10 ${activeMenu === 'More' ? 'text-pink-600' : 'text-gray-500'}`}>
                    {activeMenu === 'More' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-pink-50 rounded-full -z-10" />}
                    More
                </button>
                <AnimatePresence>
                    {activeMenu === 'More' && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2rem] border border-gray-100 p-3 z-[110]"
                        >
                            <Link to="/about" className="flex items-center gap-3 px-5 py-4 rounded-[1.5rem] text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-all">
                                <Info size={18} /> <span className="text-sm font-bold">About Us</span>
                            </Link>
                            <Link to="/help" className="flex items-center gap-3 px-5 py-4 rounded-[1.5rem] text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                <HelpCircle size={18} /> <span className="text-sm font-bold">Help Center</span>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

const CategoryItem = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <Link to="/products" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all group">
        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div>
            <p className="text-sm font-black text-gray-900 leading-none">{title}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tighter">{desc}</p>
        </div>
    </Link>
);

export default HeaderNav;