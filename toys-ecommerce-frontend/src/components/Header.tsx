import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, MapPin, X, Info, Heart, HelpCircle, LogOut, Star, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CategoryMenu from './CategoryMenu';
import { getCurrentCoordinates, getAddressFromCoords } from '../services/locationService';
import { toast } from 'react-toastify';

interface UserData {
    fullName: string;
    email: string;
    role: string;
    rewardPoints?: number;
}

const Header: React.FC = () => {
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isCollectionOpen, setIsCollectionOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [location, setLocation] = useState<string>('Check Location');
    const [isLocating, setIsLocating] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<UserData | null>(null);
    
    const headerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const ageGroups = [
        { label: "0 - 2 Years", value: "0-2", image: "/images/ages/age-0-2.jpg" },
        { label: "2 - 4 Years", value: "2-4", image: "/images/ages/age-2-4.jpg" },
        { label: "4 - 6 Years", value: "4-6", image: "/images/ages/age-4-6.jpg" },
        { label: "6 + Years", value: "6+", image: "/images/ages/age-6.jpg" }
    ];

    // ✨ THE SYNC FIX: Ensure session is picked up immediately
    const syncSession = useCallback(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('user');
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setIsCategoryOpen(false);
                setIsCollectionOpen(false);
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) setLocation(savedLocation);
        
        syncSession();
        // Added custom event listener for immediate login detection
        window.addEventListener('storage', syncSession);
        window.addEventListener('user-login', syncSession); 
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('storage', syncSession);
            window.removeEventListener('user-login', syncSession);
        };
    }, [syncSession]);

    const handleLogout = () => {
        localStorage.clear(); 
        window.dispatchEvent(new Event('storage'));
        toast.success("Logged out successfully");
        setIsUserMenuOpen(false);
        navigate('/');
        window.location.reload(); // Force refresh to clear all states
    };

    const handleFetchLocation = async () => {
        setIsLocating(true);
        try {
            const position = await getCurrentCoordinates();
            const data = await getAddressFromCoords(position.coords.latitude, position.coords.longitude);
            const city = data.city || data.locality || 'Unknown';
            setLocation(city);
            localStorage.setItem('userLocation', city);
            toast.success("Location updated!");
        } catch (error) {
            toast.error("Location access denied.");
        } finally {
            setIsLocating(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`); // Updated to ProductListing path
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header ref={headerRef} className="fixed top-0 w-full z-[100] bg-white shadow-sm">
            <div className="border-b bg-white relative">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
                    
                    {/* Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-6 text-[13px] font-black text-gray-500 uppercase tracking-tight">
                        <Link to="/products" className="hover:text-[#2D4A73] transition-colors">Featured</Link>
                        
                        <button 
                            onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsCollectionOpen(false); setIsMoreOpen(false); }} 
                            className={`hover:text-[#2D4A73] transition-colors ${isCategoryOpen ? 'text-[#2D4A73]' : ''}`}
                        >
                            Categories
                        </button>

                        <button 
                            onClick={() => { setIsCollectionOpen(!isCollectionOpen); setIsCategoryOpen(false); setIsMoreOpen(false); }} 
                            className={`hover:text-[#2D4A73] transition-colors ${isCollectionOpen ? 'text-[#2D4A73]' : ''}`}
                        >
                            Collections
                        </button>

                        <div className="relative py-6" onMouseEnter={() => setIsMoreOpen(true)} onMouseLeave={() => setIsMoreOpen(false)}>
                            <button className={`hover:text-pink-600 flex items-center gap-1 transition-colors uppercase ${isMoreOpen ? 'text-pink-600' : ''}`}>
                                More <ChevronDown size={14} />
                            </button>
                            <AnimatePresence>
                                {isMoreOpen && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-[80%] left-0 w-64 bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2rem] border border-gray-100 p-2 z-[110]">
                                        <Link to="/about" className="flex items-center gap-3 px-5 py-4 rounded-[1.5rem] text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-all">
                                            <Info size={18} /> <div><p className="text-sm font-bold">About Us</p></div>
                                        </Link>
                                        <Link to="/help" className="flex items-center gap-3 px-5 py-4 rounded-[1.5rem] text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all">
                                            <Heart size={18} /> <div><p className="text-sm font-bold">Help Center</p></div>
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/images/banner/logo.jpg" alt="YAS BOSS" className="h-10 md:h-12 object-contain" />
                    </div>

                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate('/quiz')} className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-all">
                            <Star size={14} fill="white" /> Play & Earn
                        </button>

                        <button onClick={handleFetchLocation} disabled={isLocating} className="hidden md:flex items-center gap-2 bg-[#F8F9FA] text-[#2D4A73] px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 border border-gray-100">
                            <MapPin size={14} className={isLocating ? 'animate-pulse' : ''} />
                            <span className="truncate max-w-[100px]">{isLocating ? '...' : location}</span>
                        </button>

                        <div className="flex items-center gap-1">
                            <button onClick={() => setIsSearchOpen(true)} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-600"><Search size={20} /></button>
                            <Link to="/cart" className="p-2.5 hover:bg-gray-50 rounded-xl relative text-gray-600">
                                <ShoppingCart size={20} />
                                <span className="absolute top-1.5 right-1.5 bg-pink-600 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-black">3</span>
                            </Link>

                            {/* ✨ IMPROVED: User Profile Menu */}
                            <div 
                                className="relative flex items-center" 
                                onMouseEnter={() => user && setIsUserMenuOpen(true)} 
                                onMouseLeave={() => setIsUserMenuOpen(false)}
                            >
                                {user ? (
                                    <div className="flex items-center gap-2">
                                        <div className="hidden lg:flex flex-col items-end mr-1">
                                            <span className="text-[9px] font-black text-gray-400 uppercase">Points</span>
                                            <span className="text-xs font-black text-purple-600 flex items-center gap-1">
                                                <Sparkles size={10} /> {user.rewardPoints || 0}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                            className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 border-2 border-transparent hover:border-blue-100 transition-all"
                                        >
                                            <User size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <Link to="/login" className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-600"><User size={20} /></Link>
                                )}

                                <AnimatePresence>
                                    {isUserMenuOpen && user && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full right-0 w-56 bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl border border-gray-50 p-3 z-[110] mt-2">
                                            <div className="px-4 py-3 mb-2 bg-gray-50 rounded-2xl">
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Logged in as</p>
                                                <p className="text-sm font-black text-[#2D4A73] truncate">{user.fullName}</p>
                                            </div>
                                            <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-sm">My Profile</Link>
                                            <Link to="/profile/orders" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-bold text-sm">Order History</Link>
                                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-black text-sm mt-2 border-t border-gray-50">
                                                <LogOut size={16} /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isSearchOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 bg-white z-[120] flex items-center px-4 md:px-10">
                                <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto flex items-center gap-4">
                                    <Search className="text-gray-300" size={28} />
                                    <input autoFocus type="text" placeholder="Search toys..." className="w-full text-2xl font-black outline-none border-none py-2 text-[#2D4A73]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    <button type="button" onClick={() => setIsSearchOpen(false)} className="p-3 hover:bg-gray-50 rounded-full transition-colors"><X size={28} /></button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Sub Menus - Keep existing Logic */}
            <AnimatePresence>
                {isCategoryOpen && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute top-full left-0 w-full bg-white shadow-2xl z-50 border-t border-gray-100">
                        <CategoryMenu isOpen={isCategoryOpen} onClose={() => setIsCategoryOpen(false)} />
                    </motion.div>
                )}

                {isCollectionOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="absolute top-full left-0 w-screen bg-white/80 backdrop-blur-2xl shadow-2xl z-50 border-t border-gray-100/50 py-12 px-6"
                    >
                        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                            {ageGroups.map((age) => (
                                <Link 
                                    key={age.value} 
                                    to={`/products?age=${age.value}`} // Updated to ProductListing path
                                    onClick={() => setIsCollectionOpen(false)} 
                                    className="group relative"
                                >
                                    <div className="rounded-[3rem] overflow-hidden aspect-[3/4] bg-gray-50 border border-gray-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                                        <img src={age.image} alt={age.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A73]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;