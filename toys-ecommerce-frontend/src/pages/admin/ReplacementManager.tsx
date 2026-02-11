import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Check, X, Package, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ReplacementManager = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            // Using your existing admin API structure
            const res = await api.orderService.getPendingReplacements();
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error("Failed to load requests");
            setRequests([]); // Fallback to empty array on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const processAction = async (id: number, action: 'APPROVE' | 'REJECT') => {
        try {
            await api.orderService.handleReplacementAction(id, action);
            toast.success(`Request ${action.toLowerCase()}ed`);
            fetchRequests(); // Refresh list
        } catch (err) {
            toast.error("Action failed");
        }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="p-8 bg-white min-h-screen">
            <h1 className="text-3xl font-black text-[#2D4A73] mb-8 uppercase italic">Replacement <span className="text-pink-500">Queue</span></h1>
            
            <div className="grid gap-6">
                {requests.length === 0 ? (
                    <div className="p-20 border-2 border-dashed rounded-[2rem] text-center text-gray-400 font-bold uppercase text-xs">
                        No pending replacement requests.
                    </div>
                ) : (
                    requests.map(order => (
                        <div key={order.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex justify-between items-center">
                            <div className="flex gap-6 items-center">
                                <div className="p-4 bg-white rounded-2xl shadow-sm">
                                    <Package className="text-[#2D4A73]" />
                                </div>
                                <div>
                                    <h3 className="font-black text-[#2D4A73] uppercase tracking-tighter">Order #YB-{order.id}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{order.userEmail}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => processAction(order.id, 'REJECT')}
                                    className="p-4 bg-white text-red-500 rounded-2xl border border-red-100 hover:bg-red-50 transition-all"
                                    title="Reject Request"
                                >
                                    <X size={20} />
                                </button>
                                <button 
                                    onClick={() => processAction(order.id, 'APPROVE')}
                                    className="px-8 py-4 bg-[#2D4A73] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all flex items-center gap-2"
                                >
                                    <Check size={16} /> Approve & Re-ship
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReplacementManager;