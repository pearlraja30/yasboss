import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin } from 'lucide-react';

const AnimatedTracker = ({ progressPercentage }: { progressPercentage: number }) => {
    // progressPercentage is 0, 33, 66, or 100 based on status
    
    return (
        <div className="relative w-full h-24 bg-white rounded-3xl p-8 shadow-sm overflow-hidden">
            {/* Background Track */}
            <div className="absolute top-1/2 left-10 right-10 h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
            
            {/* Animated Progress Line */}
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-1/2 left-10 h-1 bg-blue-500 -translate-y-1/2 rounded-full"
            />

            {/* ✨ THE MOVING TRUCK ANIMATION */}
            <motion.div
                initial={{ left: "2.5rem" }}
                animate={{ left: `calc(${progressPercentage}% + 2.5rem)` }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
            >
                <div className="relative flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-blue-500 text-blue-600">
                        <Truck size={24} />
                    </div>
                    {/* Animated "Pulsing" exhaust or shadow could go here */}
                </div>
            </motion.div>

            {/* Stage Markers */}
            <div className="absolute w-full top-1/2 left-0 right-0 -translate-y-1/2 px-10 flex justify-between">
                {['Created', 'In Transit', 'Out For Delivery', 'Delivered'].map((label, i) => (
                    <div key={label} className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mb-8 z-20 ${
                            (i * 33.3) <= progressPercentage ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-tighter ${
                            (i * 33.3) <= progressPercentage ? 'text-blue-600' : 'text-gray-300'
                        }`}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnimatedTracker;