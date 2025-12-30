import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api'; // Ensure this path matches your file structure

const AdminLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!credentials.username || !credentials.password) {
            toast.error("Please enter both username and password.");
            return;
        }

        try {
            setIsLoading(true);
            
            // 1. Call your Java Backend
            // Note: credentials object must match what your backend expects (username/password or email/password)
            const response = await api.authService.login(credentials);
            
            // 2. ✨ CRITICAL: Store token and user data BEFORE navigation
            // This prevents the 403 error when the next page loads
            localStorage.setItem('jwtToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Also store email if your cart logic requires the X-User-Email header
            if (response.user?.email) {
                localStorage.setItem('userEmail', response.user.email);
            }

            toast.success("Welcome, Admin!");
            
            // 3. Navigate to the dashboard only after the token is secure
           setTimeout(() => {
            navigate('/admin/inventory');
        }, 100);
            
        } catch (error: any) {
            console.error("Login failed:", error);
            const errorMsg = error.response?.data?.message || "Invalid credentials. Access denied.";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2rem] shadow-xl w-96">
                <div className="flex justify-center mb-6">
                    <img src="/images/banner/logo.jpg" alt="YAS BOSS" className="h-10 object-contain" />
                </div>
                <h2 className="text-2xl font-bold mb-6 text-center text-[#2D4A73]">Admin Access</h2>
                
                <input 
                    type="text" 
                    placeholder="Username" 
                    className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:ring-2 focus:ring-[#2D4A73] outline-none transition-all"
                    value={credentials.username}
                    onChange={e => setCredentials({...credentials, username: e.target.value})}
                    disabled={isLoading}
                />
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full p-3 border border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-[#2D4A73] outline-none transition-all"
                    value={credentials.password}
                    onChange={e => setCredentials({...credentials, password: e.target.value})}
                    disabled={isLoading}
                />
                
                <button 
                    type="submit"
                    className="w-full bg-[#2D4A73] text-white py-3 rounded-xl font-bold hover:bg-[#1e334f] transition-all disabled:opacity-50 flex items-center justify-center"
                    disabled={isLoading}
                >
                    {isLoading ? "Authenticating..." : "Login to Dashboard"}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;