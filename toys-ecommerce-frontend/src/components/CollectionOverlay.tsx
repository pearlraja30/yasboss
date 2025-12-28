import React from 'react';
import  { collections } from '../data/CollectionsData';
import type { Collection } from '../data/CollectionsData';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CollectionOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const CollectionOverlay: React.FC<CollectionOverlayProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Component for a single Collection Tile
    const CollectionTile: React.FC<{ collection: Collection }> = ({ collection }) => (
        <Link 
            to={`/products/collection/${collection.route}`} 
            onClick={onClose}
            className="group block rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200 bg-white"
        >
            {/* Placeholder Image (similar to the screenshot) */}
            <div className="h-40 w-full bg-pink-100 flex items-center justify-center relative overflow-hidden">
                 {/* Replace this div with an actual image tag for the collection */}
                 <span className="absolute bottom-2 left-2 bg-pink-600 text-white text-xs font-bold px-2 py-1 rounded">
                    {collection.name}
                 </span>
            </div>
            <div className="p-3 text-center">
                <p className="font-semibold text-gray-700">{collection.name}</p>
            </div>
        </Link>
    );

    return (
        <div className="fixed inset-0 z-40 bg-white shadow-2xl overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
                
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-900">
                        <X size={24} />
                    </button>
                </div>

                <h2 className="text-4xl font-serif font-bold text-center mb-12">Shop by Age Collection</h2>
                
                {/* Collection Tiles (Grid) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {collections.map(col => <CollectionTile key={col.id} collection={col} />)}
                </div>

            </div>
        </div>
    );
};

export default CollectionOverlay;