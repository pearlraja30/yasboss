import * as React from 'react';
import { useState } from 'react';
import { Search, ChevronDown, MessageCircle, Phone, Mail, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    { q: "What is your delivery time?", a: "We typically deliver within 3-5 business days. Free delivery applies to orders above ₹500." },
    { q: "Are the toys non-toxic?", a: "Yes, all our toys are made from child-safe, non-toxic materials and undergo strict quality checks." },
    { q: "How do I track my order?", a: "Once shipped, you will receive a tracking link via email and SMS." }
];

const HelpCenter: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="bg-gray-50 min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-[#2D4A73] mb-6">How can we help?</h1>
                    <div className="relative max-w-xl mx-auto">
                        <input type="text" placeholder="Search for topics..." className="w-full px-8 py-5 rounded-[2rem] shadow-xl border-none focus:ring-2 focus:ring-blue-500" />
                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {[
                        { icon: <MessageCircle className="text-blue-500" />, label: "Live Chat" },
                        { icon: <Phone className="text-green-500" />, label: "Call Us" },
                        { icon: <Mail className="text-pink-500" />, label: "Email Support" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] text-center shadow-sm hover:shadow-md transition-all cursor-pointer">
                            <div className="flex justify-center mb-4">{item.icon}</div>
                            <span className="font-bold text-gray-700">{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[3rem] p-10 shadow-sm">
                    <h2 className="text-2xl font-black text-gray-800 mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border-b border-gray-100 last:border-0 pb-4">
                                <button 
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    className="w-full flex items-center justify-between py-4 text-left font-bold text-gray-700"
                                >
                                    {faq.q} <ChevronDown className={`transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openIndex === idx && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                            <p className="text-gray-500 text-sm pb-4">{faq.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;