import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Trash2, Home, Briefcase, X, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AddressBook: React.FC = () => {
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // New Address State
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        zip: '',
        state: '',
        addressType: 'HOME'
    });

    // ✨ FIXED: Added missing fetchAddresses logic
    const fetchAddresses = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.userService.getAddresses();
            setAddresses(data || []);
        } catch (err) {
            console.error("Failed to load addresses");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const toggleDefault = async (id: number) => {
        try {
            await api.userService.setDefaultAddress(id);
            toast.success("Primary address updated!");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to update primary address");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            await api.userService.deleteAddress(id);
            toast.info("Address removed");
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await api.userService.addAddress(newAddress);
            toast.success("New address saved!");
            setShowForm(false);
            setNewAddress({ fullName: '', phone: '', street: '', city: '', zip: '', state: '', addressType: 'HOME' });
            fetchAddresses();
        } catch (err) {
            toast.error("Failed to save address");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#2D4A73]" size={40} />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-[#2D4A73] uppercase italic tracking-tighter">Address Book</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage your delivery destinations</p>
                </div>
                <button 
                    onClick={() => setShowForm(true)} 
                    className="flex items-center gap-2 bg-[#2D4A73] text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                    <Plus size={16} /> Add New Address
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <MapPin className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No addresses saved yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map(addr => (
                        <motion.div 
                            layout
                            key={addr.id} 
                            className={`p-8 rounded-[2.5rem] border-2 transition-all relative overflow-hidden ${
                                addr.isDefault ? 'border-[#2D4A73] bg-blue-50/30' : 'border-gray-100 bg-white hover:border-blue-200'
                            }`}
                        >
                            <div className="flex justify-between mb-6">
                                <div className={`p-3 rounded-2xl ${addr.isDefault ? 'bg-[#2D4A73] text-white' : 'bg-gray-50 text-gray-400'}`}>
                                    {addr.addressType === 'HOME' ? <Home size={20} /> : <Briefcase size={20} />}
                                </div>
                                {addr.isDefault && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-black text-[#2D4A73] uppercase tracking-widest bg-white px-4 py-1.5 rounded-full shadow-sm">
                                        <CheckCircle2 size={12} /> Primary
                                    </span>
                                )}
                            </div>
                            
                            <h4 className="font-black text-[#2D4A73] text-lg mb-1">{addr.fullName}</h4>
                            <p className="text-xs font-bold text-gray-500 mb-4">{addr.phone}</p>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed mb-6">
                                {addr.street},<br />
                                {addr.city}, {addr.state} - {addr.zip}
                            </p>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                {!addr.isDefault && (
                                    <button 
                                        onClick={() => toggleDefault(addr.id)} 
                                        className="text-[10px] font-black uppercase text-[#2D4A73] hover:underline tracking-widest"
                                    >
                                        Set as Primary
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDelete(addr.id)}
                                    className="text-[10px] font-black uppercase text-red-400 hover:text-red-600 tracking-widest flex items-center gap-1"
                                >
                                    <Trash2 size={12} /> Remove
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* --- ADD ADDRESS MODAL --- */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-[#2D4A73]/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative"
                        >
                            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black">
                                <X size={24} />
                            </button>

                            <h3 className="text-2xl font-black text-[#2D4A73] mb-8 uppercase italic tracking-tighter">Add Destination</h3>

                            <form onSubmit={handleAddAddress} className="space-y-4">
                                <input required placeholder="Full Name" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none" 
                                    onChange={e => setNewAddress({...newAddress, fullName: e.target.value})} />
                                
                                <input required placeholder="Phone Number" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none" 
                                    onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />

                                <textarea required placeholder="Street Address" className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none h-24" 
                                    onChange={e => setNewAddress({...newAddress, street: e.target.value})} />

                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="City" className="p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none" 
                                        onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                    <input required placeholder="ZIP Code" className="p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none" 
                                        onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                                </div>

                                <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl">
                                    {['HOME', 'WORK'].map(type => (
                                        <button 
                                            key={type}
                                            type="button"
                                            onClick={() => setNewAddress({...newAddress, addressType: type})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                newAddress.addressType === type ? 'bg-[#2D4A73] text-white shadow-md' : 'text-gray-400'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    disabled={isSaving}
                                    type="submit" 
                                    className="w-full bg-[#2D4A73] text-white py-5 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : 'Save Address'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddressBook;