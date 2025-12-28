import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract the token from the URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            // 1. Save the JWT token to localStorage for future API calls
            localStorage.setItem('token', token);
            console.log("Authentication successful! Token saved.");
            
            // 2. Redirect the user to the homepage or their account
            navigate('/', { replace: true });
        } else {
            // If no token is found, redirect to login with an error
            console.error("Authentication failed: No token found in redirect URL.");
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mb-4"></div>
            <p className="text-xl font-medium text-gray-600">Completing login, please wait...</p>
        </div>
    );
};

export default OAuth2RedirectHandler;