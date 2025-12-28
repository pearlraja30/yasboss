import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-20">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full text-center"
            >
                {/* Visual Icon */}
                <div className="relative mb-8 flex justify-center">
                    <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="w-40 h-40 bg-white rounded-[3.5rem] shadow-xl flex items-center justify-center text-[#2D4A73]"
                    >
                        <Ghost size={80} strokeWidth={1.5} />
                    </motion.div>
                    <div className="absolute -bottom-4 bg-[#2D4A73] text-white px-6 py-2 rounded-2xl font-black text-4xl shadow-lg">
                        404
                    </div>
                </div>

                <h1 className="text-4xl font-black text-[#2D4A73] mb-4 tracking-tighter">
                    Whoops! Toy Box is Empty.
                </h1>
                <p className="text-gray-400 font-medium text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                    It looks like this page wandered off on its own adventure. Let's get you back to the fun!
                </p>

                {/* Advanced Navigation Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#2D4A73] text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-[#1e334f] transition-all shadow-xl shadow-blue-100"
                    >
                        <Home size={18} /> Go To Home
                    </button>
                    
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-gray-500 border-2 border-gray-100 px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all"
                    >
                        <ArrowLeft size={18} /> Go Back
                    </button>
                </div>

                {/* Subtle Brand Footer */}
                <p className="mt-16 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    YasBoss Toys & Discovery
                </p>
            </motion.div>
        </div>
    );
};

export default NotFound;