import * as React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, ShieldCheck, Globe } from 'lucide-react';

const AboutUs: React.FC = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-pink-600 font-black uppercase tracking-[0.3em] text-xs"
                    >
                        Our Story
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-7xl font-black text-[#2D4A73] mt-4 tracking-tighter"
                    >
                        Smart Fun for <br /> Growing Minds.
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl mx-auto mt-8 text-gray-500 text-lg leading-relaxed"
                    >
                        At YasBoss, we believe that every toy should be a gateway to discovery. 
                        Our journey started with a simple mission: to provide children with 
                        safe, non-toxic, and educational play experiences.
                    </motion.p>
                </div>
            </section>

            {/* Main Image Section (Place your uploaded image here) */}
            <section className="max-w-6xl mx-auto px-4 mb-32">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[4rem] overflow-hidden shadow-2xl aspect-[16/9] bg-gray-100"
                >
                    {/* Replace this src with your actual image path */}
                    <img 
                        src="/images/about/about-main.jpg" 
                        alt="Children playing with toys" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if the image fails to load
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2D4A73]/40 to-transparent" />
                </motion.div>
            </section>

            {/* Values Grid */}
            <section className="bg-gray-50 py-32 rounded-[5rem]">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: <ShieldCheck className="text-blue-600" />, title: "100% Safe", desc: "Non-toxic materials, certified child-safe." },
                            { icon: <Sparkles className="text-pink-600" />, title: "Educational", desc: "Designed to boost motor and cognitive skills." },
                            { icon: <Heart className="text-red-500" />, title: "With Love", desc: "Handpicked selection for your little ones." },
                            { icon: <Globe className="text-green-600" />, title: "Eco-Friendly", desc: "Sustainable wood and recycled packaging." }
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-xl transition-all"
                            >
                                <div className="mb-6 p-4 bg-gray-50 w-fit rounded-2xl">{item.icon}</div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission Quote */}
            <section className="py-40 text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-[#2D4A73] leading-tight italic">
                        "Yes, You Can – Empowering the next generation through the magic of creative play."
                    </h2>
                    <div className="mt-10 h-1 w-20 bg-pink-600 mx-auto rounded-full" />
                </div>
            </section>
        </div>
    );
};

export default AboutUs;