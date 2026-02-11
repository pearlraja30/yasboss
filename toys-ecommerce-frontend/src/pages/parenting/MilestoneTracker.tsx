import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { 
    Star, Plus, Calendar, Camera, Download, 
    Loader2, X, ChevronRight, Heart, Baby 
} from 'lucide-react';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';

const MilestoneTracker: React.FC = () => {
    const [milestones, setMilestones] = useState<any[]>([]);
    const [babyProfile, setBabyProfile] = useState<any>(null); // ✨ Store baby info
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const navigate = useNavigate();
    const timelineRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        achievementDate: '',
        note: '',
        imageUrl: ''
    });

    const fetchMilestones = async () => {
        setLoading(true);
        try {
            const userData = localStorage.getItem('user');
            if (!userData) {
                navigate('/login');
                return;
            }
            const user = JSON.parse(userData);
            
            // ✨ Fetch both Milestones and Baby Profile simultaneously
            const [milestonesRes, profileRes] = await Promise.all([
                api.milestoneService.getUserMilestones(user.id),
                api.parentingService.getBabyProfile(user.id).catch(() => null) 
            ]);

            setMilestones(Array.isArray(milestonesRes) ? milestonesRes : []);
            setBabyProfile(profileRes);
        } catch (err) {
            console.error("Fetch Error:", err);
            setMilestones([]);
        } finally {
            setTimeout(() => setLoading(false), 500);
        }
    };

    useEffect(() => {
        fetchMilestones();
    }, []);

    const calculateAgeAtMilestone = (birthDate: string | Date, milestoneDate: string | Date): string => {
        if (!birthDate || !milestoneDate) return "";
        const birth = new Date(birthDate);
        const milestone = new Date(milestoneDate);

        const diffTime = Math.abs(milestone.getTime() - birth.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 0 ? "Newborn" : `${weeks} weeks old`;
        }

        const months = Math.floor(diffDays / 30.44);
        return `${months} months old`;
    };

    // ... handleImageUpload, handleSave, downloadPDF functions remain the same ...
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('file', file);
        try {
            toast.info("Uploading photo...");
            const imageUrl = await api.articleService.uploadImage(uploadData);
            setFormData({ ...formData, imageUrl });
            toast.success("Photo added!");
        } catch (err) { toast.error("Upload failed"); }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.achievementDate) {
            toast.error("Please add a title and date");
            return;
        }
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            await api.milestoneService.addMilestone({ ...formData, userId: user.id });
            setIsModalOpen(false);
            setFormData({ title: '', achievementDate: '', note: '', imageUrl: '' });
            fetchMilestones();
        } catch (err) { toast.error("Error saving memory"); }
    };

    const downloadPDF = async () => {
        if (!timelineRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(timelineRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            pdf.save(`Baby-Book-${user.fullName || 'Memories'}.pdf`);
            toast.success("PDF Downloaded!");
        } catch (err) { toast.error("PDF generation failed"); } finally { setIsExporting(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-40">
            <Loader2 className="animate-spin text-pink-500 mb-4" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opening your memories...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 pt-32 bg-white min-h-screen text-left">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                <div>
                    <span className="flex items-center gap-2 text-pink-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                        <Heart size={14} fill="currentColor" /> Milestone Tracker
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-[#2D4A73] italic uppercase leading-none">
                        {babyProfile?.babyName ? `${babyProfile.babyName}'s` : 'The Baby'} <span className="text-pink-500 underline decoration-wavy underline-offset-8">Book</span>
                    </h1>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={downloadPDF} disabled={isExporting || milestones.length === 0} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-gray-50 text-[#2D4A73] px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-pink-50 transition-all border border-gray-100">
                        {isExporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} Export PDF
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-[#2D4A73] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-pink-500 transition-all shadow-xl shadow-blue-100">
                        <Plus size={18} /> Add Memory
                    </button>
                </div>
            </div>

            <div ref={timelineRef} className="p-4 md:p-10 bg-white">
                {milestones.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <Star className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-bold uppercase text-xs">No memories recorded yet. Start your journey!</p>
                    </div>
                ) : (
                    <div className="relative border-l-4 border-pink-100 ml-4 md:ml-10 space-y-12">
                        {milestones.map((m) => (
                            <div key={m.id} className="relative pl-10 md:pl-16">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 bg-pink-500 rounded-full border-4 border-white shadow-md" />
                                <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center flex-wrap gap-3 mb-4">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full">
                                                    <Calendar className="text-pink-400" size={12} />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        {new Date(m.achievementDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                
                                                {/* ✨ AGE BADGE ✨ */}
                                                {babyProfile?.birthDate && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-full">
                                                        <Baby className="text-pink-500" size={12} />
                                                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                                                            {calculateAgeAtMilestone(babyProfile.birthDate, m.achievementDate)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-[#2D4A73] uppercase italic mb-4">{m.title}</h3>
                                            <p className="text-gray-600 font-medium leading-relaxed">{m.note}</p>
                                        </div>
                                        {m.imageUrl && (
                                            <div className="w-full md:w-64 h-48 rounded-[2rem] overflow-hidden shadow-inner bg-gray-100">
                                                <img src={`http://localhost:8080${m.imageUrl}`} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="Milestone" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Modal code remains the same */}
        </div>
    );
};

export default MilestoneTracker;