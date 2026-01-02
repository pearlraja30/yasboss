import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, ChevronRight } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                <header className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-3xl mb-6 shadow-sm">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-5xl font-black text-[#2D4A73] tracking-tighter mb-4">Privacy Policy</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                        Your safety is our top priority at YasBoss Toys
                    </p>
                </header>

                <div className="space-y-8">
                    {/* Section 1: Data Collection */}
                    <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center">
                                <Eye size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-[#2D4A73]">Information We Collect</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-6 font-medium">
                            When you shop for magical toys on our platform, we collect information to ensure a smooth delivery experience. This includes:
                        </p>
                        <ul className="space-y-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
                            <li className="flex items-center gap-3"><ChevronRight size={14} className="text-blue-500" /> Name & Contact Details</li>
                            <li className="flex items-center gap-3"><ChevronRight size={14} className="text-blue-500" /> Shipping Addresses for Toy Delivery</li>
                            <li className="flex items-center gap-3"><ChevronRight size={14} className="text-blue-500" /> Transactional & Payment History</li>
                        </ul>
                    </section>

                    {/* Section 2: Toy Safety & Security */}
                    <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-[#2D4A73]">How We Protect Your Data</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            We use industrial-grade encryption to safeguard your information. Your account details and order history are stored in our secure toy vault, ensuring that only authorized personnel can handle your shipment logistics.
                        </p>
                    </section>

                    {/* Section 3: Shipment Transparency */}
                    <section className="bg-blue-50/50 p-10 rounded-[2.5rem] border border-blue-100">
                        <div className="flex items-center gap-4 mb-6 text-blue-700">
                            <FileText size={20} />
                            <h2 className="text-2xl font-black">Shipment Transparency</h2>
                        </div>
                        <p className="text-blue-900/70 font-medium leading-relaxed mb-6">
                            To provide real-time tracking, we share minimal necessary data with our delivery partners (e.g., Delhivery). This includes:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-2xl border border-blue-100 text-xs font-black text-blue-600 uppercase">
                                Waybill & Tracking IDs
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-blue-100 text-xs font-black text-blue-600 uppercase">
                                Delivery Progress Logs
                            </div>
                        </div>
                    </section>
                </div>

                <footer className="mt-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
                    Last Updated: January 2026 • YasBoss Toy Co.
                </footer>
            </div>
        </div>
    );
};

export default Privacy;