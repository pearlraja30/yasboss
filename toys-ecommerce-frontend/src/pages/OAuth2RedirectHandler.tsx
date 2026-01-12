import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userService } from '../services/api';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('jwtToken', token);
            
            // Sync user profile immediately
            userService.getProfile().then(user => {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('userEmail', user.email);
                
                window.dispatchEvent(new Event("user-login"));
                window.dispatchEvent(new Event("storage"));
                
                navigate('/profile');
            }).catch(() => navigate('/login'));
        } else {
            navigate('/login');
        }
    }, [navigate, location]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
};

export default OAuth2RedirectHandler;