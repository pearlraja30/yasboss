// src/pages/admin/AddProduct.tsx
import React, { useState } from 'react';
import { productService } from '../../services/api';
import { toast } from 'react-toastify';

const AddProduct: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Activity Toys',
        mrpPrice: 0,
        sellingPrice: 0,
        discountPct: 0,
        imageUrl: '',
        shortDescription: '',
        detailedDescription: '',
        ageRange: '0-2-years',
        featured: false,
        stock: 10
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productService.addProduct(formData);
            toast.success("Product added successfully!");
            // Reset form or redirect
        } catch (error) {
            toast.error("Failed to add product.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white rounded-[2rem] shadow-xl my-10">
            <h2 className="text-3xl font-bold mb-8 font-serif">Add New Toy to Catalog</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Full Product Name (SEO Friendly)</label>
                    <input 
                        className="w-full p-3 border rounded-xl" 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. 5 in 1 Activity Cube - Learning House" 
                        required 
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">MRP Price (₹)</label>
                    <input type="number" className="w-full p-3 border rounded-xl" 
                        onChange={e => setFormData({...formData, mrpPrice: Number(e.target.value)})} />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Selling Price (₹)</label>
                    <input type="number" className="w-full p-3 border rounded-xl" 
                        onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Detailed Description (Bullet Points)</label>
                    <textarea 
                        className="w-full p-3 border rounded-xl h-40" 
                        onChange={e => setFormData({...formData, detailedDescription: e.target.value})}
                        placeholder="Why Parents Love This... Features: ..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold mb-2">Image URL Path</label>
                    <input className="w-full p-3 border rounded-xl" 
                        onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        placeholder="/images/products/toy-name.jpg" />
                </div>

                <div className="flex items-center gap-2 mt-8">
                    <input type="checkbox" className="w-5 h-5" 
                        onChange={e => setFormData({...formData, featured: e.target.checked})} />
                    <label className="font-bold">Mark as Bestseller (Featured)</label>
                </div>

                <button type="submit" className="md:col-span-2 bg-[#2D4A73] text-white py-4 rounded-2xl font-bold text-xl mt-6 hover:bg-[#1e334f] transition-all">
                    Save Product to Database
                </button>
            </form>
        </div>
    );
};

export default AddProduct;