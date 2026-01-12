import React, { useState, useRef } from 'react';
import { Camera, Loader2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProfileImageUpload: React.FC = () => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('image', file);

            try {
                setUploading(true);
                await api.userService.uploadProfileImage(formData);
                toast.success("Profile photo updated!");
            } catch (error) {
                toast.error("Failed to upload image.");
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <div className="relative group w-32 h-32 mx-auto">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
            />
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center text-white"
            >
                {uploading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                <span className="text-[8px] font-black uppercase mt-1">Change Photo</span>
            </button>

            {/* Success checkmark after upload */}
            {!uploading && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                    <Check size={12} strokeWidth={4} />
                </div>
            )}
        </div>
    );
};

export default ProfileImageUpload;