import axios from 'axios';
import type { Product } from '../types/Product';
import { toast } from 'react-toastify'; 

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
    
    // Defensive check to avoid sending "null" strings to backend
    if (token && token !== "null" && token !== "undefined" && token.length > 20) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => Promise.reject(error));

/**
 * 4. Global Response Interceptor
 */
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            toast.warning("🔒 Session expired. Please sign in again.");
            localStorage.clear();
            window.location.href = '/login';     
        } else if (status === 403) {
            toast.error("🚫 Access Denied: Insufficient Permissions.");
        }
        return Promise.reject(error);
    }
);

/**
* 5. Product Service Implementation
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
    delete360Sequence: async (productId: number) => {
        const response = await apiClient.delete(`/admin/products/${productId}/delete-360`);
        return response.data;
    },
    deleteMedia: async (imageId: number) => {
        const response = await apiClient.delete(`/admin/products/media/${imageId}`);
        return response.data;
    },
    addProduct: async (productData: Partial<Product>): Promise<Product> => {
        const response = await apiClient.post('/products/add', productData);
        return response.data;
    },
    addProductWithImage: async (formData: FormData) => {
        const response = await apiClient.post('/products/add', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    updateProduct: async (id: number, data: Partial<Product>): Promise<Product> => {
        const response = await apiClient.put(`/products/update/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id: number) => {
        const response = await apiClient.delete(`/products/delete/${id}`);
        return response.data;
    },
    upload360Sequence: async (productId: number, files: File[], onProgress?: (percent: number) => void) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        const response = await apiClient.post(`/admin/products/${productId}/upload-360`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            }
        });
        return response.data;
    },
    getFilteredProducts: async (category: string, age: string, search: string) => {
        // 🛡️ Logic to ensure we don't send empty strings if they aren't needed
        const params: any = {};
        if (category && category !== 'all') params.category = category;
        if (age && age !== 'all') params.age = age;
        if (search) params.search = search;

        // This hits /api/products/search?age=0-2
        const response = await apiClient.get('/products/search', { params });
        console.log(response.data);
        return response.data;
    }
};

/**
* 6. Auth Service Implementation
*/
export const authService = {
    login: async (credentials: { email: string; password: string }) => {
        return await apiClient.post('/auth/login', credentials);
    },
    register: async (formData: any) => {
        return await apiClient.post('/auth/register', formData);
    }
};

/**
* 7. Cart Service Implementation
*/
export const cartService = {
    addToCart: async (productId: number, quantity: number, email: string) => {
        return await apiClient.post(`/cart/add/${productId}`,
            { quantity },
            { headers: { 'X-User-Email': email } }
        );
    },
    calculateCartTotals: (items: any[], taxPercent: number, freeThreshold: number) => {
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const taxAmount = (subtotal * taxPercent) / 100;
        const shipping = subtotal >= freeThreshold ? 0 : 49;
        const grandTotal = subtotal + taxAmount + shipping;
        return { subtotal, taxAmount, shipping, grandTotal };
    },
    instantOrder: async (productId: number, quantity: number, email: string) => {
        return await apiClient.post(`/orders/instant`,
            { productId, quantity },
            { headers: { 'X-User-Email': email } }
        );
    }
};

