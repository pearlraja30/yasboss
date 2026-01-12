import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const banners = [
    { 
        id: 1, 
        url: '/images/banner/banner1.jpg', 
        tag: 'Curated Collection',
        title: 'New Educational Toys',
        desc: 'Nurture growth through purposeful play.'
    },
    { 
        id: 2, 
        url: '/images/banner/banner2.jpg', 
        tag: 'Exclusive Offer',
        title: 'Seasonal Sale - 20% Off',
        desc: 'Premium quality toys at a thoughtful price.'
    },
    { 
        id: 3, 
        url: '/images/banner/banner3.jpg', 
        tag: 'Learning Labs',
        title: 'STEM Kits for Kids',
        desc: 'Building the engineers of tomorrow.'
    }
];

const Banner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 8000); // 8 seconds is the "sweet spot" for luxury sliders
        return () => clearInterval(interval);
    }, []);

    const nextSlide = () => setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

    return (
        <div className="relative w-full h-[400px] md:h-[600px] overflow-hidden rounded-[3rem] bg-[#F8F9FA] group">
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    {/* ✨ Ken Burns Effect Image */}
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 8, ease: "linear" }}
                        src={banners[currentIndex].url}
                        alt={banners[currentIndex].title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555448248-2571daf6344b?q=80&w=1200&auto=format&fit=crop';
                        }}
                    />

                    {/* ✨ Elegant Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

                    {/* ✨ Floating Content Card */}
                    <div className="absolute inset-0 flex items-center px-12 md:px-24">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="max-w-xl text-white"
                        >
                            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/80">
                                {banners[currentIndex].tag}
                            </span>
                            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-none">
                                {banners[currentIndex].title}
                            </h2>
                            <p className="text-lg md:text-xl text-white/90 font-medium mb-10 max-w-md leading-relaxed">
                                {banners[currentIndex].desc}
                            </p>
                            <button className="bg-white text-[#2D4A73] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#2D4A73] hover:text-white transition-all duration-500 shadow-2xl">
                                Explore Now
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ✨ Minimalist Navigation Arrows (Visible on hover) */}
            <button 
                onClick={prevSlide}
                className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-[#2D4A73]"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-[#2D4A73]"
            >
                <ChevronRight size={24} />
            </button>

            {/* ✨ Progress Bar Navigation */}
            <div className="absolute bottom-10 left-12 right-12 flex gap-4 items-center">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className="relative flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden"
                    >
                        {index === currentIndex && (
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 8, ease: "linear" }}
                                className="absolute inset-0 bg-white"
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Banner;