import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ✨ FIX: Added RefreshCcw to the imports
import { 
    Search, Package, MapPin, Truck, Box, 
    CreditCard, RefreshCcw, Loader2 as LucideLoader 
} from 'lucide-react';
// ✨ FIX: Added motion import
import { motion, AnimatePresence } from 'framer-motion'; 
import api from '../../services/api';
import AnimatedTracker from '../../components/admin/AnimatedTracker'; 
import { toast } from 'react-toastify';

const TrackingPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [trackingData, setTrackingData] = useState<any>(null);
    const [searchAWB, setSearchAWB] = useState(id || '');
    const [loading, setLoading] = useState(false);

    const handleTrack = async (awb: string) => {
        if (!awb.trim()) {
            toast.error("Please enter a Waybill number");
            return;
        }
        try {
            setLoading(true);
            const primaryAWB = awb.split(',')[0].trim();
            const res = await api.shipmentService.getTrackingDetails(primaryAWB);
            setTrackingData(res);
            if (id !== primaryAWB) {
                navigate(`/profile/track/${primaryAWB}`, { replace: true });
            }
        } catch (err) {
            toast.error("Waybill not found");
            setTrackingData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        if (id) {
            handleTrack(id);
            setSearchAWB(id);
        } 
    }, [id]);

    return (
        <div className="min-h-screen bg-[#F1F3F9] pt-28 pb-20 px-4">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
                <div className="lg:w-80 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-[#2D4A73] mb-4 tracking-tight">Track Another Order</h2>
                        <div className="relative mb-6">
                            <input 
                                type="text" 
                                placeholder="Enter AWB No."
                                className="w-full pl-4 pr-12 py-4 bg-gray-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-blue-100"
                                value={searchAWB}
                                onChange={(e) => setSearchAWB(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTrack(searchAWB)}
                            />
                            <button 
                                onClick={() => handleTrack(searchAWB)}
                                className="absolute right-2 top-2 p-2 bg-[#2D4A73] text-white rounded-xl"
                            >
                                <Search size={20} />
                            </button>
                        </div>

                        {trackingData && (
                            <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">AWB Number</p>
                                        <p className="font-black text-[#2D4A73] text-sm">{trackingData.shipment.waybillNumber}</p>
                                    </div>
                                    <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-blue-600 border border-blue-100 uppercase">
                                        {trackingData.shipment.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase">Est. delivery date</p>
                                    <p className="font-black text-[#2D4A73] text-sm">
                                        {trackingData.shipment.edd 
                                            // ✨ FIX: Changed 'yyyy' to 'numeric'
                                            ? new Date(trackingData.shipment.edd).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                            : 'Calculating...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 space-y-8">
                    {trackingData && !loading && (
                        <>
                            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-10 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-[#2D4A73] leading-none">{trackingData.shipment.fromCity}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Origin</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-right">
                                        <div>
                                            <p className="text-lg font-black text-[#2D4A73] leading-none">{trackingData.shipment.toCity}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Destination</p>
                                        </div>
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                            <MapPin size={20} />
                                        </div>
                                    </div>
                                </div>
                                <AnimatedTracker progressPercentage={trackingData.progressPercentage} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                                    <h3 className="text-xl font-black text-[#2D4A73] mb-8 uppercase tracking-widest flex items-center gap-3">
                                        <Truck size={20} className="text-blue-500" /> Shipment Progress
                                    </h3>
                                    <ShipmentFeed logs={trackingData.logs} />
                                </div>

                                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 h-fit">
                                    <h3 className="text-xl font-black text-[#2D4A73] mb-8 uppercase tracking-widest flex items-center gap-3">
                                        <Package size={20} className="text-blue-500" /> Order Details
                                    </h3>
                                    <div className="space-y-6">
                                        <DetailRow label="Mode Of Payment" value={trackingData.shipment.paymentMode || 'Prepaid'} icon={<CreditCard size={14}/>} />
                                        <DetailRow label="Courier" value={trackingData.shipment.carrier} icon={<Truck size={14}/>} />
                                        <DetailRow label="Number of Boxes" value="1" icon={<Box size={14}/>} />
                                        <DetailRow label="Delivery Mode" value="Surface" icon={<Truck size={14}/>} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
    <div className="flex flex-col gap-1 pb-4 border-b border-gray-50 last:border-0">
        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-2 text-[#2D4A73]">
            <span className="text-gray-400">{icon}</span>
            <span className="text-sm font-black">{value}</span>
        </div>
    </div>
);

const ShipmentFeed = ({ logs }: { logs: any[] }) => (
    <div className="mt-4 space-y-0 border-l-2 border-blue-100 ml-4">
        {logs.map((log, index) => (
            <div key={index} className="relative pl-12 pb-12 last:pb-0">
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                    index === 0 ? 'bg-blue-600 scale-125' : 'bg-gray-200'
                }`} />
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <h4 className={`font-black text-lg leading-none ${index === 0 ? 'text-[#2D4A73]' : 'text-gray-400'}`}>
                            {log.status}
                        </h4>
                        <p className="text-xs font-bold text-gray-500 mt-3">
                            Location: <span className="text-gray-400 font-medium">{log.location || 'N/A'}</span>
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#2D4A73]">{log.formattedDate}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{log.formattedTime}</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// ✨ Loader component using RefreshCcw
const Loader = ({ className, size }: { className?: string, size?: number }) => (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className={className}>
        <RefreshCcw size={size} />
    </motion.div>
);

export default TrackingPage;