import type { Product } from './Product';

export interface CartItemType {
    id: number;
    quantity: number;
    product: Product;
    subtotal: number; // Calculated on the backend
}

export interface CartType {
    id: number;
    items: CartItemType[];
    // We can calculate total here based on item subtotals
}