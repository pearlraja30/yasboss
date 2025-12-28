import React from 'react';

const AboutUsBanner: React.FC = () => {
    return (
        <section className="relative bg-[#D0E1F9] py-20 overflow-hidden">
            {/* Background Decorative Shapes (Simulated from the image) */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#A5C4E7] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#76A5D9] rounded-tl-full opacity-30"></div>

            <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-[#2D4A73] mb-8 font-serif">
                    Smart Fun for Growing Minds
                </h2>
                
                <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-white/20">
                    <h3 className="text-xl md:text-2xl font-semibold text-[#3E5C8A] mb-4 italic">About Us</h3>
                    <p className="text-[#2D4A73] text-lg md:text-2xl leading-relaxed font-medium">
                        At Yas Boss, we believe learning begins with play. We're an Indian brand dedicated to 
                        <span className="block text-3xl md:text-5xl font-bold mt-4 text-[#1E3A5F]">
                            Encourages early learning in letters, numbers, and nature laying the foundation for future growth
                        </span>
                    </p>
                    <p className="text-[#3E5C8A] mt-6 text-sm md:text-lg max-w-2xl mx-auto">
                        creating thoughtfully designed, eco-friendly wooden toys that inspire curiosity, creativity, and confidence in young minds.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutUsBanner;