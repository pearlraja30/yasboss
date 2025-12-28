// src/pages/admin/AdminLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, call your Java backend /api/auth/login here
        navigate('/admin/inventory');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2rem] shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Admin Access</h2>
                <input 
                    type="text" 
                    placeholder="Username" 
                    className="w-full p-3 border rounded-xl mb-4"
                    onChange={e => setCredentials({...credentials, username: e.target.value})}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full p-3 border rounded-xl mb-6"
                    onChange={e => setCredentials({...credentials, password: e.target.value})}
                />
                <button className="w-full bg-[#2D4A73] text-white py-3 rounded-xl font-bold hover:bg-[#1e334f] transition">
                    Login to Dashboard
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;