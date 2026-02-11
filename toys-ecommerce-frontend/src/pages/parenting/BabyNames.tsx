import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Heart, Baby, Info, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const BabyNames: React.FC = () => {
    const [names, setNames] = useState<any[]>([]);
    const [filters, setFilters] = useState({ query: '', gender: 'ALL', origin: '' });
    const [loading, setLoading] = useState(false);

    const fetchNames = async () => {
        setLoading(true);
        try {
            const res = await api.get('/parenting/names/search', { params: filters });
            setNames(res.data);
        } catch (err) {
            console.error("Failed to fetch names");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNames(); }, [filters.gender]);

    return (
        <div className="max-w-7xl mx-auto p-10 text-left bg-white min-h-screen">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-[#2D4A73] italic uppercase">Magic <span className="text-pink-500">Name Finder</span></h1>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Discover the perfect name for your little legend</p>
            </header>

            {/* Search Hub */}
            <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-100 mb-12 flex flex-col md:flex-row gap-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by meaning (e.g. 'Strong', 'Light')..."
                        className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-none outline-none font-bold text-sm shadow-sm"
                        onChange={(e) => setFilters({...filters, query: e.target.value})}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'BOY', 'GIRL', 'UNISEX'].map(g => (
                        <button 
                            key={g}
                            onClick={() => setFilters({...filters, gender: g})}
                            className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                filters.gender === g ? 'bg-[#2D4A73] text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-pink-50'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {names.map((n, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        key={n.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${n.gender === 'BOY' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'}`}>
                                <Baby size={24} />
                            </div>
                            <button className="text-gray-200 hover:text-red-500 transition-colors"><Heart size={20} /></button>
                        </div>
                        <h3 className="text-2xl font-black text-[#2D4A73] uppercase italic">{n.name}</h3>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">{n.origin} Origin</p>
                        <div className="bg-gray-50 p-4 rounded-2xl">
                            <p className="text-xs font-bold text-gray-500 italic">"{n.meaning}"</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BabyNames;