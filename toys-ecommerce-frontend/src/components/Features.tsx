import React from 'react';
import { Wallet, Award, Factory, Bike } from 'lucide-react';

const featureData = [
    {
        icon: <Wallet className="text-[#1e293b]" size={40} />,
        title: "Secure Payments"
    },
    {
        icon: <Award className="text-[#1e293b]" size={40} />,
        title: "Assured Quality"
    },
    {
        icon: <Factory className="text-[#1e293b]" size={40} />,
        title: "Made In India"
    },
    {
        icon: <Bike className="text-[#1e293b]" size={40} />,
        title: "Timely Delivery"
    }
];

const Features: React.FC = () => {
    return (
        <section className="bg-[#f8fafc] py-12 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {featureData.map((item, index) => (
                        <div key={index} className="flex flex-col items-center text-center space-y-4">
                            <div className="p-4 bg-white rounded-full shadow-sm border border-gray-50 transition-transform hover:scale-110">
                                {item.icon}
                            </div>
                            <h3 className="text-gray-700 font-medium text-sm md:text-base tracking-wide">
                                {item.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;