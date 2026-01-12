import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, PlayCircle } from 'lucide-react';

const HeroSection = () => {
    const { scrollYProgress } = useScroll();
    const xMove = useTransform(scrollYProgress, [0, 1], [0, -600]);

    return (
        <section className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
            {/* ✨ KINETIC TYPOGRAPHY LAYER */}
            <div className="overflow-hidden whitespace-nowrap mb-8 select-none pointer-events-none">
                <motion.h1 
                    style={{ x: xMove }} 
                    className="text-[12vw] font-black uppercase text-[#2D4A73]/5 leading-none"
                >
                    Imagine • Create • Play • Imagine • Create • Play • 
                </motion.h1>
            </div>

            {/* ✨ BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:h-[600px]">
                
                {/* LARGE FEATURE BLOCK */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="md:col-span-2 md:row-span-2 bg-[#2D4A73] rounded-[3.5rem] p-12 text-white relative overflow-hidden group"
                >
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <span className="bg-pink-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full">New Arrivals</span>
                            <h2 className="text-5xl font-black mt-6 tracking-tighter leading-none">The Future of <br/> Play is Here.</h2>
                        </div>
                        <button className="flex items-center gap-3 bg-white text-[#2D4A73] w-fit px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-pink-500 hover:text-white transition-all shadow-2xl">
                            Explore Collection <ArrowRight size={18} />
                        </button>
                    </div>
                    <PlayCircle className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64 group-hover:scale-110 transition-transform duration-700" />
                </motion.div>

                {/* TALL PRODUCT SPOTLIGHT */}
                <div className="md:col-span-1 md:row-span-2 bg-pink-50 rounded-[3.5rem] p-8 flex flex-col items-center justify-center border-2 border-pink-100 group">
                    <motion.img 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        src="/images/hero-toy.png" 
                        className="w-full drop-shadow-2xl mb-6"
                    />
                    <div className="text-center">
                        <p className="text-pink-600 font-black uppercase text-[10px] tracking-widest">Toy of the Week</p>
                        <h3 className="text-2xl font-black text-[#2D4A73] mt-2">STEM Build Bot</h3>
                    </div>
                </div>

                {/* HORIZONTAL PROMO */}
                <div className="md:col-span-1 md:row-span-1 bg-yellow-400 rounded-[3rem] p-8 flex flex-col justify-center relative overflow-hidden">
                    <Sparkles className="absolute top-4 right-4 text-[#2D4A73]/20" size={40} />
                    <h4 className="text-[#2D4A73] font-black text-xl leading-tight">Weekend Bonus: <br/> 2x Points!</h4>
                    <p className="text-[#2D4A73]/70 text-xs font-bold mt-2">Active until Sunday</p>
                </div>

                {/* QUICK NAV BLOCK */}
                <div className="md:col-span-1 md:row-span-1 bg-blue-50 rounded-[3rem] p-8 flex items-center justify-between group cursor-pointer hover:bg-[#2D4A73] transition-all duration-500">
                    <span className="text-[#2D4A73] group-hover:text-white font-black uppercase text-xs tracking-widest leading-tight">Shop by <br/> Age: 2-4</span>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <ArrowRight className="text-[#2D4A73]" size={20} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;