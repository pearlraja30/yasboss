import apiClient from '../api/axiosConfig'; // Import the new intercepted client

export const getAllProducts = async () => {
    // This request will now automatically include the JWT if it exists!
    const response = await apiClient.get('/products');
    return response.data;
};

export const getProductById = async (id: number) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
};

// Example of a protected call that requires the token
export const addToCart = async (productId: number, quantity: number) => {
    // Because of the interceptor, we don't need to manually pass the token here
    return await apiClient.post('/cart/add', { productId, quantity });
};