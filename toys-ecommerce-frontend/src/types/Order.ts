export type OrderStatus = 'PENDING_PAYMENT' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    // You might include productImageUrl here for display purposes
}

export interface Order {
    id: number;
    user: any; // Use a simple type for user here, or a detailed User type
    orderDate: string; // Java's LocalDateTime comes as a string (ISO 8601 format)
    totalAmount: number;
    status: OrderStatus;
    shippingAddress: string;
    // Payment details and other fields...
    items: OrderItem[]; // List of items included in the order
}