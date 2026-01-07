import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, X, ShoppingBag } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * ✨ AuthModal: A premium gatekeeper for authenticated actions.
 * Used when guests attempt to add to cart or buy now.
 */
const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop: Deep blur to keep focus on the modal */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4"
                    />
                    
                    {/* Modal Content: Premium rounded corners and high-contrast typography */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] z-[201] overflow-hidden"
                    >
                        <div className="p-10 text-center relative">
                            {/* Close Button */}
                            <button 
                                onClick={onClose} 
                                className="absolute top-8 right-8 text-gray-300 hover:text-gray-900 transition-colors"
                                aria-label="Close Modal"
                            >
                                <X size={24} />
                            </button>
                            
                            {/* Icon Visual */}
                            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <ShoppingBag className="text-[#2D4A73]" size={36} />
                            </div>
                            
                            {/* Text Content */}
                            <h3 className="text-3xl font-black text-[#2D4A73] mb-3 uppercase italic tracking-tighter leading-none">
                                Start Your <br /> Collection
                            </h3>
                            <p className="text-gray-400 font-bold text-sm mb-10 px-4 leading-relaxed">
                                Join the world of Yas Boss Toys! Please sign in to add these magical items to your bag.
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-4">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    className="w-full bg-[#2D4A73] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-blue-100"
                                >
                                    <LogIn size={18} /> Sign In Now
                                </motion.button>
                                
                                <button 
                                    onClick={onClose}
                                    className="w-full py-2 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-[#2D4A73] transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>

                        {/* Subtle Bottom Accent */}
                        <div className="h-2 w-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 opacity-20" />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AuthModal;