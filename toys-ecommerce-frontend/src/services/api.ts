// src/services/api.ts
import axios from 'axios';
import type { Product } from '../types/Product';
import { toast } from 'react-toastify'; // ✨ Added for centralized error notifications

/**
 * 1. Centralized Host Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * 2. Common Axios Instance
 */
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * 3. Global Request Interceptor
 */
apiClient.interceptors.request.use((config) => {
    if (config.url?.includes('/auth/')) return config;

    const token = localStorage.getItem('jwtToken');
    delete config.headers.Authorization;

    if (token && token !== "null" && token !== "undefined" && token.length > 20) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🚀 API INTERCEPTOR: Attached token to ${config.url}`);
    } else {
        console.warn(`⚠️ API INTERCEPTOR: No token found for ${config.url}`);
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * ✨ REFINED RESPONSE INTERCEPTOR
 * Now captures clean Java ErrorResponse messages and displays them via Toast.
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Extract the message from your Java GlobalExceptionHandler
        const message = error.response?.data?.message || "An unexpected magic error occurred!";
        const status = error.response?.status;

        if (status === 401) {
            console.error("Session Expired");
            toast.warning("🔒 Session expired. Please sign in again.");
            localStorage.clear();
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        } else if (status === 404) {
            toast.error(`🔍 ${message}`);
        } else if (status === 500) {
            toast.error(`⚠️ Server Error: ${message}`);
        } else {
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

/**
* 4. Product Service Implementation
*/
export const productService = {
    getAllProducts: async (): Promise<Product[]> => {
        const response = await apiClient.get('/products/all');
        return response.data;
    },
    getFeaturedProducts: async (): Promise<Product[]> => {
        const response = await apiClient.get('/products/features');
        return response.data;
    },
    getProductsByAge: async (ageRange: string): Promise<Product[]> => {
        const response = await apiClient.get(`/products/age/${ageRange}`);
        return response.data;
    },
    getProductById: async (id: string | number): Promise<Product> => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },
    searchProducts: async (query: string): Promise<Product[]> => {
        const response = await apiClient.get(`/products/search?q=${query}`);
        return response.data;
    },
    getProductsByCategory: async (category: string): Promise<Product[]> => {
        const response = await apiClient.get(`/products/category/${category}`);
        return response.data;
    },
    getProducts: async (params: { category: string, age: string, search: string }) => {
        const response = await apiClient.get('/products/filter', { params });
        return response.data;
    },
    
    /**
     * Uploads a single media file (Image or Video) with flags.
     */
    uploadMedia: async (productId: number, file: File, is360: boolean, isVideo: boolean) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('is360', String(is360));
        formData.append('isVideo', String(isVideo));
        const response = await apiClient.post(`/admin/products/${productId}/media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Clears the entire 360 rotation set and physical files.
     */
    delete360Sequence: async (productId: number) => {
        const response = await apiClient.delete(`/admin/products/${productId}/delete-360`);
        return response.data;
    },

    /**
     * Deletes a specific media item (Image/Video) and its physical file.
     */
    deleteMedia: async (imageId: number) => {
        const response = await apiClient.delete(`/admin/products/media/${imageId}`);
        return response.data;
    },

    // --- Legacy methods ---
    addProduct: async (productData: Partial<Product>): Promise<Product> => {
        const response = await apiClient.post('/products/add', productData);
        return response.data;
    },
    updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
        const response = await apiClient.put(`/products/update/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id: number): Promise<void> => {
        await apiClient.delete(`/products/delete/${id}`);
    },

    upload360Sequence: async (productId: number, files: File[], onProgress?: (percent: number) => void) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        
        const response = await apiClient.post(`/admin/products/${productId}/upload-360`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            // ✨ Axios native progress tracking
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
        return response.data;
    },
};

/**
* 5. Auth Service Implementation
*/
export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data; 
    },
    register: async (formData: any) => {
        const response = await apiClient.post('/auth/register', formData);
        return response.data;
    }
};

/**
* 6. Cart Service Implementation
*/
export const cartService = {
    addToCart: async (productId: number, quantity: number, email: string) => {
        return await apiClient.post(`/cart/add/${productId}`,
            { quantity },
            { headers: { 'X-User-Email': email } }
        );
    },
    instantOrder: async (productId: number, quantity: number, email: string) => {
        return await apiClient.post(`/orders/instant`,
            { productId, quantity },
            { headers: { 'X-User-Email': email } }
        );
    }
};

/**
* 7. Order Service Implementation
*/
export const orderService = {
    getUserOrders: (email: string) => apiClient.get(`/orders/user/${email}`),
    placeOrder: async (orderData: any) => {
        const response = await apiClient.post('/orders/place', orderData);
        return response.data;
    },
    getOrderHistory: async (email: string) => {
        const response = await apiClient.get(`/orders/user/${email}`);
        return response.data;
    },
    updateStatus: async (orderId: number, status: string) => {
        const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status });
        return response.data;
    },
    getAllAdminOrders: async () => {
        const response = await apiClient.get('/admin/orders');
        return response.data;
    },
    getMyTracking: async () => {
        const response = await apiClient.get('/orders/my-tracking');
        return response.data;
    },
    downloadInvoice: async (id: number) => {
        const response = await apiClient.get(`/admin/orders/${id}/invoice`, {
            responseType: 'blob',
        });
        return response.data;
    },
    createOrder: async (orderData: any) => {
        const response = await apiClient.post('/orders/checkout', orderData);
        return response.data;
    },
    processPayment: async (paymentData: any) => {
        const response = await apiClient.post('/process-payment', paymentData);
        return response.data;
    }
};

/**
* 8. Reward & Quiz Services
*/
export const rewardService = {
    completeQuiz: async (quizData: { pointsEarned: number; quizId: string }) => {
        const response = await apiClient.post('/rewards/complete-quiz', quizData);
        return response.data;
    },
    getPointHistory: async () => {
        const response = await apiClient.get('/rewards/history');
        return response.data;
    }
};

export const quizService = {
    getQuestions: async (category: string) => {
        const response = await apiClient.get(`/quiz/questions/${category}`);
        return response.data;
    },
    submitResult: async (resultData: any) => {
        const response = await apiClient.post('/rewards/quiz-completion', resultData);
        return response.data;
    },
    getAllAdminQuestions: async () => {
        const response = await apiClient.get('/admin/quiz/all');
        return response.data;
    },
    addQuestion: async (data: any) => {
        const response = await apiClient.post('/admin/quiz/add', data);
        return response.data;
    },
    deleteQuestion: async (id: number) => {
        const response = await apiClient.delete(`/admin/quiz/delete/${id}`);
        return response.data;
    }
};

/**
* 9. Inventory & User Services
*/
export const inventoryService = {
    getAll: () => apiClient.get('/products/all'),
    getLowStock: (threshold: number) => apiClient.get(`/products/low-stock?threshold=${threshold}`),
    update: (id: number, data: any) => apiClient.put(`/products/${id}`, data),
    delete: (id: number) => apiClient.delete(`/products/${id}`),
};

export const userService = {
    getLeaderboard: async () => {
        const response = await apiClient.get('/users/leaderboard');
        return response.data;
    },
    getProfile: async () => {
        const response = await apiClient.get('/users/profile');
        return response.data;
    },
    updateProfile: async (data: any) => {
        const response = await apiClient.put('/users/profile/update', data);
        return response.data;
    }
};

export const adminService = {
    getLowStock: (threshold: number) => apiClient.get(`/products/low-stock?threshold=${threshold}`),
    getAllOrders: () => apiClient.get('/orders/all'),
    updateOrderStatus: (id: string, status: string, agentName: string, agentPhone: string) => 
        apiClient.put(`/orders/${id}/status`, null, {
            params: { status, agentName, agentPhone }
        }),
    deleteImageId: async (id: number) => apiClient.delete(`/gallery/${id}`),
};

export const agentService = {
    updateStatus: (orderId: string, status: string, note: string) => 
        apiClient.put(`/orders/${orderId}/agent-update`, null, {
            params: { status, deliveryNote: note }
        })
};

export const shipmentService = {
    getCounts: async () => {
        const response = await apiClient.get('/admin/shipments/counts');
        return response.data;
    },
    getFilteredShipments: async (status: string) => {
        const response = await apiClient.get('/admin/shipments/filter', {
            params: { status }
        });
        return response.data;
    },
    updateTracking: async (waybill: string, data: any) => {
        const response = await apiClient.put(`/admin/shipments/update/${waybill}`, data);
        return response.data;
    },
    getTrackingDetails: async (waybill: string) => {
        const response = await apiClient.get(`admin/shipments/track/${waybill}`);
        return response.data;
    }
};

export const announcementService = {
    getActive: async () => {
        const response = await apiClient.get('/announcements/active');
        return response.data; // Returns array of Announcement objects
    },
    create: async (data: any) => {
        const response = await apiClient.post('/announcements/create', data);
        return response.data;
    },
    updateStatus: async (id: number, data: any) => {
        const response = await apiClient.put(`/announcements/update/${id}`, data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/announcements/delete/${id}`);
        return response.data;
    }
    
};

/**
* 🚀 Centralized API Export
*/
const api = {
    productService,
    authService,
    cartService, 
    orderService,
    rewardService,
    couponService: {
        validateCoupon: async (code: string, subtotal: number) => {
            const response = await apiClient.get(`/coupons/validate?code=${code}&total=${subtotal}`);
            return response.data;
        }
    },
    quizService,
    inventoryService,
    userService,
    adminService,
    agentService,
    shipmentService,
    announcementService
};

export default api;