/**
* 8. Order Service Implementation
*/
export const orderService = {
    getUserOrders: async (email: string) => {
        const response = await apiClient.get(`/orders/user/${email}`);
        return response.data;
    },
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
        const response = await apiClient.get(`/admin/orders/${id}/invoice`, { responseType: 'blob' });
        return response.data;
    },
    createOrder: async (orderData: any) => {
        const response = await apiClient.post('/orders/checkout', orderData);
        return response.data;
    },
    processPayment: async (paymentData: any) => {
        const response = await apiClient.post('/process-payment', paymentData);
        return response.data;
    },
    requestSupport: async (orderId: string, type: 'RETURN' | 'REPLACEMENT' | 'CANCEL') => {
        const response = await apiClient.post(`/orders/${orderId}/support`, null, { params: { type } });
        return response.data;
    },
    get: (url: string) => apiClient.get(url),
    getOrderById: async (orderId: string) => {
        const response = await apiClient.get(`/orders/${orderId}`);
        return response.data;
    },
    getTrackingDetails: async (orderId: string) => {
        const response = await apiClient.get(`/orders/track/${orderId}`);
        return response.data;
    },
    requestReplacement: async (orderId: string, reason: string) => {
        const response = await apiClient.post(`/orders/${orderId}/request-replacement`, { reason });
        return response.data;
    },
    getPendingReplacements: async () => {
        const response = await apiClient.get('/admin/replacements/pending');
        return response.data;
    },
    handleReplacementAction: (id: number, action: string) => 
        apiClient.post(`/admin/orders/${id}/replacement-action`, null, { params: { action } }),
};

/**
* 9. Reward & Quiz Services
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
* 10. Inventory & User Services
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
    },
    uploadProfileImage: async (formData: FormData) => {
        const response = await apiClient.post('/user/profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, profileImage: response.data.imageUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        return response.data;
    },
    getAddresses: async () => {
        const response = await apiClient.get('/user/addresses');
        return response.data;
    },
    setDefaultAddress: async (addressId: number) => {
        const response = await apiClient.put(`/user/addresses/${addressId}/default`);
        return response.data;
    },
    deleteAddress: async (addressId: number) => {
        const response = await apiClient.delete(`/user/addresses/${addressId}`);
        return response.data;
    },
    addAddress: async (addressData: any) => {
        const response = await apiClient.post('/user/addresses', addressData);
        return response.data;
    },
    updateFcmToken: async (token: string) => {
        return await apiClient.put('/user/update-fcm-token', { token });
    }
};

/**
 * 11. Location, Admin, Agent Services
 */
export const locationService = {
    getAddressByPincode: async (pincode: string) => {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data[0].Status === "Success") {
            const po = data[0].PostOffice[0];
            return { city: po.District, state: po.State, district: po.District, locality: po.Name };
        }
        throw new Error("Invalid Pincode");
    }
};

export const adminService = {
    getLowStock: (threshold: number) => apiClient.get(`/products/low-stock?threshold=${threshold}`),
    getAllOrders: () => apiClient.get('/orders/all'),
    updateOrderStatus: (id: string, status: string, agentName: string, agentPhone: string) => 
        apiClient.put(`/orders/${id}/status`, null, { params: { status, agentName, agentPhone } }),
    deleteImageId: async (id: number) => apiClient.delete(`/gallery/${id}`),
    downloadReport: (type: string, start: string, end: string, format: string) => {
        return apiClient.get('/admin/reports/download', { params: { type, start, end, format }, responseType: 'blob' });
    },
    applyGlobalOffer: async (data: any) => {
        const response = await apiClient.post('/admin/offers/apply', data);
        return response.data;
    },
    resetOffers: async () => {
        const response = await apiClient.post('/admin/offers/reset');
        return response.data;
    },
    getGlobalSettings: async () => {
        const response = await apiClient.get('/admin/settings');
        const settingsMap: Record<string, string> = {};
        if (Array.isArray(response.data)) {
            response.data.forEach((s: any) => { settingsMap[s.settingKey] = s.settingValue; });
        }
        return settingsMap;
    },
    updateGlobalSetting: async (key: string, value: string) => {
        const response = await apiClient.put(`/admin/settings/${key}`, { settingValue: value });
        return response.data;
    },

    getRecentActivities: () => apiClient.get('/admin/audit-logs'),
};

export const agentService = {
    updateStatus: (orderId: string, status: string, note: string) => 
        apiClient.put(`/orders/${orderId}/agent-update`, null, { params: { status, deliveryNote: note } })
};

/**
 * 12. Shipment, Announcement, Article Services
 */
