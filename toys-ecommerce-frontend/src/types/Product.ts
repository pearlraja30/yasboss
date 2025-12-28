// src/types/Product.ts

export interface ProductImage {
    id: number;
    imageUrl: string;
    is360View: boolean;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    imageUrl: string;
    detailedDescription?: string;
    longDescription?: string;
    useCases?: string;
    stock?: number;
    featured?: boolean;
    // Add this line to fix the error
    images?: ProductImage[]; 
}