import React, { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, Rotate3d } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import config from '../../config'; // Using the config we created earlier
import { toast } from 'react-toastify';

interface AdminMediaActionsProps {
    productId: number;
    onSequenceCleared: () => void; // Refresh the list after deletion
}

const AdminMediaActions: React.FC<AdminMediaActionsProps> = ({ productId, onSequenceCleared }) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            // Calling the new Java Delete endpoint
            await axios.delete(`${config.BASE_URL}/api/admin/products/${productId}/delete-360`);
            toast.success("360° sequence cleared and physical files removed!");
            setIsConfirming(false);
            onSequenceCleared();
        } catch (error) {
            toast.error("Failed to clear sequence. Check server logs.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-black text-[#2D4A73] uppercase text-sm tracking-widest">360° View Management</h4>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Clear all frames to upload a new rotation sequence.</p>
                </div>
                
                <button 
                    onClick={() => setIsConfirming(true)}
                    className="flex items-center gap-2 bg-pink-50 text-pink-600 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                >
                    <Trash2 size={16} /> Clear 360 View
                </button>
            </div>

            {/* ✨ Integrated Confirmation Modal */}
            <AnimatePresence>
                {isConfirming && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
                            onClick={() => !isDeleting && setIsConfirming(false)}
                        />
                        
                        {/* Modal */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl z-[201] p-10 text-center"
                        >
                            <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle size={32} />
                            </div>
                            
                            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Are you sure?</h3>
                            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                                This will permanently delete all 360° frames from the server and database. This action cannot be undone.
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                    className="w-full bg-pink-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                                >
                                    {isDeleting ? <Loader2 className="animate-spin" /> : "Yes, Delete All"}
                                </button>
                                <button 
                                    onClick={() => setIsConfirming(false)}
                                    disabled={isDeleting}
                                    className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMediaActions;