import React, { useState, useEffect } from 'react';

const banners = [
    { id: 1, url: '/images/banner/banner1.jpg', title: 'New Educational Toys' },
    { id: 2, url: '/images/banner/banner2.jpg', title: 'Seasonal Sale - 20% Off' },
    { id: 3, url: '/images/banner/banner3.jpg', title: 'STEM Kits for Kids' }
];

const Banner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Set the interval for 30 seconds (30000ms)
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === banners.length - 1 ? 0 : prevIndex + 1
            );
        }, 10000); // Change to 60000 for 60 seconds

        // Clear interval if component unmounts to prevent memory leaks
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl shadow-lg mb-8 bg-gray-200">
            {/* Image Transition */}
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <img
                        src={banner.url}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x450?text=YasBoss+Toy+Store';
                        }}
                    />
                    {/* Overlay Text */}
                    <div className="absolute bottom-10 left-10 bg-black/40 p-4 rounded-lg text-white">
                        <h2 className="text-3xl font-bold">{banner.title}</h2>
                    </div>
                </div>
            ))}

            {/* Manual Dots Navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                            index === currentIndex ? 'bg-pink-600' : 'bg-white/50'
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Banner;