export const shipmentService = {
    getCounts: async () => {
        const response = await apiClient.get('/admin/shipments/counts');
        return response.data;
    },
    getFilteredShipments: async (status: string) => {
        const response = await apiClient.get('/admin/shipments/filter', { params: { status } });
        return response.data;
    },
    updateTracking: async (waybill: string, data: any) => {
        const response = await apiClient.put(`/admin/shipments/update/${waybill}`, data);
        return response.data;
    },
    getTrackingDetails: async (waybill: string) => {
        const response = await apiClient.get(`admin/shipments/track/${waybill}`);
        return response.data;
    },
    getAllShipments: async () => {
        const response = await apiClient.get('/admin/shipments/all');
        return response.data;
    },
};

export const announcementService = {
    getActive: async () => {
        const response = await apiClient.get('/announcements/active');
        return response.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post('/announcements/create', data);
        return response.data;
    },
    updateStatus: async (id: number, active: boolean) => {
        const response = await apiClient.patch(`/announcements/${id}/status`, null, { params: { active } });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/announcements/delete/${id}`);
        return response.data;
    },
    getAllForAdmin: async () => {
        const response = await apiClient.get('/announcements/admin/all');
        return response.data;
    },
};

export const articleService = {
    getFeatured: async () => {
        const response = await apiClient.get('/parenting/articles/featured');
        return response.data;
    },
    getByCategory: async (categorySlug: string) => {
        const response = await apiClient.get(`/parenting/articles/category/${categorySlug}`);
        return response.data;
    },
    createArticle: async (articleData: any) => {
        const response = await apiClient.post('/parenting/articles', articleData);
        return response.data;
    },
    deleteArticle: async (id: number) => { await apiClient.delete(`/parenting/articles/${id}`); },
    getAgeGroups: async () => {
        const response = await apiClient.get('/parenting/age-groups');
        return response.data;
    },
    uploadImage: async (formData: FormData) => {
        const response = await apiClient.post('/upload/article-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        return response.data;
    },
    getBySlug: async (slug: string) => {
        const response = await apiClient.get(`/parenting/articles/slug/${slug}`);
        return response.data;
    }
};

/**
 * 13. Milestone, Parenting, Coupon, Category Services
 */
export const milestoneService = {
    getUserMilestones: async (userId: number) => {
        const response = await apiClient.get(`/parenting/milestones/user/${userId}`);
        return response.data;
    },
    addMilestone: async (milestoneData: any) => {
        const response = await apiClient.post('/parenting/milestones', milestoneData);
        return response.data;
    },
    deleteMilestone: async (id: number) => { await apiClient.delete(`/parenting/milestones/${id}`); }
};

export const parentingService = {
    getBabyProfile: async (userId: number) => {
        const response = await apiClient.get(`/parenting/profile/${userId}`);
        return response.data;
    },
    saveBabyProfile: async (profileData: any) => {
        const response = await apiClient.post('/parenting/profile', profileData);
        return response.data;
    },
    getRecommendations: async (ageInMonths: number) => {
        const response = await apiClient.get(`/parenting/recommendations/${ageInMonths}`);
        return response.data;
    }
};

export const couponService = {
    getAllCoupons: () => apiClient.get('/admin/coupons'),
    saveCoupon: (couponData: any) => apiClient.post('/admin/coupons', couponData),
    deleteCoupon: (id: number) => apiClient.delete(`/admin/coupons/${id}`),
    updateValidity: (id: number, expiryDate: string) => 
        apiClient.put(`/admin/coupons/${id}/validity`, null, { params: { expiryDate } })
};

export const categoryService = {
    getAllCategories: () => apiClient.get('/categories'),
    saveCategory: (categoryData: any) => apiClient.post('/categories', categoryData),
    deleteCategory: (id: number) => apiClient.delete(`/categories/${id}`)
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
    couponService,
    quizService,
    inventoryService,
    userService,
    adminService,
    agentService,
    shipmentService,
    announcementService,
    locationService,
    articleService,
    milestoneService,
    parentingService,
    categoryService
};

export default api;