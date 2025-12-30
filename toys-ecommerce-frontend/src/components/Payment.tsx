import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api';

const Payment: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, amount } = location.state || { orderId: 'N/A', amount: 0 };

    const [paymentMode, setPaymentMode] = useState<'CARD' | 'UPI'>('CARD');
    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulated payment delay
            const paymentPayload = {
                orderId,
                amount,
                paymentMethod: paymentMode,
                status: "SUCCESS"
            };

            // Backend service call
            const response = await api.orderService.processPayment(paymentPayload);

            if (response.status === "SUCCESS") {
                setPaymentSuccess(true);
                toast.success("Payment Received Successfully!");
                setTimeout(() => navigate('/profile'), 3000);
            }
        } catch (err: any) {
            toast.error("Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (paymentSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <CheckCircle2 size={100} className="text-green-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-black text-[#2D4A73] mb-2">Payment Verified</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest">Redirecting to your orders...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-8 hover:text-[#2D4A73]">
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side: Order Info */}
                    <div className="space-y-6">
                        <div className="bg-[#2D4A73] rounded-[3rem] p-10 text-white shadow-2xl">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Total Payable</h2>
                            <p className="text-5xl font-black">₹{amount.toFixed(2)}</p>
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <p className="text-xs font-bold uppercase opacity-50">Order Reference</p>
                                <p className="font-mono text-lg">{orderId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-6 bg-green-50 rounded-3xl text-green-700">
                            <ShieldCheck size={24} />
                            <span className="text-xs font-black uppercase tracking-wider">Bank-grade Secure Encryption</span>
                        </div>
                    </div>

                    {/* Right Side: Payment Methods */}
                    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
                        <div className="flex gap-4 mb-10">
                            <button 
                                onClick={() => setPaymentMode('CARD')}
                                className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${paymentMode === 'CARD' ? 'bg-blue-50 text-[#2D4A73] ring-2 ring-blue-100' : 'text-gray-300'}`}
                            >
                                <CreditCard size={24} />
                                <span className="text-[10px] font-black uppercase">Card</span>
                            </button>
                            <button 
                                onClick={() => setPaymentMode('UPI')}
                                className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 transition-all ${paymentMode === 'UPI' ? 'bg-blue-50 text-[#2D4A73] ring-2 ring-blue-100' : 'text-gray-300'}`}
                            >
                                <Smartphone size={24} />
                                <span className="text-[10px] font-black uppercase">UPI</span>
                            </button>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {paymentMode === 'CARD' ? (
                                    <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        <input required type="text" placeholder="Card Number" className="w-full p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input required type="text" placeholder="MM/YY" className="p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                                            <input required type="text" placeholder="CVV" className="p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100" />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="upi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        <div className="p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
                                            <p className="text-xs font-black text-gray-400 uppercase mb-4">Scan QR to Pay</p>
                                            <div className="w-32 h-32 bg-white mx-auto rounded-2xl shadow-inner flex items-center justify-center">
                                                <Smartphone size={40} className="text-gray-200" />
                                            </div>
                                        </div>
                                        <input required type="text" placeholder="yourname@upi" className="w-full p-5 bg-gray-50 rounded-2xl border-none font-bold outline-none focus:ring-2 focus:ring-blue-100 text-center" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-[#2D4A73] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl hover:bg-[#1e334f] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : `Pay ₹${amount.toFixed(2)}`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;