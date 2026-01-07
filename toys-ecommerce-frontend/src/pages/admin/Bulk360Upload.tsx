import React, { useState } from 'react';
import { Upload, Rotate3d, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion'; // ✨ Added for progress bar animation
import { productService } from '../../services/api';
import { toast } from 'react-toastify';

interface Bulk360UploadProps {
    productId: number;
    onUploadComplete: () => void;
}

const Bulk360Upload: React.FC<Bulk360UploadProps> = ({ productId, onUploadComplete }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // ✨ Track real-time progress

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
            setUploadProgress(0); // Reset progress on new selection
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        setUploadProgress(0); // Initialize progress at 0%

        try {
            // ✨ Passing the progress callback to the service
            await productService.upload360Sequence(productId, selectedFiles, (percent) => {
                setUploadProgress(percent);
            });
            
            toast.success(`Successfully uploaded ${selectedFiles.length} frames!`);
            
            // Clean up state
            setSelectedFiles([]);
            setPreviews([]);
            onUploadComplete();
        } catch (error) {
            // Error handled by centralized interceptor
        } finally {
            setIsUploading(false);
            // Optional: small delay before hiding progress bar for visual confirmation
            setTimeout(() => setUploadProgress(0), 1000);
        }
    };

    const clearSelection = () => {
        setSelectedFiles([]);
        setPreviews([]);
        setUploadProgress(0);
    };

    return (
        <div className="bg-white/5 rounded-[3rem] p-8 border border-white/10 mt-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-600 rounded-2xl shadow-lg shadow-pink-600/20">
                        <Rotate3d className="text-white" size={20} />
                    </div>
                    <h4 className="font-black text-white uppercase text-xs tracking-widest italic">Bulk 360° Sync</h4>
                </div>
                {selectedFiles.length > 0 && !isUploading && (
                    <button onClick={clearSelection} className="text-pink-400 text-[10px] font-black uppercase hover:text-white transition-colors">
                        Clear All
                    </button>
                )}
            </div>

            {/* Drag & Drop Area */}
            {!isUploading ? (
                <div className="relative group cursor-pointer">
                    <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="border-2 border-dashed border-white/20 rounded-[2rem] p-10 text-center group-hover:border-pink-600 transition-colors">
                        <Upload className="mx-auto mb-4 text-blue-200" size={32} />
                        <p className="text-[10px] font-black uppercase text-blue-100 tracking-widest">
                            {selectedFiles.length > 0 ? `${selectedFiles.length} Frames Selected` : 'Select Sequence Folder'}
                        </p>
                    </div>
                </div>
            ) : (
                /* ✨ Progress Bar UI */
                <div className="p-10 text-center bg-white/5 rounded-[2rem] border border-white/10">
                    <div className="flex justify-between items-end mb-4">
                        <div className="text-left">
                            <p className="text-pink-600 font-black text-xs uppercase tracking-widest">Syncing Visuals</p>
                            <p className="text-white/40 text-[9px] font-bold uppercase">{selectedFiles.length} High-Res Frames</p>
                        </div>
                        <span className="text-2xl font-black text-white italic">{uploadProgress}%</span>
                    </div>
                    
                    {/* Track */}
                    <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                        {/* Progress Fill */}
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                            transition={{ type: "spring", stiffness: 50, damping: 20 }}
                            className="h-full bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_0_20px_rgba(219,39,119,0.4)]"
                        />
                    </div>
                    <p className="mt-4 text-[10px] font-black text-white/30 uppercase animate-pulse">Uploading to Command Center...</p>
                </div>
            )}

            {/* Preview Filmstrip */}
            {previews.length > 0 && !isUploading && (
                <div className="mt-6 flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {previews.map((url, i) => (
                        <div key={i} className="min-w-[80px] h-20 rounded-xl overflow-hidden border border-white/10 relative shrink-0">
                            <img src={url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt={`Frame ${i}`} />
                            <div className="absolute top-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded font-black">
                                {i + 1}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button 
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="w-full mt-6 bg-pink-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest hover:bg-white hover:text-[#2D4A73] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 disabled:bg-gray-700"
            >
                {isUploading ? (
                    <><Loader2 className="animate-spin" size={20} /> Processing Sequence...</>
                ) : (
                    <><ImageIcon size={20} /> Sync Sequence to Toy</>
                )}
            </button>
        </div>
    );
};

export default Bulk360Upload;