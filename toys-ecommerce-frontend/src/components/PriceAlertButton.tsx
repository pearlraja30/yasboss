import React, { useState } from 'react';
import { Bell, BellRing, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const PriceAlertButton: React.FC<{ productId: number }> = ({ productId }) => {
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = async () => {
        // api.productService.subscribeToPriceDrop(productId);
        setIsSubscribed(true);
    };

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSubscribe}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                isSubscribed 
                ? 'bg-green-50 text-green-600 border border-green-100' 
                : 'bg-blue-50 text-[#2D4A73] hover:bg-[#2D4A73] hover:text-white border border-blue-100'
            }`}
        >
            {isSubscribed ? (
                <><Check size={16} /> Alert Active</>
            ) : (
                <><Bell size={16} /> Notify on Price Drop</>
            )}
        </motion.button>
    );
};

export default PriceAlertButton;