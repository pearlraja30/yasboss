import axios from 'axios';
import type { Product } from '../types/Product';

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
 * ✨ FIXED: Removed duplicate return and cleaned logic to ensure token is ALWAYS attached.
 */
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');

    // Remove any previous Authorization to prevent stale/duplicate headers
    delete config.headers.Authorization;

    if (token && token !== "null" && token !== "undefined" && token.length > 20) {
        config.headers.Authorization = `Bearer ${token}`;
        // Verify this in your Browser Console (F12)
        console.log(`🚀 API INTERCEPTOR: Attached token to ${config.url}`);
    } else {
        console.warn(`⚠️ API INTERCEPTOR: No token found for ${config.url}`);
    }
    
    return config; // Return the modified config only once
}, (error) => {
    return Promise.reject(error);
});

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
    getProductsByIds: async (ids: number[]): Promise<Product[]> => {
    const response = await apiClient.get(`/products/compare?ids=${ids.join(',')}`);
    return response.data;
    },
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
    getProducts: async (params: { category: string, age: string, search: string }) => {
    const response = await apiClient.get('/products/filter', { params});
    return response.data;
    }
};

/**
* 5. Auth Service Implementation
*/
export const authService = {
    login: async (credentials: any) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
    },
    register: async (formData: any) => {
    const response = await apiClient.post('/auth/register', formData);
    return response.data;
    }
};

/**
* 6. Cart Service Implementation (✨ NEW)
* Manages the shopping bag synchronization with PostgreSQL.
*/
export const cartService = {
    /**
    * Centralized Add to Cart logic.
    * Note: Token is handled automatically by the interceptor.
    */
    addToCart: async (productId: number, quantity: number, email: string) => {
    return await apiClient.post(`/cart/add/${productId}`,
    { quantity },
    {
    headers: { 'X-User-Email': email }
    }
    );
},
// Useful for Buy Now feature
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
    getLowStockAlerts: async () => {
    const response = await apiClient.get('/admin/inventory/alerts');
    return response.data;
    },
    updateStock: async (id: number, quantity: number) => {
    const response = await apiClient.put(`/admin/inventory/update/${id}`, { quantity });
    return response.data;
    }
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

/**
* 🚀 Centralized API Export
*/
const api = {
productService,
authService,
cartService, // ✨ Included in default export
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
userService
};

export default api;