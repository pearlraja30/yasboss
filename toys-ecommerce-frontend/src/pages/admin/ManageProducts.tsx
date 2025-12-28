// src/pages/admin/ManageProducts.tsx
import React, { useEffect, useState } from 'react';
import { productService } from '../../services/api';
import { Edit3, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ManageProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        const data = await productService.getAllProducts();
        setProducts(data);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this toy?")) {
            await productService.deleteProduct(id);
            loadProducts();
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold font-serif">Inventory Management</h1>
                <Link to="/admin/add-product" className="bg-[#2D4A73] text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold">
                    <Plus size={20}/> Add New Toy
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-6 font-bold text-gray-600">Product</th>
                            <th className="p-6 font-bold text-gray-600">Category</th>
                            <th className="p-6 font-bold text-gray-600">Price</th>
                            <th className="p-6 font-bold text-gray-600">Stock</th>
                            <th className="p-6 font-bold text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-6 flex items-center gap-4">
                                    <img src={`http://localhost:8080${p.imageUrl}`} className="w-12 h-12 object-contain" alt={p.name} />
                                    <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                                </td>
                                <td className="p-6 text-gray-500">{p.category}</td>
                                <td className="p-6 font-bold text-pink-600">₹{p.price}</td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="p-6 text-right space-x-2">
                                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit3 size={18}/></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageProducts;