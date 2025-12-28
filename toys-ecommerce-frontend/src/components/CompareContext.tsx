import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../types/Product';

interface CompareContextType {
    compareList: Product[];
    toggleCompare: (product: Product) => void;
    removeFromCompare: (id: number) => void;
    clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareList, setCompareList] = useState<Product[]>([]);

    const toggleCompare = (product: Product) => {
        setCompareList((prev) => {
            const exists = prev.find((p) => p.id === product.id);
            if (exists) {
                return prev.filter((p) => p.id !== product.id);
            }
            if (prev.length >= 3) {
                alert("You can only compare up to 3 toys at a time.");
                return prev;
            }
            return [...prev, product];
        });
    };

    const removeFromCompare = (id: number) => {
        setCompareList((prev) => prev.filter((p) => p.id !== id));
    };

    const clearCompare = () => setCompareList([]);

    return (
        <CompareContext.Provider value={{ compareList, toggleCompare, removeFromCompare, clearCompare }}>
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) throw new Error("useCompare must be used within a CompareProvider");
    return context;
};