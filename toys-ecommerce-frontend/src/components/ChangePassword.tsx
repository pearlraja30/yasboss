import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, ShieldCheck } from 'lucide-react';

const ChangePassword: React.FC = () => {
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Client-side validation
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error("New passwords do not match!");
        }

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            await axios.put(`http://localhost:8080/api/users/profile/change-password`, {
                email: user.email,
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });

            toast.success("Security updated! Please use your new password next time.");
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.response?.data || "Failed to update password");
        }
    };

    return (
        <div className="mt-8 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                    <ShieldCheck size={24} />
                </div>
                <h2 className="text-2xl font-black text-[#2D4A73]">Security Settings</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                    <input 
                        type="password" 
                        required
                        className="w-full mt-2 p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-purple-100"
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full mt-2 p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-blue-100"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirm New Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full mt-2 p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold focus:ring-2 focus:ring-blue-100"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full py-5 bg-[#2D4A73] text-white font-black rounded-2xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                    <Lock size={20} /> Update Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;