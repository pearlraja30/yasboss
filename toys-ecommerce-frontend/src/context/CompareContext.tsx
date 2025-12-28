import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/Product';

interface CompareContextType {
    compareList: Product[];
    toggleCompare: (product: Product) => void;
    removeFromCompare: (id: number) => void;
    clearCompare: () => void;
    isMaxReached: boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [isMaxReached, setIsMaxReached] = useState(false);

    // Toggle logic: Adds if not present, removes if already present
    const toggleCompare = (product: Product) => {
        setCompareList((prev) => {
            const isAlreadyAdded = prev.find((p) => p.id === product.id);
            
            if (isAlreadyAdded) {
                return prev.filter((p) => p.id !== product.id);
            }

            // Enforce a limit of 3 products for the side-by-side UI
            if (prev.length >= 3) {
                setIsMaxReached(true);
                setTimeout(() => setIsMaxReached(false), 3000); // Reset alert state
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
        <CompareContext.Provider 
            value={{ 
                compareList, 
                toggleCompare, 
                removeFromCompare, 
                clearCompare,
                isMaxReached 
            }}
        >
            {children}
        </CompareContext.Provider>
    );
};

// Custom hook for easy access in components
export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error("useCompare must be used within a CompareProvider");
    }
    return context;
};