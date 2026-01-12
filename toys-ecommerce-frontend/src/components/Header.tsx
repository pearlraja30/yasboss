import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Search, ShoppingCart, User, MapPin, X, Info, Heart, 
    HelpCircle, LogOut, Star, Sparkles, ChevronDown, 
    LayoutDashboard, Truck, Zap, ArrowRight, LayoutGrid, Rocket, Puzzle 
} from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import CategoryMenu from './CategoryMenu';
import { getCurrentCoordinates, getAddressFromCoords } from '../services/locationService';
import { toast } from 'react-toastify';
import api from '../services/api'; 

interface UserData {
    fullName: string;
    email: string;
    role: string;
    rewardPoints?: number;
    profileImage?: string;
}

interface Announcement {
    text: string;
    iconType: 'TRUCK' | 'SPARKLES' | 'ZAP' | 'STAR';
    color: string;
    link?: string;
}

const Header: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [location, setLocation] = useState<string>('Check Location');
    const [pincode, setPincode] = useState<string>(''); // ✨ New Pincode State
    const [isLocating, setIsLocating] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<UserData | null>(null);
    const [tickerMessages, setTickerMessages] = useState<Announcement[]>([]);
    const [tickerIndex, setTickerIndex] = useState(0);

    const headerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // --- ✨ MANUAL PINCODE HANDLER ---
    const handlePincodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pincode.length !== 6) {
            toast.error("Please enter a valid 6-digit pincode");
            return;
        }
        
        setIsLocating(true);
        try {
            // Note: Ensure this service is implemented in your api.ts
            const data = await api.locationService.getAddressByPincode(pincode);
            const city = data.city || data.district || 'Unknown';
            setLocation(city);
            localStorage.setItem('userLocation', city);
            localStorage.setItem('userPincode', pincode);
            toast.success(`Location set to ${city} (${pincode})`);
        } catch (error) {
            toast.error("Invalid pincode or service unavailable");
        } finally {
            setIsLocating(false);
        }
    };

    const handleFetchLocation = async () => {
        setIsLocating(true);
        try {
            const position = await getCurrentCoordinates();
            const data = await getAddressFromCoords(position.coords.latitude, position.coords.longitude);
            const city = data.city || data.locality || 'Unknown';
            setLocation(city);
            localStorage.setItem('userLocation', city);
            toast.success(`Welcome to YasBoss, shopping from ${city}!`);
        } catch (error) {
            toast.error("Could not determine location. Please check permissions.");
        } finally {
            setIsLocating(false);
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'TRUCK': return <Truck size={12} />;
            case 'SPARKLES': return <Sparkles size={12} />;
            case 'ZAP': return <Zap size={12} />;
            default: return <Star size={12} />;
        }
    };

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await api.announcementService.getActive();
                if (data && data.length > 0) setTickerMessages(data);
                else setTickerMessages([{ text: "₹49 Delivery Charge. Free Delivery above ₹500", iconType: 'TRUCK', color: 'text-white' }]);
            } catch (err) {
                setTickerMessages([{ text: "Welcome to Yas Boss Toys!", iconType: 'STAR', color: 'text-white' }]);
            }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (tickerMessages.length > 1) {
            const timer = setInterval(() => {
                setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
            }, 4000);
            return () => clearInterval(timer);
        }
    }, [tickerMessages]);

    const syncSession = useCallback(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('jwtToken');
        setUser((savedUser && token && token !== "null") ? JSON.parse(savedUser) : null);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        syncSession();
        
        const savedLoc = localStorage.getItem('userLocation');
        const savedPin = localStorage.getItem('userPincode');
        if (savedLoc) setLocation(savedLoc);
        if (savedPin) setPincode(savedPin);

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [syncSession]);

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event('storage'));
        toast.success("Logged out successfully");
        navigate('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <header ref={headerRef} className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100">
            
            {/* 1. TICKER BAR */}
            <div className="w-full bg-[#2D4A73] py-2 overflow-hidden relative cursor-pointer group"
                onClick={() => tickerMessages[tickerIndex]?.link && navigate(tickerMessages[tickerIndex].link!)}>
                <div className="max-w-7xl mx-auto px-4 flex justify-center items-center">
                    <AnimatePresence mode="wait">
                        {tickerMessages.length > 0 && (
                            <motion.div key={tickerIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3">
                                <div className={tickerMessages[tickerIndex]?.color || 'text-white'}>{getIcon(tickerMessages[tickerIndex]?.iconType)}</div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${tickerMessages[tickerIndex]?.color || 'text-white'}`}>
                                    {tickerMessages[tickerIndex]?.text}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* 2. MAIN NAVIGATION */}
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                
                {/* LEFT: NAV PILLS */}
                <div className="hidden lg:flex items-center gap-1 h-full">
                    {[
                        { name: 'Featured', path: '/products', icon: <Sparkles size={16} /> },
                        { name: 'Categories', type: 'mega', icon: <LayoutGrid size={16} /> },
                        { name: 'Collections', type: 'mega', icon: <Rocket size={16} /> }
                    ].map((item) => (
                        <div key={item.name} className="relative h-full flex items-center" 
                             onMouseEnter={() => setActiveMenu(item.name)}
                             onMouseLeave={() => setActiveMenu(null)}>
                            <Link to={item.path || '#'} onClick={(e) => !item.path && e.preventDefault()}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all relative z-10 outline-none
                                ${activeMenu === item.name ? 'text-[#2D4A73]' : 'text-gray-500 hover:text-gray-900'}`}>
                                {activeMenu === item.name && (
                                    <motion.div layoutId="nav-pill" className="absolute inset-0 bg-blue-50 rounded-full -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                                )}
                                {item.icon} {item.name}
                            </Link>

                            <AnimatePresence>
                                {activeMenu === item.name && item.type === 'mega' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="fixed top-28 left-0 w-full pt-4 z-50 px-4"
                                    >
                                        <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-[2.5rem] border border-gray-100 overflow-hidden">
                                            {item.name === 'Categories' ? (
                                                <CategoryMenu isOpen={true} onClose={() => setActiveMenu(null)} />
                                            ) : (
                                                <div className="p-10 grid grid-cols-4 gap-8 bg-white">
                                                    {[
                                                        { label: "0-2 Years", img: "/images/ages/age-0-2.jpg", val: "0-2" },
                                                        { label: "2-4 Years", img: "/images/ages/age-2-4.jpg", val: "2-4" },
                                                        { label: "4-6 Years", img: "/images/ages/age-4-6.jpg", val: "4-6" },
                                                        { label: "6+ Years", img: "/images/ages/age-6.jpg", val: "6+" }
                                                    ].map(age => (
                                                        <Link key={age.val} to={`/products?age=${age.val}`} onClick={() => setActiveMenu(null)} className="group relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-lg hover:shadow-2xl transition-all duration-500">
                                                            <img src={age.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={age.label} />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A73]/90 via-transparent to-transparent flex items-end p-8">
                                                                <div>
                                                                    <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Explore</p>
                                                                    <p className="text-white font-black uppercase text-sm tracking-widest">{age.label}</p>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                    
                    <div className="relative h-full flex items-center" 
                         onMouseEnter={() => setActiveMenu('More')}
                         onMouseLeave={() => setActiveMenu(null)}>
                        <button className={`flex items-center gap-2 px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest relative z-10 transition-all outline-none ${activeMenu === 'More' ? 'text-pink-600' : 'text-gray-500'}`}>
                            {activeMenu === 'More' && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-pink-50 rounded-full -z-10" />}
                            More <ChevronDown size={14} />
                        </button>
                        <AnimatePresence>
                            {activeMenu === 'More' && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute top-full left-0 w-64 pt-4">
                                    <div className="bg-white shadow-2xl rounded-[2rem] border border-gray-100 p-3 overflow-hidden">
                                        <Link to="/about" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-pink-50 text-gray-700 hover:text-pink-600 transition-all">
                                            <Info size={18} /> <span className="font-bold text-sm">About Us</span>
                                        </Link>
                                        <Link to="/help" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all">
                                            <HelpCircle size={18} /> <span className="font-bold text-sm">Help Center</span>
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* CENTER: LOGO */}
                <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => navigate('/')}>
                    <img src="/images/banner/logo.jpg" alt="YAS BOSS" className="h-10 md:h-12 object-contain" />
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="flex items-center gap-2">
                    
                    {/* --- ✨ UPDATED: DUAL MODE LOCATION GROUP --- */}
                    <div className="hidden md:flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1 group transition-all focus-within:ring-2 focus-within:ring-blue-100">
                        {/* Auto-detect button */}
                        <button 
                            onClick={handleFetchLocation} 
                            disabled={isLocating}
                            title="Auto-detect location"
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-black uppercase text-[#2D4A73] hover:bg-white transition-colors outline-none"
                        >
                            <MapPin size={14} className={isLocating ? 'animate-bounce' : ''} />
                            <span className="max-w-[100px] truncate">{isLocating ? 'Detecting...' : location}</span>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-6 bg-gray-200 mx-1" />

                        {/* Pincode Input */}
                        <form onSubmit={handlePincodeSubmit} className="flex items-center px-2">
                            <input 
                                type="text" 
                                maxLength={6}
                                placeholder="Pincode"
                                className="bg-transparent border-none outline-none text-[10px] font-bold text-[#2D4A73] w-16 placeholder:text-gray-300 tracking-widest"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                            />
                            <button type="submit" className="p-1.5 hover:bg-white rounded-md text-[#2D4A73] transition-all">
                                <ArrowRight size={12} />
                            </button>
                        </form>
                    </div>

                    <button onClick={() => setIsSearchOpen(true)} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-600 outline-none"><Search size={20} /></button>
                    
                    <Link to="/cart" className="p-2.5 hover:bg-blue-50 rounded-xl relative text-[#2D4A73] outline-none transition-all active:scale-95">
                        <ShoppingCart size={20} />
                        <span className="absolute top-1.5 right-1.5 bg-pink-600 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-black border-2 border-white">3</span>
                    </Link>

                    <div className="relative flex items-center h-full group" 
                         onMouseEnter={() => user && setIsUserMenuOpen(true)} 
                         onMouseLeave={() => setIsUserMenuOpen(false)}>
                        {user ? (
                            <>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-md overflow-hidden outline-none bg-blue-50 transition-transform active:scale-90">
                                    {user.profileImage ? (
                                        <img 
                                            src={user.profileImage.startsWith('http') ? user.profileImage : `http://localhost:8080${user.profileImage}`} 
                                            alt={user.fullName} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = ""; 
                                                setUser({...user, profileImage: undefined});
                                            }}
                                        />
                                    ) : (
                                        <span className="font-black text-xs text-[#2D4A73]">{user.fullName.charAt(0)}</span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} 
                                            className="absolute top-full right-0 w-72 pt-6">
                                            <div className="bg-white shadow-2xl rounded-[2.5rem] border border-gray-100 p-5 overflow-hidden">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-[#2D4A73] flex items-center justify-center text-white font-black overflow-hidden shadow-inner">
                                                        {user.profileImage ? (
                                                            <img src={`http://localhost:8080${user.profileImage}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            user.fullName.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-[#2D4A73] leading-tight">{user.fullName}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 truncate w-32">{user.email}</p>
                                                    </div>
                                                </div>

                                                <div className="px-5 py-4 mb-2 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Points Balance</p>
                                                    <p className="text-sm font-black text-purple-600 flex items-center gap-1 mt-1">
                                                        <Sparkles size={14} /> {user.rewardPoints || 0} Points
                                                    </p>
                                                </div>
                                                
                                                <Link to="/profile" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-blue-50 text-[#2D4A73] font-bold text-xs uppercase tracking-widest transition-all">
                                                    <LayoutDashboard size={18} /> My Profile
                                                </Link>
                                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-red-600 hover:bg-red-50 font-black text-xs uppercase mt-1 tracking-widest transition-all">
                                                    <LogOut size={18} /> Logout
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <Link to="/login" className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-600 outline-none transition-all active:scale-95"><User size={20} /></Link>
                        )}
                    </div>
                </div>
            </div>

            {/* SEARCH PANEL */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-[200] flex items-center px-10">
                        <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto flex items-center gap-6">
                            <Search className="text-gray-300" size={32} />
                            <input autoFocus type="text" placeholder="What is your child imagining today?" className="w-full text-3xl font-black outline-none border-none py-2 text-[#2D4A73]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <button type="button" onClick={() => setIsSearchOpen(false)} className="p-4 hover:bg-gray-100 rounded-full outline-none"><X size={32} /></button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;