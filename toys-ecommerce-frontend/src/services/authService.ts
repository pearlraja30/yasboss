// src/services/authService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const register = (userData: any) => {
    return axios.post(`${API_URL}/register`, userData);
};

// Social login helper - typically redirects to the backend OAuth endpoint
export const socialLogin = (provider: 'google' | 'facebook') => {
    window.location.href = `http://localhost:8080/oauth2/authorize/${provider}?redirect_uri=http://localhost:5173/oauth2/redirect`;
};